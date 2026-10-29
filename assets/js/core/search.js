/**
 * Product Search Engine
 * Real-time fast keyword matching across title, category, tags, colors, and description.
 */

window.StoreSearch = {
  search(query, options = {}) {
    if (!query || typeof query !== "string") return [];
    
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length === 0) return [];

    let deletedIds = [];
    try {
      const rawDeleted = localStorage.getItem("atelier_deleted_product_ids_v2");
      if (rawDeleted) deletedIds = JSON.parse(rawDeleted);
    } catch(e) {}
    const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);

    const rawList = options.products || window.STORE_PRODUCTS || [];
    const products = rawList.filter(p => 
      p && 
      !deletedSet.has(p.id) && 
      (options.includeDisabled || (p.status !== 'disabled' && p.isActive !== false && p.disabled !== true))
    );

    return products.filter(product => {
      // 1. Name match (Arabic, French, or default)
      if (product.name && product.name.toLowerCase().includes(cleanQuery)) return true;
      if (product.nameAr && product.nameAr.toLowerCase().includes(cleanQuery)) return true;
      if (product.nameFr && product.nameFr.toLowerCase().includes(cleanQuery)) return true;

      // 2. Category match
      if (product.category && product.category.toLowerCase().includes(cleanQuery)) return true;
      if (product.categoryName && product.categoryName.toLowerCase().includes(cleanQuery)) return true;
      if (product.categoryNameFr && product.categoryNameFr.toLowerCase().includes(cleanQuery)) return true;

      // 3. Tags match
      if (product.tags && product.tags.some(tag => tag.toLowerCase().includes(cleanQuery))) {
        return true;
      }

      // 4. Color names match
      if (product.colors && product.colors.some(c => c.name.toLowerCase().includes(cleanQuery))) {
        return true;
      }

      // 5. Short description match
      if (product.shortDescription && product.shortDescription.toLowerCase().includes(cleanQuery)) {
        return true;
      }

      // 6. Materials / Details match
      if (product.materials && product.materials.toLowerCase().includes(cleanQuery)) {
        return true;
      }

      return false;
    });
  }
};
