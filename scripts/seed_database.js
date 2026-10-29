const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'srv898.hstgr.io',
  user: process.env.DB_USER || 'u895506237_dxn',
  password: process.env.DB_PASSWORD || 'j^TA3Y!X:I7',
  database: process.env.DB_NAME || 'u895506237_dxn',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10
};

async function seed() {
  console.log('Connecting to database:', DB_CONFIG.host, DB_CONFIG.database);
  const conn = await mysql.createConnection(DB_CONFIG);

  console.log('Creating tables...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(100) PRIMARY KEY,
      slug VARCHAR(100),
      name VARCHAR(255),
      nameAr VARCHAR(255),
      nameFr VARCHAR(255),
      categoryGroup VARCHAR(100),
      description TEXT,
      image VARCHAR(255),
      active TINYINT(1) DEFAULT 1,
      itemCount INT DEFAULT 0,
      raw_json LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(120) PRIMARY KEY,
      sku VARCHAR(100),
      name VARCHAR(255),
      nameAr VARCHAR(255),
      nameFr VARCHAR(255),
      titleAr VARCHAR(255),
      brand VARCHAR(100),
      price DECIMAL(10,2) NOT NULL,
      compareAtPrice DECIMAL(10,2) NULL,
      costPrice DECIMAL(10,2) NULL,
      category VARCHAR(100),
      categoryName VARCHAR(255),
      categoryNameFr VARCHAR(255),
      subcategory VARCHAR(100),
      categoryGroup VARCHAR(100),
      stock INT DEFAULT 0,
      isNew TINYINT(1) DEFAULT 0,
      isFeatured TINYINT(1) DEFAULT 0,
      isSale TINYINT(1) DEFAULT 0,
      shortDescription TEXT,
      shortDescriptionAr TEXT,
      shortDescriptionFr TEXT,
      description LONGTEXT,
      descriptionAr LONGTEXT,
      descriptionFr LONGTEXT,
      attributes JSON,
      colors JSON,
      images JSON,
      variants JSON,
      tags JSON,
      collections JSON,
      specs JSON,
      seo JSON,
      raw_json LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_brand (brand),
      INDEX idx_sku (sku)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Load products from assets/js/data/products.js
  const productsCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'data', 'products.js'), 'utf8');
  const sandbox = {};
  const vm = require('vm');
  vm.createContext(sandbox);
  sandbox.window = sandbox;
  vm.runInContext(productsCode, sandbox);
  const products = sandbox.DEFAULT_STORE_PRODUCTS || [];

  // Load categories from assets/js/data/categories.js
  const categoriesCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'data', 'categories.js'), 'utf8');
  vm.runInContext(categoriesCode, sandbox);
  const categories = sandbox.DEFAULT_STORE_CATEGORIES || [];

  console.log(`Found ${categories.length} categories to seed.`);
  for (const cat of categories) {
    const rawJson = JSON.stringify(cat);
    await conn.query(`
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
  }
  console.log('Categories seeded successfully.');

  console.log(`Found ${products.length} products to seed.`);
  for (const p of products) {
    const rawJson = JSON.stringify(p);
    await conn.query(`
      INSERT INTO products (
        id, sku, name, nameAr, nameFr, titleAr, brand, price, compareAtPrice, costPrice,
        category, categoryName, categoryNameFr, subcategory, categoryGroup, stock,
        isNew, isFeatured, isSale, shortDescription, shortDescriptionAr, shortDescriptionFr,
        description, descriptionAr, descriptionFr, attributes, colors, images, variants,
        tags, collections, specs, seo, raw_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  }
  console.log('Products seeded successfully.');

  const [prodCount] = await conn.query('SELECT COUNT(*) as cnt FROM products');
  const [catCount] = await conn.query('SELECT COUNT(*) as cnt FROM categories');
  console.log(`Verification: Database currently contains ${prodCount[0].cnt} products and ${catCount[0].cnt} categories.`);

  await conn.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
