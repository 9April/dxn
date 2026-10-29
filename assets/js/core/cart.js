/**
 * Shopping Cart State Machine & Engine
 * Supports variant selection (color/size), SKU-level items, inventory checks,
 * Moroccan free shipping threshold meter, discount coupons, and event-driven UI updates.
 */

window.StoreCart = {
  items: [],
  discount: null,
  orderNote: "",

  _isAr() {
    return (window.StoreI18n && window.StoreI18n.currentLang === 'ar') || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'ar');
  },

  init() {
    this.items = StoreStorage.get(StoreStorage.KEYS.CART, []);
    // Sanitize any existing items from localStorage with missing or 'undefined' variantIds
    if (Array.isArray(this.items)) {
      this.items = this.items.map(item => {
        if (!item.variantId || item.variantId === 'undefined' || item.variantId === 'null') {
          item.variantId = item.sku || `${item.productId || 'item'}_${item.color || 'std'}_${item.size || 'std'}`;
        }
        if (!item.maxStock || item.maxStock <= 0) {
          item.maxStock = 99;
        }
        item.quantity = parseInt(item.quantity, 10) || 1;
        return item;
      });
      StoreStorage.set(StoreStorage.KEYS.CART, this.items);
    }
    this.discount = null;
    StoreStorage.remove(StoreStorage.KEYS.DISCOUNT);
    this.orderNote = StoreStorage.get(StoreStorage.KEYS.ORDER_NOTE, "");
    this.emitChange();
  },

  /**
   * Add a product variant to cart
   */
  addItem({ productId, colorCode = null, size = null, quantity = 1, openDrawer = true }) {
    const product = (window.STORE_PRODUCTS || []).find(p => p.id === productId);
    if (!product) {
      StoreUtils.showToast("Produit introuvable.", "error");
      return false;
    }

    // Find specific variant with fallback
    let variant = null;
    if (product.variants && product.variants.length > 0) {
      if (colorCode && size) {
        variant = product.variants.find(v => v.color === colorCode && v.size === size);
      }
      if (!variant && colorCode) {
        variant = product.variants.find(v => v.color === colorCode);
      }
      if (!variant && size) {
        variant = product.variants.find(v => v.size === size);
      }
      if (!variant) {
        variant = product.variants[0];
      }
    } else {
      variant = {
        color: colorCode || 'standard',
        size: size || product.weight || 'Standard',
        stock: product.stock || 99,
        sku: product.sku || product.id,
        price: product.price,
        compareAtPrice: product.compareAtPrice
      };
    }

    const maxStock = (variant && variant.stock > 0) ? variant.stock : ((product.stock > 0) ? product.stock : 99);
    if (variant.stock <= 0 && (!product.stock || product.stock <= 0)) {
      StoreUtils.showToast("Cet article est en rupture de stock.", "error");
      return false;
    }

    // Resolve color object
    const colorObj = (product.colors && product.colors.find(c => c.code === colorCode)) || (product.colors && product.colors[0]) || { name: 'Standard', code: 'standard', hex: '#2F5233' };
    const image = (product.images && product.images[colorCode] && product.images[colorCode][0]) 
      || colorObj.image 
      || (product.images && Object.keys(product.images).length > 0 && product.images[Object.keys(product.images)[0]][0])
      || product.image
      || 'assets/Header/Header Ar.png';

    // Form unique, concrete variantId
    const resolvedVariantId = variant.id || variant.sku || `${product.id}_${variant.color || colorCode || 'std'}_${variant.size || size || 'std'}`;

    // Check if variant is already in cart
    const existingIndex = this.items.findIndex(item => String(item.variantId) === String(resolvedVariantId));

    const addQty = parseInt(quantity, 10) || 1;

    if (existingIndex > -1) {
      const newQty = this.items[existingIndex].quantity + addQty;
      if (newQty > maxStock) {
        StoreUtils.showToast(`Stock maximum atteint (${maxStock} articles disponibles).`, "warning");
        this.items[existingIndex].quantity = maxStock;
      } else {
        this.items[existingIndex].quantity = newQty;
      }
    } else {
      const initialQty = Math.min(addQty, maxStock);
      this.items.push({
        variantId: resolvedVariantId,
        productId: product.id,
        name: product.name,
        nameAr: product.nameAr,
        slug: product.slug,
        color: colorCode || variant.color || 'standard',
        colorName: colorObj.name,
        size: size || variant.size || product.weight || 'Standard',
        sku: variant.sku || product.sku || product.id,
        price: variant.price || product.price,
        compareAtPrice: variant.compareAtPrice || product.compareAtPrice,
        image: image,
        quantity: initialQty,
        maxStock: maxStock
      });
    }

    this.save();
    const isAr = this._isAr();
    const prodName = isAr ? (product.nameAr || product.name) : product.name;
    StoreUtils.showToast(isAr ? `تمت إضافة "${prodName}" إلى السلة !` : `"${prodName}" ajouté au panier !`, "success");

    if (openDrawer && window.CartDrawerComponent) {
      window.CartDrawerComponent.open();
    }

    return true;
  },

  /**
   * Add a customized bundle pack (e.g. Pack 3 T-Shirts) to cart
   */
  addBundleItem({ productId = 'pack-trio-tshirts', bundleName, price = 599, compareAtPrice = 780, image, bundleItems = [], quantity = 1, openDrawer = true }) {
    const bundleVariantId = `pack-trio-${Date.now()}`;
    const product = (window.STORE_PRODUCTS || []).find(p => p.id === productId) || {
      id: productId,
      name: bundleName || 'Pack 3 T-Shirts Personnalisable',
      price: price,
      compareAtPrice: compareAtPrice
    };

    const bundleItem = {
      variantId: bundleVariantId,
      productId: product.id,
      name: bundleName || product.name,
      slug: product.slug || 'pack-trio-tshirts',
      isBundle: true,
      price: price,
      compareAtPrice: compareAtPrice,
      image: image || 'assets/Header/Header Ar.png',
      quantity: quantity,
      maxStock: 50,
      bundleItems: bundleItems // Array of { slot, productId, productName, colorCode, colorName, colorHex, size, sku, image }
    };

    this.items.push(bundleItem);
    this.save();

    const isAr = this._isAr();
    const savings = (compareAtPrice && compareAtPrice > price) ? (isAr ? ` (توفير : ${compareAtPrice - price} درهم)` : ` (Économie : ${compareAtPrice - price} MAD)`) : '';
    const addedMsg = isAr ? `تمت إضافة ${bundleItem.name} إلى السلة !${savings}` : `${bundleItem.name} ajouté au panier !${savings}`;
    StoreUtils.showToast(addedMsg, "success");

    if (openDrawer && window.CartDrawerComponent) {
      window.CartDrawerComponent.open();
    }

    return true;
  },

  /**
   * Update quantity of a line item
   */
  updateQuantity(variantId, newQuantity) {
    const targetId = String(variantId);
    let itemIndex = this.items.findIndex(item => String(item.variantId) === targetId);
    if (itemIndex === -1) {
      // Fallback matching in case of legacy / corrupted variantId
      itemIndex = this.items.findIndex(item => 
        String(item.sku) === targetId || 
        String(item.productId) === targetId || 
        (targetId === 'undefined' && (!item.variantId || item.variantId === 'undefined'))
      );
    }
    if (itemIndex === -1) return;

    newQuantity = parseInt(newQuantity, 10);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      this.removeItem(this.items[itemIndex].variantId);
      return;
    }

    const item = this.items[itemIndex];
    const maxStock = (item.maxStock && item.maxStock > 0) ? item.maxStock : 99;
    if (newQuantity > maxStock) {
      const isAr = this._isAr();
      StoreUtils.showToast(isAr ? `عذراً، تتوفر ${maxStock} قطع فقط في المخزون.` : `Désolé, seulement ${maxStock} pièces disponibles.`, "warning");
      item.quantity = maxStock;
    } else {
      item.quantity = newQuantity;
    }

    this.save();
  },

  /**
   * Remove item from cart
   */
  removeItem(variantId) {
    const targetId = String(variantId);
    let item = this.items.find(i => String(i.variantId) === targetId);
    if (!item) {
      item = this.items.find(i => 
        String(i.sku) === targetId || 
        String(i.productId) === targetId || 
        (targetId === 'undefined' && (!i.variantId || i.variantId === 'undefined'))
      );
    }
    if (item) {
      const removedName = item.name;
      this.items = this.items.filter(i => i !== item);
      this.save();
      const isAr = this._isAr();
      StoreUtils.showToast(isAr ? `تم حذف "${removedName}" من السلة.` : `"${removedName}" retiré du panier.`, "info");
    }
  },

  /**
   * Change variant (e.g. Size or Color) from inside the cart
   */
  updateItemVariant(oldVariantId, newColorCode, newSize) {
    const targetId = String(oldVariantId);
    let oldItem = this.items.find(i => String(i.variantId) === targetId);
    if (!oldItem) {
      oldItem = this.items.find(i => String(i.sku) === targetId || String(i.productId) === targetId);
    }
    if (!oldItem) return false;

    const product = (window.STORE_PRODUCTS || []).find(p => p.id === oldItem.productId);
    if (!product) return false;

    const newVariant = (product.variants || []).find(v => v.color === newColorCode && v.size === newSize);
    if (!newVariant || newVariant.stock <= 0) {
      StoreUtils.showToast("Cette variante n'est pas disponible en stock.", "error");
      return false;
    }

    const qty = Math.min(oldItem.quantity, newVariant.stock);
    this.removeItem(oldVariantId);
    return this.addItem({
      productId: product.id,
      colorCode: newColorCode,
      size: newSize,
      quantity: qty,
      openDrawer: false
    });
  },

  /**
   * Clear all items in cart
   */
  clear() {
    this.items = [];
    this.discount = null;
    this.orderNote = "";
    this.save();
    StoreStorage.remove(StoreStorage.KEYS.DISCOUNT);
    StoreStorage.remove(StoreStorage.KEYS.ORDER_NOTE);
  },

  /**
   * Set order note
   */
  setOrderNote(note) {
    this.orderNote = note;
    StoreStorage.set(StoreStorage.KEYS.ORDER_NOTE, note);
  },

  /**
   * Apply a discount coupon
   */
  applyCoupon(code) {
    if (!code) return { success: false, message: "Veuillez saisir un code promo." };
    const cleanCode = code.trim().toUpperCase();
    const coupon = window.STORE_CONFIG.coupons[cleanCode];

    if (!coupon) {
      return { success: false, message: "Code promotionnel invalide ou expiré." };
    }

    const subtotal = this.getSubtotal();
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return {
        success: false,
        message: `Ce code nécessite un montant minimum de ${StoreUtils.formatMoney(coupon.minSpend)}.`
      };
    }

    this.discount = {
      code: cleanCode,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description
    };

    StoreStorage.set(StoreStorage.KEYS.DISCOUNT, this.discount);
    this.emitChange();
    return { success: true, message: `Code ${cleanCode} appliqué avec succès !` };
  },

  /**
   * Remove active discount
   */
  removeCoupon() {
    this.discount = null;
    StoreStorage.remove(StoreStorage.KEYS.DISCOUNT);
    this.emitChange();
  },

  /**
   * Cart totals calculations
   */
  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getDiscountAmount() {
    if (!this.discount) return 0;
    const subtotal = this.getSubtotal();
    if (this.discount.type === "percentage") {
      return Math.round((subtotal * this.discount.value) / 100);
    }
    return 0;
  },

  getShippingCost() {
    if (this.items.length === 0) return 0;
    
    // Free shipping coupon
    if (this.discount && this.discount.type === "shipping") return 0;

    const subtotalAfterDiscount = this.getSubtotal() - this.getDiscountAmount();
    if (subtotalAfterDiscount >= window.STORE_CONFIG.shipping.freeThreshold) {
      return 0;
    }
    return window.STORE_CONFIG.shipping.standardCost;
  },

  getShippingProgress() {
    const subtotal = this.getSubtotal();
    const threshold = window.STORE_CONFIG.shipping.freeThreshold;
    const remaining = Math.max(0, threshold - subtotal);
    const percentage = Math.min(100, Math.round((subtotal / threshold) * 100));

    return {
      threshold,
      current: subtotal,
      remaining,
      percentage,
      isFree: subtotal >= threshold && this.items.length > 0
    };
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingCost();
    return Math.max(0, subtotal - discount + shipping);
  },

  /**
   * Persist and notify listeners
   */
  save() {
    StoreStorage.set(StoreStorage.KEYS.CART, this.items);
    this.emitChange();
  },

  emitChange() {
    window.dispatchEvent(new CustomEvent("cart:updated", {
      detail: {
        items: this.items,
        count: this.getCount(),
        subtotal: this.getSubtotal(),
        discount: this.getDiscountAmount(),
        shipping: this.getShippingCost(),
        total: this.getTotal(),
        shippingProgress: this.getShippingProgress(),
        appliedDiscount: this.discount
      }
    }));
  }
};

// Auto-initialize cart on script load
document.addEventListener("DOMContentLoaded", () => {
  window.StoreCart.init();
});
