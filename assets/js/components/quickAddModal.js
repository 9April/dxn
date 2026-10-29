/**
 * Quick Add Modal Component
 * Allows rapid selection of color & size variant directly from product grids.
 */

window.QuickAddModalComponent = {
  container: null,

  init() {
    if (this.container) return;

    this.container = document.createElement("div");
    this.container.id = "quick-add-modal-root";
    this.container.className = "modal-overlay";
    document.body.appendChild(this.container);
  },

  open(productId) {
    this.init();
    let targetId = productId;
    const aliases = window.PRODUCT_ALIASES || {};
    if (targetId && aliases[targetId]) {
      const aliasData = typeof aliases[targetId] === 'string' ? { targetId: aliases[targetId] } : aliases[targetId];
      targetId = aliasData.targetId;
    }

    const allProducts = window.STORE_PRODUCTS || window.DEFAULT_STORE_PRODUCTS || [];
    const product = allProducts.find(p => p.id === targetId || p.slug === targetId);
    if (!product) return;

    if (product.isBundle || product.id === 'pack-trio-tshirts') {
      window.location.href = `product.html?id=${product.id}`;
      return;
    }

    let currentProduct = product;
    let selectedColor = (currentProduct.colors && currentProduct.colors[0]) ? currentProduct.colors[0].code : 'black';
    let selectedSize = (currentProduct.sizes && currentProduct.sizes[0]) || (currentProduct.variants && currentProduct.variants[0] && currentProduct.variants[0].size) || currentProduct.weight || 'Standard';
    let modalQty = 1;

    const renderContent = () => {
      const activeColorObj = (currentProduct.colors || []).find(c => c.code === selectedColor) || (currentProduct.colors && currentProduct.colors[0]) || {};
      
      const possibleCodes = [selectedColor];
      if (selectedColor === 'rose') possibleCodes.push('pink');
      if (selectedColor === 'pink') possibleCodes.push('rose');
      if (selectedColor === 'dark-blue') possibleCodes.push('navy', 'darkblue');
      if (selectedColor === 'navy') possibleCodes.push('dark-blue');

      let img = null;
      if (currentProduct.images) {
        for (const code of possibleCodes) {
          if (currentProduct.images[code] && currentProduct.images[code][0]) {
            img = currentProduct.images[code][0];
            break;
          }
        }
      }
      if (!img) img = activeColorObj.image || 'assets/ecom/1.png';

      const variant = (currentProduct.variants || []).find(v => v.color === selectedColor && v.size === selectedSize) || (currentProduct.variants && currentProduct.variants[0]);
      const maxStock = (variant && variant.stock > 0) ? variant.stock : (currentProduct.stock > 0 ? currentProduct.stock : 99);
      const inStock = variant ? variant.stock > 0 : (currentProduct.stock > 0);
      const isAr = window.I18N ? window.I18N.isRTL() : true;
      const primaryTitle = isAr ? (currentProduct.nameAr || currentProduct.name) : (currentProduct.nameFr || currentProduct.name);
      const secondaryTitle = isAr ? (currentProduct.subtitleAr || '') : (currentProduct.subtitleFr || '');

      this.container.innerHTML = `
        <div class="modal-window" style="max-width: 480px;">
          <button class="action-btn modal-close" onclick="window.QuickAddModalComponent.close()">✕</button>
          
          <div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center;">
            <img src="${img}" alt="${primaryTitle}" style="width: 85px; height: 110px; object-fit: cover; background: #f5f5f5; border-radius: 6px; flex-shrink: 0; border: 1px solid var(--color-border);">
            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0;">
              <div class="product-card-category">${currentProduct.categoryName || currentProduct.category}</div>
              <h3 style="font-size: 1.1rem; margin: 0; font-weight: 700; line-height: 1.35;">${primaryTitle}</h3>
              ${secondaryTitle ? `<div style="font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${secondaryTitle}</div>` : ''}
              
              <div style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.74rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-bg-secondary); padding: 3px 8px; border-radius: 4px; border: 1px solid var(--color-border); width: fit-content; margin-top: 3px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <span>${currentProduct.weight || (isAr ? 'عبوة قياسية' : 'Format standard')}</span>
              </div>

              <div class="product-card-prices" style="margin-top: 4px;">
                <span class="product-card-price" style="font-size: 1.25rem; font-weight: 800;">${StoreUtils.formatMoney(currentProduct.price)}</span>
                ${currentProduct.compareAtPrice ? `<span class="product-card-compare-price">${StoreUtils.formatMoney(currentProduct.compareAtPrice)}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Color selection -->
          ${currentProduct.colors && currentProduct.colors.length > 1 ? `
            <div style="margin-bottom: 16px;">
              <div style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                ${isAr ? 'الخيار :' : 'Option :'} <strong>${activeColorObj.name || ''}</strong>
              </div>
              <div style="display: flex; gap: 10px;">
                ${currentProduct.colors.map(color => {
                  const isSelected = color.code === selectedColor;
                  return `
                    <button class="pdp-swatch-btn ${isSelected ? 'active' : ''}" 
                            style="background-color: ${color.hex};" 
                            title="${color.name}"
                            data-product-id="${color.productId || currentProduct.id}"
                            data-color="${color.code}">
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Size or Format selection -->
          ${currentProduct.sizes && currentProduct.sizes.length > 0 ? `
            <div style="margin-bottom: 24px;">
              <div style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                ${isAr ? 'المقاس :' : 'Taille :'} <strong>${selectedSize}</strong>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px;">
                ${currentProduct.sizes.map(size => {
                  const v = (currentProduct.variants || []).find(item => item.color === selectedColor && item.size === size);
                  const hasStock = v && v.stock > 0;
                  return `
                    <button class="pdp-size-btn ${size === selectedSize ? 'active' : ''} ${!hasStock ? 'disabled' : ''}" 
                            data-size="${size}"
                            ${!hasStock ? 'disabled' : ''}>
                      ${size}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : (currentProduct.weight ? `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; color: var(--color-text-muted);">
                ${isAr ? 'الوزن / الحجم (Format) :' : 'Format / Contenance :'}
              </div>
              <div style="display: inline-block; padding: 6px 14px; background: var(--color-bg-secondary); border: 1.5px solid var(--color-dark); border-radius: 4px; font-weight: 700; font-size: 0.9rem; color: var(--color-dark);">
                📦 ${currentProduct.weight}
              </div>
            </div>
          ` : '')}

          <!-- Quantity & Add Action -->
          <div style="display: flex; gap: 10px; margin-top: 18px; align-items: stretch;">
            <div class="qty-control" style="margin-top: 0; height: 48px; border: 1px solid var(--color-border); border-radius: 4px; display: inline-flex; align-items: center; background: var(--color-bg);">
              <button type="button" class="qty-btn" id="qa-qty-minus" style="width: 36px; height: 100%; font-size: 1.1rem; cursor: pointer; border: none; background: transparent;">-</button>
              <input type="number" id="qa-qty-input" class="qty-input" min="1" max="${maxStock}" value="${modalQty}" style="width: 40px; height: 100%; text-align: center; font-weight: 700; border: none; background: transparent; font-size: 0.95rem;">
              <button type="button" class="qty-btn" id="qa-qty-plus" style="width: 36px; height: 100%; font-size: 1.1rem; cursor: pointer; border: none; background: transparent;">+</button>
            </div>
            <button class="btn btn-primary" id="quick-add-confirm-btn" ${!inStock ? 'disabled' : ''} style="flex: 1; font-weight: 700; font-size: 0.95rem; height: 48px;">
              ${inStock ? (isAr ? `إضافة إلى السلة • ${StoreUtils.formatMoney(currentProduct.price * modalQty)}` : `Ajouter au Panier • ${StoreUtils.formatMoney(currentProduct.price * modalQty)}`) : (isAr ? 'نفد من المخزون' : 'Épuisé')}
            </button>
          </div>
        </div>
      `;

      // Swatch clicks
      this.container.querySelectorAll(".pdp-swatch-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetProductId = btn.getAttribute("data-product-id");
          const targetColorCode = btn.getAttribute("data-color");
          if (targetProductId && targetProductId !== currentProduct.id) {
            const nextProd = window.STORE_PRODUCTS.find(p => p.id === targetProductId);
            if (nextProd) {
              currentProduct = nextProd;
              selectedColor = targetColorCode || nextProd.colors[0].code;
              if (!currentProduct.sizes.includes(selectedSize)) {
                selectedSize = currentProduct.sizes[0];
              }
            }
          } else {
            selectedColor = targetColorCode;
          }
          renderContent();
        });
      });

      // Size clicks
      this.container.querySelectorAll(".pdp-size-btn:not(.disabled)").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedSize = btn.getAttribute("data-size");
          renderContent();
        });
      });

      // Quantity controls
      const qaInput = this.container.querySelector("#qa-qty-input");
      const qaMinus = this.container.querySelector("#qa-qty-minus");
      const qaPlus = this.container.querySelector("#qa-qty-plus");
      const addBtn = this.container.querySelector("#quick-add-confirm-btn");

      const updateQaQty = (newQ) => {
        let q = parseInt(newQ, 10);
        if (isNaN(q) || q < 1) q = 1;
        if (q > maxStock) q = maxStock;
        modalQty = q;
        if (qaInput) qaInput.value = modalQty;
        if (addBtn && inStock) {
          addBtn.innerHTML = isAr ? `إضافة إلى السلة • ${StoreUtils.formatMoney(currentProduct.price * modalQty)}` : `Ajouter au Panier • ${StoreUtils.formatMoney(currentProduct.price * modalQty)}`;
        }
      };

      if (qaMinus) qaMinus.addEventListener("click", () => updateQaQty(modalQty - 1));
      if (qaPlus) qaPlus.addEventListener("click", () => updateQaQty(modalQty + 1));
      if (qaInput) qaInput.addEventListener("input", (e) => updateQaQty(e.target.value));

      // Confirm Add
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          window.StoreCart.addItem({
            productId: currentProduct.id,
            colorCode: selectedColor,
            size: selectedSize,
            quantity: modalQty,
            openDrawer: true
          });
          window.QuickAddModalComponent.close();
        });
      }
    };

    renderContent();
    this.container.classList.add("open");
    document.body.classList.add("overflow-locked");

    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) this.close();
    });
  },

  close() {
    if (!this.container) return;
    this.container.classList.remove("open");
    document.body.classList.remove("overflow-locked");
  }
};
