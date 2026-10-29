/**
 * Shop / Catalog Page Controller
 * Dynamic multi-facet filtering (category, size, color, price, stock, sale),
 * sorting, URL query param sync, and responsive layout.
 * Bilingual: Arabic (RTL) & French (LTR).
 */

window.ShopController = {
  products: [],
  filters: {
    category: null,
    collection: null,
    sizes: [],
    colors: [],
    maxPrice: 3500,
    inStockOnly: false,
    saleOnly: false,
    query: ""
  },
  sortBy: "featured",

  init() {
    if (window.HeaderComponent) window.HeaderComponent.mount();
    if (window.FooterComponent) window.FooterComponent.mount();

    // Filter out bundle packs, deleted, and disabled products from standard catalog
    let deletedIds = [];
    try {
      const rawDeleted = localStorage.getItem("atelier_deleted_product_ids_v2");
      if (rawDeleted) deletedIds = JSON.parse(rawDeleted);
    } catch(e) {}
    const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);

    this.products = (window.STORE_PRODUCTS || []).filter(p => 
      p && 
      !deletedSet.has(p.id) &&
      p.status !== 'disabled' && 
      p.isActive !== false && 
      p.disabled !== true &&
      !p.isBundle && 
      p.id !== 'pack-trio-tshirts'
    );

    // Parse URL parameters
    const params = StoreUtils.getUrlParams();
    if (params.collection === 'packs-bundles') {
      window.location.href = 'collections.html?c=packs-bundles';
      return;
    }
    if (params.category) this.filters.category = params.category;
    if (params.collection) this.filters.collection = params.collection;
    if (params.sort) this.sortBy = params.sort;
    if (params.filter === "sale") this.filters.saleOnly = true;
    if (params.q) this.filters.query = params.q;
    if (params.size) this.filters.sizes = params.size.split(",");
    if (params.color) this.filters.colors = params.color.split(",");

    this.applyLanguage();
    this.renderCategoryChips();
    this.renderFilterSidebar();
    this.bindEvents();
    this.applyFiltersAndRender();
  },

  applyLanguage() {
    const isAr = window.I18N ? window.I18N.isRTL() : true;
    document.title = isAr ? 'متجر المنتجات الطبيعية | دي إكس إن وكالو المغرب' : 'Boutique & Catalogue Officiel | DXN & KALLOW Maroc';

    // Breadcrumbs
    const breadcrumbs = document.querySelector(".pdp-breadcrumbs");
    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <a href="index.html">${isAr ? 'الرئيسية' : 'Accueil'}</a>
        <span>/</span>
        <span>${isAr ? 'المتجر' : 'Boutique'}</span>
      `;
    }

    // Page title and subtitle
    const pageHeader = document.querySelector("#main-content h1");
    if (pageHeader) {
      pageHeader.textContent = isAr ? 'متجر الصحة والجمال الطبيعي' : 'Boutique Santé & Beauté Naturelle';
    }
    const pageSub = document.querySelector("#main-content h1 + p");
    if (pageSub) {
      pageSub.textContent = isAr 
        ? 'اكتشف مجموعتنا المتكاملة من منتجات دي إكس إن (DXN) وكالو (Kallow) الطبيعية للعناية الفائقة، المكملات الغذائية المعززة للصحة، والقهوة الصحية الفاخرة.'
        : 'Découvrez notre sélection officielle de produits naturels DXN et Kallow : compléments alimentaires, soins dermo-cosmétiques et cafés bien-être.';
    }

    // Mobile Filter Button Label
    const mobileFilterLabel = document.getElementById("shop-filter-mobile-label");
    if (mobileFilterLabel) {
      mobileFilterLabel.textContent = isAr ? 'تصفية' : 'Filtres';
    }

    // Sort label & options
    const sortLabel = document.querySelector("label[for='shop-sort-select']");
    if (sortLabel) sortLabel.textContent = isAr ? 'الترتيب :' : 'Trier par :';

    const sortSelect = document.getElementById("shop-sort-select");
    if (sortSelect) {
      sortSelect.style.textAlign = isAr ? "right" : "left";
      const currentVal = sortSelect.value || this.sortBy;
      sortSelect.innerHTML = isAr ? `
        <option value="featured">الترتيب الموصى به</option>
        <option value="newest">أحدث المنتجات</option>
        <option value="price-asc">السعر : من الأقل إلى الأعلى</option>
        <option value="price-desc">السعر : من الأعلى إلى الأقل</option>
        <option value="alpha">الاسم : أ - ي</option>
      ` : `
        <option value="featured">Recommandés & Vedettes</option>
        <option value="newest">Nouveautés</option>
        <option value="price-asc">Prix : croissant</option>
        <option value="price-desc">Prix : décroissant</option>
        <option value="alpha">Nom : A - Z</option>
      `;
      sortSelect.value = currentVal;
    }
  },

  renderFilterSidebar() {
    const sidebar = document.getElementById("shop-filter-sidebar");
    if (!sidebar) return;

    const isAr = window.I18N ? window.I18N.isRTL() : true;
    const mainCategories = window.STORE_MAIN_CATEGORIES || [];
    const allSubs = window.STORE_CATEGORIES || [];

    const treeHtml = mainCategories.map(main => {
      const subs = allSubs.filter(s => (main.subcategories || []).includes(s.slug) || s.parentCategory === main.slug);
      const mainCount = (this.products || []).filter(p => {
        if (main.slug === 'kallow') {
          return p.brand === 'Kallow' || (p.id && p.id.startsWith('kallow')) || (Array.isArray(p.collections) && p.collections.includes('kallow'));
        }
        return (main.subcategories || []).includes(p.category) || p.categoryGroup === main.slug || p.mainCategory === main.slug;
      }).length;
      const isMainChecked = this.filters.category === main.slug;
      const isAnySubChecked = subs.some(s => this.filters.category === s.slug);
      const isCardActive = isMainChecked || isAnySubChecked;

      const mainTitle = isAr ? (main.nameAr || main.name) : (main.nameFr || main.name);

      const subsHtml = subs.map(sub => {
        const subCount = (this.products || []).filter(p => p.category === sub.slug || p.category === sub.id).length;
        const subTitle = isAr ? (sub.nameAr || sub.name) : (sub.nameFr || sub.name);
        const isSubChecked = this.filters.category === sub.slug;
        const statusLabel = !sub.active ? (isAr ? '(قريباً)' : '(Bientôt)') : `${subCount}`;

        return `
          <label class="filter-sub-label ${isSubChecked ? 'is-active' : ''}">
            <span style="display: flex; align-items: center; gap: 8px;">
              <input type="radio" name="filter-category" value="${sub.slug}" ${isSubChecked ? 'checked' : ''} ${!sub.active ? 'disabled' : ''}>
              <span>${subTitle}</span>
            </span>
            <span class="filter-count-badge">${statusLabel}</span>
          </label>
        `;
      }).join('');

      return `
        <div class="filter-tree-main-item ${isCardActive ? 'is-selected' : ''}">
          <label class="filter-main-label">
            <span style="display: flex; align-items: center; gap: 8px;">
              <input type="radio" name="filter-category" value="${main.slug}" ${isMainChecked ? 'checked' : ''}>
              <span>${main.code ? main.code + '. ' : ''}${mainTitle}</span>
            </span>
            <span class="filter-count-badge" style="background: rgba(212, 175, 55, 0.15); color: var(--color-primary);">${mainCount}</span>
          </label>
          <div class="filter-sub-list">
            ${subsHtml}
          </div>
        </div>
      `;
    }).join('');

    sidebar.innerHTML = `
      <!-- Mobile Drawer Header -->
      <div class="filter-drawer-header">
        <h3 class="filter-drawer-title">${isAr ? 'تصفية المنتجات' : 'Filtrer les Produits'}</h3>
        <button type="button" class="filter-drawer-close" id="filter-drawer-close-btn" aria-label="Fermer">✕</button>
      </div>

      <!-- Category Filter -->
      <div class="filter-group">
        <div class="filter-group-title">
          <span>${isAr ? 'التصنيفات الموصى بها' : 'Catégories & Rayons'}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <label class="filter-checkbox-label" style="font-weight: 700; color: var(--color-text-primary);">
            <input type="radio" name="filter-category" value="all" ${!this.filters.category ? 'checked' : ''}>
            <span>${isAr ? `جميع المنتجات (${this.products.length})` : `Tous les produits (${this.products.length})`}</span>
          </label>
        </div>

        <div class="filter-category-tree">
          ${treeHtml}
        </div>
      </div>

      <!-- Price Range Filter -->
      <div class="filter-group">
        <div class="filter-group-title">
          <span>${isAr ? 'السعر الأقصى' : 'Prix Maximum'}</span>
          <span id="price-display-val" style="color: var(--color-dark);">${StoreUtils.formatMoney(this.filters.maxPrice)}</span>
        </div>
        <input type="range" id="filter-price-range" min="30" max="3500" step="20" value="${this.filters.maxPrice}" style="width: 100%; accent-color: var(--color-dark); cursor: pointer;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted); margin-top: 6px;">
          <span>${StoreUtils.formatMoney(30)}</span>
          <span>${StoreUtils.formatMoney(3500)}</span>
        </div>
      </div>

      <!-- Quick Toggles -->
      <div class="filter-group">
        <div class="filter-group-title">${isAr ? 'التوفر والعروض' : 'Disponibilité & Offres'}</div>
        <div class="filter-options-list">
          <label class="filter-checkbox-label">
            <input type="checkbox" id="filter-instock" ${this.filters.inStockOnly ? 'checked' : ''}>
            <span>${isAr ? 'المتوفر بالمخزون فقط' : 'En stock uniquement'}</span>
          </label>
          <label class="filter-checkbox-label">
            <input type="checkbox" id="filter-sale" ${this.filters.saleOnly ? 'checked' : ''}>
            <span style="color: var(--color-sale); font-weight: 700;">${isAr ? 'العروض والتخفيضات فقط' : 'Offres & Promotions uniquement'}</span>
          </label>
        </div>
      </div>

      <!-- Reset button -->
      <button class="btn btn-secondary btn-full btn-sm" id="clear-all-filters-btn" style="font-weight: 700;">
        ${isAr ? 'إعادة ضبط الفلاتر' : 'Réinitialiser les filtres'}
      </button>

      <!-- Mobile Drawer Apply Footer -->
      <div class="filter-drawer-footer">
        <button type="button" class="btn btn-primary btn-full" id="filter-drawer-apply-btn" style="height: 44px; font-weight: 700;">
          ${isAr ? 'تطبيق الفلاتر والاطلاع' : 'Appliquer les filtres'}
        </button>
      </div>
    `;

    this.bindSidebarEvents();
  },

  renderCategoryChips() {
    const container = document.getElementById("shop-category-chips");
    if (!container) return;

    const isAr = window.I18N ? window.I18N.isRTL() : true;
    const mainCategories = window.STORE_MAIN_CATEGORIES || [];
    const activeCat = this.filters.category;

    const allPill = `
      <button type="button" class="category-chip ${!activeCat ? 'active' : ''}" data-category="all">
        ${isAr ? `الكل (${this.products.length})` : `Tous (${this.products.length})`}
      </button>
    `;

    const mainPills = mainCategories.map(main => {
      const isSelected = activeCat === main.slug;
      const count = (this.products || []).filter(p => {
        if (main.slug === 'kallow') {
          return p.brand === 'Kallow' || (p.id && p.id.startsWith('kallow')) || (Array.isArray(p.collections) && p.collections.includes('kallow'));
        }
        return (main.subcategories || []).includes(p.category) || p.categoryGroup === main.slug || p.mainCategory === main.slug;
      }).length;

      const title = isAr ? (main.nameAr || main.name) : (main.nameFr || main.name);
      return `
        <button type="button" class="category-chip ${isSelected ? 'active' : ''}" data-category="${main.slug}">
          ${title} (${count})
        </button>
      `;
    }).join('');

    container.innerHTML = allPill + mainPills;

    container.querySelectorAll(".category-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const cat = chip.getAttribute("data-category");
        this.filters.category = cat === "all" ? null : cat;
        this.renderCategoryChips();
        this.renderFilterSidebar();
        this.applyFiltersAndRender();
      });
    });
  },

  updateActiveFilterBadge() {
    const badge = document.getElementById("shop-filter-active-count");
    if (!badge) return;
    let count = 0;
    if (this.filters.category) count++;
    if (this.filters.collection) count++;
    if (this.filters.maxPrice < 3500) count++;
    if (this.filters.inStockOnly) count++;
    if (this.filters.saleOnly) count++;
    if (this.filters.query) count++;

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  },

  bindSidebarEvents() {
    // Mobile Drawer Close / Apply listeners
    const drawerCloseBtn = document.getElementById("filter-drawer-close-btn");
    const drawerApplyBtn = document.getElementById("filter-drawer-apply-btn");
    const backdrop = document.getElementById("filter-drawer-backdrop");
    const sidebar = document.getElementById("shop-filter-sidebar");

    const closeDrawer = () => {
      if (sidebar) sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
      document.body.classList.remove("overflow-locked");
    };

    if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);
    if (drawerApplyBtn) drawerApplyBtn.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);

    // Category radio changes
    document.querySelectorAll("input[name='filter-category']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.filters.category = e.target.value === "all" ? null : e.target.value;
        this.renderCategoryChips();
        this.applyFiltersAndRender();
      });
    });

    // Price slider
    const priceSlider = document.getElementById("filter-price-range");
    const priceDisplay = document.getElementById("price-display-val");
    if (priceSlider) {
      priceSlider.addEventListener("input", (e) => {
        const val = Number(e.target.value);
        this.filters.maxPrice = val;
        if (priceDisplay) priceDisplay.textContent = StoreUtils.formatMoney(val);
      });
      priceSlider.addEventListener("change", () => {
        this.applyFiltersAndRender();
      });
    }

    // In Stock toggle
    const inStockCheck = document.getElementById("filter-instock");
    if (inStockCheck) {
      inStockCheck.addEventListener("change", (e) => {
        this.filters.inStockOnly = e.target.checked;
        this.applyFiltersAndRender();
      });
    }

    // Sale toggle
    const saleCheck = document.getElementById("filter-sale");
    if (saleCheck) {
      saleCheck.addEventListener("change", (e) => {
        this.filters.saleOnly = e.target.checked;
        this.applyFiltersAndRender();
      });
    }

    // Clear all
    const clearBtn = document.getElementById("clear-all-filters-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearAllFilters());
    }
  },

  bindEvents() {
    // Mobile filter button trigger
    const mobileFilterBtn = document.getElementById("shop-filter-mobile-btn");
    if (mobileFilterBtn) {
      mobileFilterBtn.addEventListener("click", () => {
        const sidebar = document.getElementById("shop-filter-sidebar");
        const backdrop = document.getElementById("filter-drawer-backdrop");
        if (sidebar) sidebar.classList.add("open");
        if (backdrop) backdrop.classList.add("open");
        document.body.classList.add("overflow-locked");
      });
    }

    const sortSelect = document.getElementById("shop-sort-select");
    if (sortSelect) {
      sortSelect.value = this.sortBy;
      sortSelect.addEventListener("change", (e) => {
        this.sortBy = e.target.value;
        this.applyFiltersAndRender();
      });
    }

    window.addEventListener("language:changed", () => {
      this.applyLanguage();
      this.renderCategoryChips();
      this.renderFilterSidebar();
      this.applyFiltersAndRender();
    });
  },

  clearAllFilters() {
    this.filters = {
      category: null,
      collection: null,
      sizes: [],
      colors: [],
      maxPrice: 3500,
      inStockOnly: false,
      saleOnly: false,
      query: ""
    };
    this.sortBy = "featured";
    this.renderCategoryChips();
    this.renderFilterSidebar();
    this.applyFiltersAndRender();
  },

  applyFiltersAndRender() {
    let list = [...this.products];

    // 1. Search query
    if (this.filters.query) {
      list = window.StoreSearch.search(this.filters.query, { products: list });
    }

    // 2. Category (Hierarchical: matches Main Category or Subcategory)
    if (this.filters.category) {
      list = list.filter(p => {
        if (window.CategoryManager) {
          return window.CategoryManager.matchesCategoryFilter(p.category, this.filters.category, p);
        }
        return p.category === this.filters.category || p.categoryGroup === this.filters.category || (this.filters.category === 'kallow' && p.brand === 'Kallow');
      });
    }

    // 3. Collection
    if (this.filters.collection) {
      list = list.filter(p => {
        const slug = this.filters.collection;
        return (p.collections && p.collections.includes(slug)) ||
               p.categoryGroup === slug ||
               p.mainCategory === slug ||
               (slug === 'kallow' && p.brand === 'Kallow');
      });
    }

    // 4. Max Price
    list = list.filter(p => p.price <= this.filters.maxPrice);

    // 5. In Stock Only
    if (this.filters.inStockOnly) {
      list = list.filter(p => {
        const stock = p.stock !== undefined ? p.stock : (Array.isArray(p.variants) ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : 0);
        return stock > 0;
      });
    }

    // 6. Sale Only
    if (this.filters.saleOnly) {
      list = list.filter(p => p.isSale || (p.compareAtPrice && p.compareAtPrice > p.price));
    }

    // 7. Sort
    if (this.sortBy === "newest") {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (this.sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === "alpha") {
      const isAr = window.I18N ? window.I18N.isRTL() : true;
      list.sort((a, b) => {
        const nameA = isAr ? (a.nameAr || a.name) : (a.nameFr || a.name);
        const nameB = isAr ? (b.nameAr || b.name) : (b.nameFr || b.name);
        return nameA.localeCompare(nameB);
      });
    } else {
      // Featured
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    // Render Results Count & Active Filter Pills
    this.updateActiveFilterBadge();
    this.renderActiveFilterPills();
    this.renderGrid(list);
  },

  renderActiveFilterPills() {
    const pillsContainer = document.getElementById("active-filter-pills-container");
    const countEl = document.getElementById("shop-products-count");
    const isAr = window.I18N ? window.I18N.isRTL() : true;

    if (pillsContainer) {
      let pillsHtml = [];

      if (this.filters.query) {
        pillsHtml.push(`<span class="filter-pill">${isAr ? 'بحث: ' : 'Recherche: '}"${this.filters.query}" <span class="filter-pill-remove" onclick="window.ShopController.removeQuery()">✕</span></span>`);
      }
      if (this.filters.category) {
        let name = this.filters.category;
        const main = window.CategoryManager ? window.CategoryManager.getMainCategoryBySlug(this.filters.category) : null;
        if (main) {
          name = (isAr ? main.nameAr : main.nameFr) || main.name;
        } else {
          const cat = (window.STORE_CATEGORIES || []).find(c => c.slug === this.filters.category || c.id === this.filters.category);
          if (cat) {
            const parent = window.CategoryManager ? window.CategoryManager.getParentForSubcategory(cat.slug) : null;
            const parentPrefix = parent ? `${(isAr ? parent.nameAr : parent.nameFr)} > ` : '';
            name = parentPrefix + ((isAr ? cat.nameAr : cat.nameFr) || cat.name);
          }
        }
        pillsHtml.push(`<span class="filter-pill">${name} <span class="filter-pill-remove" onclick="window.ShopController.removeCategory()">✕</span></span>`);
      }
      if (this.filters.collection) {
        const col = (window.STORE_COLLECTIONS || []).find(c => c.slug === this.filters.collection);
        const name = col ? ((isAr ? col.titleAr : col.titleFr) || col.title) : this.filters.collection;
        pillsHtml.push(`<span class="filter-pill">${isAr ? 'المجموعة: ' : 'Collection: '}${name} <span class="filter-pill-remove" onclick="window.ShopController.removeCollection()">✕</span></span>`);
      }
      if (this.filters.saleOnly) {
        pillsHtml.push(`<span class="filter-pill" style="color: var(--color-sale);">${isAr ? 'تخفيضات' : 'Promotions'} <span class="filter-pill-remove" onclick="window.ShopController.removeSale()">✕</span></span>`);
      }
      if (this.filters.maxPrice < 800) {
        pillsHtml.push(`<span class="filter-pill">${isAr ? 'أقصى سعر: ' : 'Prix max: '}${StoreUtils.formatMoney(this.filters.maxPrice)} <span class="filter-pill-remove" onclick="window.ShopController.removePrice()">✕</span></span>`);
      }

      if (pillsHtml.length > 0) {
        pillsContainer.innerHTML = pillsHtml.join('') + `<button class="btn btn-sm btn-secondary" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 999px;" onclick="window.ShopController.clearAllFilters()">${isAr ? 'مسح الكل' : 'Effacer tout'}</button>`;
        pillsContainer.style.display = "flex";
      } else {
        pillsContainer.innerHTML = "";
        pillsContainer.style.display = "none";
      }
    }
  },

  removeQuery() { this.filters.query = ""; this.applyFiltersAndRender(); },
  removeCategory() { this.filters.category = null; this.renderFilterSidebar(); this.applyFiltersAndRender(); },
  removeCollection() { this.filters.collection = null; this.applyFiltersAndRender(); },
  removeSale() { this.filters.saleOnly = false; this.renderFilterSidebar(); this.applyFiltersAndRender(); },
  removePrice() { this.filters.maxPrice = 800; this.renderFilterSidebar(); this.applyFiltersAndRender(); },

  renderGrid(list) {
    const grid = document.getElementById("shop-products-grid");
    const countEl = document.getElementById("shop-products-count");
    const isAr = window.I18N ? window.I18N.isRTL() : true;

    if (countEl) {
      countEl.textContent = isAr 
        ? `عرض ${list.length} منتج${list.length > 1 ? 'اً' : ''}`
        : `Affichage de ${list.length} produit${list.length > 1 ? 's' : ''}`;
    }

    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; background-color: var(--color-bg-secondary); border-radius: 6px;">
          <h3 style="margin-bottom: 8px; font-weight: 700;">${isAr ? 'لم يتم العثور على أي منتج' : 'Aucun produit trouvé'}</h3>
          <p style="margin-bottom: 20px;">${isAr ? 'يرجى ضبط أو إعادة تعيين فلاتر البحث للعثور على ما تبحث عنه.' : 'Veuillez modifier ou réinitialiser vos filtres de recherche.'}</p>
          <button class="btn btn-primary btn-sm" onclick="window.ShopController.clearAllFilters()" style="font-weight: 700;">
            ${isAr ? 'إعادة ضبط الفلاتر' : 'Réinitialiser les filtres'}
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = list.map(p => window.ProductCardComponent.render(p)).join('');
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.ShopController.init();
});
