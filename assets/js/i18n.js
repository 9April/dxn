/**
 * Centralized Internationalization / Localization Dictionary (AR & FR)
 * Supports dynamic language switching between Arabic (primary) and French (secondary).
 * Automatically handles RTL / LTR document direction, typography, and persistence.
 */

window.I18N = {
  // Stored language key
  STORAGE_KEY: "atelier_lang",

  // Supported languages
  currentLang: "ar",

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  init() {
    try {
      if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === "fr" || saved === "ar") {
          this.currentLang = saved;
        } else {
          this.currentLang = "ar"; // Arabic default
        }
      }
    } catch (e) {
      this.currentLang = "ar";
    }

    this.applyDomDirection();
  },

  applyDomDirection() {
    if (typeof document !== "undefined" && document.documentElement) {
      const isAr = this.currentLang === "ar";
      document.documentElement.lang = this.currentLang;
      document.documentElement.dir = isAr ? "rtl" : "ltr";
      document.documentElement.classList.toggle("lang-ar", isAr);
      document.documentElement.classList.toggle("lang-fr", !isAr);
      this.updateDocumentTitle();
    }
  },

  updateDocumentTitle() {
    if (typeof document === "undefined" || !document.location) return;
    const isAr = this.isRTL();
    const pathname = (window.location.pathname || "").toLowerCase();

    const titles = {
      "shop": {
        ar: "متجر المنتجات الطبيعية | دي إكس إن وكالو المغرب",
        fr: "Boutique & Catalogue Officiel | DXN & KALLOW Maroc"
      },
      "product": {
        ar: "تفاصيل المنتج | دي إكس إن وكالو المغرب",
        fr: "Détails Produit | DXN & KALLOW Maroc"
      },
      "about": {
        ar: "من نحن ورؤيتنا الصحية | دي إكس إن وكالو المغرب",
        fr: "À Propos & Notre Histoire | DXN & KALLOW Maroc"
      },
      "contact": {
        ar: "اتصل بنا وخدمة العملاء | دي إكس إن وكالو المغرب",
        fr: "Contact & Service Client | DXN & KALLOW Maroc"
      },
      "collections": {
        ar: "المجموعات والتصنيفات | دي إكس إن وكالو المغرب",
        fr: "Collections & Gammes | DXN & KALLOW Maroc"
      },
      "shipping-returns": {
        ar: "الشحن والتوصيل بالمغرب | دي إكس إن وكالو المغرب",
        fr: "Livraison & Retours au Maroc | DXN & KALLOW Maroc"
      },
      "cart": {
        ar: "سلة التسوق | دي إكس إن وكالو المغرب",
        fr: "Votre Panier | DXN & KALLOW Maroc"
      },
      "checkout": {
        ar: "إتمام الطلب والدفع عند الاستلام | دي إكس إن وكالو المغرب",
        fr: "Commander - Paiement à la Livraison | DXN & KALLOW Maroc"
      },
      "wishlist": {
        ar: "قائمة المنتجات المفضلة | دي إكس إن وكالو المغرب",
        fr: "Mes Produits Favoris | DXN & KALLOW Maroc"
      },
      "account": {
        ar: "حسابي والطلبات | دي إكس إن وكالو المغرب",
        fr: "Mon Compte & Commandes | DXN & KALLOW Maroc"
      },
      "login": {
        ar: "تسجيل الدخول وإنشاء حساب | دي إكس إن وكالو المغرب",
        fr: "Connexion & Inscription | DXN & KALLOW Maroc"
      },
      "order-success": {
        ar: "تم تأكيد الطلب بنجاح | دي إكس إن وكالو المغرب",
        fr: "Commande Confirmée avec Succès | DXN & KALLOW Maroc"
      },
      "admin": {
        ar: "لوحة التحكم وإدارة المخزون | دي إكس إن وكالو",
        fr: "Tableau de Bord Admin & Stocks | DXN & KALLOW"
      },
      "index": {
        ar: "دي إكس إن وكالو المغرب | متجر الصحة والجمال الطبيعي 100%",
        fr: "DXN & KALLOW Maroc | Boutique Officielle Santé & Beauté Naturelle"
      }
    };

    for (const key of Object.keys(titles)) {
      if (pathname.includes(key)) {
        if (key === "product") {
          if (window.ProductPageController && window.ProductPageController.product) {
            const p = window.ProductPageController.product;
            const pTitle = isAr ? (p.nameAr || p.name) : (p.nameFr || p.name);
            const bTitle = isAr ? "دي إكس إن وكالو المغرب" : "DXN & KALLOW Maroc";
            document.title = `${pTitle} | ${bTitle}`;
            return;
          }
        }
        if (key !== "product" || !document.title || document.title.includes("ATELIER") || document.title.includes("تفاصيل المنتج") || document.title.includes("Détails Produit")) {
          document.title = isAr ? titles[key].ar : titles[key].fr;
        }
        return;
      }
    }
    document.title = isAr ? titles["index"].ar : titles["index"].fr;
  },

  getLang() {
    return this.currentLang || "ar";
  },

  isRTL() {
    return this.getLang() === "ar";
  },

  setLang(newLang, reload = true) {
    if (newLang !== "ar" && newLang !== "fr") return;
    this.currentLang = newLang;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.STORAGE_KEY, newLang);
      }
    } catch (e) {}

    this.applyDomDirection();
    window.dispatchEvent(new CustomEvent("language:changed", { detail: { lang: newLang } }));

    if (typeof window !== "undefined" && window.AdminDashboard && window.AdminDashboard.activeTab) {
      try {
        const u = new URL(window.location.href);
        u.searchParams.set("tab", window.AdminDashboard.activeTab);
        window.history.replaceState({}, "", u.toString());
      } catch (e) {}
    }

    if (reload && typeof window !== "undefined") {
      window.location.reload();
    }
  },

  toggleLang() {
    const next = this.currentLang === "ar" ? "fr" : "ar";
    this.setLang(next, true);
  },

  // --------------------------------------------------------------------------
  // TRANSLATION HELPER
  // --------------------------------------------------------------------------
  t(key, params = {}) {
    const lang = this.currentLang || "ar";
    let text = (this[lang] && this[lang][key]) || (this.ar && this.ar[key]) || (this.fr && this.fr[key]) || key;
    
    if (typeof text === "string") {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }
    return text;
  },

  // --------------------------------------------------------------------------
  // ARABIC DICTIONARY
  // --------------------------------------------------------------------------
  ar: {
    // Navigation
    nav_shop: "المتجر",
    nav_collections: "المجموعات",
    nav_about: "من نحن",
    nav_contact: "اتصل بنا",
    nav_search: "بحث",
    nav_wishlist: "المفضلة",
    nav_cart: "السلة",
    nav_account: "حسابي",
    nav_sale: "العروض والتخفيضات",
    nav_shipping: "الشحن والتوصيل بالمغرب",
    nav_admin: "إدارة المخزون (Admin)",

    // Brand & Header
    brand_subtitle: "منتجات الصحة والجمال الطبيعي بالمغرب",
    announcement_text: "🚚 توصيل سريع خلال 24-48 ساعة لكافة مدن المغرب • الدفع عند الاستلام",
    announcement_link: "اكتشف المزيد",

    // Search Modal
    search_placeholder: "ابحث عن منتج، قهوة، مكمل غذائي، سيروم...",
    search_hint: "اكتب كلمة للبحث الفوري عن المنتجات...",
    search_min_chars: "اكتب حرفين على الأقل للبحث...",
    search_no_results: "لم يتم العثور على أي منتج يطابق",
    search_view_shop: "تصفح كامل المتجر",
    search_view_all: "عرض جميع النتائج ({count})",
    search_results_count: "{count} نتيجة بحث",

    // Product Card
    quick_add: "إضافة سريعة",
    view_product: "عرض التفاصيل",
    badge_new: "جديد",
    badge_sale: "تخفيض",
    badge_bundle: "باقة {count} قطع",
    save_amount: "وفر {amount} درهم",
    in_stock: "متوفر",
    out_of_stock: "نفد من المخزون",
    size_label: "الحجم / العبوة",

    // PDP (Product Detail Page)
    add_to_cart: "إضافة إلى السلة ⚡",
    buy_now: "اطلب الآن (الدفع عند الاستلام بالمغرب) 📦",
    out_of_stock_btn: "نفذت الكمية مؤقتاً",
    stock_available: "متوفر في المخزون ({count} قطعة متوفرة)",
    stock_empty: "نفذت الكمية مؤقتاً",
    quantity: "الكمية",
    rating_reviews: "({count} تقييم موثق)",
    tab_overview: "🌿 نظرة عامة والفوائد الصحية (Aperçu & Bienfaits)",
    tab_usage: "✨ طريقة الاستخدام والتحضير (Conseils d'utilisation & Posologie)",
    tab_specs: "📋 المواصفات الفنية والحجم (Fiche Technique & Format)",
    tab_shipping: "🚚 الشحن والتوصيل والضمان (Livraison & Garantie)",
    guarantee_shipping: "<strong>شحن سريع بالمغرب :</strong> توصيل مضمون خلال 24/48 ساعة مع خدمة التتبع.",
    guarantee_cod: "<strong>الدفع عند الاستلام (Cash on Delivery) :</strong> ادفع نقداً بكل أمان بعد استلام طلبيتك وفحصها.",
    guarantee_authentic: "<strong>ضمان الأصالة 100% :</strong> منتجات طبيعية معتمدة وأصلية مباشرة من المصدر.",
    related_title: "منتجات مقترحة قد تعجبك",
    breadcrumbs_home: "الرئيسية",
    breadcrumbs_shop: "المتجر",

    // Cart Drawer & Page
    cart_title: "سلة التسوق ({count})",
    cart_empty_title: "سلة التسوق فارغة",
    cart_empty_sub: "تصفح منتجاتنا الطبيعية للعناية والصحة وابدأ التسوق الآن.",
    cart_browse_shop: "تصفح المتجر",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن والتوصيل",
    shipping_free: "مجاني",
    total: "المجموع الإجمالي",
    checkout_btn: "إتمام الطلب والدفع عند الاستلام ←",
    free_shipping_achieved: "<strong>تهانينا!</strong> لقد حصلت على توصيل مجاني بالمغرب!",
    free_shipping_remaining: "أضف <strong>{amount}</strong> للاستفادة من التوصيل المجاني",
    remove_item: "حذف",
    bundle_3pack: "⚡ باقة 3 قطع",

    // Shop & Filters
    shop_title: "جميع المنتجات",
    filter_categories: "التصنيفات",
    filter_all_products: "جميع المنتجات ({count})",
    filter_price_max: "السعر الأقصى",
    filter_availability: "التوفر والعروض",
    filter_in_stock_only: "المتوفر بالمخزون فقط",
    filter_sale_only: "العروض والتخفيضات فقط",
    filter_clear_all: "إعادة ضبط الفلاتر",
    sort_by: "الترتيب حسب",
    sort_featured: "المميزة والافتراضية",
    sort_newest: "الأحدث وصولاً",
    sort_price_asc: "السعر : من الأقل للأعلى",
    sort_price_desc: "السعر : من الأعلى للأقل",
    products_count: "عرض {count} منتجاً",
    no_products_found: "لم يتم العثور على أي منتج",
    no_products_sub: "يرجى ضبط أو إعادة تعيين فلاتر البحث للعثور على ما تبحث عنه.",

    // Checkout
    checkout_page_title: "إتمام الطلب السريع",
    checkout_delivery_info: "بيانات التوصيل بالمغرب",
    checkout_fullname: "الاسم الكامل (Nom & Prénom)",
    checkout_phone: "رقم الهاتف للاتصال والتأكيد",
    checkout_city: "المدينة",
    checkout_address: "عنوان الاستلام (الحي، الشارع، رقم المنزل)",
    checkout_notes: "ملاحظات إضافية للتوصيل (اختياري)",
    checkout_payment_method: "طريقة الدفع",
    checkout_cod_desc: "الدفع نقداً عند استلام طلبيتك (Paiement Cash à la Livraison)",
    checkout_confirm_btn: "تأكيد الطلب الآن 🛍️",
    checkout_order_summary: "ملخص الطلب",

    // Wishlist
    wishlist_title: "قائمة المنتجات المفضلة",
    wishlist_empty: "قائمة المفضلة فارغة حالياً",
    wishlist_empty_sub: "انقر على رمز القلب على أي منتج لحفظه والرجوع إليه لاحقاً.",
    wishlist_browse: "تصفح المتجر",
    wishlist_count: "{count} منتج محفوظ",

    // Footer
    footer_desc: "متجرك المعتمد لمنتجات دي إكس إن (DXN) وكالو (Kallow) الطبيعية بالمغرب. نقدم تشكيلة راقية من المكملات العضوية، مستحضرات العناية الفائقة، والقهوة الصحية مع ضمان الجودة 100%.",
    footer_categories: "أقسام المتجر",
    footer_all: "جميع المنتجات الطبيعية",
    footer_coffee: "القهوة الصحية وفطر الريشي",
    footer_skincare: "العناية بالبشرة والجمال",
    footer_supplements: "المكملات الغذائية والفيتامينات",
    footer_sale: "العروض والتخفيضات الحصرية",
    footer_support: "خدمة العملاء",
    footer_delivery: "توصيل سريع 24/48h بالمغرب",
    footer_cod: "الدفع عند الاستلام (COD)",
    footer_contact: "تواصل معنا",
    footer_whatsapp: "دعم واتساب المباشر 💬",
    footer_admin_link: "لوحة الإدارة وإدارة المخزون",
    footer_about: "عن المتجر",
    footer_story: "قصتنا ورؤيتنا الصحية",
    footer_authenticity: "ضمان الأصالة والمصداقية",
    footer_copyright: "جميع الحقوق محفوظة.",
    footer_privacy: "سياسة الخصوصية",

    // Admin Panel
    admin_title: "مركز إدارة المخزون والمتجر",
    admin_nav_overview: "Vue d'ensemble • نظرة عامة",
    admin_nav_categories: "Catégories • التصنيفات",
    admin_nav_stock: "Matrice des Stocks • المخزون",
    admin_nav_products: "Produits • المنتجات",
    admin_nav_orders: "Commandes • الطلبات",
    admin_nav_settings: "Sauvegarde & Sync • الإعدادات",
    admin_btn_sync: "⚡ مزامنة مع الكود المصدري",
    admin_btn_storefront: "معاينة المتجر ↗",
    admin_lang_switch_label: "اللغة : "
  },

  // --------------------------------------------------------------------------
  // FRENCH DICTIONARY
  // --------------------------------------------------------------------------
  fr: {
    // Navigation
    nav_shop: "Boutique",
    nav_collections: "Collections",
    nav_about: "À Propos",
    nav_contact: "Contact",
    nav_search: "Recherche",
    nav_wishlist: "Favoris",
    nav_cart: "Panier",
    nav_account: "Mon Compte",
    nav_sale: "Promotions & Soldes",
    nav_shipping: "Livraison & Retours",
    nav_admin: "Tableau de Bord Admin",

    // Brand & Header
    brand_subtitle: "Santé, Bien-être & Beauté Naturelle au Maroc",
    announcement_text: "🚚 Livraison Express 24-48h partout au Maroc • Paiement Sécurisé à la Livraison",
    announcement_link: "Découvrir",

    // Search Modal
    search_placeholder: "Rechercher un produit, café, complément, sérum...",
    search_hint: "Tapez au moins 2 caractères pour lancer la recherche...",
    search_min_chars: "Tapez au moins 2 caractères...",
    search_no_results: "Aucun produit ne correspond à",
    search_view_shop: "Voir toute la boutique",
    search_view_all: "Voir tous les résultats ({count})",
    search_results_count: "{count} résultat(s)",

    // Product Card
    quick_add: "Ajout Rapide",
    view_product: "Voir le produit",
    badge_new: "NOUVEAU",
    badge_sale: "SOLDE",
    badge_bundle: "Pack {count} pièces",
    save_amount: "Économisez {amount} MAD",
    in_stock: "En stock",
    out_of_stock: "Rupture de stock",
    size_label: "Format / Volume",

    // PDP (Product Detail Page)
    add_to_cart: "Ajouter au Panier ⚡",
    buy_now: "Commander Express (Paiement à la Livraison) 📦",
    out_of_stock_btn: "Rupture de stock temporaire",
    stock_available: "En stock ({count} unités disponibles immédiatement)",
    stock_empty: "Rupture de stock temporaire",
    quantity: "Quantité",
    rating_reviews: "({count} avis clients certifiés)",
    tab_overview: "🌿 Aperçu & Bienfaits (نظرة عامة والفوائد الصحية)",
    tab_usage: "✨ Conseils d'utilisation & Posologie (طريقة الاستخدام)",
    tab_specs: "📋 Fiche Technique & Format (المواصفات والحجم)",
    tab_shipping: "🚚 Livraison & Garantie au Maroc (الشحن والضمان)",
    guarantee_shipping: "<strong>Livraison Express Maroc :</strong> Expédition garantie en 24/48h avec suivi par transporteur.",
    guarantee_cod: "<strong>Paiement à la Livraison :</strong> Réglez en espèces en toute sécurité à la réception de votre colis.",
    guarantee_authentic: "<strong>100% Authentique & Certifié :</strong> Produits naturels certifiés provenant directement des laboratoires officiels.",
    related_title: "Vous aimerez aussi",
    breadcrumbs_home: "Accueil",
    breadcrumbs_shop: "Boutique",

    // Cart Drawer & Page
    cart_title: "Votre Panier ({count})",
    cart_empty_title: "Votre panier est vide",
    cart_empty_sub: "Découvrez notre gamme santé & beauté naturelle et commencez vos achats.",
    cart_browse_shop: "Découvrir la boutique",
    subtotal: "Sous-total",
    shipping: "Livraison",
    shipping_free: "Gratuite",
    total: "Total",
    checkout_btn: "Passer la commande (Paiement à la livraison) →",
    free_shipping_achieved: "<strong>Félicitations !</strong> Vous bénéficiez de la livraison gratuite au Maroc !",
    free_shipping_remaining: "Ajoutez <strong>{amount}</strong> pour profiter de la livraison gratuite",
    remove_item: "Supprimer",
    bundle_3pack: "⚡ Pack 3 pièces",

    // Shop & Filters
    shop_title: "Tous les Produits",
    filter_categories: "Catégories",
    filter_all_products: "Tous les Produits ({count})",
    filter_price_max: "Prix Maximum",
    filter_availability: "Disponibilité & Offres",
    filter_in_stock_only: "En stock uniquement",
    filter_sale_only: "Promotions & Soldes uniquement",
    filter_clear_all: "Réinitialiser les filtres",
    sort_by: "Trier par",
    sort_featured: "Sélection en vedette",
    sort_newest: "Nouveautés",
    sort_price_asc: "Prix : Croissant",
    sort_price_desc: "Prix : Décroissant",
    products_count: "Affichage de {count} produit(s)",
    no_products_found: "Aucun produit trouvé",
    no_products_sub: "Veuillez ajuster ou réinitialiser vos filtres de recherche.",

    // Checkout
    checkout_page_title: "Commande Express",
    checkout_delivery_info: "Adresse de Livraison au Maroc",
    checkout_fullname: "Nom & Prénom",
    checkout_phone: "Numéro de Téléphone (ex: 07 08 87 30 60)",
    checkout_city: "Ville de destination",
    checkout_address: "Adresse complète (Quartier, Rue, N°)",
    checkout_notes: "Instructions spéciales pour le livreur (optionnel)",
    checkout_payment_method: "Mode de Paiement",
    checkout_cod_desc: "Paiement en espèces lors de la réception de votre colis (Cash on Delivery)",
    checkout_confirm_btn: "Confirmer ma Commande 🛍️",
    checkout_order_summary: "Résumé de la Commande",

    // Wishlist
    wishlist_title: "Mes Produits Favoris",
    wishlist_empty: "Votre liste de favoris est vide",
    wishlist_empty_sub: "Cliquez sur l'icône cœur sur les produits pour les sauvegarder ici.",
    wishlist_browse: "Découvrir la boutique",
    wishlist_count: "{count} article(s) sauvegardé(s)",

    // Footer
    footer_desc: "Votre boutique officielle pour les produits naturels DXN et Kallow au Maroc. Découvrez nos gammes de compléments alimentaires au Ganoderma, cafés bien-être et soins dermo-cosmétiques certifiés 100% originaux.",
    footer_categories: "Catégories",
    footer_all: "Tous les Produits Naturels",
    footer_coffee: "Cafés Santé & Ganoderma",
    footer_skincare: "Soins Visage & Beauté",
    footer_supplements: "Compléments Alimentaires",
    footer_sale: "Offres & Promotions",
    footer_support: "Service Client",
    footer_delivery: "Livraison Rapide 24/48h au Maroc",
    footer_cod: "Paiement à la Livraison (COD)",
    footer_contact: "Contactez-nous",
    footer_whatsapp: "Assistance WhatsApp Directe 💬",
    footer_admin_link: "Tableau de Bord Admin & Stocks",
    footer_about: "À Propos",
    footer_story: "Notre Histoire & Vision Santé",
    footer_authenticity: "Garantie d'Authenticité 100%",
    footer_copyright: "Tous droits réservés.",
    footer_privacy: "Politique de Confidentialité",

    // Admin Panel
    admin_title: "Centre de Contrôle & Gestion des Stocks",
    admin_nav_overview: "Vue d'ensemble",
    admin_nav_categories: "Catégories",
    admin_nav_stock: "Matrice des Stocks",
    admin_nav_products: "Produits & Modèles",
    admin_nav_orders: "Commandes (Live DB)",
    admin_nav_settings: "Sauvegarde & Sync",
    admin_btn_sync: "⚡ Sync vers Code Source",
    admin_btn_storefront: "Boutique en direct ↗",
    admin_lang_switch_label: "Langue : "
  }
};

// Auto-run immediate initialization on script parse
window.I18N.init();

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.I18N.init();
  });
}
