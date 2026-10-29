/**
 * Header & Navigation Component
 * Sticky scroll detection, announcement bar, mobile drawer, wishlist/cart badges, and search modal.
 */

window.HeaderComponent = {
  mount(containerId = "site-header-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const config = window.STORE_CONFIG;
    const wishlistCount = window.StoreWishlist ? window.StoreWishlist.getCount() : 0;
    const cartCount = window.StoreCart ? window.StoreCart.getCount() : 0;
    const lang = window.I18N ? window.I18N.getLang() : "ar";
    const isAr = lang === "ar";

    const announcementText = isAr 
      ? (config.announcementText || "🚚 توصيل سريع خلال 24-48 ساعة لكافة مدن المغرب • الدفع عند الاستلام")
      : "🚚 Livraison Express 24-48h partout au Maroc • Paiement Sécurisé à la Livraison";
    const announcementLinkText = isAr ? "اكتشف المزيد" : "Découvrir";

    const brandName = isAr ? "دي إكس إن وكالو" : "DXN & KALLOW";
    const brandSubtitle = isAr
      ? "منتجات الصحة والجمال الطبيعي بالمغرب"
      : "Santé, Bien-être & Beauté Naturelle au Maroc";

    this.updateDocumentTitle(isAr);

    container.innerHTML = `
      ${config.showAnnouncement ? `
        <div class="announcement-bar" id="announcement-bar">
          <span>${announcementText}</span>
          ${config.announcementLink ? ` &nbsp;•&nbsp; <a href="${config.announcementLink}">${announcementLinkText}</a>` : ''}
        </div>
      ` : ''}

      <header class="site-header" id="site-header">
        <div class="container">
          <div class="header-inner">
            <!-- Mobile Toggle -->
            <button class="action-btn mobile-menu-toggle" id="mobile-drawer-open" aria-label="Menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <!-- Brand Logo -->
            <a href="index.html" class="brand-logo">
              <img src="assets/logo.png" alt="DXN & KALLOW" class="brand-logo-img">
              <div class="brand-logo-text">
                <span class="brand-logo-main">${brandName}</span>
                <span class="brand-logo-sub">${brandSubtitle}</span>
              </div>
            </a>

            <!-- Desktop Nav Links -->
            <nav class="main-nav" aria-label="${isAr ? 'التنقل الرئيسي' : 'Navigation principale'}">
              <a href="shop.html" class="nav-link">${isAr ? 'المتجر' : 'Boutique'}</a>
              <a href="collections.html" class="nav-link">${isAr ? 'المجموعات' : 'Collections'}</a>
              <a href="about.html" class="nav-link">${isAr ? 'من نحن' : 'À Propos'}</a>
              <a href="contact.html" class="nav-link">${isAr ? 'اتصل بنا' : 'Contact'}</a>
            </nav>

            <!-- Action Buttons -->
            <div class="header-actions">
              <!-- Live Search Trigger -->
              <button class="action-btn" id="search-modal-trigger" aria-label="${isAr ? 'بحث' : 'Rechercher'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              <!-- Language Switcher Pill -->
              <div class="header-lang-switch" id="header-lang-switch" title="${isAr ? 'تغيير اللغة' : 'Changer de langue'}">
                <button type="button" class="header-lang-btn ${isAr ? 'active' : ''}" onclick="window.I18N.setLang('ar')" aria-label="العربية">عربي</button>
                <span class="header-lang-divider">|</span>
                <button type="button" class="header-lang-btn ${!isAr ? 'active' : ''}" onclick="window.I18N.setLang('fr')" aria-label="Français">FR</button>
              </div>

              <!-- Admin Control Center Shortcut -->
              <a href="admin.html" class="action-btn" aria-label="${isAr ? 'لوحة الإدارة' : 'Tableau de Bord Admin'}" title="${isAr ? 'إدارة المخزون والطلبات' : 'Tableau de Bord & Gestion des Stocks'}" style="color: #D4AF37;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </a>

              <!-- Account -->
              <a href="account.html" class="action-btn" aria-label="${isAr ? 'حسابي' : 'Compte'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </a>

              <!-- Wishlist -->
              <a href="wishlist.html" class="action-btn" aria-label="${isAr ? 'المفضلة' : 'Favoris'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="badge-counter" id="header-wishlist-count" style="${wishlistCount > 0 ? '' : 'display:none;'}">${wishlistCount}</span>
              </a>

              <!-- Cart Drawer Trigger -->
              <button class="action-btn" id="cart-drawer-trigger" aria-label="${isAr ? 'سلة التسوق' : 'Panier'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span class="badge-counter" id="header-cart-count" style="${cartCount > 0 ? '' : 'display:none;'}">${cartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-content">
          <div class="mobile-drawer-header">
            <div class="brand-logo">
              <img src="assets/logo.png" alt="DXN & KALLOW" class="brand-logo-img">
              <div class="brand-logo-text">
                <span class="brand-logo-main">${brandName}</span>
                <span class="brand-logo-sub">${brandSubtitle}</span>
              </div>
            </div>
            <button class="action-btn" id="mobile-drawer-close" aria-label="${isAr ? 'إغلاق القائمة' : 'Fermer le menu'}">✕</button>
          </div>

          <!-- Mobile Language Switch -->
          <div class="mobile-drawer-lang">
            <span class="mobile-drawer-lang-label">${isAr ? 'اللغة / Langue' : 'Langue / اللغة'}</span>
            <div class="mobile-lang-btn-group">
              <button type="button" class="mobile-lang-btn ${isAr ? 'active' : ''}" onclick="window.I18N.setLang('ar')">العربية (AR)</button>
              <button type="button" class="mobile-lang-btn ${!isAr ? 'active' : ''}" onclick="window.I18N.setLang('fr')">Français (FR)</button>
            </div>
          </div>

          <div class="mobile-drawer-nav">
            <a href="shop.html" class="mobile-nav-link">${isAr ? 'المتجر (جميع المنتجات)' : 'Boutique (Tous les Produits)'} <span>${isAr ? '←' : '→'}</span></a>
            <a href="collections.html" class="mobile-nav-link">${isAr ? 'المجموعات' : 'Collections'} <span>${isAr ? '←' : '→'}</span></a>
            <a href="shop.html?filter=sale" class="mobile-nav-link" style="color: var(--color-sale);">${isAr ? 'العروض والتخفيضات' : 'Promotions & Soldes'} <span>${isAr ? '←' : '→'}</span></a>
            
            <!-- Main Category Departments -->
            <div class="mobile-drawer-categories" style="margin: 10px 0; padding: 10px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">
                ${isAr ? 'الأقسام الرئيسية' : 'Rayons & Catégories'}
              </div>
              ${((window.CategoryManager && window.CategoryManager.getMainCategories()) || window.STORE_MAIN_CATEGORIES || []).map(m => `
                <a href="shop.html?category=${m.slug}" class="mobile-nav-link" style="font-size: 0.88rem; padding: 7px 0;">
                  <span>${isAr ? m.nameAr : m.nameFr}</span>
                  <span style="font-size: 0.78rem; color: var(--color-text-secondary);">${isAr ? '←' : '→'}</span>
                </a>
              `).join('')}
            </div>

            <a href="about.html" class="mobile-nav-link">${isAr ? 'من نحن' : 'À Propos'} <span>${isAr ? '←' : '→'}</span></a>
            <a href="shipping-returns.html" class="mobile-nav-link">${isAr ? 'الشحن والتوصيل بالمغرب' : 'Livraison & Retours au Maroc'} <span>${isAr ? '←' : '→'}</span></a>
            <a href="contact.html" class="mobile-nav-link">${isAr ? 'خدمة العملاء' : 'Service Client & Contact'} <span>${isAr ? '←' : '→'}</span></a>
            <a href="admin.html" class="mobile-nav-link" style="color: #D4AF37; font-weight: 600;">${isAr ? 'إدارة المخزون (Admin)' : 'Gestion Stocks (Admin)'} <span>${isAr ? '←' : '→'}</span></a>
          </div>

          <div class="mobile-drawer-footer">
            <div style="font-size: 0.82rem; color: var(--color-text-secondary);">
              📍 ${isAr ? 'طنجة، المغرب' : 'Tanger, Maroc'}<br>
              🚚 ${isAr ? 'توصيل سريع خلال 24 إلى 48 ساعة بالمغرب' : 'Livraison express en 24 à 48h partout au Maroc'}
            </div>
            <div style="display: flex; gap: 12px; margin-top: 8px;">
              <a href="${config.social.instagram}" target="_blank" style="font-size: 0.8rem; font-weight: 600;">INSTAGRAM</a>
              <a href="${config.social.tiktok}" target="_blank" style="font-size: 0.8rem; font-weight: 600;">TIKTOK</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Search Modal -->
      <div class="search-modal" id="search-modal">
        <div class="search-modal-container">
          <div class="search-modal-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="search-modal-input" id="search-modal-input" placeholder="${isAr ? 'ابحث عن منتج، قهوة، مكمل غذائي، سيروم...' : 'Rechercher un produit, café, complément, soin...'}" autocomplete="off">
            <button class="action-btn" id="search-modal-close">✕</button>
          </div>
          <div class="search-modal-results" id="search-modal-results">
            <p class="text-muted" style="padding: 12px 0;">${isAr ? 'اكتب كلمة للبحث الفوري عن المنتجات...' : 'Tapez au moins 2 caractères pour rechercher...'}</p>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.bindBadges();
  },

  bindEvents() {
    // Mobile Drawer
    const drawer = document.getElementById("mobile-drawer");
    const openBtn = document.getElementById("mobile-drawer-open");
    const closeBtn = document.getElementById("mobile-drawer-close");

    if (openBtn && drawer) {
      openBtn.addEventListener("click", () => {
        drawer.classList.add("open");
        document.body.classList.add("overflow-locked");
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener("click", () => {
        drawer.classList.remove("open");
        document.body.classList.remove("overflow-locked");
      });
      drawer.addEventListener("click", (e) => {
        if (e.target === drawer) {
          drawer.classList.remove("open");
          document.body.classList.remove("overflow-locked");
        }
      });
    }

    // Cart Trigger
    const cartTrigger = document.getElementById("cart-drawer-trigger");
    if (cartTrigger) {
      cartTrigger.addEventListener("click", () => {
        if (window.CartDrawerComponent) {
          window.CartDrawerComponent.open();
        } else {
          window.location.href = "cart.html";
        }
      });
    }

    // Search Modal
    const searchModal = document.getElementById("search-modal");
    const searchTrigger = document.getElementById("search-modal-trigger");
    const searchClose = document.getElementById("search-modal-close");
    const searchInput = document.getElementById("search-modal-input");
    const searchResults = document.getElementById("search-modal-results");

    if (searchTrigger && searchModal) {
      searchTrigger.addEventListener("click", () => {
        searchModal.classList.add("open");
        document.body.classList.add("overflow-locked");
        setTimeout(() => searchInput && searchInput.focus(), 100);
      });
    }

    const closeSearch = () => {
      searchModal.classList.remove("open");
      document.body.classList.remove("overflow-locked");
    };

    if (searchClose && searchModal) {
      searchClose.addEventListener("click", closeSearch);
      searchModal.addEventListener("click", (e) => {
        if (e.target === searchModal) closeSearch();
      });
    }

    // Live Search Typing
    if (searchInput && searchResults) {
      searchInput.addEventListener("input", StoreUtils.debounce((e) => {
        const query = e.target.value.trim();
        const isAr = window.I18N ? window.I18N.isRTL() : true;
        if (query.length < 2) {
          searchResults.innerHTML = `<p class="text-muted" style="padding: 12px 0;">${isAr ? 'اكتب حرفين على الأقل للبحث...' : 'Tapez au moins 2 caractères...'}</p>`;
          return;
        }

        const results = window.StoreSearch.search(query);
        if (results.length === 0) {
          searchResults.innerHTML = `
            <div style="padding: 24px 0; text-align: center;">
              <p>${isAr ? `لم يتم العثور على أي منتج لـ "<strong>${query}</strong>"` : `Aucun produit trouvé pour "<strong>${query}</strong>"`}</p>
              <a href="shop.html" class="btn btn-secondary btn-sm" style="margin-top: 12px;" onclick="document.getElementById('search-modal').classList.remove('open')">
                ${isAr ? 'تصفح كامل المتجر' : 'Voir toute la boutique'}
              </a>
            </div>
          `;
        } else {
          let html = `
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 8px;">
              ${isAr ? `${results.length} نتيجة بحث` : `${results.length} résultat(s)`}
            </div>
          `;
          results.slice(0, 5).forEach(product => {
            const firstColor = product.colors[0];
            const img = (product.images[firstColor.code] && product.images[firstColor.code][0]) || firstColor.image;
            const primaryTitle = isAr ? (product.nameAr || product.name) : (product.nameFr || product.name);
            const secondarySub = isAr ? (product.subtitleAr || '') : (product.subtitleFr || '');
            const categoryLabel = isAr ? (product.categoryName || product.category) : (product.categoryNameFr || product.category);
            html += `
              <a href="product.html?id=${product.id}" class="search-result-item" onclick="document.getElementById('search-modal').classList.remove('open')">
                <img src="${img}" alt="${primaryTitle}" class="search-result-thumb">
                <div class="search-result-info">
                  <div class="font-heading" style="font-weight: 600; font-size: 0.95rem;">${primaryTitle}</div>
                  ${secondarySub ? `<div style="font-size: 0.78rem; color: var(--color-primary); font-weight: 500;">${secondarySub}</div>` : ''}
                  <div style="font-size: 0.76rem; color: var(--color-text-secondary); margin-top: 2px;">${categoryLabel}</div>
                  <div style="font-weight: 700; font-size: 0.9rem; margin-top: 2px;">${StoreUtils.formatMoney(product.price)}</div>
                </div>
              </a>
            `;
          });
          html += `
            <div style="margin-top: 14px; text-align: center;">
              <a href="shop.html?q=${encodeURIComponent(query)}" class="btn btn-primary btn-sm btn-full" onclick="document.getElementById('search-modal').classList.remove('open')">
                ${isAr ? `عرض جميع النتائج (${results.length})` : `Voir tous les résultats (${results.length})`}
              </a>
            </div>
          `;
          searchResults.innerHTML = html;
        }
      }, 200));
    }
  },

  bindBadges() {
    window.addEventListener("cart:updated", (e) => {
      const badge = document.getElementById("header-cart-count");
      if (badge) {
        badge.textContent = e.detail.count;
        badge.style.display = e.detail.count > 0 ? "flex" : "none";
      }
    });

    window.addEventListener("wishlist:updated", (e) => {
      const badge = document.getElementById("header-wishlist-count");
      if (badge) {
        badge.textContent = e.detail.count;
        badge.style.display = e.detail.count > 0 ? "flex" : "none";
      }
    });
  },

  updateDocumentTitle(isAr) {
    if (typeof document === 'undefined') return;
    const path = (window.location.pathname || '').toLowerCase();
    const titles = {
      'shop': {
        ar: 'متجر المنتجات الطبيعية | دي إكس إن وكالو المغرب',
        fr: 'Boutique & Catalogue Officiel | DXN & KALLOW Maroc'
      },
      'product': {
        ar: 'تفاصيل المنتج | دي إكس إن وكالو المغرب',
        fr: 'Détails Produit | DXN & KALLOW Maroc'
      },
      'about': {
        ar: 'من نحن ورؤيتنا الصحية | دي إكس إن وكالو المغرب',
        fr: 'À Propos & Notre Histoire | DXN & KALLOW Maroc'
      },
      'contact': {
        ar: 'اتصل بنا وخدمة العملاء | دي إكس إن وكالو المغرب',
        fr: 'Contact & Service Client | DXN & KALLOW Maroc'
      },
      'collections': {
        ar: 'المجموعات والتصنيفات | دي إكس إن وكالو المغرب',
        fr: 'Collections & Gammes | DXN & KALLOW Maroc'
      },
      'shipping-returns': {
        ar: 'الشحن والتوصيل بالمغرب | دي إكس إن وكالو المغرب',
        fr: 'Livraison & Retours au Maroc | DXN & KALLOW Maroc'
      },
      'cart': {
        ar: 'سلة التسوق | دي إكس إن وكالو المغرب',
        fr: 'Votre Panier | DXN & KALLOW Maroc'
      },
      'checkout': {
        ar: 'إتمام الطلب والدفع عند الاستلام | دي إكس إن وكالو المغرب',
        fr: 'Commander - Paiement à la Livraison | DXN & KALLOW Maroc'
      },
      'wishlist': {
        ar: 'قائمة المنتجات المفضلة | دي إكس إن وكالو المغرب',
        fr: 'Mes Produits Favoris | DXN & KALLOW Maroc'
      },
      'admin': {
        ar: 'لوحة التحكم وإدارة المخزون | دي إكس إن وكالو',
        fr: 'Tableau de Bord Admin & Stocks | DXN & KALLOW'
      },
      'index': {
        ar: 'دي إكس إن وكالو المغرب | متجر الصحة والجمال الطبيعي 100%',
        fr: 'DXN & KALLOW Maroc | Boutique Officielle Santé & Beauté Naturelle'
      }
    };

    for (const key of Object.keys(titles)) {
      if (path.includes(key)) {
        if (key !== 'product' || !document.title || document.title.includes('ATELIER') || document.title.includes('Détails Produit')) {
          document.title = isAr ? titles[key].ar : titles[key].fr;
        }
        return;
      }
    }
    // Default fallback (e.g. root /)
    document.title = isAr ? titles['index'].ar : titles['index'].fr;
  }
};
