/**
 * ATELIER Store Data Management Engine
 * Handles bi-directional synchronization between Admin Dashboard and Storefront.
 * Persists customized categories, colors, inventory stock, and products in localStorage.
 */

window.StoreDataManager = {
  KEYS: {
    PRODUCTS: "atelier_products_v2",
    CATEGORIES: "atelier_categories_v2",
    COLORS: "atelier_colors_v2",
    LAST_UPDATED: "atelier_catalog_updated_at_v2",
    DELETED_IDS: "atelier_deleted_product_ids_v2"
  },

  // Default color palette presets
  DEFAULT_COLORS: [
    {
        "name": "Vert Naturel (DXN)",
        "nameAr": "أخضر طبيعي",
        "code": "green",
        "hex": "#2D6A4F",
        "image": "assets/ecom/1.png"
    },
    {
        "name": "Or Reishi Ganoderma",
        "nameAr": "ذهبي ريشي",
        "code": "gold",
        "hex": "#D4A373",
        "image": "assets/ecom/7.png"
    },
    {
        "name": "Rouge Ganoderma",
        "nameAr": "أحمر غانوديرما",
        "code": "red",
        "hex": "#9E2A2B",
        "image": "assets/ecom2/1.png"
    },
    {
        "name": "Blanc Pur Naturel",
        "nameAr": "أبيض نقي",
        "code": "white",
        "hex": "#F8F9FA",
        "image": "assets/ecom/8.png"
    },
    {
        "name": "Noir Café Lingzhi",
        "nameAr": "أسود قهوة لينغزي",
        "code": "black",
        "hex": "#1F1D1D",
        "image": "assets/ecom2/2.png"
    },
    {
        "name": "Pack Découverte DXN",
        "nameAr": "باقة دكسن الصحية",
        "code": "bundle",
        "hex": "#1B4332",
        "image": "assets/Header/Header Ar.png"
    }
],

  // Available image mockup library presets for quick selection
  IMAGE_PRESETS: [
  {
    "label": "Bannière Officielle DXN (Arabe)",
    "url": "assets/Header/Header Ar.png",
    "color": "standard"
  },
  {
    "label": "Bannière Officielle DXN (Français)",
    "url": "assets/Header/Header fr.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN ALOE.V Gel Aqueux Hydratant à l'Aloès",
    "url": "assets/ecom/1.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Boisson Concentrée Pur Jus de Pomme",
    "url": "assets/ecom/2.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Black Cumin Plus - Gélules de Nigelle Pure",
    "url": "assets/ecom/3.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Thé Oozhi Oolong au Ganoderma",
    "url": "assets/ecom/4.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Nouilles Spirudle Tom Yam à la Spiruline",
    "url": "assets/ecom/5.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Nouilles Diététiques Spirudle à la Spiruline",
    "url": "assets/ecom/6.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Poudre Reishilium Pure de Reishi (Ganoderma)",
    "url": "assets/ecom/7.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN ALOE.V Lait Hydratant Mains & Corps à l'Aloès",
    "url": "assets/ecom/8.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Poria S Gélules Bien-Être & Vitalité",
    "url": "assets/ecom/9.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Huile de Massage Gano au Reishi & Palme",
    "url": "assets/ecom/10.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Ganoodle Tom Yam au Ganoderma",
    "url": "assets/ecom/11.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Infusion Florathemum aux Fleurs de Chrysanthème",
    "url": "assets/ecom/12.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Divine Touch Crème Contour des Yeux Effet Liftant",
    "url": "assets/ecom/13.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Lait Après-Soleil Rafraîchissant & Apaisant",
    "url": "assets/ecom/14.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Masque Visage Hydratant Spiruline & Avocat",
    "url": "assets/ecom/15.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Divine Touch Crème Visage Effet Liftant",
    "url": "assets/ecom/16.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Crème Mains Ultra-Nourrissante",
    "url": "assets/ecom/17.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Émulsion Solaire Protectrice SPF 30",
    "url": "assets/ecom/18.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Sérum Tenseur & Liftant Immédiat",
    "url": "assets/ecom/19.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Divine Touch Sérum Visage Effet Liftant",
    "url": "assets/ecom/20.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Mousse Nettoyante Instantanée Aloe Vera & Camomille",
    "url": "assets/ecom/21.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Baume à Lèvres Ultra-Hydratant",
    "url": "assets/ecom/22.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Gel Douche Aromatique & Sensoriel de Luxe",
    "url": "assets/ecom/23.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Divine Touch Huile Visage Nourrissante de Nuit",
    "url": "assets/ecom/24.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Huile de Bronzage Naturelle & Dorée",
    "url": "assets/ecom/25.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Divine Touch Brume Multi-Usages Visage & Corps",
    "url": "assets/ecom/26.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Crème Visage Hydratante Huile d'Argan & Pépins de Raisin",
    "url": "assets/ecom/27.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Lait Corporel Aromatique & Parfumé de Luxe",
    "url": "assets/ecom/28.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Eau Tonique & Micellaire Purifiante Sauge & Hamamélis",
    "url": "assets/ecom/29.png",
    "color": "standard"
  },
  {
    "label": "Kallow - Kallow Crème Solaire Visage Haute Protection SPF 50",
    "url": "assets/ecom/30.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Mousse de Douche Ganozhi au Ganoderma",
    "url": "assets/ecom2/1.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Pastilles Zhi Mint Plus Sans Sucre au Reishi",
    "url": "assets/ecom2/2.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Huile Douce Bébé Chubby Baby Oil",
    "url": "assets/ecom2/3.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Huile de Coco Vierge VCO-1 au Ganoderma",
    "url": "assets/ecom2/4.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Pommade Apaisante Zhimeko aux Extraits Naturels",
    "url": "assets/ecom2/5.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Biscuits SpiruNanas Ananas, Spiruline & Reishi",
    "url": "assets/ecom2/6.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Spiruline Pure 660 Comprimés - Format Économique",
    "url": "assets/ecom2/7.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Spiruline Pure 120 Comprimés Super-Aliment",
    "url": "assets/ecom2/8.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Shampoing Revitalisant Ganozhi au Ganoderma",
    "url": "assets/ecom2/9.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Thé Instantané Zhitea Premix Énergisant",
    "url": "assets/ecom2/10.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Boisson Botanique Oocha à la Crinière de Lion",
    "url": "assets/ecom2/11.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Savon Translucide Végétal Oocha Trans Soap",
    "url": "assets/ecom2/12.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Savon Translucide Ganozhi Trans Soap au Reishi",
    "url": "assets/ecom2/13.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Pain de Savon Naturel Ganozhi à l'Huile de Palme & Ganoderma",
    "url": "assets/ecom2/14.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Crinière de Lion Pure 120 Comprimés (Lion's Mane)",
    "url": "assets/ecom2/15.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Vinaigrette Gourmande Miel Pur & Vinaigre de Riz",
    "url": "assets/ecom2/16.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Boisson Botanique Hydratante Aloe Vita à l'Aloe Vera",
    "url": "assets/ecom2/17.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Thé Citronné Lemonzhi au Ganoderma & Thé Noir",
    "url": "assets/ecom2/18.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Boisson Rafraîchissante Instantanée Lemonzhi au Citron",
    "url": "assets/ecom2/19.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Pur Jus Morinzhi Fermenté de Noni & Hibiscus (285 ml)",
    "url": "assets/ecom2/20.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Jus Morinzhi Noni & Hibiscus Grand Format (700 ml)",
    "url": "assets/ecom2/21.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Cordyceps Purifié en Gélules Énergie & Endurance",
    "url": "assets/ecom2/22.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Ganocelium GL Mycélium de Reishi Oxygénant",
    "url": "assets/ecom2/23.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Reishi Gano RG Extrait Concentré Détoxifiant",
    "url": "assets/ecom2/24.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Café Cordyceps 3-en-1 Tonus & Vitalité",
    "url": "assets/ecom2/25.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Café Crinière de Lion Concentration & Clarté",
    "url": "assets/ecom2/26.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Café Onctueux Lingzhi 3-en-1 au Ganoderma",
    "url": "assets/ecom2/27.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Café Noir Pur Lingzhi Black Coffee Sans Sucre",
    "url": "assets/ecom2/28.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Crème Purifiante à l'Arbre à Thé (Tea Tree Cream)",
    "url": "assets/ecom2/29.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Éixir Cordypine Ananas Fermenté & Cordyceps",
    "url": "assets/ecom2/30.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Gâteau Moelleux Lingzhi Ananas au Ganoderma",
    "url": "assets/ecom2/31.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Poudre Végétale Détox MycoVeggie Riches en Fibres",
    "url": "assets/ecom2/32.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Confiture Artisanale de Pommes Fermentées Saines",
    "url": "assets/ecom2/33.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Boisson Cacao Gourmande Cocozhi au Ganoderma",
    "url": "assets/ecom2/34.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Boisson Botanique Roselle à l'Hibiscus Pur",
    "url": "assets/ecom2/35.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Dentifrice Naturel Ganozhi au Ganoderma Sans Fluor",
    "url": "assets/ecom2/36.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN Sel Rose Pur de l'Himalaya Iodé de Table",
    "url": "assets/ecom2/37.png",
    "color": "standard"
  },
  {
    "label": "DXN - DXN ALOE.V Gel Nettoyant Doux Visage à l'Aloès",
    "url": "assets/ecom2/38.png",
    "color": "standard"
  },
  {
    "label": "DXN - ميكوفيتا – MYCOVITA DXN",
    "url": "assets/ecom2/39.png",
    "color": "standard"
  }
],

  /**
   * Initialize and synchronize global window store arrays
   */
  init() {
    this.syncGlobalStores();
  },

  syncGlobalStores() {
    window.STORE_PRODUCTS = this.getProducts(false); // Storefront only receives active products
    window.STORE_CATEGORIES = this.getCategories();
    window.STORE_COLORS = this.getColors();
  },

  getDeletedProductIds() {
    try {
      const stored = localStorage.getItem(this.KEYS.DELETED_IDS);
      if (stored) return new Set(JSON.parse(stored));
    } catch(e) {}
    return new Set();
  },

  saveDeletedProductIds(setOrArray) {
    try {
      const arr = Array.from(setOrArray);
      localStorage.setItem(this.KEYS.DELETED_IDS, JSON.stringify(arr));
    } catch(e) {}
  },

  /**
   * Sync complete catalog (products, categories, colors) to disk files and MySQL
   */
  syncAllToDisk(deletedProductId = null, productsList = null) {
    if (typeof fetch !== 'function') return Promise.resolve({ success: false });
    const deletedSet = this.getDeletedProductIds();
    if (deletedProductId) deletedSet.add(deletedProductId);

    let products = productsList ? [...productsList] : this.getRawProducts();
    if (deletedProductId) {
      products = products.filter(p => p.id !== deletedProductId);
    }
    products = products.filter(p => p && p.id && !deletedSet.has(p.id));

    const payload = {
      products: products,
      categories: this.getCategories(),
      colors: this.getColors(),
      deletedProductId: deletedProductId || undefined
    };
    return fetch('/api/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json())
      .then(data => {
        if (data && data.success) {
          console.log('[StoreDataManager] Full catalog synced to MySQL & disk:', data.synced);
        }
        return data;
      })
      .catch(e => {
        console.warn('[StoreDataManager] Disk sync skipped:', e.message);
        return { success: false, error: e.message };
      });
  },

  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  getRawProducts() {
    return this.getProducts(true);
  },

  getProducts(includeDisabled = false) {
    const deletedSet = this.getDeletedProductIds();
    try {
      const CATALOG_VERSION_KEY = "dxn_catalog_version_square";
      const CURRENT_VERSION = "2026_10_25_catalog_v7_dxn_prices";
      if (localStorage.getItem(CATALOG_VERSION_KEY) !== CURRENT_VERSION) {
        localStorage.removeItem(this.KEYS.PRODUCTS);
        localStorage.setItem(CATALOG_VERSION_KEY, CURRENT_VERSION);
      }
      const stored = localStorage.getItem(this.KEYS.PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const DEPRECATED_IDS = new Set([
            "heritage-regular-tshirt-heather-grey",
            "pack-trio-tshirts",
            "graphic-tee-colored",
            "essential-oversized-tee",
            "minimal-embroidered-logo-tee",
            "rodeo-bear-classic-fit-tee",
            "relaxed-tank-top-180gsm",
            "oversized-muscle-tee-180gsm",
            "zip-hoodie-boxy-320gsm",
            "crewneck-heavyweight-320gsm",
            "tshirt-boxy-inverted-label-navy",
            "heavyweight-boxy-tee-300", 
            "oversized-tee-big-white", 
            "vintage-washed-charcoal-tee", 
            "graphic-tee-colored-blue-dark", 
            "essential-tee-rose",
            "essential-tee-indigo",
            "essential-tee-blue-m",
            "atelier-studio-drop-tee",
            "relaxed-earth-tone-tee",
            "classic-relaxed-tank-top"
          ]);
          const cleaned = parsed.filter(p => p && p.id && !DEPRECATED_IDS.has(p.id) && !deletedSet.has(p.id));
          
          const defaultList = window.DEFAULT_STORE_PRODUCTS || [];
          const finalProducts = [];
          const processedIds = new Set();

          // 1. Reconcile stored items with master defaults
          cleaned.forEach(item => {
            if (!item || !item.id || deletedSet.has(item.id)) return;
            processedIds.add(item.id);

            const def = defaultList.find(d => d.id === item.id);
            if (!def) {
              finalProducts.push(item);
              return;
            }

            const merged = { ...def, ...item };
            
            // Merge collections (ensure default collections like packs-bundles are preserved)
            const defColls = Array.isArray(def.collections) ? def.collections : [];
            const itemColls = Array.isArray(item.collections) ? item.collections : [];
            const mergedColls = Array.from(new Set([...defColls, ...itemColls]));
            if (def.isBundle || def.id === 'pack-trio-tshirts') {
              if (!mergedColls.includes('packs-bundles')) {
                mergedColls.unshift('packs-bundles');
              }
            }
            merged.collections = mergedColls;

            // Merge colors
            const existingCodes = new Set((item.colors || []).map(c => c.code));
            const mergedColors = [...(item.colors || [])];
            (def.colors || []).forEach(defColor => {
              if (!existingCodes.has(defColor.code)) {
                mergedColors.push(defColor);
                existingCodes.add(defColor.code);
              }
            });
            merged.colors = mergedColors;

            // Merge images
            merged.images = { ...(def.images || {}), ...(item.images || {}) };
            // Sanitize any stale jpeg image paths to png
            for (const k in merged.images) {
              if (Array.isArray(merged.images[k])) {
                merged.images[k] = merged.images[k].map(img => typeof img === 'string' ? img.replace(/\.jpeg$/i, '.png') : img);
              }
            }
            (def.colors || []).forEach(defColor => {
              if (!merged.images[defColor.code] || merged.images[defColor.code].length === 0) {
                if (def.images && def.images[defColor.code]) {
                  merged.images[defColor.code] = def.images[defColor.code];
                }
              }
            });

            // Synchronize colorway primary image with gallery image 1
            mergedColors.forEach(c => {
              if (merged.images && merged.images[c.code] && merged.images[c.code].length > 0) {
                c.image = merged.images[c.code][0];
              }
            });

            // Merge variants
            const existingVarKeys = new Set((item.variants || []).map(v => `${v.color}-${v.size}`));
            const mergedVariants = [...(item.variants || [])];
            (def.variants || []).forEach(defVar => {
              const key = `${defVar.color}-${defVar.size}`;
              if (!existingVarKeys.has(key)) {
                mergedVariants.push(defVar);
                existingVarKeys.add(key);
              }
            });
            merged.variants = mergedVariants;

            finalProducts.push(merged);
          });

          // 2. Append any default products not yet in localStorage (UNLESS DELETED)
          defaultList.forEach(def => {
            if (def && def.id && !processedIds.has(def.id) && !DEPRECATED_IDS.has(def.id) && !deletedSet.has(def.id)) {
              finalProducts.push(def);
              processedIds.add(def.id);
            }
          });

          localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(finalProducts));

          if (includeDisabled) {
            return finalProducts;
          }
          return finalProducts.filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
        }
      }
    } catch (e) {
      console.warn("Error reading stored products:", e);
    }

    const fallback = (window.DEFAULT_STORE_PRODUCTS || window.STORE_PRODUCTS || [])
      .filter(p => p && p.id && !deletedSet.has(p.id));

    if (includeDisabled) {
      return fallback;
    }
    return fallback.filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
  },

  saveProducts(products, deletedProductId = null) {
    let savedLocal = false;
    const deletedSet = this.getDeletedProductIds();
    if (deletedProductId) {
      deletedSet.add(deletedProductId);
      this.saveDeletedProductIds(deletedSet);
    }
    
    // Safety guard: merge any missing defaults before saving UNLESS deleted
    const defaults = window.DEFAULT_STORE_PRODUCTS || [];
    if (Array.isArray(products) && defaults.length > 0) {
      const existingIds = new Set(products.map(p => p.id));
      defaults.forEach(d => {
        if (d && d.id && !existingIds.has(d.id) && d.id !== deletedProductId && !deletedSet.has(d.id)) {
          products.push(d);
          existingIds.add(d.id);
        }
      });
    }

    // Ensure deletedProductId is strictly excluded
    if (deletedProductId) {
      products = products.filter(p => p.id !== deletedProductId);
    }
    products = products.filter(p => !deletedSet.has(p.id));

    try {
      localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(this.KEYS.LAST_UPDATED, new Date().toISOString());
      savedLocal = true;
    } catch (e) {
      console.warn("Storage quota warning:", e.message);
    }

    // Active products for storefront
    window.STORE_PRODUCTS = products.filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
    this.recalculateCategoryCounts();

    // Trigger automatic background sync to disk and MySQL
    this.syncAllToDisk(deletedProductId, products);

    return savedLocal;
  },

  getProductById(id) {
    const products = this.getProducts(true);
    let product = products.find(p => p.id === id || p.slug === id);
    if (!product) {
      // Alias mapping for merged items
      const ALIASES = {
        "vintage-washed-charcoal-tee": "graphic-tee-colored",
        "graphic-tee-colored-blue-dark": "graphic-tee-colored",
        "essential-tee-rose": "graphic-tee-colored",
        "essential-tee-indigo": "graphic-tee-colored",
        "heavyweight-boxy-tee-300": "essential-oversized-tee",
        "oversized-tee-big-white": "essential-oversized-tee",
        "essential-tee-blue-m": "minimal-embroidered-logo-tee",
        "atelier-studio-drop-tee": "minimal-embroidered-logo-tee",
        "relaxed-earth-tone-tee": "minimal-embroidered-logo-tee"
      };
      if (ALIASES[id]) {
        product = products.find(p => p.id === ALIASES[id] || p.slug === ALIASES[id]);
      }
    }
    return product || null;
  },

  saveProduct(productData) {
    const products = this.getRawProducts();
    const defaults = window.DEFAULT_STORE_PRODUCTS || [];
    const deletedSet = this.getDeletedProductIds();
    const existingIds = new Set(products.map(p => p.id));
    defaults.forEach(d => {
      if (d && d.id && !existingIds.has(d.id) && !deletedSet.has(d.id)) {
        products.push(d);
        existingIds.add(d.id);
      }
    });

    const index = products.findIndex(p => p.id === productData.id);

    if (index >= 0) {
      products[index] = { ...products[index], ...productData };
    } else {
      products.unshift(productData);
    }

    return this.saveProducts(products);
  },

  toggleProductStatus(id) {
    const products = this.getRawProducts();
    const product = products.find(p => p.id === id);
    if (!product) return null;

    const isCurrentlyActive = product.status !== 'disabled' && product.isActive !== false && product.disabled !== true;
    const newStatus = isCurrentlyActive ? 'disabled' : 'active';
    product.status = newStatus;
    product.isActive = !isCurrentlyActive;
    product.disabled = isCurrentlyActive;

    this.saveProducts(products);

    if (typeof fetch === 'function') {
      fetch('/api/toggle-product-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      }).catch(e => console.warn('Could not sync status toggle:', e.message));
    }

    return product;
  },

  deleteProduct(id) {
    const deletedSet = this.getDeletedProductIds();
    deletedSet.add(id);
    this.saveDeletedProductIds(deletedSet);

    const all = this.getRawProducts().filter(p => p.id !== id);
    this.saveProducts(all, id);

    if (typeof fetch === 'function') {
      fetch('/api/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(e => console.warn('Could not notify server of delete:', e.message));
    }
    return true;
  },

  // --------------------------------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------------------------------
  getCategories() {
    try {
      const stored = localStorage.getItem(this.KEYS.CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaults = window.DEFAULT_STORE_CATEGORIES || [];
          const existingSlugs = new Set(parsed.map(c => c.slug || c.id));
          let changed = false;
          defaults.forEach(d => {
            if (!existingSlugs.has(d.slug || d.id)) {
              parsed.push(d);
              existingSlugs.add(d.slug || d.id);
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading stored categories:", e);
    }
    return window.DEFAULT_STORE_CATEGORIES || window.STORE_CATEGORIES || [];
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(this.KEYS.LAST_UPDATED, new Date().toISOString());
      window.STORE_CATEGORIES = categories;
      this.syncAllToDisk();
      return true;
    } catch (e) {
      console.error("Error saving categories:", e);
      return false;
    }
  },

  saveCategory(catData) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === catData.id || c.slug === catData.slug);

    if (index >= 0) {
      categories[index] = { ...categories[index], ...catData };
    } else {
      categories.push(catData);
    }

    return this.saveCategories(categories);
  },

  deleteCategory(idOrSlug) {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== idOrSlug && c.slug !== idOrSlug);
    return this.saveCategories(filtered);
  },

  getMainCategories() {
    return window.STORE_MAIN_CATEGORIES || [];
  },

  recalculateCategoryCounts() {
    const products = this.getProducts();
    const categories = this.getCategories();
    const mainCategories = window.STORE_MAIN_CATEGORIES || [];

    // 1. Recalculate subcategories count
    categories.forEach(cat => {
      const count = products.filter(p => !p.isBundle && p.id !== 'pack-trio-tshirts' && (p.category === cat.slug || p.category === cat.id)).length;
      cat.itemCount = count;
    });

    // 2. Recalculate main categories count
    mainCategories.forEach(main => {
      const subs = new Set(main.subcategories || []);
      const count = products.filter(p => !p.isBundle && p.id !== 'pack-trio-tshirts' && (
        subs.has(p.category) || 
        p.categoryGroup === main.slug || 
        p.mainCategory === main.slug ||
        (main.slug === 'kallow' && (p.brand === 'Kallow' || (Array.isArray(p.collections) && p.collections.includes('kallow'))))
      )).length;
      main.itemCount = count;
    });

    try {
      localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
      window.STORE_CATEGORIES = categories;
      window.STORE_MAIN_CATEGORIES = mainCategories;
    } catch (e) {
      console.warn("Could not recalculate category counts:", e);
    }
  },

  // --------------------------------------------------------------------------
  // COLORS
  // --------------------------------------------------------------------------
  getColors() {
    try {
      const stored = localStorage.getItem(this.KEYS.COLORS);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingCodes = new Set(parsed.map(c => c.code));
          let changed = false;
          (this.DEFAULT_COLORS || []).forEach(defColor => {
            if (!existingCodes.has(defColor.code)) {
              parsed.push(defColor);
              existingCodes.add(defColor.code);
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(this.KEYS.COLORS, JSON.stringify(parsed));
            window.STORE_COLORS = parsed;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading stored colors:", e);
    }

    return [...this.DEFAULT_COLORS];
  },

  saveColors(colors) {
    try {
      localStorage.setItem(this.KEYS.COLORS, JSON.stringify(colors));
      window.STORE_COLORS = colors;
      this.syncAllToDisk();
      return true;
    } catch (e) {
      console.error("Error saving colors:", e);
      return false;
    }
  },

  saveColor(colorData) {
    const colors = this.getColors();
    const index = colors.findIndex(c => c.code === colorData.code);

    if (index >= 0) {
      colors[index] = { ...colors[index], ...colorData };
    } else {
      colors.push(colorData);
    }

    return this.saveColors(colors);
  },

  deleteColor(code) {
    const colors = this.getColors();
    const filtered = colors.filter(c => c.code !== code);
    this.saveColors(filtered);

    // Clean up color reference from products if present
    const products = this.getProducts();
    let productsUpdated = false;
    products.forEach(p => {
      if (Array.isArray(p.colors) && p.colors.some(c => c.code === code)) {
        p.colors = p.colors.filter(c => c.code !== code);
        if (Array.isArray(p.variants)) {
          p.variants = p.variants.filter(v => v.color !== code);
        }
        if (p.images && p.images[code]) {
          delete p.images[code];
        }
        productsUpdated = true;
      }
    });

    if (productsUpdated) {
      this.saveProducts(products);
    }

    return true;
  },

  // --------------------------------------------------------------------------
  // INVENTORY & STOCK
  // --------------------------------------------------------------------------
  getAllVariants() {
    const products = this.getProducts();
    const variants = [];

    products.forEach(product => {
      if (Array.isArray(product.variants)) {
        product.variants.forEach(v => {
          const colorObj = Array.isArray(product.colors) ? product.colors.find(c => c.code === v.color) : null;
          variants.push({
            productId: product.id,
            productName: product.name,
            productCategory: product.category,
            productImage: (colorObj && colorObj.image) || (product.images && product.images[v.color] && product.images[v.color][0]) || (product.colors && product.colors[0] && product.colors[0].image) || "",
            variantId: v.id,
            sku: v.sku || `${product.id}-${v.color}-${v.size}`.toUpperCase(),
            color: v.color,
            colorName: (colorObj && colorObj.name) || v.color,
            colorHex: (colorObj && colorObj.hex) || "#111111",
            size: v.size,
            stock: typeof v.stock === "number" ? v.stock : 0,
            price: v.price || product.price || 0
          });
        });
      }
    });

    return variants;
  },

  updateVariantStock(productId, variantId, newStock) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);

    if (!product || !Array.isArray(product.variants)) return false;

    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return false;

    variant.stock = Math.max(0, parseInt(newStock, 10) || 0);
    return this.saveProducts(products);
  },

  updateProductStock(productId, newStock) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const val = Math.max(0, parseInt(newStock, 10) || 0);
    product.stock = val;

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      product.variants.forEach(v => {
        v.stock = val;
      });
    }

    return this.saveProducts(products);
  },


  bulkUpdateStock(updates) {
    const products = this.getProducts();

    updates.forEach(u => {
      const product = products.find(p => p.id === u.productId);
      if (product && Array.isArray(product.variants)) {
        const variant = product.variants.find(v => v.id === u.variantId);
        if (variant) {
          variant.stock = Math.max(0, parseInt(u.stock, 10) || 0);
        }
      }
    });

    return this.saveProducts(products);
  },

  getInventoryStats() {
    const variants = this.getAllVariants();
    const products = this.getProducts();
    const categories = this.getCategories();

    let totalUnits = 0;
    let totalValueMAD = 0;
    let lowStockCount = 0; // < 5
    let outOfStockCount = 0; // 0

    variants.forEach(v => {
      totalUnits += v.stock;
      totalValueMAD += (v.stock * v.price);
      if (v.stock === 0) {
        outOfStockCount++;
      } else if (v.stock < 5) {
        lowStockCount++;
      }
    });

    return {
      totalProducts: products.length,
      totalVariants: variants.length,
      totalCategories: categories.length,
      activeCategories: categories.filter(c => c.active).length,
      totalUnits,
      totalValueMAD,
      lowStockCount,
      outOfStockCount
    };
  },

  // --------------------------------------------------------------------------
  // BACKUP, EXPORT, IMPORT & RESET
  // --------------------------------------------------------------------------
  exportCatalogJSON() {
    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      colors: this.getColors()
    };
    return JSON.stringify(data, null, 2);
  },

  importCatalogJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.products || !Array.isArray(data.products)) {
        throw new Error("Format invalide : le tableau 'products' est obligatoire.");
      }

      if (data.categories && Array.isArray(data.categories)) {
        this.saveCategories(data.categories);
      }
      if (data.colors && Array.isArray(data.colors)) {
        this.saveColors(data.colors);
      }
      this.saveProducts(data.products);
      this.recalculateCategoryCounts();

      return { success: true, count: data.products.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  resetToDefaults() {
    try {
      localStorage.removeItem(this.KEYS.PRODUCTS);
      localStorage.removeItem(this.KEYS.CATEGORIES);
      localStorage.removeItem(this.KEYS.COLORS);
      localStorage.removeItem(this.KEYS.LAST_UPDATED);

      window.STORE_PRODUCTS = window.DEFAULT_STORE_PRODUCTS || [];
      window.STORE_CATEGORIES = window.DEFAULT_STORE_CATEGORIES || [];
      window.STORE_COLORS = [...this.DEFAULT_COLORS];

      this.recalculateCategoryCounts();
      return true;
    } catch (e) {
      console.error("Error resetting defaults:", e);
      return false;
    }
  }
};
