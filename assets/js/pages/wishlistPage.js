/**
 * Wishlist Page Controller
 * Displays saved items with quick add-to-cart, individual removal, and empty state.
 * Bilingual: Arabic (RTL) & French (LTR).
 */

window.WishlistPageController = {
  init() {
    if (window.HeaderComponent) window.HeaderComponent.mount();
    if (window.FooterComponent) window.FooterComponent.mount();

    this.render();

    window.addEventListener("wishlist:updated", () => {
      this.render();
    });
  },

  render() {
    const container = document.getElementById("wishlist-grid-container");
    const countEl = document.getElementById("wishlist-count-display");
    if (!container) return;

    const wishlist = window.StoreWishlist;
    const items = (wishlist && wishlist.getProducts()) || [];
    const isAr = window.I18N ? window.I18N.isRTL() : true;

    document.title = isAr ? 'قائمة المنتجات المفضلة | دي إكس إن وكالو المغرب' : 'Mes Produits Favoris | DXN & KALLOW Maroc';

    const pageTitle = document.getElementById("wishlist-page-title");
    if (pageTitle) pageTitle.textContent = isAr ? 'قائمة المنتجات المفضلة' : 'Mes Produits Favoris';

    const crumbHome = document.getElementById("wishlist-crumb-home");
    if (crumbHome) crumbHome.textContent = isAr ? 'الرئيسية' : 'Accueil';

    const crumbCurrent = document.getElementById("wishlist-crumb-current");
    if (crumbCurrent) crumbCurrent.textContent = isAr ? 'المفضلة' : 'Favoris';

    if (countEl) {
      countEl.textContent = isAr 
        ? `${items.length} منتج محفوظ`
        : `${items.length} article${items.length > 1 ? 's' : ''} sauvegardé${items.length > 1 ? 's' : ''}`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 64px 20px; text-align: center; background-color: var(--color-bg-secondary); border-radius: 6px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px; stroke: var(--color-text-muted);">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <h3 style="margin-bottom: 8px; font-weight: 700;">${isAr ? 'قائمة المنتجات المفضلة فارغة حالياً' : 'Votre liste de favoris est vide'}</h3>
          <p style="margin-bottom: 24px; color: var(--color-text-secondary);">${isAr ? 'انقر على رمز القلب على أي منتج لحفظه والرجوع إليه لاحقاً.' : 'Sauvegardez vos articles préférés pour les retrouver facilement plus tard.'}</p>
          <a href="shop.html" class="btn btn-primary btn-sm" style="font-weight: 700;">${isAr ? 'تصفح المتجر' : 'Découvrir la boutique'}</a>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(product => window.ProductCardComponent.render(product)).join('');
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.WishlistPageController.init();
});
