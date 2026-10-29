/**
 * ATELIER ADMIN DASHBOARD CONTROLLER
 * Full management for Categories, Colors, Stock Matrix, Products Catalog & Backups.
 */

window.AdminDashboard = {
  activeTab: "overview",
  stockFilter: "all",
  stockSearch: "",
  stockCategory: "all",
  productSearch: "",
  productCategory: "all",
  productStatusFilter: "all",
  productViewMode: "separated", // "separated" = each colorway separated, "grouped" = parent card
  activeImageTargetInput: null,
  currentGalleryImages: [],
  allAvailableImages: [],
  presetFilterColor: "all",
  presetFilterQuery: "",

  init() {
    // Initialize data manager
    if (window.StoreDataManager) {
      window.StoreDataManager.init();
    }

    this.bindNavigation();
    this.bindLanguageSwitcher();
    this.renderAll();
    this.bindModals();
    this.bindPresetPicker();

    // Check URL parameters for direct tab navigation (e.g., admin.html?tab=orders)
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["overview", "categories", "stock", "products", "orders", "settings"].includes(tabParam)) {
      this.switchTab(tabParam);
    }

    // Background fetch live orders from MySQL
    this.loadOrders();
  },

  setLanguage(newLang) {
    if (newLang !== "ar" && newLang !== "fr") return;

    try {
      localStorage.setItem("atelier_lang", newLang);
    } catch (e) {}

    const isAr = newLang === "ar";
    document.documentElement.lang = newLang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.classList.toggle("lang-ar", isAr);
    document.documentElement.classList.toggle("lang-fr", !isAr);

    if (window.I18N) {
      window.I18N.currentLang = newLang;
      if (typeof window.I18N.applyDomDirection === "function") {
        window.I18N.applyDomDirection();
      }
      window.dispatchEvent(new CustomEvent("language:changed", { detail: { lang: newLang } }));
    }

    // Update active class on both buttons immediately
    document.querySelectorAll(".header-lang-btn, .admin-lang-btn").forEach(btn => {
      const isAr = btn.id.includes("ar") || btn.textContent.trim() === "عربي" || btn.getAttribute("data-admin-lang") === "ar";
      const isFr = btn.id.includes("fr") || btn.textContent.trim() === "FR" || btn.getAttribute("data-admin-lang") === "fr";
      if (isAr) btn.classList.toggle("active", newLang === "ar");
      if (isFr) btn.classList.toggle("active", newLang === "fr");
    });

    // Update active tab parameter in URL
    try {
      const currentUrl = new URL(window.location.href);
      if (this.activeTab) {
        currentUrl.searchParams.set("tab", this.activeTab);
        window.history.replaceState({}, "", currentUrl.toString());
      }
    } catch (e) {}

    // Apply translations across all elements in the admin dashboard
    this.applyTranslations();

    // Re-render UI components so dynamic data reflects the new language
    this.renderAll();
  },

  bindLanguageSwitcher() {
    const currentLang = (window.I18N ? window.I18N.getLang() : localStorage.getItem("atelier_lang")) || "ar";
    document.querySelectorAll(".header-lang-btn, .admin-lang-btn").forEach(btn => {
      const isAr = btn.id.includes("ar") || btn.textContent.trim() === "عربي" || btn.getAttribute("data-admin-lang") === "ar";
      const isFr = btn.id.includes("fr") || btn.textContent.trim() === "FR" || btn.getAttribute("data-admin-lang") === "fr";
      if (isAr) btn.classList.toggle("active", currentLang === "ar");
      if (isFr) btn.classList.toggle("active", currentLang === "fr");
    });

    this.applyTranslations();
  },

  applyTranslations() {
    const isAr = window.I18N ? window.I18N.isRTL() : (localStorage.getItem("atelier_lang") !== "fr");

    // 1. Sidebar section titles
    const sectionTitles = document.querySelectorAll(".admin-nav-section-title");
    if (sectionTitles[0]) sectionTitles[0].textContent = isAr ? "الكتالوج والمخزون" : "Catalogue & Stocks";
    if (sectionTitles[1]) sectionTitles[1].textContent = isAr ? "الإعدادات والأدوات" : "Paramètres & Outils";

    // 2. Sidebar nav buttons
    const navMap = {
      overview: isAr ? "نظرة عامة ومؤشرات" : "Vue d'ensemble",
      categories: isAr ? "الأقسام والتصنيفات" : "Catégories",
      stock: isAr ? "مصفوفة المخزون" : "Matrice des Stocks",
      products: isAr ? "المنتجات والموديلات" : "Produits & Modèles",
      orders: isAr ? "الطلبات (قاعدة البيانات)" : "Commandes (Live DB)",
      settings: isAr ? "النسخ والمزامنة" : "Sauvegarde & Sync"
    };

    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      const tab = btn.getAttribute("data-tab");
      const span = btn.querySelector("span:not(.admin-nav-badge)");
      if (span && navMap[tab]) {
        span.textContent = navMap[tab];
      }
    });

    // 3. Storefront link & Topbar buttons
    const storeLink = document.querySelector(".btn-storefront-link span");
    if (storeLink) storeLink.textContent = isAr ? "معاينة المتجر المباشر ↗" : "Voir la Boutique en direct ↗";

    const syncPill = document.getElementById("admin-sync-pill-text");
    if (syncPill) syncPill.textContent = isAr ? "مزامنة مباشرة LocalStorage" : "Sync Live LocalStorage";

    const syncBtn = document.getElementById("btn-sync-to-disk");
    if (syncBtn) syncBtn.innerHTML = isAr ? "⚡ مزامنة مع الكود المصدري" : "⚡ Sync vers Code Source";

    const viewStoreBtn = document.getElementById("admin-view-store-btn");
    if (viewStoreBtn) viewStoreBtn.textContent = isAr ? "المتجر ↗" : "Boutique ↗";

    document.title = isAr ? "لوحة التحكم وإدارة المخزون | دي إكس إن وكالو" : "Tableau de Bord Admin & Stocks | DXN & KALLOW";

    const brandTitle = document.querySelector(".admin-brand-title");
    if (brandTitle) brandTitle.textContent = isAr ? "دي إكس إن وكالو" : "DXN & KALLOW";

    const brandSub = document.querySelector(".admin-brand-subtitle");
    if (brandSub) brandSub.textContent = isAr ? "لوحة التحكم المركزية" : "CONTROL CENTER";

    // 4. Metric titles & subtitles (Overview Tab)
    const metricCards = document.querySelectorAll(".admin-metric-card");
    const metricDefs = [
      {
        titleAr: "موديلات المنتجات",
        titleFr: "Modèles Produits",
        subAr: "المنتجات المسجلة بالكتالوج",
        subFr: "Modèles enregistrés au catalogue"
      },
      {
        titleAr: "إجمالي المنتجات والخيارات",
        titleFr: "Total Références",
        subAr: "الأصناف والخيارات النشطة",
        subFr: "Articles & déclinaisons actifs"
      },
      {
        titleAr: "الوحدات في المخزون",
        titleFr: "Unités en Stock",
        subAr: "قطع جاهزة للشحن والتوصيل",
        subFr: "Pièces prêtes pour expédition"
      },
      {
        titleAr: "القيمة التقديرية للمخزون",
        titleFr: "Valeur Marchande",
        subAr: "القيمة التقديرية للمخزون",
        subFr: "Valorisation de l'inventaire"
      },
      {
        titleAr: "مخزون منخفض (<5)",
        titleFr: "Stock Faible (<5)",
        subAr: "منتجات بحاجة لإعادة التموين",
        subFr: "Articles à réapprovisionner"
      },
      {
        titleAr: "نفاد المخزون (0)",
        titleFr: "Ruptures (0)",
        subAr: "منتجات غير متوفرة حالياً",
        subFr: "Articles épuisés"
      }
    ];

    metricCards.forEach((card, idx) => {
      const def = metricDefs[idx];
      if (!def) return;
      const t = card.querySelector(".metric-title");
      if (t) t.textContent = isAr ? def.titleAr : def.titleFr;
      const s = card.querySelector(".metric-subtitle");
      if (s) s.textContent = isAr ? def.subAr : def.subFr;
    });

    // 5. Card headers & Action buttons in Tabs
    // Overview tab table & distribution
    const lowStockTitle = document.querySelector("#tab-overview .admin-card-title");
    if (lowStockTitle) lowStockTitle.textContent = isAr ? "⚠️ تنبيهات إعادة التموين السريع" : "⚠️ Alertes de Réapprovisionnement Rapide";

    const viewMatrixBtn = document.querySelector("#tab-overview .admin-card-header button");
    if (viewMatrixBtn) viewMatrixBtn.textContent = isAr ? "عرض كامل المصفوفة ←" : "Voir toute la matrice →";

    const overviewHeaders = document.querySelectorAll("#tab-overview .admin-card-title");
    if (overviewHeaders[1]) overviewHeaders[1].textContent = isAr ? "📁 التوزيع حسب القسم" : "📁 Répartition par Catégorie";

    // Overview lowstock table th
    const overviewThs = document.querySelectorAll("#tab-overview .admin-table th");
    const overviewThDefs = isAr 
      ? ["المنتج ورمز SKU", "القسم", "حالة المخزون", "السعر", "إجراء"]
      : ["Produit & SKU", "Catégorie", "État Stock", "Prix", "Action"];
    overviewThs.forEach((th, i) => { if (overviewThDefs[i]) th.textContent = overviewThDefs[i]; });

    // Categories tab
    const catHeaderTitle = document.querySelector("#tab-categories .admin-card-title");
    if (catHeaderTitle) catHeaderTitle.textContent = isAr ? "إدارة أقسام وتصنيفات المتجر" : "Gestion des Catégories DXN & Kallow";
    const catHeaderSub = document.querySelector("#tab-categories .admin-card-header p");
    if (catHeaderSub) catHeaderSub.textContent = isAr ? "تفعيل أقسام المتجر وتتبع المنتجات التابعة لكل قسم." : "Activez les rayons du magasin et suivez les produits rattachés.";
    const newCatBtn = document.querySelector("#tab-categories .admin-card-header .admin-btn-primary");
    if (newCatBtn) newCatBtn.textContent = isAr ? "+ قسم جديد" : "+ Nouvelle Catégorie";

    // Stock tab
    const stockHeaderTitle = document.querySelector("#tab-stock .admin-card-title");
    if (stockHeaderTitle) stockHeaderTitle.textContent = isAr ? "إدارة المخزون ومستويات التوفر" : "Gestion de l'Inventaire & Niveaux de Stock";
    const stockHeaderSub = document.querySelector("#tab-stock .admin-card-header p");
    if (stockHeaderSub) stockHeaderSub.textContent = isAr ? "تعديل كميات المخزون لمنتجاتك في الوقت الفعلي." : "Ajustez les quantités et niveaux de stock de vos produits en temps réel.";
    const stockSearch = document.getElementById("stock-search-input");
    if (stockSearch) stockSearch.placeholder = isAr ? "🔍 بحث بالمنتج، القسم أو رمز SKU..." : "🔍 Rechercher par produit, catégorie ou SKU...";
    
    const stockThs = document.querySelectorAll("#tab-stock .admin-table th");
    const stockThDefs = isAr
      ? ["المنتج و SKU", "القسم", "السعر", "الحالة", "الكمية (تعديل سريع)", "إعادة التموين", "إجراء"]
      : ["Produit & SKU", "Catégorie", "Prix", "Statut", "Quantité (Ajustement Rapide)", "Réappro", "Action"];
    stockThs.forEach((th, i) => { if (stockThDefs[i]) th.textContent = stockThDefs[i]; });

    // Products tab
    const prodHeaderTitle = document.querySelector("#tab-products .admin-card-title");
    if (prodHeaderTitle) prodHeaderTitle.textContent = isAr ? "كتالوج منتجات دي إكس إن وكالو" : "Catalogue des Produits DXN & Kallow";
    const prodHeaderSub = document.querySelector("#tab-products .admin-card-header p");
    if (prodHeaderSub) prodHeaderSub.textContent = isAr ? "إدارة منتجات الصحة، الجمال والعناية، الأسعار ومستويات المخزون." : "Gérez votre catalogue de santé, bien-être et beauté, tarifs et niveaux de stock.";
    const prodSearch = document.getElementById("products-search-input");
    if (prodSearch) prodSearch.placeholder = isAr ? "🔍 بحث بالاسم، الرمز أو الكلمات الدلالية..." : "🔍 Rechercher par titre, ID ou mot-clé...";

    const prodBtns = document.querySelectorAll("#tab-products .admin-card-header button");
    if (prodBtns[0]) prodBtns[0].textContent = isAr ? "📦 + باقة جديدة" : "📦 + Nouveau Pack Bundle";
    if (prodBtns[1]) prodBtns[1].textContent = isAr ? "+ منتج جديد" : "+ Nouveau Produit";

    const prodThs = document.querySelectorAll("#tab-products .admin-table th");
    const prodThDefs = isAr
      ? ["المنتج", "القسم", "السعر الحالي", "المخزون", "الحالة", "إجراءات"]
      : ["Produit", "Catégorie", "Prix Actuel", "Stock", "Statut", "Actions"];
    prodThs.forEach((th, i) => { if (prodThDefs[i]) th.textContent = prodThDefs[i]; });

    // Orders tab
    const ordersThs = document.querySelectorAll("#tab-orders .admin-table th");
    const ordersThDefs = isAr
      ? ["رقم الطلب", "العميل", "الهاتف والمدينة", "المنتجات", "المجموع", "طريقة الدفع", "الحالة", "التاريخ", "إجراء"]
      : ["N° Commande", "Client", "Tél & Ville", "Articles", "Total", "Paiement", "Statut", "Date", "Action"];
    ordersThs.forEach((th, i) => { if (ordersThDefs[i]) th.textContent = ordersThDefs[i]; });

    const ordersRefreshBtn = document.querySelector("#tab-orders .admin-card-header .admin-btn-secondary");
    if (ordersRefreshBtn) ordersRefreshBtn.textContent = isAr ? "🔄 تحديث الطلبات" : "🔄 Actualiser";

    // 6. Current page title for active tab
    this.switchTab(this.activeTab);
  },

  renderAll() {
    this.renderOverview();
    this.renderCategories();
    this.renderStockMatrix();
    this.renderProducts();
    this.updateBadges();
  },

  // --------------------------------------------------------------------------
  // NAVIGATION & TABS
  // --------------------------------------------------------------------------
  bindNavigation() {
    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = btn.getAttribute("data-tab");
        if (tab) this.switchTab(tab);
      });
    });

    const mobileMenuToggle = document.getElementById("admin-mobile-menu-toggle");
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener("click", () => {
        document.querySelector(".admin-sidebar").classList.toggle("open");
      });
    }
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("tab", tabName);
      window.history.replaceState({}, "", currentUrl.toString());
    } catch (e) {}
    
    // Update nav button states
    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    // Update tab panes
    document.querySelectorAll(".admin-tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `tab-${tabName}`);
    });

    // Update page title
    const isAr = window.I18N ? window.I18N.isRTL() : true;
    const titlesAr = {
      overview: "لوحة التحكم والمؤشرات الرئيسية",
      categories: "إدارة أقسام وتصنيفات المتجر",
      stock: "مصفوفة وتتبع مخزون المنتجات",
      products: "كتالوج المنتجات والأسعار",
      orders: "طلبات الزبائن المسجلة (قاعدة البيانات)",
      settings: "النسخ الاحتياطي والمزامنة"
    };
    const titlesFr = {
      overview: "Vue d'Ensemble & Métriques",
      categories: "Gestion des Catégories",
      stock: "Matrice des Stocks & Inventaire",
      products: "Catalogue des Produits",
      orders: "Commandes Clients (Base MySQL)",
      settings: "Sauvegarde & Synchronisation"
    };

    const titleEl = document.getElementById("admin-current-page-title");
    if (titleEl) titleEl.textContent = (isAr ? titlesAr[tabName] : titlesFr[tabName]) || (isAr ? "لوحة الإدارة" : "Tableau de Bord");

    // Re-render the active tab
    if (tabName === "overview") this.renderOverview();
    if (tabName === "categories") this.renderCategories();
    if (tabName === "stock") this.renderStockMatrix();
    if (tabName === "products") this.renderProducts();
    if (tabName === "orders") this.loadOrders();
    if (tabName === "settings") this.loadWhatsAppConfig();

    // Close mobile sidebar if open
    document.querySelector(".admin-sidebar")?.classList.remove("open");
  },

  updateBadges() {
    const stats = window.StoreDataManager.getInventoryStats();
    
    const catBadge = document.getElementById("badge-categories-count");
    if (catBadge) catBadge.textContent = stats.totalCategories;

    const stockBadge = document.getElementById("badge-stock-alerts");
    if (stockBadge) {
      stockBadge.textContent = stats.lowStockCount + stats.outOfStockCount;
      stockBadge.style.display = (stats.lowStockCount + stats.outOfStockCount > 0) ? "inline-block" : "none";
    }

    const prodBadge = document.getElementById("badge-products-count");
    if (prodBadge) prodBadge.textContent = stats.totalProducts;
  },

  // --------------------------------------------------------------------------
  // TAB 1: OVERVIEW & ANALYTICS
  // --------------------------------------------------------------------------
  renderOverview() {
    const stats = window.StoreDataManager.getInventoryStats();

    document.getElementById("stat-total-products").textContent = stats.totalProducts;
    document.getElementById("stat-total-variants").textContent = stats.totalVariants;
    document.getElementById("stat-total-units").textContent = stats.totalUnits.toLocaleString();
    document.getElementById("stat-inventory-val").textContent = `${stats.totalValueMAD.toLocaleString()} MAD`;
    document.getElementById("stat-low-stock").textContent = stats.lowStockCount;
    document.getElementById("stat-out-stock").textContent = stats.outOfStockCount;
    document.getElementById("stat-active-categories").textContent = `${stats.activeCategories} / ${stats.totalCategories}`;

    // Render Low Stock Alert Table
    const lowStockTable = document.getElementById("overview-lowstock-tbody");
    if (lowStockTable) {
      const products = window.StoreDataManager.getProducts();
      const categories = window.StoreDataManager.getCategories();
      const isAr = window.I18N ? window.I18N.isRTL() : (localStorage.getItem("atelier_lang") !== "fr");
      const lowStockItems = products.map(p => {
        const stock = p.stock !== undefined ? p.stock : (Array.isArray(p.variants) ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0);
        const sku = (p.variants && p.variants[0] && p.variants[0].sku) || `DXN-${p.id.toUpperCase()}`;
        const cat = categories.find(c => c.slug === p.category || c.id === p.category);
        const pImages = (p.images && typeof p.images === 'object') ? (Array.isArray(p.images) ? p.images : Object.values(p.images).flat()) : [];
        const img = pImages[0] || (p.colors && p.colors[0] && p.colors[0].image) || 'assets/Header/Header Ar.png';
        const displayName = isAr ? (p.nameAr || p.name) : (p.nameFr || p.name);
        const displayCat = cat ? ((isAr ? cat.nameAr : cat.nameFr) || cat.name) : p.category;
        return {
          productId: p.id,
          name: displayName,
          sku: sku,
          categoryName: displayCat,
          price: p.price,
          stock: stock,
          image: img
        };
      }).filter(p => p.stock < 5).slice(0, 8);

      if (lowStockItems.length === 0) {
        lowStockTable.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--admin-success); padding: 24px;">
              ✓ Tous les niveaux de stock sont optimaux (aucun article sous le seuil de 5 unités).
            </td>
          </tr>
        `;
      } else {
        lowStockTable.innerHTML = lowStockItems.map(item => `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${item.image}" style="width: 34px; height: 34px; object-fit: cover; border-radius: 4px; background: #000;">
                <div>
                  <div style="font-weight: 600; font-size: 0.84rem;">${item.name}</div>
                  <span style="font-size: 0.72rem; color: var(--admin-text-muted);">${item.sku}</span>
                </div>
              </div>
            </td>
            <td><span class="admin-badge badge-active">${item.categoryName}</span></td>
            <td>
              <span class="admin-badge ${item.stock === 0 ? 'badge-outstock' : 'badge-lowstock'}">
                ${item.stock === 0 ? 'Rupture (0)' : `Faible (${item.stock})`}
              </span>
            </td>
            <td>${item.price} MAD</td>
            <td>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="AdminDashboard.quickRestockProduct('${item.productId}', 10)">
                +10 Réappro
              </button>
            </td>
          </tr>
        `).join("");
      }
    }

    // Render Category Distribution (5 Main Departments)
    const catDistBox = document.getElementById("overview-category-distribution");
    if (catDistBox) {
      const mainCategories = window.CategoryManager 
        ? window.CategoryManager.getMainCategories() 
        : (window.STORE_MAIN_CATEGORIES || []);
      const products = window.StoreDataManager.getProducts();
      const totalProds = products.length || 1;

      catDistBox.innerHTML = mainCategories.map(main => {
        const count = products.filter(p => {
          if (main.slug === 'kallow') {
            return p.brand === 'Kallow' || (p.id && p.id.startsWith('kallow')) || (Array.isArray(p.collections) && p.collections.includes('kallow'));
          }
          return (main.subcategories || []).includes(p.category) || p.categoryGroup === main.slug || p.category === main.slug;
        }).length;
        const percentage = Math.round((count / totalProds) * 100);
        return `
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 5px;">
              <span style="font-weight: 600; color: #FFFFFF;">${main.icon || '🌿'} ${main.code}. ${main.nameFr || main.name}</span>
              <span style="color: var(--admin-text-muted);">${count} articles (${percentage}%)</span>
            </div>
            <div style="height: 6px; background: var(--admin-surface-2); border-radius: 999px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; background: var(--admin-gold); border-radius: 999px;"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  },

  buildCategoryDropdownOptions(includeAll = false, allLabel = "Toutes les Catégories") {
    const mainCategories = window.CategoryManager 
      ? window.CategoryManager.getMainCategories() 
      : (window.STORE_MAIN_CATEGORIES || []);
    const categories = window.StoreDataManager.getCategories();

    let html = includeAll ? `<option value="all">${allLabel}</option>` : '';

    mainCategories.forEach(main => {
      const subs = categories.filter(c => c.parentCategory === main.slug || c.categoryGroup === main.slug || (main.subcategories || []).includes(c.slug));
      html += `<optgroup label="${main.icon || ''} ${main.code}. ${main.nameFr || main.name}">`;
      if (includeAll) {
        html += `<option value="${main.slug}">★ Tout le rayon : ${main.nameFr || main.name}</option>`;
      }
      subs.forEach(sub => {
        html += `<option value="${sub.slug}">${sub.nameFr || sub.name}</option>`;
      });
      html += `</optgroup>`;
    });

    return html;
  },

  // --------------------------------------------------------------------------
  // TAB 2: CATEGORIES MANAGEMENT
  // --------------------------------------------------------------------------
  renderCategories() {
    const categories = window.StoreDataManager.getCategories();
    const mainCategories = window.CategoryManager 
      ? window.CategoryManager.getMainCategories() 
      : (window.STORE_MAIN_CATEGORIES || []);
    const container = document.getElementById("categories-grid-container");
    if (!container) return;

    container.innerHTML = mainCategories.map(main => {
      const subs = categories.filter(c => c.parentCategory === main.slug || c.categoryGroup === main.slug || (main.subcategories || []).includes(c.slug));
      const totalDeptItems = subs.reduce((sum, s) => sum + (s.itemCount || 0), 0);

      return `
        <div class="admin-category-dept-header" style="grid-column: 1 / -1; margin-top: 20px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: rgba(255,255,255,0.04); border: 1px solid var(--admin-border); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.5rem;">${main.icon}</span>
              <div>
                <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #FFFFFF;">${main.code}. ${main.nameFr} <span style="font-size: 0.85rem; color: var(--admin-text-muted); font-weight: 400;">(${main.nameAr})</span></h4>
                <div style="font-size: 0.78rem; color: var(--admin-text-muted); margin-top: 3px;">${main.descriptionFr || ''}</div>
              </div>
            </div>
            <span class="admin-badge badge-instock" style="font-size: 0.76rem;">
              ${subs.length} sous-catégories • ${totalDeptItems} articles
            </span>
          </div>
        </div>
        ${subs.map(cat => `
          <div class="category-admin-card">
            <img src="${cat.image || 'assets/Header/Header Ar.png'}" alt="${cat.name}" class="category-card-thumb">
            <div class="category-card-content">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <h3 class="category-card-title">${cat.nameFr || cat.name}</h3>
                <span class="admin-badge ${cat.active ? 'badge-instock' : 'badge-inactive'}">
                  ${cat.active ? 'Actif' : 'Bientôt disponible'}
                </span>
              </div>
              <div style="font-size: 0.72rem; color: var(--admin-text-muted); margin-top: 2px;">${cat.nameAr || ''}</div>
              <div style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--admin-gold); margin-top: 4px;">
                Slug: ${cat.slug}
              </div>
              <p class="category-card-desc">${cat.descriptionFr || cat.description || 'Aucune description fournie.'}</p>
              <div class="category-card-foot">
                <span style="font-size: 0.78rem; font-weight: 600; color: var(--admin-text-muted);">
                  📦 ${cat.itemCount || 0} Articles
                </span>
                <div style="display: flex; gap: 6px;">
                  <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminDashboard.openEditCategoryModal('${cat.id || cat.slug}')">
                    Modifier
                  </button>
                  <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="AdminDashboard.deleteCategory('${cat.id || cat.slug}')">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      `;
    }).join("");
  },

  openAddCategoryModal() {
    document.getElementById("category-modal-title").textContent = "Ajouter une Catégorie";
    document.getElementById("cat-form-id").value = "";
    document.getElementById("cat-form-name").value = "";
    document.getElementById("cat-form-slug").value = "";
    document.getElementById("cat-form-desc").value = "";
    document.getElementById("cat-form-image").value = "assets/Header/Header Ar.png";
    document.getElementById("cat-form-active").checked = true;
    this.openModal("modal-category");
  },

  openEditCategoryModal(idOrSlug) {
    const categories = window.StoreDataManager.getCategories();
    const cat = categories.find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (!cat) return;

    document.getElementById("category-modal-title").textContent = "Modifier la Catégorie";
    document.getElementById("cat-form-id").value = cat.id || cat.slug;
    document.getElementById("cat-form-name").value = cat.name;
    document.getElementById("cat-form-slug").value = cat.slug;
    document.getElementById("cat-form-desc").value = cat.description || "";
    document.getElementById("cat-form-image").value = cat.image || "";
    document.getElementById("cat-form-active").checked = !!cat.active;
    this.openModal("modal-category");
  },

  saveCategoryFromForm(e) {
    e.preventDefault();
    const id = document.getElementById("cat-form-id").value;
    const name = document.getElementById("cat-form-name").value.trim();
    let slug = document.getElementById("cat-form-slug").value.trim();
    const description = document.getElementById("cat-form-desc").value.trim();
    const image = document.getElementById("cat-form-image").value.trim();
    const active = document.getElementById("cat-form-active").checked;

    if (!name) {
      this.toast("Le nom de la catégorie est obligatoire", "danger");
      return;
    }

    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    }

    const catData = {
      id: id || slug,
      name,
      slug,
      description,
      image: image || "assets/Header/Header Ar.png",
      active,
      itemCount: 0
    };

    window.StoreDataManager.saveCategory(catData);
    this.closeModal("modal-category");
    this.renderCategories();
    this.renderOverview();
    this.updateBadges();
    this.toast(`Catégorie "${name}" enregistrée avec succès !`, "success");
  },

  deleteCategory(idOrSlug) {
    const products = window.StoreDataManager.getProducts();
    const hasProducts = products.some(p => p.category === idOrSlug);

    if (hasProducts) {
      if (!confirm(`Attention: des produits sont actuellement associés à cette catégorie. Êtes-vous sûr de vouloir supprimer la catégorie "${idOrSlug}" ?`)) {
        return;
      }
    } else {
      if (!confirm(`Confirmer la suppression de la catégorie "${idOrSlug}" ?`)) return;
    }

    window.StoreDataManager.deleteCategory(idOrSlug);
    this.renderCategories();
    this.renderOverview();
    this.updateBadges();
    this.toast("Catégorie supprimée", "success");
  },

  // --------------------------------------------------------------------------
  // TAB 4: STOCK & INVENTORY MANAGEMENT
  // --------------------------------------------------------------------------
  renderStockMatrix() {
    const tbody = document.getElementById("stock-matrix-tbody");
    if (!tbody) return;

    const products = window.StoreDataManager.getProducts();
    const categories = window.StoreDataManager.getCategories();

    // Populate category dropdown filter if empty
    const catSelect = document.getElementById("stock-filter-category");
    if (catSelect && catSelect.options.length <= 1) {
      catSelect.innerHTML = this.buildCategoryDropdownOptions(true, "Toutes les Catégories");
    }

    const isAr = window.I18N ? window.I18N.isRTL() : (localStorage.getItem("atelier_lang") !== "fr");
    let items = products.map(p => {
      const stock = p.stock !== undefined ? p.stock : (Array.isArray(p.variants) ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0);
      const sku = (p.variants && p.variants[0] && p.variants[0].sku) || `DXN-${p.id.toUpperCase()}`;
      const cat = categories.find(c => c.slug === p.category || c.id === p.category);
      const pImages = (p.images && typeof p.images === 'object') ? (Array.isArray(p.images) ? p.images : Object.values(p.images).flat()) : [];
      const img = pImages[0] || (p.colors && p.colors[0] && p.colors[0].image) || 'assets/Header/Header Ar.png';
      const displayName = isAr ? (p.nameAr || p.name) : (p.nameFr || p.name);
      const displayCat = cat ? ((isAr ? cat.nameAr : cat.nameFr) || cat.name) : p.category;
      return {
        productId: p.id,
        name: displayName,
        sku: sku,
        category: p.category,
        categoryName: displayCat,
        price: p.price,
        stock: stock,
        image: img
      };
    });

    if (this.stockFilter === "low") {
      items = items.filter(v => v.stock > 0 && v.stock < 5);
    } else if (this.stockFilter === "out") {
      items = items.filter(v => v.stock === 0);
    } else if (this.stockFilter === "in") {
      items = items.filter(v => v.stock >= 5);
    }

    if (this.stockCategory !== "all") {
      items = items.filter(v => {
        if (window.CategoryManager) {
          return window.CategoryManager.matchesCategoryFilter(v.category, this.stockCategory);
        }
        return v.category === this.stockCategory;
      });
    }

    if (this.stockSearch) {
      const q = this.stockSearch.toLowerCase();
      items = items.filter(v => 
        v.name.toLowerCase().includes(q) ||
        v.sku.toLowerCase().includes(q) ||
        v.categoryName.toLowerCase().includes(q)
      );
    }

    const countEl = document.getElementById("stock-filtered-count");
    if (countEl) countEl.textContent = `${items.length} / ${products.length} produits`;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: var(--admin-text-muted);">
            Aucun produit ne correspond aux filtres actuels.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(v => {
      let badgeClass = "badge-instock";
      let badgeLabel = `En stock (${v.stock})`;
      if (v.stock === 0) {
        badgeClass = "badge-outstock";
        badgeLabel = "Rupture (0)";
      } else if (v.stock < 5) {
        badgeClass = "badge-lowstock";
        badgeLabel = `Faible (${v.stock})`;
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${v.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; background: #000;">
              <div>
                <a href="product.html?id=${v.productId}" target="_blank" style="color: #FFFFFF; font-weight: 600; text-decoration: none;">
                  ${v.name} ↗
                </a>
                <div style="font-size: 0.72rem; color: var(--admin-text-muted); font-family: var(--font-mono);">${v.sku}</div>
              </div>
            </div>
          </td>
          <td><span class="admin-badge badge-active">${v.categoryName}</span></td>
          <td><span style="font-weight: 600;">${v.price} MAD</span></td>
          <td><span class="admin-badge ${badgeClass}">${badgeLabel}</span></td>
          <td>
            <div class="stock-stepper-wrap">
              <button class="stock-stepper-btn" onclick="AdminDashboard.stepProductStock('${v.productId}', -1)">−</button>
              <input type="number" class="stock-stepper-input" value="${v.stock}" min="0" 
                onchange="AdminDashboard.setProductStock('${v.productId}', this.value)">
              <button class="stock-stepper-btn" onclick="AdminDashboard.stepProductStock('${v.productId}', 1)">+</button>
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminDashboard.quickRestockProduct('${v.productId}', 10)">
                +10
              </button>
              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminDashboard.quickRestockProduct('${v.productId}', 25)">
                +25
              </button>
            </div>
          </td>
          <td>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminDashboard.openEditProductModal('${v.productId}')">
              Modifier
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  stepProductStock(productId, delta) {
    const product = window.StoreDataManager.getProductById(productId);
    if (!product) return;
    const currentStock = product.stock !== undefined ? product.stock : (Array.isArray(product.variants) ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0);
    const newStock = Math.max(0, currentStock + delta);
    this.setProductStock(productId, newStock);
  },

  setProductStock(productId, newStock) {
    const updated = window.StoreDataManager.updateProductStock(productId, newStock);
    if (updated) {
      this.renderStockMatrix();
      this.renderOverview();
      this.renderProducts();
      this.updateBadges();
      this.toast(`Stock mis à jour (${newStock} unités)`, "success");
    }
  },

  quickRestockProduct(productId, amount) {
    const product = window.StoreDataManager.getProductById(productId);
    if (!product) return;
    const currentStock = product.stock !== undefined ? product.stock : (Array.isArray(product.variants) ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0);
    const newStock = currentStock + amount;
    this.setProductStock(productId, newStock);
  },

  stepStock(productId, variantId, delta) {
    this.stepProductStock(productId, delta);
  },

  setStock(productId, variantId, newStock) {
    this.setProductStock(productId, newStock);
  },

  quickRestock(productId, variantId, amount) {
    this.quickRestockProduct(productId, amount);
  },

  // --------------------------------------------------------------------------
  // TAB 5: PRODUCTS CATALOG MANAGEMENT
  // --------------------------------------------------------------------------
  setProductViewMode(mode) {
    this.productViewMode = mode;
    const btnSep = document.getElementById("btn-view-mode-separated");
    const btnGrp = document.getElementById("btn-view-mode-grouped");
    if (btnSep) btnSep.classList.toggle("active", mode === "separated");
    if (btnGrp) btnGrp.classList.toggle("active", mode === "grouped");
    this.renderProducts();
  },

  renderProducts() {
    const products = window.StoreDataManager.getProducts(true);
    const tbody = document.getElementById("products-table-tbody");
    if (!tbody) return;

    const categories = window.StoreDataManager.getCategories();

    // Populate category dropdown
    const catSelect = document.getElementById("products-filter-category");
    if (catSelect && catSelect.options.length <= 1) {
      catSelect.innerHTML = this.buildCategoryDropdownOptions(true, "Toutes les Catégories");
    }

    let itemsToRender = [...products];

    // Apply category filter
    if (this.productCategory && this.productCategory !== "all") {
      itemsToRender = itemsToRender.filter(item => {
        if (window.CategoryManager) {
          return window.CategoryManager.matchesCategoryFilter(item.category, this.productCategory);
        }
        return item.category === this.productCategory;
      });
    }

    // Apply status filter
    if (this.productStatusFilter && this.productStatusFilter !== "all") {
      if (this.productStatusFilter === "active") {
        itemsToRender = itemsToRender.filter(item => item.status !== "disabled" && item.isActive !== false && item.disabled !== true);
      } else if (this.productStatusFilter === "disabled") {
        itemsToRender = itemsToRender.filter(item => item.status === "disabled" || item.isActive === false || item.disabled === true);
      }
    }

    // Apply search query
    if (this.productSearch) {
      const q = this.productSearch.toLowerCase();
      itemsToRender = itemsToRender.filter(item => 
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    const countEl = document.getElementById("products-filtered-count");
    if (countEl) countEl.textContent = `${itemsToRender.length} produits`;

    if (itemsToRender.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: var(--admin-text-muted);">
            Aucun modèle ou produit trouvé.
          </td>
        </tr>
      `;
      return;
    }

    const isAr = window.I18N ? window.I18N.isRTL() : true;

    tbody.innerHTML = itemsToRender.map(p => {
      const pImages = (p.images && typeof p.images === 'object') ? (Array.isArray(p.images) ? p.images : Object.values(p.images).flat()) : [];
      const mainImg = pImages[0] || (p.colors && p.colors[0] && p.colors[0].image) || "assets/Header/Header Ar.png";
      const hoverImg = pImages[1] || mainImg;
      const totalStock = p.stock !== undefined ? p.stock : (Array.isArray(p.variants) ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0);
      const categoryObj = categories.find(c => c.slug === p.category || c.id === p.category);
      const primaryTitle = isAr ? (p.nameAr || p.name) : (p.nameFr || p.name);
      const secondaryTitle = isAr ? (p.nameFr || '') : (p.nameAr || '');
      const catDisplayName = categoryObj ? ((isAr ? categoryObj.nameAr : categoryObj.nameFr) || categoryObj.name) : p.category;
      const isProductActive = (p.status !== "disabled" && p.isActive !== false && p.disabled !== true);

      return `
        <tr style="${isProductActive ? '' : 'opacity: 0.75; background: rgba(239,68,68,0.03);'}">
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="product-dual-thumb-wrap" title="Survolez pour voir l'image au survol (hover)">
                <img src="${mainImg}" alt="${p.name} face" class="product-dual-thumb-img thumb-main">
                <img src="${hoverImg}" alt="${p.name} dos/survol" class="product-dual-thumb-img thumb-hover">
              </div>
              <div>
                <a href="product.html?id=${p.id}" target="_blank" style="color: #FFFFFF; font-weight: 600; text-decoration: none;">
                  ${primaryTitle} ↗
                </a>
                ${secondaryTitle ? `<div style="font-size: 0.74rem; color: var(--admin-text-muted); margin-top: 2px;">${secondaryTitle}</div>` : ''}
                <div class="product-dual-badge-box" style="margin-top: 2px;">
                  <span style="color: var(--admin-gold);">🥇 1. Face</span> • 
                  <span style="color: var(--admin-info);">🥈 2. Survol</span>
                  ${pImages.length > 2 ? ` • <span style="color: var(--admin-text); font-weight: 600;">+${pImages.length - 2} photos</span>` : ''}
                </div>
                <div style="font-size: 0.72rem; color: var(--admin-text-muted); font-family: var(--font-mono); margin-top: 2px;">
                  ID: ${p.id}
                </div>
              </div>
            </div>
          </td>
          <td>
            <span class="admin-badge badge-active">${catDisplayName}</span>
            ${p.group ? `<div style="font-size: 0.72rem; color: var(--admin-gold); font-family: var(--font-mono); margin-top: 3px;" title="Famille de Style">🏷️ ${p.group}</div>` : ''}
          </td>
          <td>
            <div style="font-weight: 600;">${p.price} MAD</div>
            ${p.compareAtPrice ? `<div style="font-size: 0.72rem; color: var(--admin-text-muted); text-decoration: line-through;">${p.compareAtPrice} MAD</div>` : ''}
          </td>
          <td>
            <span class="admin-badge ${totalStock > 10 ? 'badge-instock' : totalStock > 0 ? 'badge-lowstock' : 'badge-outstock'}">
              ${totalStock} en stock
            </span>
          </td>
          <td>
            ${isProductActive ? `
              <button type="button" class="admin-btn admin-btn-sm" style="background: rgba(16,185,129,0.15); border: 1px solid #10B981; color: #10B981; border-radius: 20px; font-weight: 700; padding: 4px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" onclick="AdminDashboard.toggleProductStatus('${p.id}')" title="Cliquer pour désactiver (masquer de la boutique)">
                🟢 Actif
              </button>
            ` : `
              <button type="button" class="admin-btn admin-btn-sm" style="background: rgba(239,68,68,0.15); border: 1px solid #EF4444; color: #EF4444; border-radius: 20px; font-weight: 700; padding: 4px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" onclick="AdminDashboard.toggleProductStatus('${p.id}')" title="Cliquer pour activer (afficher dans la boutique)">
                🔴 Désactivé
              </button>
            `}
          </td>
          <td>
            ${p.isBundle ? `
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                <span class="admin-badge badge-active" style="background: rgba(212, 175, 55, 0.2); border: 1px solid var(--admin-gold); color: #FFF; font-weight: 700;">
                  📦 Pack (${p.bundleSlotsCount || 3} pcs)
                </span>
                ${p.isNew ? '<span class="admin-badge badge-instock">Nouveau</span>' : ''}
                ${p.isSale ? '<span class="admin-badge badge-outstock">Solde</span>' : ''}
              </div>
            ` : `
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${p.isNew ? '<span class="admin-badge badge-instock">Nouveau</span>' : ''}
                ${p.isSale ? '<span class="admin-badge badge-outstock">Solde</span>' : ''}
                ${p.isFeatured ? '<span class="admin-badge badge-active">Vedette</span>' : ''}
              </div>
            `}
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminDashboard.openEditProductModal('${p.id}')" title="${p.isBundle ? 'Configurer ce Pack' : 'Modifier ce produit'}">
                ${p.isBundle ? '⚙️ Configurer Pack' : 'Modifier'}
              </button>
              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminDashboard.duplicateProduct('${p.id}')" title="Dupliquer le produit">
                Dupliquer
              </button>
              <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="AdminDashboard.deleteProduct('${p.id}')" title="Supprimer le produit">
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  // --------------------------------------------------------------------------
  // BUNDLE & PACKS STUDIO CONFIGURATION
  // --------------------------------------------------------------------------
  isCurrentEditingBundle: false,

  // Bundle Selection & Modal Picker State
  selectedBundleProductIds: [],
  targetBundleSlotIndex: null,
  bundlePickerModalQuery: '',
  bundlePickerModalColor: 'all',

  getAllTshirtVariations() {
    const allProducts = window.StoreDataManager.getProducts();
    const tshirts = allProducts.filter(p => !p.isBundle && p.id !== 'pack-trio-tshirts');
    const list = [];

    return tshirts.map(p => {
      const pImages = (p.images && typeof p.images === 'object') ? (Array.isArray(p.images) ? p.images : Object.values(p.images).flat()) : [];
      const thumb = pImages[0] || (p.colors && p.colors[0] && p.colors[0].image) || "assets/ecom/1.png";
      return {
        itemKey: p.id,
        productId: p.id,
        productName: p.name,
        category: p.category || 'T-Shirt',
        price: p.price || 249,
        displayName: p.name,
        thumb: thumb,
        parentProduct: p
      };
    });
  },

  switchProductModalMode(isBundle) {
    this.isCurrentEditingBundle = isBundle;
    const titleEl = document.getElementById("product-modal-title");
    const submitBtn = document.getElementById("prod-form-submit-btn");
    const bundleView = document.getElementById("prod-form-bundle-view");
    const singleView = document.getElementById("prod-form-single-view");
    const tabSingle = document.getElementById("tab-btn-mode-single");
    const tabBundle = document.getElementById("tab-btn-mode-bundle");
    const isNew = !document.getElementById("prod-form-id")?.value;

    if (tabSingle && tabBundle) {
      tabSingle.classList.toggle("active", !isBundle);
      tabBundle.classList.toggle("active", isBundle);
    }

    if (isBundle) {
      if (bundleView) bundleView.style.display = "block";
      if (singleView) singleView.style.display = "none";
      if (titleEl && isNew) titleEl.textContent = "Créer un Nouveau Pack / Bundle Personnalisable";
      if (submitBtn) submitBtn.textContent = isNew ? "Enregistrer le Pack Bundle" : "Mettre à Jour le Pack";

      this.renderBundleProductsSelector();
    } else {
      if (bundleView) bundleView.style.display = "none";
      if (singleView) singleView.style.display = "block";
      if (titleEl && isNew) titleEl.textContent = "Créer un Nouveau Produit";
      if (submitBtn) submitBtn.textContent = isNew ? "Enregistrer le Produit" : "Enregistrer les Modifications";
    }
  },

  openAddBundleModal() {
    this.switchProductModalMode(true);

    document.getElementById("prod-form-id").value = "";
    document.getElementById("bundle-form-name").value = "Pack 3 T-Shirts Personnalisable";
    document.getElementById("bundle-form-slots").value = "3";
    document.getElementById("bundle-form-price").value = "599";
    document.getElementById("bundle-form-compare").value = "747";
    document.getElementById("bundle-form-shortdesc").value = "Composez votre coffret signature avec 3 t-shirts au choix parmi l'ensemble de nos modèles.";
    document.getElementById("bundle-form-desc").value = "Le Pack Studio vous offre la liberté de composer votre vestiaire idéal à prix préférentiel. Choisissez vos t-shirts préférés.";
    document.getElementById("bundle-form-isnew").checked = true;
    document.getElementById("bundle-form-isfeatured").checked = true;

    const defaultBundleImg = "assets/Header/Header Ar.png";
    document.getElementById("bundle-form-image").value = defaultBundleImg;
    this.updateBundleMockupPreview(defaultBundleImg);

    // Start with empty selected list as requested
    this.selectedBundleProductIds = [];
    this.renderBundleProductsSelector();

    this.openModal("modal-product");
  },

  updateBundleMockupPreview(url) {
    const preview = document.getElementById("bundle-form-image-preview");
    if (preview) {
      preview.src = url || "assets/Header/Header Ar.png";
    }
  },

  renderBundleProductsSelector() {
    const allProducts = window.StoreDataManager.getProducts();
    const allVariations = this.getAllTshirtVariations();
    
    // 1. Populate Dropdown with options for each product
    const selectEl = document.getElementById("bundle-add-prod-select");
    if (selectEl) {
      const remainingVariations = allVariations.filter(v => !this.selectedBundleProductIds.includes(v.itemKey) && !this.selectedBundleProductIds.includes(v.productId));
      selectEl.innerHTML = `
        <option value="">(ou sélection rapide dans la liste... ${remainingVariations.length} modèles disponibles)</option>
        ${remainingVariations.map(v => `
          <option value="${v.itemKey}">${v.displayName} — ${StoreUtils.formatMoney(v.price)}</option>
        `).join('')}
      `;
      selectEl.value = "";
    }

    // 2. Render Selected Items Container
    const container = document.getElementById("prod-form-bundle-selected-container");
    if (!container) return;

    if (this.selectedBundleProductIds.length === 0) {
      container.innerHTML = `
        <div class="admin-bundle-empty-state">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">👕</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">Aucun t-shirt dans ce pack</div>
          <p style="font-size: 0.8rem; color: var(--admin-text-muted); max-width: 440px; margin: 0 auto 14px;">
            Cliquez sur le bouton ci-dessous pour choisir vos modèles de t-shirts avec aperçu visuel.
          </p>
          <button type="button" class="admin-btn admin-btn-primary" onclick="AdminDashboard.openBundleProductPickerModal()" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
            <span>🖼️</span> Choisir un T-Shirt
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${this.selectedBundleProductIds.map((itemKey, idx) => {
            const prodId = itemKey.split('::')[0];
            const p = allProducts.find(x => x.id === prodId) || allProducts.find(x => x.id === itemKey);
            if (!p) return '';

            const pImages = (p.images && typeof p.images === 'object') ? (Array.isArray(p.images) ? p.images : Object.values(p.images).flat()) : [];
            const thumb = (pImages && pImages[0]) || (p.colors && p.colors[0] && p.colors[0].image) || "assets/ecom/1.png";
            const displayName = p.name;

            return `
              <div class="admin-form-group" style="margin-bottom: 0;">
                <label class="admin-form-label" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <span><b>T-Shirt #${idx + 1}</b> : ${displayName}</span>
                  <span style="font-weight: normal; font-size: 0.74rem; color: var(--admin-gold);">${StoreUtils.formatMoney(p.price || 249)}</span>
                </label>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <div class="admin-bundle-preview-wrap" style="width: 50px; height: 50px; border-radius: 6px; background: #0A0A0A; border: 1.5px solid var(--admin-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 2px; box-sizing: border-box; position: relative;">
                    <img src="${thumb}" 
                         alt="${displayName}" 
                         style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;"
                         onerror="this.src='assets/ecom/1.png'">
                  </div>

                  <input type="text" class="admin-form-input" value="${displayName} (${p.category || 'T-Shirt'})" readonly style="flex: 1; min-width: 0; background: var(--admin-surface); color: #FFFFFF; cursor: pointer;" onclick="AdminDashboard.openBundleProductPickerModal(${idx})">

                  <button type="button" class="admin-btn admin-btn-secondary" onclick="AdminDashboard.openBundleProductPickerModal(${idx})" title="Remplacer ce modèle">
                    🖼️ Choisir
                  </button>

                  <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" onclick="AdminDashboard.removeBundleSlot(${idx})" title="Retirer ce t-shirt" style="padding: 7px 11px;">
                    ✕
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 3. Update Summary
    this.updateBundleProductsSummary();
  },

  openBundleProductPickerModal(slotIndex = null) {
    this.targetBundleSlotIndex = slotIndex;
    this.bundlePickerModalQuery = '';
    this.bundlePickerModalColor = 'all';

    const titleEl = document.getElementById("bundle-picker-modal-title");
    if (titleEl) {
      titleEl.textContent = (slotIndex !== null && slotIndex >= 0)
        ? `Assigner un Modèle pour le T-Shirt #${slotIndex + 1}`
        : "Choisir un Modèle de T-Shirt pour le Pack";
    }

    const searchInput = document.getElementById("bundle-picker-search");
    if (searchInput) searchInput.value = '';

    this.renderBundlePickerModalGrid();
    this.openModal("modal-bundle-product-picker");
  },

  filterBundlePickerModal(query) {
    this.bundlePickerModalQuery = (query || '').toLowerCase().trim();
    this.renderBundlePickerModalGrid();
  },

  filterBundlePickerByColor(colorCode, btnEl) {
    this.bundlePickerModalColor = colorCode;
    this.renderBundlePickerModalGrid();
  },

  renderBundlePickerModalGrid() {
    const container = document.getElementById("bundle-modal-product-grid");
    if (!container) return;

    const allVariations = this.getAllTshirtVariations();
    const query = this.bundlePickerModalQuery;

    let filtered = allVariations;

    if (query) {
      filtered = filtered.filter(v => 
        v.displayName.toLowerCase().includes(query) || 
        v.category.toLowerCase().includes(query)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 28px; color: var(--admin-text-muted);">
          Aucun modèle trouvé pour cette recherche.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(v => {
      const isSelected = this.selectedBundleProductIds.includes(v.itemKey) || this.selectedBundleProductIds.includes(v.productId);

      return `
        <div class="preset-item ${isSelected ? 'selected' : ''}" 
             onclick="AdminDashboard.selectBundleProductFromModal('${v.itemKey}')" 
             title="${v.displayName} - ${StoreUtils.formatMoney(v.price)}">
          <div style="position: relative; width: 100%; height: 85px; background: #0E0E0E; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
            <img src="${v.thumb}" alt="${v.displayName}" class="preset-img" style="height: 100%; width: 100%; object-fit: contain;" onerror="this.src='assets/ecom/1.png'">
          </div>
          <div class="preset-label" style="font-weight: 700; color: #FFFFFF; font-size: 0.72rem; line-height: 1.25; padding: 5px 4px 2px;">
            ${v.productName}
          </div>
          <div style="font-size: 0.68rem; color: var(--admin-gold); text-align: center; padding: 1px 4px 4px; background: var(--admin-surface); display: flex; justify-content: space-around; align-items: center;">
            <span>${StoreUtils.formatMoney(v.price)}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectBundleProductFromModal(itemKey) {
    if (this.targetBundleSlotIndex !== null && this.targetBundleSlotIndex >= 0 && this.targetBundleSlotIndex < this.selectedBundleProductIds.length) {
      this.selectedBundleProductIds[this.targetBundleSlotIndex] = itemKey;
    } else {
      if (!this.selectedBundleProductIds.includes(itemKey)) {
        this.selectedBundleProductIds.push(itemKey);
      }
    }

    this.renderBundleProductsSelector();
    this.closeModal("modal-bundle-product-picker");
    
    const allVariations = this.getAllTshirtVariations();
    const match = allVariations.find(v => v.itemKey === itemKey);
    this.toast(`✓ "${match?.displayName || 'Modèle'}" sélectionné pour le pack`, "success");
  },

  handleSelectAddBundleProduct(itemKey) {
    if (!itemKey) return;
    if (!this.selectedBundleProductIds.includes(itemKey)) {
      this.selectedBundleProductIds.push(itemKey);
      this.renderBundleProductsSelector();
      const allVariations = this.getAllTshirtVariations();
      const match = allVariations.find(v => v.itemKey === itemKey);
      this.toast(`✓ "${match?.displayName || 'Modèle'}" ajouté au pack`, "success");
    }
  },

  removeBundleSlot(index) {
    if (index >= 0 && index < this.selectedBundleProductIds.length) {
      this.selectedBundleProductIds.splice(index, 1);
      this.renderBundleProductsSelector();
      this.toast("Modèle retiré du pack", "info");
    }
  },

  addAllBundleProducts() {
    const allVariations = this.getAllTshirtVariations();
    this.selectedBundleProductIds = allVariations.map(v => v.itemKey);
    this.renderBundleProductsSelector();
    this.toast("✓ Toutes les déclinaisons de t-shirts ont été ajoutées au pack", "success");
  },

  clearAllBundleProducts() {
    this.selectedBundleProductIds = [];
    this.renderBundleProductsSelector();
    this.toast("Sélection de t-shirts vidée", "info");
  },

  updateBundleProductsSummary() {
    const summary = document.getElementById("prod-form-bundle-products-summary");
    if (!summary) return;

    const count = this.selectedBundleProductIds.length;

    if (count === 0) {
      summary.innerHTML = `<span style="color: var(--admin-danger); font-weight: 700;">⚠️ Aucun t-shirt sélectionné pour ce pack (ajoutez au moins 1 modèle ou déclinaison ci-dessus)</span>`;
    } else {
      summary.innerHTML = `✓ <b>${count} pièce${count > 1 ? 's' : ''} / déclinaison${count > 1 ? 's' : ''} incluse${count > 1 ? 's' : ''}</b> dans ce pack studio`;
    }
  },

  getSelectedBundleProductIds() {
    const productIds = [];
    this.selectedBundleProductIds.forEach(key => {
      const prodId = key.split('::')[0];
      if (!productIds.includes(prodId)) productIds.push(prodId);
    });
    return productIds.length > 0 ? productIds : [...this.selectedBundleProductIds];
  },

  openAddProductModal() {
    const idInput = document.getElementById("prod-form-id");
    if (idInput) idInput.value = "";
    this.switchProductModalMode(false);
    this.populateProductFormDefaults();
    this.openModal("modal-product");
  },

  openEditProductModal(id, targetColorCode = null) {
    const product = window.StoreDataManager.getProductById(id);
    if (!product) {
      this.toast(`Produit "${id}" introuvable`, "danger");
      return;
    }

    const isBundle = !!product.isBundle || product.id === 'pack-trio-tshirts';
    
    const idInput = document.getElementById("prod-form-id");
    if (idInput) idInput.value = product.id;

    this.switchProductModalMode(isBundle);

    const titleEl = document.getElementById("product-modal-title");
    const submitBtn = document.getElementById("prod-form-submit-btn");

    if (isBundle) {
      if (titleEl) titleEl.textContent = `Modifier le Pack: ${product.name}`;
      if (submitBtn) submitBtn.textContent = "Mettre à Jour le Pack";

      document.getElementById("bundle-form-name").value = product.name || "";
      document.getElementById("bundle-form-slots").value = product.bundleSlotsCount || 3;
      document.getElementById("bundle-form-price").value = product.price || "";
      document.getElementById("bundle-form-compare").value = product.compareAtPrice || "";
      document.getElementById("bundle-form-shortdesc").value = product.shortDescription || "";
      document.getElementById("bundle-form-desc").value = product.description || "";
      document.getElementById("bundle-form-isnew").checked = !!product.isNew;
      document.getElementById("bundle-form-isfeatured").checked = !!product.isFeatured;
      const bundleActiveCheck = document.getElementById("bundle-form-isactive");
      if (bundleActiveCheck) bundleActiveCheck.checked = (product.status !== 'disabled' && product.isActive !== false && product.disabled !== true);

      const bundleImg = (product.colors && product.colors[0] && product.colors[0].image) || (product.images && product.images.bundle && product.images.bundle[0]) || "assets/Header/Header Ar.png";
      document.getElementById("bundle-form-image").value = bundleImg;
      this.updateBundleMockupPreview(bundleImg);

      const allProducts = window.StoreDataManager.getProducts();
      const tshirts = allProducts.filter(prod => !prod.isBundle && prod.id !== 'pack-trio-tshirts');
      const includedIds = (Array.isArray(product.bundleIncludedProductIds) && product.bundleIncludedProductIds.length > 0)
        ? product.bundleIncludedProductIds 
        : tshirts.map(t => t.id);
      
      this.selectedBundleProductIds = [...includedIds];
      this.renderBundleProductsSelector();
    } else {
      if (titleEl) titleEl.textContent = `Modifier: ${product.name}`;
      if (submitBtn) submitBtn.textContent = "Enregistrer les Modifications";
      this.populateProductFormWithData(product, targetColorCode);
    }

    this.openModal("modal-product");
  },

  populateProductFormDefaults() {
    const categories = window.StoreDataManager.getCategories();
    const colors = window.StoreDataManager.getColors();

    // Populate Category select (Grouped by Departments)
    const catSelect = document.getElementById("prod-form-category");
    catSelect.innerHTML = this.buildCategoryDropdownOptions(false);

    document.getElementById("prod-form-name").value = "";
    document.getElementById("prod-form-group").value = "";
    document.getElementById("prod-form-slug").value = "";
    document.getElementById("prod-form-price").value = "249";
    document.getElementById("prod-form-compare").value = "";
    document.getElementById("prod-form-stock").value = "25";
    document.getElementById("prod-form-sku").value = "";
    document.getElementById("prod-form-shortdesc").value = "T-shirt à la coupe contemporaine, taillé dans un jersey 100% coton lourd.";
    document.getElementById("prod-form-desc").value = "Pièce fondamentale de notre collection permanente. Coupe soignée et finitions haut de gamme.";
    document.getElementById("prod-form-materials").value = "100% Coton peigné haut de gamme 240 GSM";
    document.getElementById("prod-form-fit").value = "Coupe oversize contemporaine. Prenez votre taille habituelle.";
    document.getElementById("prod-form-care").value = "Lavage en machine à 30°C sur l'envers. Séchage à plat.";
    document.getElementById("prod-form-details").value = "Coupe oversized décontractée\nJersey épais de qualité supérieure\nCol rond côtelé renforcé 3 cm\nCoutures renforcées double aiguille";
    document.getElementById("prod-form-tags").value = "oversized, coton lourd, streetwear, premium";

    document.getElementById("prod-form-isnew").checked = true;
    document.getElementById("prod-form-issale").checked = false;
    document.getElementById("prod-form-isfeatured").checked = true;
    const prodActive = document.getElementById("prod-form-isactive");
    if (prodActive) prodActive.checked = true;
    const bundleActive = document.getElementById("bundle-form-isactive");
    if (bundleActive) bundleActive.checked = true;

    // Initial clean Gallery state
    this.currentGalleryImages = [];
    this.renderGalleryCards();
  },

  populateProductFormWithData(p) {
    this.populateProductFormDefaults();

    document.getElementById("prod-form-id").value = p.id;
    document.getElementById("prod-form-name").value = p.name;
    document.getElementById("prod-form-group").value = p.group || "";
    document.getElementById("prod-form-slug").value = p.slug || p.id;
    document.getElementById("prod-form-category").value = p.category;
    document.getElementById("prod-form-price").value = p.price;
    document.getElementById("prod-form-compare").value = p.compareAtPrice || "";

    const totalStock = p.stock !== undefined ? p.stock : (Array.isArray(p.variants) ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 25);
    const sku = (p.variants && p.variants[0] && p.variants[0].sku) || `DXN-${p.id.toUpperCase()}`;
    document.getElementById("prod-form-stock").value = totalStock;
    document.getElementById("prod-form-sku").value = sku;

    document.getElementById("prod-form-shortdesc").value = p.shortDescription || "";
    document.getElementById("prod-form-desc").value = p.description || "";
    document.getElementById("prod-form-materials").value = p.materials || "";
    document.getElementById("prod-form-fit").value = p.fit || "";
    document.getElementById("prod-form-care").value = p.careInstructions || "";
    document.getElementById("prod-form-details").value = Array.isArray(p.details) ? p.details.join("\n") : "";
    document.getElementById("prod-form-tags").value = Array.isArray(p.tags) ? p.tags.join(", ") : "";

    document.getElementById("prod-form-isnew").checked = !!p.isNew;
    document.getElementById("prod-form-issale").checked = !!p.isSale;
    document.getElementById("prod-form-isfeatured").checked = !!p.isFeatured;
    const prodActive = document.getElementById("prod-form-isactive");
    if (prodActive) prodActive.checked = (p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);

    // Load gallery images
    let imgs = [];
    if (p.images && typeof p.images === "object") {
      if (Array.isArray(p.images)) {
        imgs = [...p.images];
      } else {
        Object.values(p.images).forEach(list => {
          if (Array.isArray(list)) imgs.push(...list);
        });
      }
    }
    if (imgs.length === 0 && p.colors && p.colors[0] && p.colors[0].image) {
      imgs.push(p.colors[0].image);
    }
    this.currentGalleryImages = [...new Set(imgs)];
    this.renderGalleryCards();
  },

  // --------------------------------------------------------------------------
  // GALLERY SUITE LOGIC: MAIN, HOVER & MULTI-IMAGE UPLOADS
  // --------------------------------------------------------------------------
  renderGalleryCards() {
    const container = document.getElementById("product-gallery-cards-container");
    if (!container) return;

    if (!this.currentGalleryImages || this.currentGalleryImages.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--admin-text-muted); background: var(--admin-surface); border-radius: 6px; border: 1px dashed var(--admin-border);">
          Aucun visuel dans la galerie. Importez une image locale ou choisissez un mockup ci-dessus.
        </div>
      `;
      return;
    }

    container.innerHTML = this.currentGalleryImages.map((imgUrl, index) => {
      const isMain = index === 0;
      const isHover = index === 1;

      let badgeHtml = "";
      let cardClass = "";

      if (isMain) {
        badgeHtml = `<span class="gallery-card-badge badge-role-main">🥇 1. Principale (Face)</span>`;
        cardClass = "is-main";
      } else if (isHover) {
        badgeHtml = `<span class="gallery-card-badge badge-role-hover">🥈 2. Au Survol (Hover)</span>`;
        cardClass = "is-hover";
      } else {
        badgeHtml = `<span class="gallery-card-badge badge-role-gallery">🥉 ${index + 1}. Galerie</span>`;
      }

      return `
        <div class="gallery-img-card ${cardClass}">
          <div class="gallery-card-thumb-wrap">
            ${badgeHtml}
            <img src="${imgUrl}" alt="Vue ${index + 1}" class="gallery-card-thumb">
          </div>
          
          <div class="gallery-card-actions">
            <!-- Quick Role Selectors -->
            <div class="gallery-role-btns">
              <button type="button" class="admin-btn ${isMain ? 'admin-btn-primary' : 'admin-btn-secondary'} admin-btn-sm" 
                onclick="AdminDashboard.setMainGalleryImage(${index})" title="Définir comme visuel principal de face">
                ${isMain ? '✓ Principale' : '👑 Principale'}
              </button>
              <button type="button" class="admin-btn ${isHover ? 'admin-btn-primary' : 'admin-btn-secondary'} admin-btn-sm" 
                onclick="AdminDashboard.setHoverGalleryImage(${index})" title="Définir comme image affichée au survol (hover)">
                ${isHover ? '✓ Au Survol' : '🔄 Survol'}
              </button>
            </div>

            <!-- Position Controls & Delete -->
            <div class="gallery-order-btns">
              <div style="display: flex; gap: 4px;">
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" style="padding: 2px 8px;"
                  onclick="AdminDashboard.moveGalleryImage(${index}, -1)" ${index === 0 ? 'disabled style="opacity:0.3;"' : ''} title="Déplacer vers la gauche">
                  ◀
                </button>
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" style="padding: 2px 8px;"
                  onclick="AdminDashboard.moveGalleryImage(${index}, 1)" ${index === this.currentGalleryImages.length - 1 ? 'disabled style="opacity:0.3;"' : ''} title="Déplacer vers la droite">
                  ▶
                </button>
              </div>

              <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" style="padding: 2px 8px;"
                onclick="AdminDashboard.removeGalleryImage(${index})" title="Supprimer cette image">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  setMainGalleryImage(index) {
    if (index === 0 || index >= this.currentGalleryImages.length) return;
    const item = this.currentGalleryImages.splice(index, 1)[0];
    this.currentGalleryImages.unshift(item);
    this.renderGalleryCards();
    this.toast("Image définie comme Visuel Principal (1)", "success");
  },

  setHoverGalleryImage(index) {
    if (index === 1 || index >= this.currentGalleryImages.length) return;
    const item = this.currentGalleryImages.splice(index, 1)[0];
    if (this.currentGalleryImages.length === 0) {
      this.currentGalleryImages.push(item);
    } else {
      this.currentGalleryImages.splice(1, 0, item);
    }
    this.renderGalleryCards();
    this.toast("Image définie comme Visuel au Survol (2)", "success");
  },

  moveGalleryImage(index, delta) {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= this.currentGalleryImages.length) return;
    const temp = this.currentGalleryImages[index];
    this.currentGalleryImages[index] = this.currentGalleryImages[targetIdx];
    this.currentGalleryImages[targetIdx] = temp;
    this.renderGalleryCards();
  },

  removeGalleryImage(index) {
    if (index < 0 || index >= this.currentGalleryImages.length) return;
    this.currentGalleryImages.splice(index, 1);
    this.renderGalleryCards();
    this.toast("Image retirée de la galerie", "success");
  },

  compressImageFile(file, maxWidth = 1600, quality = 0.85) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  },

  async handleImageFileUpload(event, replaceMain = false) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const existingId = document.getElementById("prod-form-id")?.value;
    const nameVal = document.getElementById("prod-form-name")?.value.trim() || "nouveau-produit";
    const slugVal = document.getElementById("prod-form-slug")?.value.trim();
    const categoryVal = document.getElementById("prod-form-category")?.value || "t-shirts";
    const productId = existingId || slugVal || nameVal.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    this.toast(`Optimisation et téléversement de ${files.length} image(s)...`, "info");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Automatically optimize/compress image to prevent LocalStorage quota overflow
        const compressedDataUrl = await this.compressImageFile(file, 1600, 0.85) || await this.readFileAsDataURL(file);

        let finalImagePath = null;

        // Try server upload API (works on Node local dev and Hostinger PHP)
        try {
          const res = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: productId,
              category: categoryVal,
              filename: file.name,
              dataUrl: compressedDataUrl
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.path) {
              finalImagePath = data.path;
            }
          }
        } catch (apiErr) {
          console.warn("Upload API unavailable, using optimized local data URL:", apiErr.message);
        }

        const chosenUrl = finalImagePath || compressedDataUrl;

        // If replaceMain was requested or if gallery was empty, place at index 0 (Primary)
        if (replaceMain || this.currentGalleryImages.length === 0) {
          this.currentGalleryImages.unshift(chosenUrl);
          this.toast(`✓ Définie comme image principale : ${file.name}`, "success");
        } else {
          this.currentGalleryImages.push(chosenUrl);
          this.toast(`✓ Ajoutée à la galerie : ${file.name}`, "success");
        }
      } catch (err) {
        console.error("Error processing image file:", err);
        this.toast(`Erreur avec le fichier ${file.name}: ${err.message}`, "danger");
      }
    }

    this.renderGalleryCards();
    event.target.value = "";
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  openImagePickerForGallery() {
    this.activeImageTargetInput = "gallery";
    this.openModal("modal-image-picker");
  },

  addImageUrlToGallery() {
    const input = document.getElementById("prod-custom-img-url");
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
      this.toast("Veuillez saisir une URL ou chemin d'image valide", "danger");
      return;
    }

    this.currentGalleryImages.push(val);
    input.value = "";
    this.renderGalleryCards();
    this.toast("Image ajoutée à la galerie", "success");
  },

  saveProductFromForm(e) {
    e.preventDefault();

    if (this.isCurrentEditingBundle) {
      // ----------------------------------------------------------------------
      // SAVE PACK / BUNDLE PRODUCT
      // ----------------------------------------------------------------------
      const existingId = document.getElementById("prod-form-id").value;
      const name = document.getElementById("bundle-form-name").value.trim();
      const price = parseInt(document.getElementById("bundle-form-price").value, 10) || 0;
      const compareAtPrice = parseInt(document.getElementById("bundle-form-compare").value, 10) || null;
      const bundleSlotsCount = parseInt(document.getElementById("bundle-form-slots").value, 10) || 3;
      const bundleImage = document.getElementById("bundle-form-image").value.trim() || "assets/Header/Header Ar.png";
      const shortDescription = document.getElementById("bundle-form-shortdesc").value.trim();
      const description = document.getElementById("bundle-form-desc").value.trim();
      const isNew = document.getElementById("bundle-form-isnew").checked;
      const isFeatured = document.getElementById("bundle-form-isfeatured").checked;
      const isActive = document.getElementById("bundle-form-isactive") ? document.getElementById("bundle-form-isactive").checked : true;

      if (!name) {
        this.toast("Le nom du pack est obligatoire", "danger");
        return;
      }
      if (price <= 0) {
        this.toast("Veuillez saisir un prix valide pour le pack", "danger");
        return;
      }

      const bundleIncludedProductIds = this.getSelectedBundleProductIds();
      if (bundleIncludedProductIds.length === 0) {
        this.toast("Veuillez sélectionner au moins 1 modèle de t-shirt pour ce pack", "danger");
        return;
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const id = existingId || slug;

      const packProductData = {
        id,
        name,
        slug,
        category: "t-shirts",
        collections: ["essential-collection", "new-arrivals"],
        price,
        compareAtPrice,
        isNew,
        isSale: false,
        isFeatured,
        status: isActive ? "active" : "disabled",
        isActive: isActive,
        disabled: !isActive,
        isBundle: true,
        bundleSlotsCount,
        bundleIncludedProductIds,
        rating: 5,
        reviewCount: 38,
        shortDescription: shortDescription || `Composez votre pack de ${bundleSlotsCount} t-shirts au choix parmi l'ensemble de nos coupes d'exception.`,
        description: description || `Pack personnalisable de ${bundleSlotsCount} pièces. Choix libre des modèles, coloris et tailles.`,
        details: [
          `${bundleSlotsCount} T-Shirts au choix parmi l'ensemble du catalogue éligible`,
          "Sélection libre du modèle, de la couleur et de la taille pour chaque pièce",
          "Jersey lourd d'exception 240 à 300 GSM en 100% coton peigné",
          "Livraison Express Gratuite partout au Maroc",
          "Livré dans notre coffret collector signature Atelier"
        ],
        materials: "100% Coton peigné haute densité (240 - 300 GSM)",
        fit: "Coupes libres au choix (Boxy, Oversize, Décontractée)",
        careInstructions: "Lavage en machine à 30°C sur l'envers. Séchage à plat.",
        colors: [{
          name: "Pack Sur-Mesure",
          code: "bundle",
          hex: "#111111",
          image: bundleImage,
          productId: id,
          linkUrl: `product.html?id=${id}`
        }],
        sizes: [`Custom (${bundleSlotsCount} Tailles au choix)`],
        images: {
          bundle: [bundleImage]
        },
        variants: [{
          id: `${id.substring(0, 8)}-pack`,
          color: "bundle",
          size: `Custom (${bundleSlotsCount} Pièces)`,
          sku: `PACK-${id.substring(0, 6).toUpperCase()}`,
          stock: 50,
          price
        }],
        tags: ["pack", "bundle", "offre speciale", `${bundleSlotsCount} tshirts`, "streetwear", "coton lourd"]
      };

      const saved = window.StoreDataManager.saveProduct(packProductData);
      this.closeModal("modal-product");
      this.renderProducts();
      this.renderStockMatrix();
      this.renderOverview();
      this.updateBadges();
      if (saved) {
        this.toast(`✓ Pack "${name}" enregistré avec succès !`, "success");
      } else {
        this.toast(`⚠️ Pack "${name}" mis à jour en mémoire (attention : quota stockage navigateur saturé)`, "warning");
      }
      return;
    }

    // ------------------------------------------------------------------------
    // SAVE STANDARD SINGLE PRODUCT
    // ------------------------------------------------------------------------
    const existingId = document.getElementById("prod-form-id").value;
    const name = document.getElementById("prod-form-name").value.trim();
    const group = document.getElementById("prod-form-group").value.trim() || undefined;
    let slug = document.getElementById("prod-form-slug").value.trim();
    const category = document.getElementById("prod-form-category").value;
    const price = parseInt(document.getElementById("prod-form-price").value, 10) || 0;
    const compareAtPrice = parseInt(document.getElementById("prod-form-compare").value, 10) || null;
    const stock = parseInt(document.getElementById("prod-form-stock")?.value, 10) || 0;
    const skuInput = document.getElementById("prod-form-sku")?.value.trim() || "";
    const shortDescription = document.getElementById("prod-form-shortdesc").value.trim();
    const description = document.getElementById("prod-form-desc").value.trim();
    const materials = document.getElementById("prod-form-materials").value.trim();
    const fit = document.getElementById("prod-form-fit").value.trim();
    const careInstructions = document.getElementById("prod-form-care").value.trim();
    const details = document.getElementById("prod-form-details").value.split("\n").map(s => s.trim()).filter(Boolean);
    const tags = document.getElementById("prod-form-tags").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

    const isNew = document.getElementById("prod-form-isnew").checked;
    const isSale = document.getElementById("prod-form-issale").checked;
    const isFeatured = document.getElementById("prod-form-isfeatured").checked;
    const isActive = document.getElementById("prod-form-isactive") ? document.getElementById("prod-form-isactive").checked : true;

    if (!name) {
      this.toast("Le nom du produit est obligatoire", "danger");
      return;
    }

    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    }

    const id = existingId || slug;
    const sku = skuInput || `DXN-${category.substring(0, 3).toUpperCase()}-${id.substring(0, 6).toUpperCase()}`;

    let oldProd = null;
    if (existingId) {
      oldProd = window.StoreDataManager.getProductById(existingId);
    }

    // Prepare gallery images
    const galleryList = (this.currentGalleryImages && this.currentGalleryImages.length > 0)
      ? [...this.currentGalleryImages]
      : ["assets/Header/Header Ar.png"];

    // Preserve or create backward-compatible color / size / variant metadata for storefront
    const primaryColor = (oldProd && oldProd.colors && oldProd.colors[0]) || {
      name: "Standard",
      code: "default",
      hex: "#121212",
      image: galleryList[0],
      productId: id
    };

    let colors = (oldProd && Array.isArray(oldProd.colors) && oldProd.colors.length > 0)
      ? oldProd.colors
      : [primaryColor];
    if (colors[0]) colors[0].image = galleryList[0];

    let sizes = (oldProd && Array.isArray(oldProd.sizes) && oldProd.sizes.length > 0)
      ? oldProd.sizes
      : ["Unique"];

    let images = {};
    if (oldProd && oldProd.images && typeof oldProd.images === "object") {
      images = { ...oldProd.images };
    }
    images[primaryColor.code || "default"] = [...galleryList];

    // Maintain variants so product page / cart know the stock level
    let variants = [];
    if (oldProd && Array.isArray(oldProd.variants) && oldProd.variants.length > 0) {
      variants = oldProd.variants.map(v => ({
        ...v,
        stock: stock,
        price: price
      }));
    } else {
      variants = [{
        id: `${id.substring(0, 6)}-var`,
        color: primaryColor.code || "default",
        size: sizes[0] || "Unique",
        sku: sku,
        stock: stock,
        price: price
      }];
    }

    const existingCollections = (oldProd && Array.isArray(oldProd.collections) && oldProd.collections.length > 0)
      ? oldProd.collections
      : ["essential-collection", "new-arrivals"];

    const productData = {
      id,
      group,
      name,
      slug,
      category,
      categoryGroup: (window.CategoryManager && window.CategoryManager.getParentForSubcategory(category))
        ? window.CategoryManager.getParentForSubcategory(category).slug
        : (oldProd ? oldProd.categoryGroup : undefined),
      mainCategory: (window.CategoryManager && window.CategoryManager.getParentForSubcategory(category))
        ? window.CategoryManager.getParentForSubcategory(category).slug
        : (oldProd ? oldProd.mainCategory : undefined),
      collections: existingCollections,
      price,
      compareAtPrice,
      stock,
      isNew,
      isSale,
      isFeatured,
      status: isActive ? "active" : "disabled",
      isActive: isActive,
      disabled: !isActive,
      isBundle: (oldProd && typeof oldProd.isBundle === 'boolean') ? oldProd.isBundle : false,
      rating: (oldProd && oldProd.rating) || 5,
      reviewCount: (oldProd && oldProd.reviewCount) || 24,
      shortDescription,
      description,
      details,
      materials,
      fit,
      careInstructions,
      colors,
      sizes,
      images,
      variants,
      tags
    };

    const saved = window.StoreDataManager.saveProduct(productData);
    this.closeModal("modal-product");
    this.renderProducts();
    this.renderStockMatrix();
    this.renderOverview();
    this.updateBadges();
    if (saved) {
      this.toast(`✓ Produit "${name}" enregistré avec succès !`, "success");
    } else {
      this.toast(`⚠️ Produit "${name}" mis à jour en session (attention : quota de stockage navigateur saturé)`, "warning");
    }
  },

  duplicateProduct(id) {
    const product = window.StoreDataManager.getProductById(id);
    if (!product) return;

    const clone = JSON.parse(JSON.stringify(product));
    const newId = `${product.id}-copy-${Date.now().toString().slice(-4)}`;
    clone.id = newId;
    clone.slug = newId;
    clone.name = `${product.name} (Copie)`;

    if (Array.isArray(clone.variants)) {
      clone.variants.forEach(v => {
        v.id = `${newId.substring(0, 4)}-${v.color.substring(0, 3)}-${v.size.toLowerCase()}`;
        v.sku = `${v.sku}-CP`;
      });
    }

    window.StoreDataManager.saveProduct(clone);
    this.renderProducts();
    this.renderStockMatrix();
    this.renderOverview();
    this.updateBadges();
    this.toast("Produit dupliqué avec succès", "success");
  },

  deleteProduct(id) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le produit "${id}" ?`)) return;
    window.StoreDataManager.deleteProduct(id);
    this.renderProducts();
    this.renderStockMatrix();
    this.renderOverview();
    this.updateBadges();
    this.toast("Produit supprimé", "success");
  },

  toggleProductStatus(id) {
    const updated = window.StoreDataManager.toggleProductStatus(id);
    if (!updated) {
      this.toast(`Produit "${id}" introuvable`, "danger");
      return;
    }
    this.renderProducts();
    this.renderStockMatrix();
    this.renderOverview();
    this.updateBadges();
    const isNowActive = (updated.status !== 'disabled' && updated.isActive !== false && updated.disabled !== true);
    this.toast(
      isNowActive ? `🟢 Produit activé (visible dans la boutique)` : `🔴 Produit désactivé (masqué de la boutique)`,
      isNowActive ? "success" : "warning"
    );
  },

  // --------------------------------------------------------------------------
  // IMAGE PRESET PICKER & DYNAMIC PROJECT IMAGES SYNC
  // --------------------------------------------------------------------------
  async bindPresetPicker() {
    await this.loadAllProjectImages();
  },

  async loadAllProjectImages() {
    let images = [...(window.StoreDataManager.IMAGE_PRESETS || [])];

    try {
      const res = await fetch("/api/images");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.images)) {
        // Merge without duplicating URLs
        data.images.forEach(img => {
          if (!images.some(p => p.url === img.url)) {
            images.push(img);
          }
        });
      }
    } catch (e) {
      console.warn("Could not load dynamic image list from /api/images:", e.message);
    }

    this.allAvailableImages = images;
    this.renderPresetPickerGrid();
  },

  renderPresetPickerGrid() {
    const container = document.getElementById("image-preset-picker-grid");
    if (!container) return;

    let list = this.allAvailableImages || (window.StoreDataManager.IMAGE_PRESETS || []);

    // Filter by color category
    if (this.presetFilterColor && this.presetFilterColor !== "all") {
      const col = this.presetFilterColor.toLowerCase();
      list = list.filter(p => 
        (p.color && p.color.toLowerCase() === col) || 
        p.url.toLowerCase().includes(col) || 
        (p.label && p.label.toLowerCase().includes(col))
      );
    }

    // Filter by search query
    if (this.presetFilterQuery) {
      const q = this.presetFilterQuery.toLowerCase();
      list = list.filter(p => 
        (p.label && p.label.toLowerCase().includes(q)) || 
        p.url.toLowerCase().includes(q)
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; color: var(--admin-text-muted);">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">🔍</div>
          <div>Aucun visuel correspondant trouvé.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(p => `
      <div class="preset-item" onclick="AdminDashboard.selectImagePreset('${p.url}')" title="${p.label}\n${p.url}">
        <img src="${p.url}" class="preset-img" alt="${p.label}" loading="lazy">
        <div class="preset-label" title="${p.label}">${p.label}</div>
      </div>
    `).join("");
  },

  filterImagePresets(query) {
    this.presetFilterQuery = query ? query.trim() : "";
    this.renderPresetPickerGrid();
  },

  filterImagePresetsByColor(color, btnEl) {
    this.presetFilterColor = color;
    if (btnEl && btnEl.parentElement) {
      btnEl.parentElement.querySelectorAll(".admin-filter-pill").forEach(p => p.classList.remove("active"));
      btnEl.classList.add("active");
    }
    this.renderPresetPickerGrid();
  },

  async openImagePicker(targetInputId) {
    this.activeImageTargetInput = targetInputId;
    this.presetFilterQuery = "";
    this.presetFilterColor = "all";
    const searchInput = document.getElementById("image-preset-search");
    if (searchInput) searchInput.value = "";
    const filterPills = document.querySelectorAll("#image-preset-color-filters .admin-filter-pill");
    filterPills.forEach((p, idx) => p.classList.toggle("active", idx === 0));

    await this.loadAllProjectImages();
    this.openModal("modal-image-picker");
  },

  selectImagePreset(url) {
    if (this.activeImageTargetInput === "gallery") {
      this.currentGalleryImages.push(url);
      this.renderGalleryCards();
    } else if (this.activeImageTargetInput) {
      const input = document.getElementById(this.activeImageTargetInput);
      if (input) {
        input.value = url;
        if (this.activeImageTargetInput === "bundle-form-image" || this.activeImageTargetInput === "prod-form-bundle-image") {
          this.updateBundleMockupPreview(url);
        }
      }
    }
    this.closeModal("modal-image-picker");
    this.toast("Image sélectionnée", "success");
  },

  // --------------------------------------------------------------------------
  // BACKUPS, EXPORT, IMPORT & DISK SYNC
  // --------------------------------------------------------------------------
  async syncToDisk() {
    const btn = document.getElementById("btn-sync-to-disk");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `⏳ Synchronisation...`;
    }
    this.toast("Synchronisation du stockage local vers le code source...", "info");
    const res = await window.StoreDataManager.syncAllToDisk();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `⚡ Sync vers Code Source`;
    }
    if (res && res.success) {
      this.toast(`✅ Données synchronisées avec succès (${res.synced ? res.synced.join(', ') : 'OK'}) !`, "success");
    } else {
      this.toast(`Erreur lors de la synchronisation vers le disque`, "danger");
    }
  },

  exportData() {
    const json = window.StoreDataManager.exportCatalogJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atelier_catalog_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.toast("Catalogue exporté avec succès !", "success");
  },

  importData() {
    const fileInput = document.getElementById("import-json-file");
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      this.toast("Veuillez sélectionner un fichier JSON", "danger");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = window.StoreDataManager.importCatalogJSON(e.target.result);
      if (res.success) {
        this.renderAll();
        this.toast(`Catalogue importé : ${res.count} produits chargés !`, "success");
      } else {
        this.toast(`Erreur d'import : ${res.error}`, "danger");
      }
    };
    reader.readAsText(file);
  },

  async confirmResetDefaults() {
    if (confirm("ATTENTION : Cette action va réinitialiser le catalogue, les catégories et les stocks aux valeurs initiales et synchroniser les fichiers. Continuer ?")) {
      window.StoreDataManager.resetToDefaults();
      await window.StoreDataManager.syncAllToDisk();
      this.renderAll();
      this.toast("✓ Catalogue réinitialisé et synchronisé avec succès !", "success");
    }
  },

  async restoreFullCatalogMaster() {
    if (!confirm("Voulez-vous réinitialiser le catalogue et recharger les produits par défaut ?")) return;
    window.StoreDataManager.resetToDefaults();
    await window.StoreDataManager.syncAllToDisk();
    this.renderAll();
    this.toast("✓ Catalogue synchronisé avec succès !", "success");
  },

  clearBrowserCacheAndReload() {
    try {
      localStorage.removeItem("atelier_products_v1");
      localStorage.removeItem("atelier_categories_v1");
      localStorage.removeItem("atelier_colors_v1");
      localStorage.removeItem("atelier_catalog_updated_at_v1");
    } catch (e) {}
    this.toast("Cache local vidé ! Rechargement des données fraîches...", "info");
    setTimeout(() => {
      window.location.reload(true);
    }, 600);
  },

  // --------------------------------------------------------------------------
  // MODAL UTILITIES & TOASTS
  // --------------------------------------------------------------------------
  bindModals() {
    // Backdrop click close
    document.querySelectorAll(".admin-modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("active");
          const anyActive = document.querySelector(".admin-modal-backdrop.active");
          if (!anyActive) {
            document.body.classList.remove("overflow-locked");
            document.body.style.overflow = "";
          }
        }
      });
    });

    // Close buttons
    document.querySelectorAll(".admin-modal-close, [data-modal-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".admin-modal-backdrop")?.classList.remove("active");
        const anyActive = document.querySelector(".admin-modal-backdrop.active");
        if (!anyActive) {
          document.body.classList.remove("overflow-locked");
          document.body.style.overflow = "";
        }
      });
    });

    // Color picker live sync
    const hexInput = document.getElementById("color-form-hex");
    const hexPicker = document.getElementById("color-form-hex-picker");
    if (hexInput && hexPicker) {
      hexPicker.addEventListener("input", (e) => {
        hexInput.value = e.target.value.toUpperCase();
      });
      hexInput.addEventListener("input", (e) => {
        if (e.target.value.startsWith("#") && e.target.value.length === 7) {
          hexPicker.value = e.target.value;
        }
      });
    }

    // Filters for Stock Matrix
    const stockSearch = document.getElementById("stock-search-input");
    if (stockSearch) {
      stockSearch.addEventListener("input", (e) => {
        this.stockSearch = e.target.value;
        this.renderStockMatrix();
      });
    }

    const stockStatus = document.getElementById("stock-filter-status");
    if (stockStatus) {
      stockStatus.addEventListener("change", (e) => {
        this.stockFilter = e.target.value;
        this.renderStockMatrix();
      });
    }

    const stockCat = document.getElementById("stock-filter-category");
    if (stockCat) {
      stockCat.addEventListener("change", (e) => {
        this.stockCategory = e.target.value;
        this.renderStockMatrix();
      });
    }

    // Filters for Products
    const prodSearch = document.getElementById("products-search-input");
    if (prodSearch) {
      prodSearch.addEventListener("input", (e) => {
        this.productSearch = e.target.value;
        this.renderProducts();
      });
    }

    const prodCat = document.getElementById("products-filter-category");
    if (prodCat) {
      prodCat.addEventListener("change", (e) => {
        this.productCategory = e.target.value;
        this.renderProducts();
      });
    }

    const prodStatus = document.getElementById("products-filter-status");
    if (prodStatus) {
      prodStatus.addEventListener("change", (e) => {
        this.productStatusFilter = e.target.value;
        this.renderProducts();
      });
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.classList.add("overflow-locked");
      document.body.style.overflow = "hidden";
      const body = modal.querySelector(".admin-modal-body");
      if (body) body.scrollTop = 0;
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
    const anyActive = document.querySelector(".admin-modal-backdrop.active");
    if (!anyActive) {
      document.body.classList.remove("overflow-locked");
      document.body.style.overflow = "";
    }
  },

  // --------------------------------------------------------------------------
  // LIVE MYSQL ORDERS MANAGEMENT
  // --------------------------------------------------------------------------
  async loadOrders() {
    const tbody = document.getElementById("admin-orders-table-body");
    const filterEl = document.getElementById("admin-orders-filter-status");
    const status = filterEl ? filterEl.value : "all";

    try {
      const sep = (status && status !== "all") ? `?status=${status}&` : "?";
      const url = `/api/orders${sep}_t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && data.success && Array.isArray(data.orders)) {
        this.renderOrdersTable(data.orders);
        const badge = document.getElementById("badge-orders-count");
        if (badge) badge.textContent = data.orders.length;
      } else {
        throw new Error(data.error || "Format de données invalide");
      }
    } catch (e) {
      console.warn("Could not load orders from MySQL:", e.message);
      const localOrders = (window.StoreStorage && window.StoreStorage.get(window.StoreStorage.KEYS.ORDERS, [])) || [];
      this.renderOrdersTable(localOrders, true);
      const badge = document.getElementById("badge-orders-count");
      if (badge) badge.textContent = localOrders.length;
    }
  },

  renderOrdersTable(orders, isLocalFallback = false) {
    const tbody = document.getElementById("admin-orders-table-body");
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 48px 20px; color: var(--admin-text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">📭</div>
            <div style="font-weight: 600; font-size: 1rem; color: #FFF; margin-bottom: 4px;">Aucune commande client enregistrée</div>
            <div style="font-size: 0.82rem;">Les commandes passées sur la boutique apparaîtront ici en temps réel.</div>
          </td>
        </tr>
      `;
      return;
    }

    const statusBadge = (s) => {
      const map = {
        pending: '<span class="admin-badge" style="background:rgba(234, 179, 8, 0.2); color:#FDE047; border: 1px solid rgba(234, 179, 8, 0.4);">⏳ En attente</span>',
        confirmed: '<span class="admin-badge" style="background:rgba(59, 130, 246, 0.2); color:#93C5FD; border: 1px solid rgba(59, 130, 246, 0.4);">✅ Confirmée</span>',
        shipped: '<span class="admin-badge" style="background:rgba(16, 185, 129, 0.2); color:#6EE7B7; border: 1px solid rgba(16, 185, 129, 0.4);">🚚 Expédiée</span>',
        delivered: '<span class="admin-badge" style="background:#059669; color:#FFF; font-weight:700;">🎉 Livrée</span>',
        cancelled: '<span class="admin-badge" style="background:rgba(239, 68, 68, 0.2); color:#FCA5A5; border: 1px solid rgba(239, 68, 68, 0.4);">❌ Annulée</span>'
      };
      return map[s] || `<span class="admin-badge badge-secondary">${s}</span>`;
    };

    tbody.innerHTML = orders.map(ord => {
      const clientName = ord.customer_first_name 
        ? `${ord.customer_first_name} ${ord.customer_last_name}` 
        : (ord.customer ? `${ord.customer.firstName} ${ord.customer.lastName}` : "Client");
      const clientPhone = ord.customer_phone || (ord.customer && ord.customer.phone) || "N/A";
      const clientCity = ord.shipping_city || (ord.shippingAddress && ord.shippingAddress.city) || "Maroc";
      const clientAddr = ord.shipping_address || (ord.shippingAddress && ord.shippingAddress.address) || "";
      const total = ord.total || 0;
      const dateStr = ord.created_at ? new Date(ord.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (ord.date ? new Date(ord.date).toLocaleDateString() : "-");
      const currentStatus = ord.status || "pending";

      const items = ord.items || [];
      const itemsSummary = items.map(it => {
        if (it.isBundle && it.bundleItems) {
          return `<strong>Pack ${it.name}</strong> (${it.bundleItems.length} pcs)`;
        }
        return `${it.quantity || 1}x ${it.name} (${it.colorName || it.color || ''} - ${it.size || ''})`;
      }).join('<br>');

      return `
        <tr>
          <td><strong style="color:var(--admin-gold);">${ord.order_number || ord.orderNumber}</strong></td>
          <td style="font-size: 0.8rem; color: var(--admin-text-secondary); white-space: nowrap;">${dateStr}</td>
          <td>
            <strong>${clientName}</strong>
            <div style="font-size:0.75rem; color:var(--admin-text-muted);">${ord.customer_email || (ord.customer && ord.customer.email) || ''}</div>
          </td>
          <td>
            <div>📞 <strong>${clientPhone}</strong></div>
            <div style="font-size:0.78rem; color:var(--admin-text-secondary);">📍 ${clientCity} (${clientAddr})</div>
          </td>
          <td style="font-size: 0.82rem; line-height: 1.4;">${itemsSummary || '1 article'}</td>
          <td><strong style="font-size: 0.95rem; color:#FFF;">${total} MAD</strong></td>
          <td style="font-size: 0.78rem; color:var(--admin-text-secondary);">${ord.payment_method || ord.paymentMethod || 'COD'}</td>
          <td>${statusBadge(currentStatus)}</td>
          <td style="text-align: right;">
            <select class="admin-form-select" style="font-size: 0.78rem; padding: 4px 8px; width: auto; display: inline-block;" 
                    onchange="AdminDashboard.updateOrderStatus('${ord.order_number || ord.orderNumber}', this.value)">
              <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>⏳ En attente</option>
              <option value="confirmed" ${currentStatus === 'confirmed' ? 'selected' : ''}>✅ Confirmer</option>
              <option value="shipped" ${currentStatus === 'shipped' ? 'selected' : ''}>🚚 Expédier</option>
              <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>🎉 Livrer</option>
              <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>❌ Annuler</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
  },

  async updateOrderStatus(orderNumber, newStatus) {
    try {
      const res = await fetch("/api/orders?action=update_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, status: newStatus })
      });
      const data = await res.json();
      if (data && data.success) {
        this.toast(`Statut de la commande ${orderNumber} mis à jour : ${newStatus}`, "success");
      }
    } catch (e) {
      this.toast(`Commande ${orderNumber} mise à jour`, "info");
    }
    this.loadOrders();
  },

  toast(message, type = "success") {
    let container = document.querySelector(".admin-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "admin-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `admin-toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'info' ? 'ℹ️' : '⚠️';
    toast.innerHTML = `
      <span>${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  showToast(message, type = "success") {
    return this.toast(message, type);
  },

  // --------------------------------------------------------------------------
  // WHATSAPP CLOUD API (META) MANAGEMENT
  // --------------------------------------------------------------------------
  async loadWhatsAppConfig() {
    try {
      const res = await fetch("/api/whatsapp/config");
      const data = await res.json();
      if (!data.success || !data.config) return;
      const cfg = data.config;

      const phoneIdEl = document.getElementById("ws-cfg-phone-id");
      const tokenEl = document.getElementById("ws-cfg-token");
      const testPhoneEl = document.getElementById("ws-cfg-test-phone");
      const templateEl = document.getElementById("ws-cfg-template");
      const langEl = document.getElementById("ws-cfg-lang");
      const enabledEl = document.getElementById("ws-cfg-enabled");
      const badgeEl = document.getElementById("ws-status-badge");

      if (phoneIdEl) phoneIdEl.value = cfg.phone_number_id || "";
      if (tokenEl) tokenEl.value = cfg.access_token || "";
      if (testPhoneEl) testPhoneEl.value = cfg.test_recipient || "";
      if (templateEl) templateEl.value = cfg.template_name || "hello_world";
      if (langEl) langEl.value = cfg.language_code || "en_US";
      if (enabledEl) enabledEl.checked = !!cfg.enabled;

      if (badgeEl) {
        if (cfg.phone_number_id && cfg.access_token) {
          badgeEl.innerHTML = `<span class="badge" style="background: rgba(37, 211, 102, 0.2); color: #25D366; font-weight: 700;">✓ Configuré (${cfg.enabled ? 'Actif' : 'En pause'})</span>`;
        } else {
          badgeEl.innerHTML = `<span class="badge" style="background: rgba(148, 163, 184, 0.2); color: #94A3B8;">Non configuré</span>`;
        }
      }
    } catch (e) {
      console.warn("Could not load WhatsApp config:", e);
    }
  },

  async saveWhatsAppSettings() {
    const phoneId = document.getElementById("ws-cfg-phone-id")?.value.trim() || "";
    const token = document.getElementById("ws-cfg-token")?.value.trim() || "";
    const testPhone = document.getElementById("ws-cfg-test-phone")?.value.trim() || "";
    const templateName = document.getElementById("ws-cfg-template")?.value.trim() || "hello_world";
    const languageCode = document.getElementById("ws-cfg-lang")?.value.trim() || "en_US";
    const enabled = document.getElementById("ws-cfg-enabled")?.checked || false;

    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: phoneId,
          access_token: token,
          test_recipient: testPhone,
          template_name: templateName,
          language_code: languageCode,
          enabled: enabled
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Échec de sauvegarde");

      this.showToast("Paramètres WhatsApp Cloud API sauvegardés !", "success");
      this.loadWhatsAppConfig();
    } catch (err) {
      alert("Erreur de sauvegarde : " + err.message);
    }
  },

  async testWhatsAppNotification() {
    const testPhone = document.getElementById("ws-cfg-test-phone")?.value.trim();
    const resultBox = document.getElementById("ws-test-result");
    const btn = document.getElementById("btn-ws-test");

    if (!testPhone) {
      alert("Veuillez saisir votre numéro de test (destinataire vérifié dans Meta).");
      return;
    }

    // Auto-save first so the server has the latest keys
    await this.saveWhatsAppSettings();

    if (resultBox) {
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="padding: 10px 14px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3B82F6; border-radius: 6px; color: #60A5FA; font-size: 0.85rem;">
          ⏳ Envoi du message WhatsApp via Meta Cloud API en cours vers <strong>${testPhone}</strong>...
        </div>
      `;
    }

    if (btn) btn.disabled = true;

    try {
      const templateName = document.getElementById("ws-cfg-template")?.value.trim() || "hello_world";
      const languageCode = document.getElementById("ws-cfg-lang")?.value.trim() || "en_US";

      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: testPhone,
          template_name: templateName,
          language_code: languageCode
        })
      });
      const data = await res.json();

      if (data.success) {
        if (resultBox) {
          resultBox.innerHTML = `
            <div style="padding: 12px 14px; background: rgba(34, 197, 94, 0.1); border: 1px solid #22C55E; border-radius: 6px; color: #4ADE80; font-size: 0.85rem;">
              <strong>🎉 Succès ! Message WhatsApp envoyé avec succès !</strong><br>
              Destinataire : <code>${data.recipient}</code><br>
              ID Message Meta : <code>${data.data?.messages?.[0]?.id || 'OK'}</code><br>
              Vérifiez dès maintenant votre smartphone.
            </div>
          `;
        }
        this.showToast("Message WhatsApp envoyé avec succès !", "success");
      } else {
        if (resultBox) {
          resultBox.innerHTML = `
            <div style="padding: 12px 14px; background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; border-radius: 6px; color: #F87171; font-size: 0.85rem;">
              <strong>⚠️ Erreur retournée par Meta :</strong><br>
              <code>${data.error || 'Erreur inconnue'}</code><br>
              <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 6px;">
                💡 Conseil : Assurez-vous que votre numéro de téléphone a bien été ajouté et vérifié dans votre tableau de bord Meta (WhatsApp > API Setup > To).
              </div>
            </div>
          `;
        }
      }
    } catch (err) {
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="padding: 12px 14px; background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; border-radius: 6px; color: #F87171; font-size: 0.85rem;">
            Erreur technique : ${err.message}
          </div>
        `;
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.AdminDashboard.init();
  });
} else {
  window.AdminDashboard.init();
}
