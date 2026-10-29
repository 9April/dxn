/**
 * Dedicated Cart Page Controller
 * Table view, shipping meter, delivery instructions note, order summary, coupon application.
 * Bilingual: Arabic (RTL) & French (LTR).
 */

window.CartPageController = {
  init() {
    if (window.HeaderComponent) window.HeaderComponent.mount();
    if (window.FooterComponent) window.FooterComponent.mount();

    this.render();

    window.addEventListener("cart:updated", () => {
      this.render();
    });
  },

  render() {
    const container = document.getElementById("cart-page-container");
    if (!container) return;

    const cart = window.StoreCart;
    if (!cart) return;

    const items = cart.items;
    const subtotal = cart.getSubtotal();
    const discount = cart.getDiscountAmount();
    const shipping = cart.getShippingCost();
    const total = cart.getTotal();
    const shippingProgress = cart.getShippingProgress();
    const appliedDiscount = cart.discount;
    const isAr = window.I18N ? window.I18N.isRTL() : true;
    document.title = isAr ? 'سلة التسوق | دي إكس إن وكالو المغرب' : 'Votre Panier | DXN & KALLOW Maroc';

    if (items.length === 0) {
      container.innerHTML = `
        <div class="container section-spacing text-center">
          <div style="max-width: 480px; margin: 0 auto; padding: 48px 24px; background-color: var(--color-bg-secondary); border-radius: 6px;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px;">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h2 style="font-size: 1.8rem; margin-bottom: 12px; font-weight: 700;">
              ${isAr ? 'سلة التسوق فارغة حالياً' : 'Votre panier est actuellement vide'}
            </h2>
            <p style="margin-bottom: 24px; color: var(--color-text-secondary);">
              ${isAr ? 'استكشف منتجاتنا الطبيعية واختر ما يناسب صحتك وجمالك.' : 'Découvrez nos produits naturels et choisissez ce qui correspond à votre bien-être.'}
            </p>
            <a href="shop.html" class="btn btn-primary" style="font-weight: 700;">
              ${isAr ? 'تصفح المتجر ⚡' : 'Découvrir la boutique ⚡'}
            </a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="container section-spacing">
        <h1 style="font-size: 2.2rem; margin-bottom: 24px; font-weight: 800;">
          ${isAr ? 'سلة التسوق' : 'Mon Panier'}
        </h1>

        <!-- Free Shipping Meter -->
        <div class="free-shipping-meter" style="border: 1px solid var(--color-border); margin-bottom: 32px; padding: 18px 24px; border-radius: 4px;">
          <div class="meter-text" style="font-size: 0.95rem;">
            <span>🚚</span>
            <span>
              ${shippingProgress.isFree 
                ? (isAr ? '<strong>تهانينا!</strong> لقد استفدت من التوصيل المجاني بالمغرب!' : '<strong>Félicitations !</strong> Vous bénéficiez de la livraison gratuite au Maroc !')
                : (isAr ? `أضف <strong>${StoreUtils.formatMoney(shippingProgress.remaining)}</strong> للاستفادة من التوصيل المجاني.` : `Ajoutez <strong>${StoreUtils.formatMoney(shippingProgress.remaining)}</strong> pour bénéficier de la livraison gratuite.`)}
            </span>
          </div>
          <div class="meter-bar-container" style="height: 6px; margin-top: 10px;">
            <div class="meter-bar-fill ${shippingProgress.isFree ? 'achieved' : ''}" style="width: ${shippingProgress.percentage}%;"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 48px; align-items: start;">
          <!-- Items Table -->
          <div>
            <div style="border-bottom: 2px solid var(--color-dark); padding-bottom: 12px; display: grid; grid-template-columns: 3fr 1fr 1fr 1fr; font-family: var(--font-heading); font-size: 0.88rem; font-weight: 700; text-transform: uppercase;">
              <span>${isAr ? 'المنتج' : 'Produit'}</span>
              <span class="text-center">${isAr ? 'السعر' : 'Prix'}</span>
              <span class="text-center">${isAr ? 'الكمية' : 'Quantité'}</span>
              <span class="text-right">${isAr ? 'المجموع' : 'Total'}</span>
            </div>

            <div style="display: flex; flex-direction: column;">
              ${items.map(item => {
                const primaryTitle = isAr ? (item.nameAr || item.name) : (item.nameFr || item.name);
                const secondaryTitle = isAr ? (item.subtitleAr || '') : (item.subtitleFr || '');
                const variantLabel = isAr 
                  ? (item.weight ? `📦 الحجم: <strong>${item.weight}</strong>` : (item.size && item.size !== 'Standard' ? `📦 الحجم: <strong>${item.size}</strong>` : ''))
                  : (item.weight ? `📦 Format: <strong>${item.weight}</strong>` : (item.size && item.size !== 'Standard' ? `📦 Format: <strong>${item.size}</strong>` : ''));

                return `
                <div style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr; align-items: center; padding: 24px 0; border-bottom: 1px solid var(--color-border);">
                  <!-- Product details -->
                  <div style="display: flex; gap: 16px; align-items: center;">
                    <img src="${item.image}" alt="${primaryTitle}" style="width: 80px; height: 105px; object-fit: cover; background: #f5f5f5; border-radius: 4px;">
                    <div>
                      <a href="product.html?id=${item.productId}${item.color ? `&color=${item.color}` : ''}" class="font-heading" style="font-weight: 700; font-size: 1.05rem;">
                        ${primaryTitle}
                      </a>
                      ${secondaryTitle ? `
                        <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px;">${secondaryTitle}</div>
                      ` : ''}
                      <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 4px;">
                        ${item.colorName && item.colorName !== 'Standard' ? item.colorName : ''} ${variantLabel}
                      </div>
                      <button style="font-size: 0.78rem; color: var(--color-sale); text-decoration: underline; margin-top: 6px; cursor: pointer; background: none; border: none; padding: 0;"
                              onclick="window.StoreCart.removeItem('${item.variantId}')">
                        ${isAr ? 'حذف' : 'Supprimer'}
                      </button>
                    </div>
                  </div>

                  <!-- Unit Price -->
                  <div class="text-center font-heading" style="font-weight: 700;">
                    ${StoreUtils.formatMoney(item.price)}
                    ${item.compareAtPrice && item.compareAtPrice > item.price ? `
                      <div style="font-size: 0.78rem; text-decoration: line-through; color: var(--color-text-muted); margin-top: 2px;">
                        ${StoreUtils.formatMoney(item.compareAtPrice)}
                      </div>
                    ` : ''}
                  </div>

                  <!-- Qty -->
                  <div class="text-center">
                    <div class="qty-control" style="justify-content: center;">
                      <button type="button" class="qty-btn" onclick="window.StoreCart.updateQuantity('${item.variantId}', ${item.quantity - 1})" aria-label="${isAr ? 'تقليل الكمية' : 'Diminuer la quantité'}">-</button>
                      <input type="number" class="qty-input" min="1" max="${item.maxStock || 99}" value="${item.quantity}" onchange="window.StoreCart.updateQuantity('${item.variantId}', this.value)" aria-label="${isAr ? 'الكمية' : 'Quantité'}">
                      <button type="button" class="qty-btn" onclick="window.StoreCart.updateQuantity('${item.variantId}', ${item.quantity + 1})" aria-label="${isAr ? 'زيادة الكمية' : 'Augmenter la quantité'}">+</button>
                    </div>
                  </div>

                  <!-- Row Total -->
                  <div class="text-right font-heading" style="font-weight: 700; font-size: 1.1rem;">
                    ${StoreUtils.formatMoney(item.price * item.quantity)}
                  </div>
                </div>
              `;
              }).join('')}
            </div>

            <!-- Special instructions textarea -->
            <div style="margin-top: 32px;">
              <label class="form-label" for="cart-order-note" style="font-weight: 700;">
                ${isAr ? 'تعليمات خاصة لمندوب التوصيل :' : 'Instructions spéciales pour la livraison :'}
              </label>
              <textarea id="cart-order-note" class="form-textarea" rows="3" placeholder="${isAr ? 'ملاحظات حول العنوان، أوقات الاستلام المناسبة...' : 'Précisions sur l’adresse ou horaires préférentiels...'}" style="text-align: ${isAr ? 'right' : 'left'};">${cart.orderNote || ''}</textarea>
            </div>
          </div>

          <!-- Order Summary Card -->
          <div style="background-color: var(--color-bg-secondary); padding: 32px; border: 1px solid var(--color-border); border-radius: 6px;">
            <h3 style="font-size: 1.3rem; margin-bottom: 20px; font-weight: 800;">
              ${isAr ? 'ملخص الطلبية' : 'Résumé de la Commande'}
            </h3>

            <div style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); font-size: 0.95rem;">
              <div style="display: flex; justify-content: space-between;">
                <span>${isAr ? 'المجموع الفرعي' : 'Sous-total'}</span>
                <span class="font-heading" dir="ltr" style="font-weight: 700; text-align: ${isAr ? 'left' : 'right'};"><bdi dir="ltr">${StoreUtils.formatMoney(subtotal)}</bdi></span>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <span>${isAr ? 'مصاريف التوصيل (المغرب)' : 'Frais de livraison (Maroc)'}</span>
                <span dir="ltr" style="text-align: ${isAr ? 'left' : 'right'};">${shipping === 0 ? `<strong style="color: var(--color-success);">${isAr ? 'مجاني' : 'Gratuit'}</strong>` : `<bdi dir="ltr">${StoreUtils.formatMoney(shipping)}</bdi>`}</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0; font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800;">
              <span>${isAr ? 'المجموع الإجمالي' : 'Montant Total'}</span>
              <span style="color: var(--color-dark);" dir="ltr" style="text-align: ${isAr ? 'left' : 'right'};"><bdi dir="ltr">${StoreUtils.formatMoney(total)}</bdi></span>
            </div>

            <a href="checkout.html" class="btn btn-primary btn-full btn-lg" style="margin-bottom: 12px; font-weight: 800; font-size: 1.05rem;">
              ${isAr ? 'إتمام الطلب (الدفع عند الاستلام) 📦' : 'Commander (Paiement à la livraison) 📦'}
            </a>

            <div style="text-align: center; font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5;">
              ${isAr ? 'الأسعار شاملة للضريبة. الدفع نقداً عند استلام الشحنة ومعاينتها.' : 'Prix TTC. Paiement en espèces auprès du livreur à la réception.'}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindCartPageEvents();
  },

  bindCartPageEvents() {
    const noteEl = document.getElementById("cart-order-note");
    if (noteEl) {
      noteEl.addEventListener("input", (e) => {
        window.StoreCart.setOrderNote(e.target.value);
      });
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.CartPageController.init();
});
