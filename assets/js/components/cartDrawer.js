/**
 * Cart Drawer Component
 * Interactive slide-out cart drawer with live quantity updates, Moroccan free shipping meter,
 * line-item removal, and direct checkout link.
 * Bilingual: Arabic (RTL) & French (LTR).
 */

window.CartDrawerComponent = {
  container: null,

  init() {
    if (this.container) return;

    this.container = document.createElement("div");
    this.container.id = "cart-drawer-root";
    this.container.className = "cart-drawer";
    document.body.appendChild(this.container);

    this.render();

    window.addEventListener("cart:updated", () => {
      this.render();
    });
  },

  open() {
    this.init();
    this.container.classList.add("open");
    document.body.classList.add("overflow-locked");
  },

  close() {
    if (!this.container) return;
    this.container.classList.remove("open");
    document.body.classList.remove("overflow-locked");
  },

  render() {
    if (!this.container) return;

    const cart = window.StoreCart;
    if (!cart) return;

    const items = cart.items;
    const count = cart.getCount();
    const subtotal = cart.getSubtotal();
    const shippingProgress = cart.getShippingProgress();
    const isAr = window.I18N ? window.I18N.isRTL() : true;

    this.container.innerHTML = `
      <div class="cart-drawer-panel">
        <!-- Header -->
        <div class="cart-drawer-header">
          <div class="cart-drawer-title">
            ${isAr ? `سلة التسوق (${count})` : `Mon Panier (${count})`}
          </div>
          <button class="action-btn" onclick="window.CartDrawerComponent.close()" aria-label="${isAr ? 'إغلاق السلة' : 'Fermer le panier'}">✕</button>
        </div>

        <!-- Free Shipping Progress Bar (Morocco) -->
        <div class="free-shipping-meter">
          <div class="meter-text">
            <span>🚚</span>
            <span>
              ${shippingProgress.isFree 
                ? (isAr ? '<strong>تهانينا!</strong> لقد حصلت على توصيل مجاني بالمغرب!' : '<strong>Félicitations !</strong> Livraison gratuite offerte au Maroc !') 
                : (isAr ? `أضف <strong>${StoreUtils.formatMoney(shippingProgress.remaining)}</strong> للاستفادة من التوصيل المجاني` : `Ajoutez <strong>${StoreUtils.formatMoney(shippingProgress.remaining)}</strong> pour la livraison gratuite`)}
            </span>
          </div>
          <div class="meter-bar-container">
            <div class="meter-bar-fill ${shippingProgress.isFree ? 'achieved' : ''}" style="width: ${shippingProgress.percentage}%;"></div>
          </div>
        </div>

        <!-- Items Container -->
        <div class="cart-drawer-items">
          ${items.length === 0 ? `
            <div class="cart-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <h4 style="margin-bottom: 8px;">${isAr ? 'سلة التسوق فارغة' : 'Votre panier est vide'}</h4>
              <p style="font-size: 0.88rem; margin-bottom: 20px;">${isAr ? 'تصفح منتجاتنا الطبيعية للعناية والصحة وابدأ التسوق الآن.' : 'Découvrez nos produits naturels de santé et bien-être et commencez vos achats.'}</p>
              <a href="shop.html" class="btn btn-primary btn-sm" onclick="window.CartDrawerComponent.close()">${isAr ? 'تصفح المتجر' : 'Découvrir la boutique'}</a>
            </div>
          ` : `
            ${items.map(item => {
              const primaryTitle = isAr ? (item.nameAr || item.name) : (item.nameFr || item.name);
              const secondaryTitle = isAr ? (item.subtitleAr || '') : (item.subtitleFr || '');
              const variantLabel = isAr 
                ? (item.weight ? `📦 الحجم: <strong>${item.weight}</strong>` : (item.size && item.size !== 'Standard' ? `📦 الحجم: <strong>${item.size}</strong>` : ''))
                : (item.weight ? `📦 Format: <strong>${item.weight}</strong>` : (item.size && item.size !== 'Standard' ? `📦 Taille: <strong>${item.size}</strong>` : ''));

              return `
              <div class="cart-item" data-variant-id="${item.variantId}">
                <img src="${item.image}" alt="${primaryTitle}" class="cart-item-img">
                <div class="cart-item-details">
                  <a href="product.html?id=${item.productId}${item.color ? `&color=${item.color}` : ''}" class="cart-item-title" onclick="window.CartDrawerComponent.close()">
                    ${primaryTitle}
                  </a>
                  ${secondaryTitle ? `
                    <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">${secondaryTitle}</div>
                  ` : ''}
                  ${item.isBundle && item.bundleItems ? `
                    <div class="cart-bundle-badge" style="display: inline-block; font-size: 0.68rem; font-weight: 700; background: var(--color-dark); color: #fff; padding: 2px 6px; border-radius: 2px; margin: 3px 0; text-transform: uppercase;">
                      ${isAr ? '⚡ باقة 3 قطع' : '⚡ Pack 3 Pièces'}
                    </div>
                  ` : `
                    <div class="cart-item-variant">
                      ${item.colorName && item.colorName !== 'Standard' ? item.colorName : ''} ${variantLabel}
                    </div>
                  `}
                  <div class="cart-item-price" dir="ltr" style="text-align: ${isAr ? 'right' : 'left'};">
                    <bdi dir="ltr">${StoreUtils.formatMoney(item.price)}</bdi>
                    ${item.compareAtPrice && item.compareAtPrice > item.price ? `
                      <span style="font-size: 0.78rem; text-decoration: line-through; color: var(--color-text-muted); margin-left: 6px;">
                        <bdi dir="ltr">${StoreUtils.formatMoney(item.compareAtPrice)}</bdi>
                      </span>
                    ` : ''}
                  </div>
                  
                  <div class="qty-control">
                    <button type="button" class="qty-btn" onclick="window.StoreCart.updateQuantity('${item.variantId}', ${item.quantity - 1})" aria-label="${isAr ? 'تقليل الكمية' : 'Diminuer la quantité'}">-</button>
                    <input type="number" class="qty-input" min="1" max="${item.maxStock || 99}" value="${item.quantity}" onchange="window.StoreCart.updateQuantity('${item.variantId}', this.value)" aria-label="${isAr ? 'الكمية' : 'Quantité'}">
                    <button type="button" class="qty-btn" onclick="window.StoreCart.updateQuantity('${item.variantId}', ${item.quantity + 1})" aria-label="${isAr ? 'زيادة الكمية' : 'Augmenter la quantité'}">+</button>
                  </div>
                </div>
                <button type="button" class="cart-item-remove" onclick="window.StoreCart.removeItem('${item.variantId}')" title="${isAr ? 'حذف' : 'Supprimer'}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            `;
            }).join('')}
          `}
        </div>

        <!-- Drawer Footer -->
        ${items.length > 0 ? `
          <div class="cart-drawer-footer">
            <div class="cart-summary-row">
              <span>${isAr ? 'المجموع الفرعي' : 'Sous-total'}</span>
              <span class="font-heading" dir="ltr" style="font-weight: 700; font-size: 1.1rem; text-align: ${isAr ? 'left' : 'right'};"><bdi dir="ltr">${StoreUtils.formatMoney(subtotal)}</bdi></span>
            </div>
            <div class="cart-summary-row" style="font-size: 0.85rem; color: var(--color-text-muted);">
              <span>${isAr ? 'التوصيل التقديري (المغرب)' : 'Livraison estimée (Maroc)'}</span>
              <span dir="ltr" style="text-align: ${isAr ? 'left' : 'right'};">${shippingProgress.isFree ? `<strong style="color: var(--color-success)">${isAr ? 'مجاني' : 'Gratuit'}</strong>` : (isAr ? '<bdi dir="ltr">35 درهم</bdi> (عند إتمام الطلب)' : '35 MAD (au paiement)')}</span>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <a href="cart.html" class="btn btn-secondary btn-full btn-sm" onclick="window.CartDrawerComponent.close()" style="font-weight: 600;">
                ${isAr ? 'عرض السلة' : 'Voir le Panier'}
              </a>
              <a href="checkout.html" class="btn btn-primary btn-full btn-sm" style="font-weight: 700;">
                ${isAr ? `إتمام الطلب • <bdi dir="ltr">${StoreUtils.formatMoney(subtotal)}</bdi>` : `Commander • ${StoreUtils.formatMoney(subtotal)}`}
              </a>
            </div>

            <div style="text-align: center; font-size: 0.78rem; color: var(--color-text-muted); margin-top: 6px;">
              ${isAr ? '🔒 الدفع عند الاستلام (Cash on Delivery) متاح لجميع المدن المغربية' : '🔒 Paiement à la livraison (Cash on Delivery) disponible partout au Maroc'}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Close on backdrop click
    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.CartDrawerComponent.init();
});
