/**
 * Reusable Product Card Component
 * Renders consistent, interactive product cards with multi-color swatches,
 * image swapping, wishlist toggle, and quick-add trigger.
 */

window.ProductCardComponent = {
  getSiblings(product) {
    if (!product) return [];
    const products = window.STORE_PRODUCTS || [];
    if (product.group) {
      const grouped = products.filter(p => p.group === product.group);
      if (grouped.length > 0) return grouped;
    }
    const parts = product.name.split(" - ");
    if (parts.length > 1) {
      const baseName = parts[0].trim();
      const matched = products.filter(p => p.name.split(" - ")[0].trim() === baseName);
      if (matched.length > 1) return matched;
    }
    return [product];
  },

  render(product, options = {}) {
    if (!product) return "";

    const isWishlisted = window.StoreWishlist ? window.StoreWishlist.has(product.id) : false;
    const defaultColor = (product.colors && product.colors[0]) || { name: 'Standard', code: 'standard', hex: '#2D6A4F', image: 'assets/ecom/1.png' };
    const defaultImages = (product.images && product.images[defaultColor.code]) || [defaultColor.image];
    const primaryImg = defaultImages[0] || defaultColor.image;
    const hoverImg = defaultImages[1] || primaryImg;

    const discountPercent = StoreUtils.getDiscountPercentage(product.price, product.compareAtPrice);
    const hasMultipleColors = product.colors && product.colors.length > 1;

    const isBundle = product.isBundle || product.id === 'pack-trio-tshirts';
    const productUrl = isBundle ? `product.html?id=${product.id}` : `product.html?id=${product.id}&color=${defaultColor.code}`;

    const isAr = window.I18N ? window.I18N.isRTL() : true;
    const primaryTitle = isAr ? (product.nameAr || product.name) : (product.nameFr || product.name);
    const secondaryTitle = isAr 
      ? (product.subtitleAr || product.shortDescription || '') 
      : (product.subtitleFr || product.shortDescriptionFr || '');
    const categoryDisplay = isBundle 
      ? (isAr ? 'عرض الباقة' : 'Offre Pack') 
      : ((product.brand ? `<strong style="color:var(--color-dark);">${product.brand}</strong> &bull; ` : '') + (isAr ? (product.categoryName || product.category) : (product.categoryNameFr || product.category)));
    const quickAddLabel = isAr ? 'إضافة سريعة' : 'Ajout Rapide';
    const customizeBundleLabel = isAr ? 'تخصيص الباقة' : 'Personnaliser le Pack';

    return `
      <div class="product-card ${isBundle ? 'product-card-bundle' : ''}" data-product-id="${product.id}" data-active-color="${defaultColor.code}">
        <div class="product-card-media">
          <!-- Badges -->
          <div class="product-card-badges">
            ${isBundle ? `<span class="badge" style="background:var(--color-dark);color:#fff;font-weight:700;">${isAr ? `باقة ${product.bundleSlotsCount || 3} قطع` : `Pack ${product.bundleSlotsCount || 3} pcs`}</span>` : ''}
            ${product.isNew && !isBundle ? `<span class="badge badge-new">${isAr ? 'جديد' : 'NOUVEAU'}</span>` : ''}
            ${discountPercent ? `<span class="badge badge-sale">-${discountPercent}%</span>` : ''}
          </div>

          <!-- Wishlist Heart Button -->
          <button class="product-card-wishlist ${isWishlisted ? 'active' : ''}" 
                  onclick="window.ProductCardComponent.handleWishlist('${product.id}', this)"
                  aria-label="${isAr ? 'إضافة إلى المفضلة' : 'Ajouter aux favoris'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <!-- Images -->
          <a href="${productUrl}" id="card-media-link-${product.id}">
            <img src="${primaryImg}" alt="${primaryTitle}" class="product-card-img img-primary" id="card-img-${product.id}">
            <img src="${hoverImg}" alt="${primaryTitle}" class="product-card-img img-hover" id="card-hover-img-${product.id}">
          </a>

          <!-- Quick Add Button Overlay -->
          <div class="product-card-quick-add">
            ${isBundle ? `
              <button type="button" class="btn btn-sm btn-quick-add" style="background: var(--color-dark); color: #fff;" onclick="window.location.href='${productUrl}'">
                <span>${customizeBundleLabel}</span>
              </button>
            ` : `
              <button type="button" class="btn btn-sm btn-quick-add" onclick="window.ProductCardComponent.handleQuickAdd('${product.id}', this, event)" aria-label="${quickAddLabel}">
                <svg class="btn-quick-add-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span class="btn-quick-add-text">${quickAddLabel}</span>
              </button>
            `}
          </div>
        </div>

        <div class="product-card-info">
          <div class="product-card-category">${categoryDisplay}</div>
          <h3 class="product-card-title">
            <a href="${productUrl}" id="card-title-link-${product.id}">
              ${primaryTitle}
            </a>
          </h3>
          <div class="product-card-subtitle" title="${secondaryTitle}">
            ${secondaryTitle || (isAr ? 'منتج طبيعي أصلي وموثوق لتعزيز الصحة والجمال' : 'Produit naturel certifié de haute qualité')}
          </div>
          
          <div class="product-card-quantity">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>${product.weight || (isAr ? 'عبوة قياسية' : 'Format standard')}</span>
          </div>

          <div class="product-card-bottom">
            <div class="product-card-prices">
              <span class="product-card-price">${StoreUtils.formatMoney(product.price)}</span>
              ${product.compareAtPrice ? `
                <span class="product-card-compare-price">${StoreUtils.formatMoney(product.compareAtPrice)}</span>
              ` : ''}
            </div>

            <!-- Color Swatches or Bundle Indicator -->
            ${isBundle ? `
              <div style="font-size: 0.72rem; color: var(--color-text-secondary); font-weight: 700; background: var(--color-bg-secondary); padding: 2px 6px; border-radius: 4px;">
                <span>✨ ${isAr ? `${product.bundleSlotsCount || 3} قطع` : `${product.bundleSlotsCount || 3} pcs`}</span>
              </div>
            ` : (hasMultipleColors ? `
              <div class="product-card-swatches">
                ${product.colors.map((col, index) => {
                  const isCurrent = col.code === defaultColor.code;
                  return `
                    <button type="button" 
                            class="color-swatch-dot ${isCurrent ? 'active' : ''}" 
                            style="background-color: ${col.hex};" 
                            title="${col.name}"
                            onmouseenter="window.ProductCardComponent.selectColor('${product.id}', '${col.code}', this, event)"
                            onclick="window.ProductCardComponent.selectColor('${product.id}', '${col.code}', this, event)">
                    </button>
                  `;
                }).join('')}
              </div>
            ` : '')}
          </div>
        </div>
      </div>
    `;
  },

  handleQuickAdd(productId, btnElement, e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    const allProducts = window.STORE_PRODUCTS || window.DEFAULT_STORE_PRODUCTS || [];
    const product = allProducts.find(p => p.id === productId || p.slug === productId);
    if (!product) return;

    if (product.isBundle || product.id === 'pack-trio-tshirts') {
      window.location.href = `product.html?id=${product.id}`;
      return;
    }

    const isAr = window.I18N ? window.I18N.isRTL() : true;

    // Check stock if explicitly 0
    if (product.stock !== undefined && product.stock <= 0) {
      if (window.StoreUtils && window.StoreUtils.showToast) {
        window.StoreUtils.showToast(isAr ? 'عذراً، هذا المنتج غير متوفر حالياً' : 'Désolé, ce produit est en rupture de stock', 'warning');
      }
      return;
    }

    const card = btnElement ? btnElement.closest('.product-card') : null;
    const activeColor = (card && card.getAttribute('data-active-color')) || (product.colors && product.colors[0] && product.colors[0].code) || 'standard';
    const defaultSize = (product.sizes && product.sizes[0]) || product.weight || 'Standard';

    // Directly add 1 unit to cart and slide open cart drawer
    if (window.StoreCart && typeof window.StoreCart.addItem === 'function') {
      window.StoreCart.addItem({
        productId: product.id,
        colorCode: activeColor,
        size: defaultSize,
        quantity: 1,
        openDrawer: true
      });
    }

    // High-end visual feedback directly on the button
    if (btnElement) {
      btnElement.classList.add('added-success');
      const textSpan = btnElement.querySelector('.btn-quick-add-text');
      const iconSvg = btnElement.querySelector('.btn-quick-add-icon');
      const originalText = isAr ? 'إضافة سريعة' : 'Ajout Rapide';

      if (textSpan) {
        textSpan.textContent = isAr ? '✓ تمت الإضافة !' : '✓ Ajouté !';
      }
      if (iconSvg) {
        iconSvg.style.display = 'none';
      }

      setTimeout(() => {
        btnElement.classList.remove('added-success');
        if (textSpan) {
          textSpan.textContent = originalText;
        }
        if (iconSvg) {
          iconSvg.style.display = '';
        }
      }, 1600);
    }

    if (window.StoreUtils && window.StoreUtils.showToast) {
      const pName = isAr ? (product.nameAr || product.name) : (product.nameFr || product.name);
      window.StoreUtils.showToast(
        isAr ? `✓ تمت إضافة "${pName}" إلى السلة` : `✓ "${pName}" ajouté au panier !`,
        'success'
      );
    }
  },

  handleWishlist(productId, btnElement) {
    if (!window.StoreWishlist) return;
    const isNowSaved = window.StoreWishlist.toggle(productId);
    if (isNowSaved) {
      btnElement.classList.add("active");
    } else {
      btnElement.classList.remove("active");
    }
  },

  selectColor(productId, colorCode, swatchElement, e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    const card = swatchElement ? swatchElement.closest(".product-card") : document.querySelector(`.product-card[data-product-id="${productId}"]`);
    const product = (window.STORE_PRODUCTS || []).find(p => p.id === productId);
    if (!product) return;

    // Update active swatch dot highlight
    if (swatchElement && swatchElement.parentElement) {
      const swatches = swatchElement.parentElement.querySelectorAll(".color-swatch-dot");
      swatches.forEach(s => s.classList.remove("active"));
      swatchElement.classList.add("active");
    }

    const colorObj = (product.colors || []).find(c => c.code === colorCode) || {};

    // Check alias keys for color code (e.g. rose / pink, dark-blue / navy)
    const possibleCodes = [colorCode];
    if (colorCode === 'rose') possibleCodes.push('pink');
    if (colorCode === 'pink') possibleCodes.push('rose');
    if (colorCode === 'dark-blue') possibleCodes.push('navy', 'darkblue');
    if (colorCode === 'navy') possibleCodes.push('dark-blue');

    let images = [];
    if (product.images) {
      for (const code of possibleCodes) {
        if (product.images[code] && product.images[code].length > 0) {
          images = product.images[code];
          break;
        }
      }
    }

    if (images.length === 0 && colorObj.image) {
      images = [colorObj.image];
    }

    const primaryImg = (images && images[0]) || colorObj.image || (product.colors && product.colors[0] && product.colors[0].image) || '';
    const hoverImg = (images && images[1]) || primaryImg;

    const imgEl = (card && card.querySelector(".product-card-img.img-primary")) || document.getElementById(`card-img-${productId}`);
    const hoverEl = (card && card.querySelector(".product-card-img.img-hover")) || document.getElementById(`card-hover-img-${productId}`);
    const linkEl = (card && card.querySelector(".product-card-title a")) || document.getElementById(`card-title-link-${productId}`);
    const mediaLinkEl = (card && card.querySelector(".product-card-media a")) || document.getElementById(`card-media-link-${productId}`);

    if (imgEl && primaryImg) imgEl.src = primaryImg;
    if (hoverEl && hoverImg) hoverEl.src = hoverImg;
    if (card) card.setAttribute("data-active-color", colorCode);

    // Update the card link destination to open the main product associated with this card's title
    const destUrl = `product.html?id=${productId}&color=${colorCode}`;
    if (linkEl) linkEl.href = destUrl;
    if (mediaLinkEl) mediaLinkEl.href = destUrl;
  }
};
