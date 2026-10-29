/**
 * Store Central Configuration
 * Easy customization of brand identity, currency, shipping thresholds, and regional settings.
 */

window.STORE_CONFIG = {
  // Brand Identity (easily swappable)
  brandName: "DXN & KALLOW",
  brandSubtitle: "منتجات الصحة والجمال الطبيعي بالمغرب",
  brandLogoText: "DXN & KALLOW",
  
  // Promotional Announcement Bar
  announcementText: "🚚 توصيل سريع لجميع المدن المغربية خلال 24/48 ساعة • الدفع نقداً عند الاستلام",
  announcementLink: "shop.html",
  showAnnouncement: true,

  // Regional & Currency Settings (Morocco Focus)
  country: "Morocco",
  countryCode: "MA",
  currency: {
    code: "MAD",
    symbol: "MAD",
    position: "after", // "249 MAD"
    decimals: 0
  },

  // Shipping Rules for Morocco
  shipping: {
    freeThreshold: 500, // Free shipping above 500 MAD
    standardCost: 35,   // Standard express delivery: 35 MAD
    estimatedDelivery: "24 à 48 heures ouvrables au Maroc",
    cashOnDeliveryFee: 0 // Free COD
  },

  // Moroccan Cities for Checkout
  moroccanCities: [
    "الدار البيضاء (Casablanca)",
    "الرباط (Rabat)",
    "مراكش (Marrakech)",
    "طنجة (Tanger)",
    "أكادير (Agadir)",
    "فاس (Fès)",
    "مكناس (Meknès)",
    "وجدة (Oujda)",
    "القنيطرة (Kénitra)",
    "تطوان (Tétouan)",
    "المحمدية (Mohammedia)",
    "سلا (Salé)",
    "الجديدة (El Jadida)",
    "الناظور (Nador)",
    "بني ملال (Béni Mellal)",
    "تمارة (Témara)",
    "آسفي (Safi)",
    "خريبكة (Khouribga)",
    "سطات (Settat)",
    "العيون (Laâyoune)",
    "الداخلة (Dakhla)",
    "مدينة أخرى بالمغرب (Autre ville)"
  ],

  // Promotional Coupons
  coupons: {},

  // Contact & Social Links
  contact: {
    email: "contact@dxn-kallow.ma",
    phone: "+212 708-873060",
    whatsapp: "+212708873060",
    whatsappMessage: "Bonjour DXN & Kallow Maroc, j'aimerais avoir plus d'informations sur vos produits naturels.",
    address: "Tanger, Maroc",
    supportHours: "Lun - Sam : 09h00 - 19h00"
  },

  social: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com"
  },

  // Size Guide Chart Data (in cm)
  sizeGuide: {
    headers: ["Taille", "Poitrine (cm)", "Longueur (cm)", "Épaule (cm)", "Manche (cm)"],
    rows: [
      { size: "S", chest: "108", length: "72", shoulder: "52", sleeve: "22" },
      { size: "M", chest: "114", length: "74", shoulder: "54", sleeve: "23" },
      { size: "L", chest: "120", length: "76", shoulder: "56", sleeve: "24" },
      { size: "XL", chest: "126", length: "78", shoulder: "58", sleeve: "25" }
    ],
    note: "Nos coupes sont conçues oversize streetwear. Pour un tombé standard plus ajusté, nous vous conseillons de choisir une taille en dessous de votre taille habituelle."
  }
};
