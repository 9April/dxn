/**
 * Collections Master Data - DXN & Kallow Storefront
 * Grouping products dynamically across wellness lines, beauty rituals, and promotions.
 * Bilingual Arabic & French support.
 * 
 * Corresponds exactly to the 5 Categories:
 * A. Soins de la Peau & Beauté (skincare-beauty)
 * B. Soins Personnels & Hygiène (personal-care-hygiene)
 * C. Compléments Alimentaires & Nutrition (health-supplements)
 * D. Boissons Santé & Ganoderma (beverages-drinks)
 * E. Alimentation & Épicerie Saine (food-pantry)
 */

window.STORE_COLLECTIONS = [
  {
    id: "skincare-beauty",
    slug: "skincare-beauty",
    code: "A",
    title: "A. Soins de la Peau & Beauté",
    titleFr: "A. Soins de la Peau & Beauté",
    titleAr: "A. العناية بالبشرة والجمال",
    subtitle: "Crèmes visage régénérantes, sérums tenseurs, émulsions solaires SPF 30 & SPF 50, nettoyants et masques.",
    subtitleFr: "Crèmes visage régénérantes, sérums tenseurs, émulsions solaires SPF 30 & SPF 50, nettoyants et masques.",
    subtitleAr: "كريمات الوجه والسيرومات، الحماية من الشمس، الغسول وأقنعة العناية الطبيعية الفاخرة من كالو.",
    banner: "assets/Categories/A.png",
    featured: true
  },
  {
    id: "personal-care-hygiene",
    slug: "personal-care-hygiene",
    code: "B",
    title: "B. Soins Personnels & Hygiène",
    titleFr: "B. Soins Personnels & Hygiène",
    titleAr: "B. العناية الشخصية والنظافة",
    subtitle: "Lotions corps, huiles de massage Gano apaisantes, shampoings fortifiants, dentifrice naturel Ganozhi et savons.",
    subtitleFr: "Lotions corps, huiles de massage Gano apaisantes, shampoings fortifiants, dentifrice naturel Ganozhi et savons.",
    subtitleAr: "لوشن الجسم، زيوت التدليك الطبيعية بالجانوديرما، العناية بالشعر والأطفال، ومعجون الأسنان الطبيعي.",
    banner: "assets/Categories/B.png",
    featured: true
  },
  {
    id: "health-supplements",
    slug: "health-supplements",
    code: "C",
    title: "C. Compléments Alimentaires & Nutrition",
    titleFr: "C. Compléments Alimentaires & Nutrition",
    titleAr: "C. المكملات الغذائية & التغذية",
    subtitle: "Extraits thérapeutiques de Reishi Ganoderma (RG & GL), Spiruline pure en comprimés, Cordyceps et Crinière de Lion.",
    subtitleFr: "Extraits thérapeutiques de Reishi Ganoderma (RG & GL), Spiruline pure en comprimés, Cordyceps et Crinière de Lion.",
    subtitleAr: "فطر الريشي الأحمر النقي (RG & GL)، السبيرولينا العضوية، فطر الكورديسيبس وعرف الأسد لتعزيز المناعة والنشاط.",
    banner: "assets/Categories/C.png",
    featured: true
  },
  {
    id: "beverages-drinks",
    slug: "beverages-drinks",
    code: "D",
    title: "D. Boissons Santé & Ganoderma",
    titleFr: "D. Boissons Santé & Ganoderma",
    titleAr: "D. المشروبات الصحية والجانوديرما",
    subtitle: "Thés botaniques Oozhi au Ganoderma, cacao gourmand Cocozhi, jus fermentés Morinzhi et boissons bien-être.",
    subtitleFr: "Thés botaniques Oozhi au Ganoderma, cacao gourmand Cocozhi, jus fermentés Morinzhi et boissons bien-être.",
    subtitleAr: "شاي الأعشاب الفاخر بالريشي، مشروبات الكاكاو الغنية، وعصائر الفواكه النباتية المنعشة.",
    banner: "assets/Categories/D.png",
    featured: true
  },
  {
    id: "food-pantry",
    slug: "food-pantry",
    code: "E",
    title: "E. Alimentation & Épicerie Saine",
    titleFr: "E. Alimentation & Épicerie Saine",
    titleAr: "E. التغذية والمنتجات الصحية",
    subtitle: "Nouilles diététiques Spirudle à la spiruline, Ganoodle au Ganoderma, sel de l'Himalaya et encas sains.",
    subtitleFr: "Nouilles diététiques Spirudle à la spiruline, Ganoodle au Ganoderma, sel de l'Himalaya et encas sains.",
    subtitleAr: "نودلز صحية بالسبيرولينا، توابل وبهارات عضوية، عسل طبيعي ووجبات خفيفة متوازنة لنمط حياة صحي.",
    banner: "assets/Categories/E.png",
    featured: true
  },
  {
    id: "kallow",
    slug: "kallow",
    code: "K",
    title: "K. Gamme Kallow Prestige",
    titleFr: "K. Gamme Kallow Prestige",
    titleAr: "K. تشكيلة كالو الفاخرة",
    subtitle: "Gamme prestige de soins cosmétiques naturels et dermo-soins Kallow : crèmes raffermissantes, sérums précieux et rituels bien-être.",
    subtitleFr: "Gamme prestige de soins cosmétiques naturels et dermo-soins Kallow : crèmes raffermissantes, sérums précieux et rituels bien-être.",
    subtitleAr: "مستحضرات التجميل والعناية الفاخرة بالبشرة والجسم من علامة كالو المغربية، تركيبات طبيعية متطورة.",
    banner: "assets/kallow.jpg",
    featured: true
  }
];
