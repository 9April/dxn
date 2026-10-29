const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5500;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const https = require('https');

// ----------------------------------------------------------------------------
// WHATSAPP BUSINESS CLOUD API HELPERS
// ----------------------------------------------------------------------------
function getWhatsAppConfig() {
  const configFile = path.join(ROOT_DIR, 'assets', 'js', 'data', 'whatsapp_config.json');
  try {
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
  } catch (e) {}
  return {
    enabled: false,
    phone_number_id: '',
    access_token: '',
    test_recipient: '',
    template_name: 'hello_world',
    language_code: 'en_US'
  };
}

function saveWhatsAppConfig(cfg) {
  const configFile = path.join(ROOT_DIR, 'assets', 'js', 'data', 'whatsapp_config.json');
  fs.writeFileSync(configFile, JSON.stringify(cfg, null, 2), 'utf8');
}

function formatWhatsAppPhoneNumber(phone) {
  const clean = String(phone || '').replace(/[^0-9]/g, '');
  if (!clean) return '';
  if (clean.startsWith('0') && clean.length === 10) {
    return '212' + clean.slice(1);
  }
  if ((clean.startsWith('6') || clean.startsWith('7')) && clean.length === 9) {
    return '212' + clean;
  }
  return clean;
}

function sendWhatsAppMessageNode(toPhone, templateName = 'hello_world', languageCode = 'en_US', bodyParams = []) {
  return new Promise((resolve) => {
    const config = getWhatsAppConfig();
    const phoneNumberId = (config.phone_number_id || '').trim();
    const accessToken = (config.access_token || '').trim();

    if (!phoneNumberId || !accessToken) {
      return resolve({ success: false, error: 'Identifiants WhatsApp manquants (Phone Number ID ou Access Token non configurés).' });
    }

    const recipient = formatWhatsAppPhoneNumber(toPhone);
    if (!recipient) {
      return resolve({ success: false, error: 'Numéro destinataire invalide.' });
    }

    const templatePayload = {
      name: templateName,
      language: { code: languageCode }
    };

    if (bodyParams && bodyParams.length > 0) {
      templatePayload.components = [
        {
          type: 'body',
          parameters: bodyParams.map(p => ({ type: 'text', text: String(p) }))
        }
      ];
    }

    const postData = JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: templatePayload
    });

    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v20.0/${phoneNumberId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
            resolve({ success: true, statusCode: apiRes.statusCode, data: parsed, recipient });
          } else {
            resolve({ success: false, statusCode: apiRes.statusCode, error: parsed.error?.message || data, details: parsed });
          }
        } catch (e) {
          resolve({ success: false, statusCode: apiRes.statusCode, error: data });
        }
      });
    });

    apiReq.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    apiReq.setTimeout(8000, () => {
      apiReq.destroy();
      resolve({ success: false, error: 'Délai d\'attente dépassé (timeout 8s).' });
    });

    apiReq.write(postData);
    apiReq.end();
  });
}

// ----------------------------------------------------------------------------
// MYSQL DATABASE CONFIGURATION & PERSISTENCE ENGINE (u895506237_dxn)
// ----------------------------------------------------------------------------
let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.warn('[DB] mysql2 not available:', e.message);
}

const DB_CONFIG = {
  host: process.env.DB_HOST || 'srv898.hstgr.io',
  user: process.env.DB_USER || 'u895506237_dxn',
  password: process.env.DB_PASSWORD || 'j^TA3Y!X:I7',
  database: process.env.DB_NAME || 'u895506237_dxn',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 8000
};

let dbPool = null;
function getDbPool() {
  if (!mysql) return null;
  if (!dbPool) {
    try {
      dbPool = mysql.createPool(DB_CONFIG);
    } catch (e) {
      console.error('[DB] Failed to create MySQL pool:', e.message);
    }
  }
  return dbPool;
}

async function getProductsFromDb(includeDisabled = false) {
  const pool = getDbPool();
  if (!pool) return null;
  try {
    const query = includeDisabled 
      ? 'SELECT raw_json, status FROM products ORDER BY brand, name'
      : 'SELECT raw_json, status FROM products WHERE status != "disabled" ORDER BY brand, name';
    const [rows] = await pool.query(query);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(r => {
        try {
          let p = typeof r.raw_json === 'string' ? JSON.parse(r.raw_json) : r.raw_json;
          if (p) {
            p.status = r.status || p.status || 'active';
            p.isActive = p.status !== 'disabled';
            p.disabled = p.status === 'disabled';
            if (p.colors) {
              p.colors.forEach(c => {
                if (c.image && c.image.endsWith('.jpeg')) {
                  c.image = c.image.replace(/\.jpeg$/i, '.png');
                }
              });
            }
            if (p.images) {
              for (const k in p.images) {
                if (Array.isArray(p.images[k])) {
                  p.images[k] = p.images[k].map(img => typeof img === 'string' ? img.replace(/\.jpeg$/i, '.png') : img);
                }
              }
            }
          }
          return p;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    }
  } catch (err) {
    console.error('[DB] Error querying products:', err.message);
  }
  return null;
}

async function saveProductToDb(p) {
  const pool = getDbPool();
  if (!pool || !p || !p.id) return false;
  try {
    const isProdActive = p.status !== 'disabled' && p.isActive !== false && p.disabled !== true;
    p.status = isProdActive ? 'active' : 'disabled';
    p.isActive = isProdActive;
    p.disabled = !isProdActive;
    const rawJson = JSON.stringify(p);
    await pool.query(`
      INSERT INTO products (
        id, sku, name, nameAr, nameFr, titleAr, brand, price, compareAtPrice, costPrice,
        category, categoryName, categoryNameFr, subcategory, categoryGroup, stock,
        isNew, isFeatured, isSale, status, shortDescription, shortDescriptionAr, shortDescriptionFr,
        description, descriptionAr, descriptionFr, attributes, colors, images, variants,
        tags, collections, specs, seo, raw_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        sku = VALUES(sku),
        name = VALUES(name),
        nameAr = VALUES(nameAr),
        nameFr = VALUES(nameFr),
        titleAr = VALUES(titleAr),
        brand = VALUES(brand),
        price = VALUES(price),
        compareAtPrice = VALUES(compareAtPrice),
        costPrice = VALUES(costPrice),
        category = VALUES(category),
        categoryName = VALUES(categoryName),
        categoryNameFr = VALUES(categoryNameFr),
        subcategory = VALUES(subcategory),
        categoryGroup = VALUES(categoryGroup),
        stock = VALUES(stock),
        isNew = VALUES(isNew),
        isFeatured = VALUES(isFeatured),
        isSale = VALUES(isSale),
        status = VALUES(status),
        shortDescription = VALUES(shortDescription),
        shortDescriptionAr = VALUES(shortDescriptionAr),
        shortDescriptionFr = VALUES(shortDescriptionFr),
        description = VALUES(description),
        descriptionAr = VALUES(descriptionAr),
        descriptionFr = VALUES(descriptionFr),
        attributes = VALUES(attributes),
        colors = VALUES(colors),
        images = VALUES(images),
        variants = VALUES(variants),
        tags = VALUES(tags),
        collections = VALUES(collections),
        specs = VALUES(specs),
        seo = VALUES(seo),
        raw_json = VALUES(raw_json)
    `, [
      p.id,
      p.sku || '',
      p.name,
      p.nameAr || p.name,
      p.nameFr || p.name,
      p.titleAr || p.nameAr || p.name,
      p.brand || 'DXN',
      p.price || 0,
      p.compareAtPrice || null,
      p.costPrice || null,
      p.category || '',
      p.categoryName || '',
      p.categoryNameFr || '',
      p.subcategory || '',
      p.categoryGroup || '',
      p.stock || 0,
      p.isNew ? 1 : 0,
      p.isFeatured ? 1 : 0,
      p.isSale ? 1 : 0,
      p.status,
      p.shortDescription || '',
      p.shortDescriptionAr || '',
      p.shortDescriptionFr || '',
      p.description || '',
      p.descriptionAr || '',
      p.descriptionFr || '',
      JSON.stringify(p.attributes || {}),
      JSON.stringify(p.colors || []),
      JSON.stringify(p.images || {}),
      JSON.stringify(p.variants || []),
      JSON.stringify(p.tags || []),
      JSON.stringify(p.collections || []),
      JSON.stringify(p.specs || {}),
      JSON.stringify(p.seo || {}),
      rawJson
    ]);
    return true;
  } catch (err) {
    console.error('[DB] Error saving product to MySQL:', err.message);
    return false;
  }
}

async function deleteProductFromDb(productId) {
  const pool = getDbPool();
  if (!pool || !productId) return false;
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    return true;
  } catch (err) {
    console.error('[DB] Error deleting product from MySQL:', err.message);
    return false;
  }
}

async function getCategoriesFromDb() {
  const pool = getDbPool();
  if (!pool) return null;
  try {
    const [rows] = await pool.query('SELECT raw_json FROM categories ORDER BY id');
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(r => {
        try {
          return typeof r.raw_json === 'string' ? JSON.parse(r.raw_json) : r.raw_json;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    }
  } catch (err) {
    console.error('[DB] Error querying categories:', err.message);
  }
  return null;
}

async function saveCategoryToDb(cat) {
  const pool = getDbPool();
  if (!pool || !cat || !cat.id) return false;
  try {
    const rawJson = JSON.stringify(cat);
    await pool.query(`
      INSERT INTO categories (id, slug, name, nameAr, nameFr, categoryGroup, description, image, active, itemCount, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        slug = VALUES(slug),
        name = VALUES(name),
        nameAr = VALUES(nameAr),
        nameFr = VALUES(nameFr),
        categoryGroup = VALUES(categoryGroup),
        description = VALUES(description),
        image = VALUES(image),
        active = VALUES(active),
        itemCount = VALUES(itemCount),
        raw_json = VALUES(raw_json)
    `, [
      cat.id,
      cat.slug || cat.id,
      cat.name,
      cat.nameAr || cat.name,
      cat.nameFr || cat.name,
      cat.categoryGroup || 'general',
      cat.description || '',
      cat.image || '',
      cat.active ? 1 : 0,
      cat.itemCount || 0,
      rawJson
    ]);
    return true;
  } catch (err) {
    console.error('[DB] Error saving category to MySQL:', err.message);
    return false;
  }
}

function writeProductsFile(products) {
  const productsFilePath = path.join(ROOT_DIR, 'assets', 'js', 'data', 'products.js');
  const jsContent = `/**
 * Products Master Database - DXN & Kallow Health, Wellness & Beauty Catalog
 * Fully data-driven catalog with bilingual support (Arabic & French),
 * pricing, attributes, high-resolution photography, and taxonomy.
 */

window.DEFAULT_STORE_PRODUCTS = ${JSON.stringify(products, null, 2)};

// Runtime Fallback & Cache Sync
if (typeof window !== 'undefined') {
  const CURRENT_VERSION = "2026_10_25_catalog_v7_dxn_prices";
  const storedVersion = localStorage.getItem("atelier_catalog_version");
  
  if (storedVersion !== CURRENT_VERSION) {
    localStorage.removeItem("atelier_products_v2");
    localStorage.setItem("atelier_catalog_version", CURRENT_VERSION);
  }

  const cached = localStorage.getItem("atelier_products_v2");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        window.STORE_PRODUCTS = parsed.filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
      } else {
        window.STORE_PRODUCTS = (window.DEFAULT_STORE_PRODUCTS || []).filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
      }
    } catch(e) {
      window.STORE_PRODUCTS = (window.DEFAULT_STORE_PRODUCTS || []).filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
    }
  } else {
    window.STORE_PRODUCTS = (window.DEFAULT_STORE_PRODUCTS || []).filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
  }

  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      if (data && data.success && Array.isArray(data.products)) {
        window.STORE_PRODUCTS = data.products.filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem("atelier_products_v2", JSON.stringify(data.products));
          }
        } catch (e) {}
      }
    })
    .catch(() => {});
}
`;
  fs.writeFileSync(productsFilePath, jsContent, 'utf8');
}

function writeCategoriesFile(categories) {
  const categoriesFilePath = path.join(ROOT_DIR, 'assets', 'js', 'data', 'categories.js');
  const mainCategories = [
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

  const jsContent = `/**
 * Categories Master Data - DXN & KALLOW Hierarchical Taxonomy
 * Recommended Website Categories & Subcategories
 * Bilingual Arabic & French
 */

window.STORE_MAIN_CATEGORIES = ${JSON.stringify(mainCategories, null, 2)};

window.DEFAULT_STORE_CATEGORIES = ${JSON.stringify(categories, null, 2)};

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

(function() {
  const CURRENT_CAT_VERSION = "2026_10_23_taxonomy_v2";
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
`;
  fs.writeFileSync(categoriesFilePath, jsContent, 'utf8');
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // --------------------------------------------------------------------------
  // API ENDPOINT: POST /api/upload-image
  // Saves uploaded image directly to product's physical folder on disk
  // --------------------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/upload-image') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // 50MB max upload limit
      if (body.length > 50 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { productId, category, filename, dataUrl } = payload;

        if (!productId || !dataUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'productId and dataUrl are required' }));
          return;
        }

        // Clean and sanitize filename
        let cleanName = (filename || `image-${Date.now()}.png`).toLowerCase().replace(/[^a-z0-9._-]/g, '-');
        if (!path.extname(cleanName)) cleanName += '.png';

        const catDir = (category || 't-shirts').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const prodDir = productId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const targetDir = path.join(ROOT_DIR, 'assets', 'images', 'products', catDir, prodDir);

        // Ensure directory exists
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Extract base64 buffer
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const buffer = matches && matches[2] ? Buffer.from(matches[2], 'base64') : Buffer.from(dataUrl, 'base64');

        const finalFilePath = path.join(targetDir, cleanName);
        fs.writeFileSync(finalFilePath, buffer);

        const relativePath = `assets/images/products/${catDir}/${prodDir}/${cleanName}`;
        console.log(`[API Upload] Successfully saved image to: ${relativePath}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          path: relativePath,
          filename: cleanName,
          size: buffer.length
        }));
      } catch (err) {
        console.error('[API Upload Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: GET /api/images
  // Dynamically scans assets/images/ directory on disk and returns all images
  // --------------------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/images') {
    try {
      const dirsToScan = [
        path.join(ROOT_DIR, 'assets', 'Header'),
        path.join(ROOT_DIR, 'assets', 'ecom'),
        path.join(ROOT_DIR, 'assets', 'ecom2'),
        path.join(ROOT_DIR, 'assets', 'images')
      ];
      const results = [];

      function scanDir(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else if (/\.(png|jpe?g|webp|svg)$/i.test(entry.name) && !entry.name.startsWith('.')) {
            const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
            let cleanLabel = entry.name.replace(/\.[^/.]+$/, '').trim();

            let colTag = 'all';
            if (relPath.includes('Header')) {
              colTag = 'header';
              cleanLabel = `Bannière: ${entry.name.replace(/\.[^/.]+$/, '')}`;
            } else if (relPath.includes('ecom/')) {
              const num = parseInt(entry.name);
              if (num >= 13 && num <= 30) {
                colTag = 'kallow';
              } else {
                colTag = 'dxn';
              }
              cleanLabel = `Produit #${num} (${colTag.toUpperCase()})`;
            } else if (relPath.includes('ecom2/')) {
              colTag = 'dxn';
              const num = parseInt(entry.name);
              cleanLabel = `DXN Produit #${num}`;
            }

            results.push({
              label: cleanLabel,
              filename: entry.name,
              url: relPath,
              color: colTag
            });
          }
        }
      }

      for (const d of dirsToScan) {
        scanDir(d);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: results.length, images: results }));
    } catch (err) {
      console.error('[API List Images Error]:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: GET /api/health-db
  // Checks MySQL connection status and row counts
  // --------------------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/health-db') {
    (async () => {
      try {
        const pool = getDbPool();
        if (!pool) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ connected: false, message: 'MySQL pool not initialized' }));
          return;
        }
        const [pRows] = await pool.query('SELECT COUNT(*) as cnt FROM products');
        const [cRows] = await pool.query('SELECT COUNT(*) as cnt FROM categories');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          connected: true,
          database: DB_CONFIG.database,
          host: DB_CONFIG.host,
          productsCount: pRows[0].cnt,
          categoriesCount: cRows[0].cnt
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ connected: false, error: err.message }));
      }
    })();
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: GET /api/products
  // Returns products from MySQL database (fallback to disk)
  // By default, filters out disabled products for storefront.
  // Query param ?all=1 or ?includeDisabled=1 returns all products for admin.
  // --------------------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/products') {
    (async () => {
      try {
        const includeAll = parsedUrl.query && (parsedUrl.query.all === '1' || parsedUrl.query.includeDisabled === '1' || parsedUrl.query.admin === '1');
        let products = await getProductsFromDb(includeAll);
        if (!products || products.length === 0) {
          const productsFilePath = path.join(ROOT_DIR, 'assets', 'js', 'data', 'products.js');
          if (fs.existsSync(productsFilePath)) {
            const code = fs.readFileSync(productsFilePath, 'utf8');
            const m = code.match(/window\.DEFAULT_STORE_PRODUCTS\s*=\s*(\[[\s\S]*?\]);\s*\n/);
            if (m) {
              const allFromDisk = JSON.parse(m[1]);
              products = includeAll 
                ? allFromDisk 
                : allFromDisk.filter(p => p && p.status !== 'disabled' && p.isActive !== false && p.disabled !== true);
            }
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: (products || []).length, products: products || [] }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    })();
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: POST /api/delete-product
  // Permanently removes product from MySQL database and updates products.js
  // --------------------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/delete-product') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { id } = JSON.parse(body || '{}');
        if (!id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Product ID required' }));
        }
        await deleteProductFromDb(id);
        
        // Remove from disk products.js
        const allProds = await getProductsFromDb(true);
        if (allProds) {
          writeProductsFile(allProds.filter(p => p.id !== id));
        }

        console.log(`[API Delete-Product] Product ${id} permanently removed from MySQL & disk.`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Product ${id} permanently deleted`, id }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: POST /api/toggle-product-status
  // Disables or enables product in MySQL database and updates products.js
  // --------------------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/toggle-product-status') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { id, status } = JSON.parse(body || '{}');
        if (!id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Product ID required' }));
        }
        const pool = getDbPool();
        const targetStatus = status === 'disabled' ? 'disabled' : 'active';
        const isActive = targetStatus === 'active';

        if (pool) {
          await pool.query(
            'UPDATE products SET status = ?, raw_json = JSON_SET(raw_json, "$.status", ?, "$.isActive", ?, "$.disabled", ?) WHERE id = ?',
            [targetStatus, targetStatus, isActive, !isActive, id]
          );
        }

        // Update disk products.js
        const allProds = await getProductsFromDb(true);
        if (allProds) {
          writeProductsFile(allProds);
        }

        console.log(`[API Toggle-Status] Product ${id} status set to "${targetStatus}".`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id, status: targetStatus, isActive }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: GET /api/categories
  // Returns categories from MySQL database (fallback to disk)
  // --------------------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/categories') {
    (async () => {
      try {
        let categories = await getCategoriesFromDb();
        if (!categories || categories.length === 0) {
          const catFilePath = path.join(ROOT_DIR, 'assets', 'js', 'data', 'categories.js');
          if (fs.existsSync(catFilePath)) {
            const code = fs.readFileSync(catFilePath, 'utf8');
            const m = code.match(/window\.DEFAULT_STORE_CATEGORIES\s*=\s*(\[[\s\S]*?\]);\s*\n/);
            if (m) categories = JSON.parse(m[1]);
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: (categories || []).length, categories: categories || [] }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    })();
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: POST /api/save-products
  // Writes master products array to MySQL database and updates products.js
  // --------------------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/save-products') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { products } = payload;

        if (!products || !Array.isArray(products)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'products array is required' }));
          return;
        }

        for (const p of products) {
          await saveProductToDb(p);
        }

        writeProductsFile(products);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Successfully persisted ${products.length} products to MySQL database & disk`, count: products.length }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: POST /api/sync-all
  // Synchronizes full catalog (products, categories, colors) to MySQL and disk
  // --------------------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/sync-all') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { products, categories, colors, deletedProductId } = payload;
        const synced = [];

        // 1. Delete product if specified
        if (deletedProductId) {
          await deleteProductFromDb(deletedProductId);
        }

        // 2. Sync Products to MySQL and disk
        if (products && Array.isArray(products)) {
          const productsToPersist = deletedProductId 
            ? products.filter(p => p.id !== deletedProductId)
            : products;

          for (const p of productsToPersist) {
            await saveProductToDb(p);
          }
          writeProductsFile(productsToPersist);
          synced.push(`products (${productsToPersist.length})`);
        }

        // 3. Sync Categories to MySQL and disk
        if (categories && Array.isArray(categories)) {
          for (const cat of categories) {
            await saveCategoryToDb(cat);
          }
          writeCategoriesFile(categories);
          synced.push(`categories (${categories.length})`);
        }

        // 4. Sync Colors
        if (colors && Array.isArray(colors)) {
          const storeDataPath = path.join(ROOT_DIR, 'assets', 'js', 'core', 'storeData.js');
          if (fs.existsSync(storeDataPath)) {
            let storeDataCode = fs.readFileSync(storeDataPath, 'utf8');
            const colorsStr = JSON.stringify(colors, null, 4).replace(/\n/g, '\n  ');
            const newDefaultColorsBlock = `DEFAULT_COLORS: ${colorsStr},`;
            storeDataCode = storeDataCode.replace(/DEFAULT_COLORS:\s*\[[\s\S]*?\],/m, newDefaultColorsBlock);
            fs.writeFileSync(storeDataPath, storeDataCode, 'utf8');
            synced.push(`colors (${colors.length})`);
          }
        }

        console.log(`[API Sync-All] Successfully updated in MySQL & on disk: ${synced.join(', ')}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, synced, message: 'Successfully synced to MySQL database & disk' }));
      } catch (err) {
        console.error('[API Sync-All Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: /api/orders
  // --------------------------------------------------------------------------
  if (pathname === '/api/orders') {
    const ordersFile = path.join(ROOT_DIR, 'assets', 'js', 'data', 'local_orders.json');
    const getLocalOrders = () => {
      try {
        if (fs.existsSync(ordersFile)) {
          return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        }
      } catch (e) {}
      return [];
    };
    const saveLocalOrders = (orders) => {
      try {
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
      } catch (e) {
        console.error('Error saving local orders:', e);
      }
    };

    if (req.method === 'GET') {
      const orders = getLocalOrders();
      const status = parsedUrl.query.status;
      const filtered = (status && status !== 'all') ? orders.filter(o => o.status === status) : orders;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: filtered.length, orders: filtered }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          let orders = getLocalOrders();

          if (parsedUrl.query.action === 'update_status' || payload.action === 'update_status') {
            const { orderNumber, status } = payload;
            const idx = orders.findIndex(o => o.order_number === orderNumber || o.orderNumber === orderNumber);
            if (idx !== -1) {
              orders[idx].status = status;
              saveLocalOrders(orders);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, orderNumber, status }));
              return;
            }
          }

          const orderNumber = payload.orderNumber || ('MA-' + Math.floor(100000 + Math.random() * 900000));
          const newOrder = {
            id: Date.now(),
            order_number: orderNumber,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            customer_first_name: payload.customer?.firstName || '',
            customer_last_name: payload.customer?.lastName || '',
            customer_email: payload.customer?.email || '',
            customer_phone: payload.customer?.phone || '',
            shipping_address: payload.shippingAddress?.address || '',
            shipping_apartment: payload.shippingAddress?.apartment || '',
            shipping_city: payload.shippingAddress?.city || '',
            shipping_postal: payload.shippingAddress?.postal || '',
            shipping_country: payload.shippingAddress?.country || 'Maroc',
            payment_method: payload.paymentMethod || 'Paiement à la livraison (COD)',
            subtotal: payload.subtotal || 0,
            discount: payload.discount || 0,
            shipping_cost: payload.shipping || 0,
            total: payload.total || 0,
            order_note: payload.orderNote || '',
            status: 'pending',
            items: payload.items || []
          };

          orders.unshift(newOrder);
          saveLocalOrders(orders);

          // Automated WhatsApp Order Confirmation if configured
          const wsCfg = getWhatsAppConfig();
          if (wsCfg.enabled && newOrder.customer_phone) {
            const customerName = `${newOrder.customer_first_name} ${newOrder.customer_last_name}`.trim();
            const tpl = wsCfg.template_name || 'hello_world';
            const lang = wsCfg.language_code || 'en_US';
            const params = (tpl === 'hello_world') ? [] : [customerName || 'Client', orderNumber, String(newOrder.total)];
            sendWhatsAppMessageNode(newOrder.customer_phone, tpl, lang, params).then(res => {
              if (res.success) {
                console.log(`[WhatsApp Node] Confirmation envoyée à ${res.recipient} pour commande ${orderNumber}`);
              } else {
                console.warn(`[WhatsApp Node Warning] Échec d'envoi à ${newOrder.customer_phone}:`, res.error);
              }
            }).catch(e => console.error('[WhatsApp Node Error]', e));
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, orderNumber, id: newOrder.id, message: 'Commande enregistrée localement' }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // --------------------------------------------------------------------------
  // API ENDPOINTS: WhatsApp Cloud API Configuration & Test
  // --------------------------------------------------------------------------
  if (pathname === '/api/whatsapp/config') {
    if (req.method === 'GET') {
      const cfg = getWhatsAppConfig();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, config: cfg }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const current = getWhatsAppConfig();
          const updated = {
            enabled: !!payload.enabled,
            phone_number_id: (payload.phone_number_id !== undefined ? payload.phone_number_id : current.phone_number_id).trim(),
            access_token: (payload.access_token !== undefined ? payload.access_token : current.access_token).trim(),
            test_recipient: (payload.test_recipient !== undefined ? payload.test_recipient : current.test_recipient).trim(),
            template_name: (payload.template_name || current.template_name || 'hello_world').trim(),
            language_code: (payload.language_code || current.language_code || 'en_US').trim()
          };
          saveWhatsAppConfig(updated);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Configuration WhatsApp sauvegardée avec succès', config: updated }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  if (pathname === '/api/whatsapp/test' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const cfg = getWhatsAppConfig();
        const targetPhone = payload.recipient || cfg.test_recipient;
        const tpl = payload.template_name || cfg.template_name || 'hello_world';
        const lang = payload.language_code || cfg.language_code || 'en_US';
        const params = payload.params || [];

        const result = await sendWhatsAppMessageNode(targetPhone, tpl, lang, params);
        res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --------------------------------------------------------------------------
  // API ENDPOINT: /api/contact & /api/newsletter
  // --------------------------------------------------------------------------
  if (pathname === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Message reçu (serveur local)' }));
    });
    return;
  }

  if (pathname === '/api/newsletter' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Inscription confirmée (serveur local)' }));
    });
    return;
  }

  // --------------------------------------------------------------------------
  // STATIC FILE SERVING
  // --------------------------------------------------------------------------
  // Normalize root to /index.html
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  let filePath = path.join(ROOT_DIR, pathname);

  // Check if direct file exists
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveStaticFile(filePath, res, req);
      return;
    }

    // Try appending .html (e.g. /shop -> /shop.html, /product -> /product.html)
    const htmlPath = filePath + '.html';
    fs.stat(htmlPath, (htmlErr, htmlStats) => {
      if (!htmlErr && htmlStats.isFile()) {
        serveStaticFile(htmlPath, res, req);
        return;
      }

      // If directory, look for index.html inside
      if (!err && stats && stats.isDirectory()) {
        const dirIndex = path.join(filePath, 'index.html');
        fs.stat(dirIndex, (dirErr, dirStats) => {
          if (!dirErr && dirStats.isFile()) {
            serveStaticFile(dirIndex, res, req);
            return;
          }
          send404(res);
        });
        return;
      }

      send404(res);
    });
  });
});

function serveStaticFile(filePath, res, req) {
  const ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    // Sniff image signatures for optimal Content-Type
    if (data && data.length > 3) {
      if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
        contentType = 'image/jpeg';
      } else if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
        contentType = 'image/png';
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(data),
      'Cache-Control': 'no-cache'
    });

    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }
  });
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;"><h1>404 - Page Non Trouvée</h1><p><a href="/">Retour à l\'accueil</a></p></body></html>');
}

async function syncMasterProductsOnStartup() {
  const pool = getDbPool();
  if (!pool) return;
  try {
    const productsFilePath = path.join(ROOT_DIR, 'assets', 'js', 'data', 'products.js');
    if (fs.existsSync(productsFilePath)) {
      const code = fs.readFileSync(productsFilePath, 'utf8');
      const m = code.match(/window\.DEFAULT_STORE_PRODUCTS\s*=\s*(\[[\s\S]*?\]);\s*\n/);
      if (m) {
        const masterProducts = JSON.parse(m[1]);
        for (const p of masterProducts) {
          await saveProductToDb(p);
        }
        console.log(`[DB] Successfully synchronized ${masterProducts.length} master products to MySQL database.`);
      }
    }
  } catch (err) {
    console.error('[DB] Error during startup products sync:', err.message);
  }
}

server.listen(PORT, () => {
  console.log(`ATELIER High-Performance Local Dev Server running at: http://localhost:${PORT}`);
  syncMasterProductsOnStartup().catch(() => {});
});
