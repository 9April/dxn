/**
 * Categories Master Data - DXN & KALLOW Hierarchical Taxonomy
 * Recommended Website Categories & Subcategories
 * Bilingual Arabic & French
 */

// ============================================================================
// 1. TOP-LEVEL MAIN CATEGORIES (5 Main Departments)
// ============================================================================
window.STORE_MAIN_CATEGORIES = [
  {
    id: "skincare-beauty",
    slug: "skincare-beauty",
    code: "A",
    name: "العناية بالبشرة والجمال (Skincare & Beauty)",
    nameAr: "العناية بالبشرة والجمال",
    nameFr: "Soins de la Peau & Beauté",
    icon: "✨",
    image: "assets/Categories/A.png",
    descriptionAr: "كريمات الوجه والسيرومات، الحماية من الشمس، الغسول وأقنعة العناية الطبيعية الفاخرة من كالو.",
    descriptionFr: "Crèmes visage régénérantes, sérums tenseurs, émulsions solaires SPF 30 & SPF 50, nettoyants et masques.",
    subPreviewAr: "كريمات وسيرومات • غسول وتونر • واقي شمس • أقنعة وعناية بالشفاه",
    subPreviewFr: "Crèmes & Sérums • Nettoyants • Solaires • Masques & Lèvres",
    subcategories: [
      "face-creams-serums",
      "cleansers-toners",
      "sunscreens-tanning",
      "face-masks-lip-care"
    ]
  },
  {
    id: "personal-care-hygiene",
    slug: "personal-care-hygiene",
    code: "B",
    name: "العناية الشخصية والنظافة (Personal Care & Hygiene)",
    nameAr: "العناية الشخصية والنظافة",
    nameFr: "Soins Personnels & Hygiène",
    icon: "🌿",
    image: "assets/Categories/B.png",
    descriptionAr: "لوشن الجسم، زيوت التدليك الطبيعية بالجانوديرما، العناية بالشعر والأطفال، ومعجون الأسنان الطبيعي.",
    descriptionFr: "Lotions corps, huiles de massage Gano apaisantes, shampoings fortifiants, dentifrice naturel Ganozhi et savons.",
    subPreviewAr: "لوشن الجسم • عناية بالشعر والطفل • معجون أسنان • صابون طبيعي",
    subPreviewFr: "Soins Corps & Lotions • Cheveux & Bébé • Soins Dentaires • Savons",
    subcategories: [
      "body-care-lotions",
      "hair-baby-care",
      "oral-care",
      "soaps"
    ]
  },
  {
    id: "health-supplements",
    slug: "health-supplements",
    code: "C",
    name: "المكملات الغذائية (Health Supplements)",
    nameAr: "المكملات الغذائية",
    nameFr: "Compléments Alimentaires & Nutrition",
    icon: "🍄",
    image: "assets/Categories/C.png",
    descriptionAr: "فطر الريشي الأحمر النقي (RG & GL)، السبيرولينا العضوية، فطر الكورديسيبس وعرف الأسد لتعزيز المناعة والنشاط.",
    descriptionFr: "Extraits thérapeutiques de Reishi Ganoderma (RG & GL), Spiruline pure en comprimés, Cordyceps et Crinière de Lion.",
    subPreviewAr: "مستخلصات فطر الريشي • كبسولات السبيرولينا وعرف الأسد",
    subPreviewFr: "Extraits de Reishi Ganoderma • Comprimés & Spiruline Pure",
    subcategories: [
      "mushroom-extracts",
      "tablets-capsules"
    ]
  },
  {
    id: "beverages-drinks",
    slug: "beverages-drinks",
    code: "D",
    name: "المشروبات الصحية (Beverages & Drinks)",
    nameAr: "المشروبات الصحية",
    nameFr: "Boissons Santé & Ganoderma",
    icon: "☕",
    image: "assets/Categories/D.png",
    descriptionAr: "القهوة السوداء بالغانوديرما، شاي الأعشاب الفاخر، مشروبات الكاكاو الغنية، وعصائر الفواكه النباتية المنعشة.",
    descriptionFr: "Café Lingzhi au Ganoderma, thés botaniques Oozhi & Zhitea, cacao gourmand Cocozhi et jus fermentés Morinzhi.",
    subPreviewAr: "قهوة لينغزي سوداء و3في1 • شاي وكاكاو • عصائر نباتية ومورينزي",
    subPreviewFr: "Cafés Lingzhi • Thés Botaniques & Cocozhi • Jus Morinzhi",
    subcategories: [
      "coffee",
      "tea-cocoa",
      "juices-botanical-drinks"
    ]
  },
  {
    id: "food-pantry",
    slug: "food-pantry",
    code: "E",
    name: "الأغذية والمنتجات اليومية (Food & Pantry)",
    nameAr: "الأغذية والمنتجات اليومية",
    nameFr: "Alimentation & Épicerie Saine",
    icon: "🍯",
    image: "assets/Categories/E.png",
    descriptionAr: "نودلز صحية بالسبيرولينا، توابل وبهارات عضوية، عسل طبيعي ووجبات خفيفة متوازنة لنمط حياة صحي.",
    descriptionFr: "Nouilles diététiques Spirudle à la spiruline, Ganoodle au Ganoderma, sel de l'Himalaya et encas sains.",
    subPreviewAr: "ملح الهملايا والعسل • وجبات خفيفة ونودلز صحية",
    subPreviewFr: "Condiments & Sel Himalayen • Encas Sains & Nouilles Spirudle",
    subcategories: [
      "pantry-condiments",
      "treats-snacks"
    ]
  },
  {
    id: "kallow",
    slug: "kallow",
    code: "K",
    name: "كالو (Kallow)",
    nameAr: "كالو (Kallow)",
    nameFr: "Kallow",
    icon: "✨",
    image: "assets/kallow.jpg",
    descriptionAr: "مستحضرات التجميل والعناية الفاخرة بالبشرة والجسم من علامة كالو المغربية، تركيبات طبيعية متطورة.",
    descriptionFr: "Gamme prestige de soins cosmétiques naturels et dermo-soins Kallow : crèmes raffermissantes, sérums précieux et rituels bien-être.",
    subPreviewAr: "كريمات وسيرومات • واقي شمس • روتين الجسم والشعر",
    subPreviewFr: "Crèmes & Sérums • Solaires SPF • Soins Corps & Bain",
    subcategories: []
  }
];

// ============================================================================
// 2. SUBCATEGORIES (15 Leaf Categories)
// ============================================================================
window.DEFAULT_STORE_CATEGORIES = [
  // --------------------------------------------------------------------------
  // A. Skincare & Beauty (العناية بالبشرة والجمال)
  // --------------------------------------------------------------------------
  {
    id: "face-creams-serums",
    slug: "face-creams-serums",
    parentCategory: "skincare-beauty",
    categoryGroup: "skincare-beauty",
    name: "العناية بالوجه والسيرومات (Face Creams & Serums)",
    nameAr: "العناية بالوجه والسيرومات",
    nameFr: "Crèmes Visage & Sérums",
    titleAr: "كريمات وسيرومات الوجه",
    titleFr: "Crèmes Visage & Sérums Tenseurs",
    description: "Lifting creams, Argan & Grapeseed cream, Tightening serums, Eye creams.",
    descriptionAr: "كريمات الشد الفوري، كريم الأرغان وبذور العنب، سيرومات الرفع، وكريمات محيط العينين.",
    descriptionFr: "Crèmes raffermissantes effet liftant, crème argan & pépins de raisin, sérums tenseurs immédiats et contour des yeux.",
    image: "assets/ecom/16.png",
    active: true,
    itemCount: 0
  },
  {
    id: "cleansers-toners",
    slug: "cleansers-toners",
    parentCategory: "skincare-beauty",
    categoryGroup: "skincare-beauty",
    name: "الغسول والتونر (Cleansers & Toners)",
    nameAr: "الغسول والتونر",
    nameFr: "Nettoyants & Toniques",
    titleAr: "الغسول والتونر المنقي",
    titleFr: "Nettoyants Visage & Eaux Toniques",
    description: "Foaming cleansers, Micellar tonic, Cleansing gels.",
    descriptionAr: "رغوة التنظيف المنعشة بالألوفيرا والبابونج، ماء الميسيلار المنقي، وجل التنظيف العميق.",
    descriptionFr: "Mousses nettoyantes instantanées à la camomille, eau tonique micellaire purifiante et gels nettoyants équilibrants.",
    image: "assets/ecom/21.png",
    active: true,
    itemCount: 0
  },
  {
    id: "sunscreens-tanning",
    slug: "sunscreens-tanning",
    parentCategory: "skincare-beauty",
    categoryGroup: "skincare-beauty",
    name: "الحماية من الشمس والتسمير (Sunscreens & Tanning)",
    nameAr: "الحماية من الشمس والتسمير",
    nameFr: "Protection Solaire & Bronzage",
    titleAr: "واقيات الشمس والتسمير",
    titleFr: "Solaires Haute Protection & Bronzage",
    description: "Face sunscreens SPF 30 & SPF 50, Natural tanning oil, Cooling after-sun.",
    descriptionAr: "واقيات الشمس للوجه SPF 30 و SPF 50، زيت التسمير الطبيعي الذهبي، ولوشن ما بعد الشمس المبرد والمهدئ.",
    descriptionFr: "Émulsions solaires protectrices SPF 30 & SPF 50, huile de bronzage naturelle dorée et lait après-soleil rafraîchissant.",
    image: "assets/ecom/18.png",
    active: true,
    itemCount: 0
  },
  {
    id: "face-masks-lip-care",
    slug: "face-masks-lip-care",
    parentCategory: "skincare-beauty",
    categoryGroup: "skincare-beauty",
    name: "أقنعة الوجه والعناية بالشفاه (Face Masks & Lip Care)",
    nameAr: "أقنعة الوجه والعناية بالشفاه",
    nameFr: "Masques Visage & Soins Lèvres",
    titleAr: "أقنعة الوجه والشفاه",
    titleFr: "Masques Visage & Baumes Lèvres",
    description: "Spirulina & Avocado face masks, Moisturizing lip balms.",
    descriptionAr: "أقنعة الوجه المغذية بالسبيرولينا والأفوكادو، وبلسم الشفاه فائق الترطيب والنعومة.",
    descriptionFr: "Masques visage ultra-hydratants spiruline & avocat et baumes à lèvres nourrissants protecteurs.",
    image: "assets/ecom/15.png",
    active: true,
    itemCount: 0
  },

  // --------------------------------------------------------------------------
  // B. Personal Care & Hygiene (العناية الشخصية والنظافة)
  // --------------------------------------------------------------------------
  {
    id: "body-care-lotions",
    slug: "body-care-lotions",
    parentCategory: "personal-care-hygiene",
    categoryGroup: "personal-care-hygiene",
    name: "العناية بالجسم واللوشن (Body Care & Lotions)",
    nameAr: "العناية بالجسم واللوشن",
    nameFr: "Soins Corps & Lotions",
    titleAr: "لوشن وعناية الجسم",
    titleFr: "Lotions Corps & Soins Hydratants",
    description: "Hand & body lotions, Hand cream, Luxury shower gels, Body foam.",
    descriptionAr: "لوشن الجسم واليدين، كريم ترطيب اليدين الفائق، جل الاستحمام العطري الفاخر، ورغوة الجسم المتعددة الاستخدامات.",
    descriptionFr: "Lotions mains & corps ALOE.V, crème mains ultra-nourrissante, gels douche aromatiques de luxe et brume corporelle.",
    image: "assets/ecom/8.png",
    active: true,
    itemCount: 0
  },
  {
    id: "hair-baby-care",
    slug: "hair-baby-care",
    parentCategory: "personal-care-hygiene",
    categoryGroup: "personal-care-hygiene",
    name: "العناية بالشعر والزيوت (Hair & Baby Care)",
    nameAr: "العناية بالشعر والزيوت",
    nameFr: "Soins Cheveux, Huiles & Bébé",
    titleAr: "الشعر والزيوت الطبيعية",
    titleFr: "Soins Capillaires & Huiles de Massage",
    description: "Shampoos, Baby oil, Massage oil, Night oil.",
    descriptionAr: "شامبو الشعر الطبيعي، زيت الأطفال، زيت التدليك جانو بالريشي والنخيل، وزيت الليل المغذي.",
    descriptionFr: "Shampoings doux fortifiants, huile de massage Gano au Reishi apaisante, huile de nuit et soins nourrissants bébé.",
    image: "assets/ecom/10.png",
    active: true,
    itemCount: 0
  },
  {
    id: "oral-care",
    slug: "oral-care",
    parentCategory: "personal-care-hygiene",
    categoryGroup: "personal-care-hygiene",
    name: "العناية بالفم والأسنان (Oral Care)",
    nameAr: "العناية بالفم والأسنان",
    nameFr: "Hygiène Bucco-Dentaire",
    titleAr: "صحة الفم والأسنان",
    titleFr: "Dentifrice & Hygiène Dentaire",
    description: "Ganozhi toothpaste, Mint products.",
    descriptionAr: "معجون الأسنان الطبيعي جانوزي بالجانوديرما بدون فلورايد، ومستحضرات النعناع المنعشة للنفس.",
    descriptionFr: "Dentifrice naturel Ganozhi au Ganoderma sans fluor, doux pour l'émail, et pastilles rafraîchissantes.",
    image: "assets/ecom2/36.png",
    active: true,
    itemCount: 2
  },
  {
    id: "soaps",
    slug: "soaps",
    parentCategory: "personal-care-hygiene",
    categoryGroup: "personal-care-hygiene",
    name: "الصابون الطبيعي (Soaps)",
    nameAr: "الصابون الطبيعي",
    nameFr: "Savons Naturels & Nettoyants",
    titleAr: "الصابون الطبيعي الفاخر",
    titleFr: "Savons Doux au Ganoderma & Plantes",
    description: "Ganozhi soaps, Trans soaps, Oocha soaps.",
    descriptionAr: "صابون جانوزي الغني بالريشي، صابون ترانس الشفاف، وصابون أوتشا بالأعشاب الطبيعية.",
    descriptionFr: "Pain de savon doux Ganozhi à l'huile de palme et Ganoderma, savons translucides et savons botaniques Oocha.",
    image: "assets/ecom2/14.png",
    active: true,
    itemCount: 3
  },

  // --------------------------------------------------------------------------
  // C. Health Supplements (المكملات الغذائية)
  // --------------------------------------------------------------------------
  {
    id: "mushroom-extracts",
    slug: "mushroom-extracts",
    parentCategory: "health-supplements",
    categoryGroup: "health-supplements",
    name: "خلاصات الفطر والريشي (Mushroom Extracts)",
    nameAr: "خلاصات الفطر والريشي",
    nameFr: "Extraits de Champignons & Reishi",
    titleAr: "فطر الريشي ومستخلصات الفطور",
    titleFr: "Extraits Thérapeutiques de Reishi",
    description: "Reishi Gano RG, Ganocelium GL, Mycovita, Poria S.",
    descriptionAr: "ريشي جانو RG، جانوسيليوم GL، ميكوفيتا، وفطر بوريا إس عالي النقاوة لدعم المناعة والنشاط الخلوي.",
    descriptionFr: "Extraits purs de Reishi Ganoderma (poudre Reishilium, RG & GL), Mycovita et Poria S pour l'immunité et l'énergie vitale.",
    image: "assets/ecom/7.png",
    active: true,
    itemCount: 0
  },
  {
    id: "tablets-capsules",
    slug: "tablets-capsules",
    parentCategory: "health-supplements",
    categoryGroup: "health-supplements",
    name: "المكملات الغذائية والكبسولات (Tablets & Capsules)",
    nameAr: "المكملات الغذائية والكبسولات",
    nameFr: "Comprimés & Gélules Nutritionnelles",
    titleAr: "الكبسولات والمكملات الغذائية",
    titleFr: "Spiruline, Gélules & Super-Aliments",
    description: "Spirulina variants, Cordyceps, Lion's Mane, SpiruNanas, Black Cumin Plus.",
    descriptionAr: "السبيرولينا النقية بالحبوب، فطر الكورديسيبس، عرف الأسد، كبسولات الحبة السوداء بلس، وسبيروناناس.",
    descriptionFr: "Spiruline pure en comprimés, Cordyceps tonifiant, Crinière de Lion cognitive et Black Cumin Plus à la nigelle pure.",
    image: "assets/ecom/3.png",
    active: true,
    itemCount: 0
  },

  // --------------------------------------------------------------------------
  // D. Beverages & Drinks (المشروبات)
  // --------------------------------------------------------------------------
  {
    id: "coffee",
    slug: "coffee",
    parentCategory: "beverages-drinks",
    categoryGroup: "beverages-drinks",
    name: "القهوة الصحية (Coffee)",
    nameAr: "القهوة الصحية",
    nameFr: "Café Santé & Ganoderma",
    titleAr: "القهوة الصحية بالريشي",
    titleFr: "Cafés Gourmets au Ganoderma",
    description: "Lingzhi Coffee 3-in-1, Black Coffee 2-in-1, Cordyceps Coffee, Lion's Mane Coffee.",
    descriptionAr: "قهوة لينغزي السوداء 2 في 1 بدون سكر، قهوة 3 في 1، قهوة الكورديسيبس، وقهوة عرف الأسد بالغانوديرما.",
    descriptionFr: "Café Noir Lingzhi 2-en-1 sans sucre, Café 3-en-1 onctueux, Café Cordyceps et Café Crinière de Lion au Ganoderma.",
    image: "assets/images/products/dxn-lingzhi-black-coffee.jpg",
    active: true,
    itemCount: 0
  },
  {
    id: "tea-cocoa",
    slug: "tea-cocoa",
    parentCategory: "beverages-drinks",
    categoryGroup: "beverages-drinks",
    name: "الشاي والكاكاو (Tea & Cocoa)",
    nameAr: "الشاي والكاكاو",
    nameFr: "Thés Botaniques & Cacao",
    titleAr: "الشاي الفاخر ومشروب الكاكاو",
    titleFr: "Thés Santé Oozhi & Cacao Cocozhi",
    description: "Zhitea Premix, Cocozhi, Oocha, Florathemum drink.",
    descriptionAr: "شاي أوزي أوولونغ بالريشي، منقوع فلوراثيموم بأزهار الأقحوان، كوكوزي مشروب الشوكولاتة الفاخر، وشاي زي تيا.",
    descriptionFr: "Thé Oozhi Oolong au Ganoderma, infusion Florathemum aux fleurs de chrysanthème, boisson chocolatée Cocozhi.",
    image: "assets/ecom/4.png",
    active: true,
    itemCount: 0
  },
  {
    id: "juices-botanical-drinks",
    slug: "juices-botanical-drinks",
    parentCategory: "beverages-drinks",
    categoryGroup: "beverages-drinks",
    name: "المشروبات النباتية والعصائر (Juices & Botanical Drinks)",
    nameAr: "المشروبات النباتية والعصائر",
    nameFr: "Jus & Boissons Botaniques",
    titleAr: "العصائر والمشروبات النباتية",
    titleFr: "Jus Végétaux & Boissons Enzymatiques",
    description: "Morinzhi (285ml & 700ml), Cordypine, Aloe Vita, Roselle, Lemonzhi, Apple Drink.",
    descriptionAr: "عصير مورينزي نوني المخمر، عصير التفاح الطبيعي المركز، كورديباين بالأناناس، ألوفيتا، وليمونزي.",
    descriptionFr: "Jus de Noni fermenté Morinzhi, concentré pur jus de pomme DXN, Cordypine ananas-cordyceps, Aloe Vita et Roselle.",
    image: "assets/ecom/2.png",
    active: true,
    itemCount: 0
  },

  // --------------------------------------------------------------------------
  // E. Food & Pantry (الأغذية والمنتجات اليومية)
  // --------------------------------------------------------------------------
  {
    id: "pantry-condiments",
    slug: "pantry-condiments",
    parentCategory: "food-pantry",
    categoryGroup: "food-pantry",
    name: "الأغذية والبهارات الصحية (Pantry & Condiments)",
    nameAr: "الأغذية والبهارات الصحية",
    nameFr: "Épicerie Fine & Condiments",
    titleAr: "الأغذية والتوابل الصحية",
    titleFr: "Épicerie Naturelle & Condiments Sains",
    description: "Himalayan Salt, Vinaigrette Honey, Fermented Jam, Virgin Coconut Oil.",
    descriptionAr: "ملح الهيمالايا الوردي، خل العسل الطبيعي، مربى الفواكه المخمرة، وزيت جوز الهند البكر العضوي.",
    descriptionFr: "Sel rose pur de l'Himalaya, vinaigre bio au miel, confitures fermentées et huile de coco vierge pressée à froid.",
    image: "assets/ecom2/37.png",
    active: true,
    itemCount: 0
  },
  {
    id: "treats-snacks",
    slug: "treats-snacks",
    parentCategory: "food-pantry",
    categoryGroup: "food-pantry",
    name: "الوجبات الخفيفة الصحية (Treats & Snacks)",
    nameAr: "الوجبات الخفيفة الصحية",
    nameFr: "Snacks & Encas Sains",
    titleAr: "الوجبات الخفيفة والنودلز الصحية",
    titleFr: "Nouilles Diététiques & Encas Sains",
    description: "Spirudle noodles, Ganoodle Tom Yam, Lingzhi Pineapple Cake, Zhi Mint.",
    descriptionAr: "نودلز سبيرودل بالسبيرولينا، نودلز غانودل توم يام بالريشي، كعك الأناناس باللينغزي، وحلوى النعناع زي مينت.",
    descriptionFr: "Nouilles diététiques Spirudle à la spiruline, Ganoodle Tom Yam au Ganoderma et gâteaux savoureux à l'ananas.",
    image: "assets/ecom/6.png",
    active: true,
    itemCount: 0
  }
];

// ============================================================================
// 3. TAXONOMY HELPER MANAGER
// ============================================================================
window.CategoryManager = {
  getMainCategories() {
    return window.STORE_MAIN_CATEGORIES || [];
  },

  getMainCategoryBySlug(slug) {
    if (!slug) return null;
    return (window.STORE_MAIN_CATEGORIES || []).find(m => m.slug === slug || m.id === slug) || null;
  },

  getSubcategoriesForMain(mainSlug) {
    const main = this.getMainCategoryBySlug(mainSlug);
    if (!main) return [];
    const subs = new Set(main.subcategories);
    return (window.STORE_CATEGORIES || window.DEFAULT_STORE_CATEGORIES || []).filter(c =>
      subs.has(c.slug || c.id) || c.parentCategory === mainSlug || c.categoryGroup === mainSlug
    );
  },

  getParentForSubcategory(subSlug) {
    if (!subSlug) return null;
    const cat = (window.STORE_CATEGORIES || window.DEFAULT_STORE_CATEGORIES || []).find(c => c.slug === subSlug || c.id === subSlug);
    const parentSlug = cat ? (cat.parentCategory || cat.categoryGroup) : null;
    if (parentSlug) {
      const parent = this.getMainCategoryBySlug(parentSlug);
      if (parent) return parent;
    }
    return (window.STORE_MAIN_CATEGORIES || []).find(m => Array.isArray(m.subcategories) && m.subcategories.includes(subSlug)) || null;
  },

  matchesCategoryFilter(productCategory, selectedFilter, product) {
    if (!selectedFilter || selectedFilter === 'all') return true;
    if (productCategory === selectedFilter) return true;
    if (selectedFilter === 'kallow') {
      if (product && (product.brand === 'Kallow' || (product.id && product.id.startsWith('kallow')) || (Array.isArray(product.collections) && product.collections.includes('kallow')))) {
        return true;
      }
      if (typeof productCategory === 'string' && (productCategory === 'kallow' || productCategory.startsWith('kallow'))) {
        return true;
      }
      return false;
    }
    if (product) {
      if (product.categoryGroup === selectedFilter || product.mainCategory === selectedFilter) return true;
      if (Array.isArray(product.collections) && product.collections.includes(selectedFilter)) return true;
    }
    const main = this.getMainCategoryBySlug(selectedFilter);
    if (main && Array.isArray(main.subcategories)) {
      return main.subcategories.includes(productCategory);
    }
    return false;
  }
};

// ============================================================================
// 4. RUNTIME CACHE & HYDRATION
// ============================================================================
(function() {
  const CURRENT_CAT_VERSION = "2026_10_26_taxonomy_v4_kallow";
  try {
    if (typeof localStorage !== 'undefined') {
      const storedVer = localStorage.getItem("atelier_categories_version");
      if (storedVer !== CURRENT_CAT_VERSION) {
        localStorage.removeItem("atelier_categories_v2");
        localStorage.setItem("atelier_categories_version", CURRENT_CAT_VERSION);
      }
      const saved = localStorage.getItem("atelier_categories_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 15) {
          window.STORE_CATEGORIES = parsed;
          return;
        }
      }
    }
  } catch (e) {
    console.warn("Categories initialization error:", e);
  }
  window.STORE_CATEGORIES = window.DEFAULT_STORE_CATEGORIES;
})();

// Asynchronously hydrate categories from MySQL database API if online
if (typeof fetch === 'function') {
  fetch('/api/categories')
    .then(res => res.json())
    .then(data => {
      if (data && data.success && Array.isArray(data.categories) && data.categories.length >= 15) {
        window.STORE_CATEGORIES = data.categories;
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem("atelier_categories_v2", JSON.stringify(data.categories));
          }
        } catch (e) {}
      }
    })
    .catch(() => {});
}
