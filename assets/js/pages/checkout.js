/**
 * Checkout Page Controller
 * 2-column layout with Moroccan market fields (City select, Phone format, COD payment).
 * Bilingual: Arabic (RTL) & French (LTR).
 */

window.CheckoutController = {
  selectedPayment: "cod", // 'cod' (Cash on delivery) or 'card'

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById("checkout-page-container");
    if (!container) return;

    const cart = window.StoreCart;
    const items = (cart && cart.items) || [];
    const config = window.STORE_CONFIG;
    const isAr = window.I18N ? window.I18N.isRTL() : true;
    const brandTitle = isAr ? "دي إكس إن وكالو" : "DXN & KALLOW";
    const brandSubtitle = isAr
      ? "منتجات الصحة والجمال الطبيعي بالمغرب"
      : "Santé, Bien-être & Beauté Naturelle au Maroc";

    document.title = isAr ? "إتمام الطلب والدفع عند الاستلام | دي إكس إن وكالو المغرب" : "Commander - Paiement à la Livraison | DXN & KALLOW Maroc";

    if (items.length === 0) {
      container.innerHTML = `
        <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px 20px;">
          <div>
            <h2 style="margin-bottom: 12px; font-weight: 800;">${isAr ? 'سلة التسوق فارغة' : 'Votre panier est vide'}</h2>
            <p style="margin-bottom: 24px; color: var(--color-text-secondary);">${isAr ? 'يرجى إضافة منتجات إلى سلتك قبل متابعة إتمام الطلب.' : 'Veuillez ajouter des articles à votre panier avant de finaliser votre commande.'}</p>
            <a href="shop.html" class="btn btn-primary">${isAr ? 'تصفح المتجر الآن' : 'Découvrir la boutique'}</a>
          </div>
        </div>
      `;
      return;
    }

    const subtotal = cart.getSubtotal();
    const discount = cart.getDiscountAmount();
    const shipping = cart.getShippingCost();
    const total = cart.getTotal();
    const appliedDiscount = cart.discount;

    container.innerHTML = `
      <div class="checkout-layout">
        <!-- Main Form Left -->
        <main class="checkout-main">
          <!-- Logo & Back to Cart -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 12px;">
            <a href="index.html" class="brand-logo">
              <img src="assets/logo.png" alt="DXN & KALLOW" class="brand-logo-img">
              <div class="brand-logo-text">
                <span class="brand-logo-main">${brandTitle}</span>
                <span class="brand-logo-sub">${brandSubtitle}</span>
              </div>
            </a>

            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="header-lang-switch" role="group" aria-label="Langue / Language" style="display: inline-flex;">
                <button type="button" class="header-lang-btn ${isAr ? 'active' : ''}" onclick="window.I18N.setLang('ar', true)">عربي</button>
                <span class="header-lang-divider">|</span>
                <button type="button" class="header-lang-btn ${!isAr ? 'active' : ''}" onclick="window.I18N.setLang('fr', true)">FR</button>
              </div>

              <a href="cart.html" style="font-size: 0.88rem; text-decoration: underline; color: var(--color-text-secondary); font-weight: 600;">
                ${isAr ? 'العودة إلى السلة ←' : '← Retour au panier'}
              </a>
            </div>
          </div>

          <form id="checkout-form" onsubmit="window.CheckoutController.handleSubmit(event)">
            <!-- 1. Contact Information -->
            <div style="margin-bottom: 36px;">
              <h2 class="checkout-step-title" style="font-weight: 800; font-size: 1.25rem;">
                ${isAr ? '1. معلومات الاتصال' : '1. Coordonnées & Contact'}
              </h2>

              <div class="form-group">
                <label class="form-label" for="checkout-phone" style="font-weight: 700;">
                  ${isAr ? 'رقم الهاتف (المغرب) *' : 'Numéro de téléphone (Maroc) *'}
                </label>
                <input type="tel" id="checkout-phone" class="form-input" placeholder="${isAr ? '07 08 87 30 60 أو 06...' : '07 08 87 30 60 ou 06...'}" required pattern="^((\\+212|0)[5-7]\\d{8})$" title="${isAr ? 'يرجى إدخال رقم هاتف مغربي صحيح (مثال: 0708873060)' : 'Veuillez saisir un numéro de téléphone marocain valide (ex: 0708873060)'}" style="text-align: ${isAr ? 'right' : 'left'}; direction: ltr;">
                <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px;">
                  ${isAr ? 'ضروري للتواصل والتنسيق مع مندوب التوصيل عند تسليم طلبيتك.' : 'Requis pour vous contacter et coordonner la livraison de votre colis.'}
                </div>
              </div>
            </div>

            <!-- 2. Shipping Address in Morocco -->
            <div style="margin-bottom: 36px;">
              <h2 class="checkout-step-title" style="font-weight: 800; font-size: 1.25rem;">
                ${isAr ? '2. عنوان التوصيل بالمغرب' : '2. Adresse de Livraison au Maroc'}
              </h2>

              <div class="form-group">
                <label class="form-label" for="checkout-full-name" style="font-weight: 700;">
                  ${isAr ? 'الاسم الكامل (الاسم واللقب) *' : 'Prénom & Nom de famille *'}
                </label>
                <input type="text" id="checkout-full-name" class="form-input" placeholder="${isAr ? 'مثال: محمد العلمي' : 'Ex: Mohamed El Alami'}" required style="text-align: ${isAr ? 'right' : 'left'};">
              </div>

              <div class="form-group">
                <label class="form-label" for="checkout-address" style="font-weight: 700;">
                  ${isAr ? 'العنوان بالتفصيل (الحي، الشارع، رقم المنزل/العمارة) *' : 'Adresse complète (Quartier, Rue, N° Immeuble/Maison) *'}
                </label>
                <input type="text" id="checkout-address" class="form-input" placeholder="${isAr ? 'مثال: شارع محمد الخامس، عمارة 45، طنجة' : 'Ex: Bd Mohammed V, Résidence 45, Tanger'}" required style="text-align: ${isAr ? 'right' : 'left'};">
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="checkout-apartment" style="font-weight: 700;">
                    ${isAr ? 'رقم الشقة، الطابق (اختياري)' : 'Appartement, étage (optionnel)'}
                  </label>
                  <input type="text" id="checkout-apartment" class="form-input" placeholder="${isAr ? 'شقة 4، الطابق 2' : 'Appt 4, 2ème étage'}" style="text-align: ${isAr ? 'right' : 'left'};">
                </div>

                <div class="form-group">
                  <label class="form-label" for="checkout-city" style="font-weight: 700;">
                    ${isAr ? 'المدينة بالمغرب *' : 'Ville au Maroc *'}
                  </label>
                  <select id="checkout-city" class="form-select" required style="text-align: ${isAr ? 'right' : 'left'};">
                    <option value="" disabled selected>${isAr ? 'اختر مدينتك بالمغرب...' : 'Sélectionnez votre ville au Maroc...'}</option>
                    ${config.moroccanCities.map(city => `
                      <option value="${city}">${city}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="checkout-postal" style="font-weight: 700;">
                    ${isAr ? 'الرمز البريدي (اختياري)' : 'Code Postal (optionnel)'}
                  </label>
                  <input type="text" id="checkout-postal" class="form-input" placeholder="Ex: 20000" style="text-align: ${isAr ? 'right' : 'left'};">
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight: 700;">
                    ${isAr ? 'البلد' : 'Pays'}
                  </label>
                  <input type="text" class="form-input" value="${isAr ? 'المغرب 🇲🇦' : 'Maroc 🇲🇦'}" disabled style="background-color: var(--color-bg-secondary); text-align: ${isAr ? 'right' : 'left'};">
                </div>
              </div>
            </div>

            <!-- 3. Delivery Method -->
            <div style="margin-bottom: 36px;">
              <h2 class="checkout-step-title" style="font-weight: 800; font-size: 1.25rem;">
                ${isAr ? '3. طريقة التوصيل' : '3. Mode de Livraison'}
              </h2>
              <div style="border: 1px solid var(--color-dark); padding: 16px; background-color: var(--color-bg-secondary); display: flex; justify-content: space-between; align-items: center; border-radius: 4px;">
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem;">
                    ${isAr ? 'توصيل سريع مضمون لجميع المدن المغربية (24 إلى 48 ساعة)' : 'Livraison express garantie dans toutes les villes du Maroc (24 à 48h)'}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">
                    ${isAr ? 'شحن آمن ومباشر حتى باب منزلك مع إشعار هاتفي مسبق' : 'Expédition soignée à domicile avec avis de passage téléphonique préalable'}
                  </div>
                </div>
                <div class="font-heading" style="font-weight: 700;">
                  ${shipping === 0 ? `<span style="color: var(--color-success)">${isAr ? 'مجاني' : 'Gratuit'}</span>` : StoreUtils.formatMoney(shipping)}
                </div>
              </div>
            </div>

            <!-- 4. Payment Method -->
            <div style="margin-bottom: 36px;">
              <h2 class="checkout-step-title" style="font-weight: 800; font-size: 1.25rem;">
                ${isAr ? '4. طريقة الدفع' : '4. Mode de Paiement'}
              </h2>

              <!-- Option 1: Cash on Delivery (COD) -->
              <div class="payment-method-card ${this.selectedPayment === 'cod' ? 'selected' : ''}" onclick="window.CheckoutController.selectPayment('cod')" style="border-radius: 4px; padding: 16px; border: 1.5px solid ${this.selectedPayment === 'cod' ? 'var(--color-dark)' : 'var(--color-border)'}; cursor: pointer; margin-bottom: 12px; background: ${this.selectedPayment === 'cod' ? 'rgba(0,0,0,0.02)' : 'none'};">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <input type="radio" name="payment-method" value="cod" ${this.selectedPayment === 'cod' ? 'checked' : ''}>
                  <div>
                    <div style="font-weight: 700; font-size: 1rem;">
                      ${isAr ? '💵 الدفع نقداً عند الاستلام (Cash on Delivery)' : '💵 Paiement Cash à la Livraison (COD)'}
                    </div>
                    <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.5;">
                      ${isAr ? 'عاين طلبيتك وادفع نقداً لمندوب التوصيل بكل أمان وسهولة وبدون أي دفع مسبق.' : 'Vérifiez votre colis et payez en espèces auprès du livreur en toute sécurité, sans avance.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Optional Email at the end -->
            <div class="form-group" style="margin-bottom: 24px;">
              <label class="form-label" for="checkout-email" style="font-weight: 600; color: var(--color-text-secondary);">
                ${isAr ? 'البريد الإلكتروني (اختياري)' : 'Adresse e-mail (optionnel)'}
              </label>
              <input type="email" id="checkout-email" class="form-input" placeholder="exemple@email.com" style="text-align: ${isAr ? 'right' : 'left'};">
              <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px;">
                ${isAr ? 'اختياري: لتلقي إشعار إلكتروني وتأكيد تفاصيل طلبيتك عبر البريد.' : 'Optionnel : pour recevoir une copie de confirmation par e-mail.'}
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary btn-full btn-lg" id="checkout-submit-btn" style="font-weight: 800; font-size: 1.1rem; padding: 16px 24px;">
              ${isAr ? `تأكيد الطلبية • ${StoreUtils.formatMoney(total)} 📦` : `Confirmer ma Commande • ${StoreUtils.formatMoney(total)} 📦`}
            </button>

            <!-- WhatsApp Direct Order Button -->
            <button type="button" class="btn btn-full btn-lg checkout-whatsapp-btn" id="checkout-whatsapp-btn" onclick="window.CheckoutController.handleWhatsAppOrder()" style="margin-top: 12px; background: #25D366; color: #FFFFFF; font-weight: 800; font-size: 1.05rem; padding: 15px 24px; border: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35); cursor: pointer; transition: all 0.25s ease;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.35C9.32 7.35 8.97 7.43 8.69 7.73C8.4 8.04 7.6 8.79 7.6 10.33C7.6 11.87 8.72 13.36 8.88 13.57C9.04 13.78 11.08 16.93 14.2 18.28C14.94 18.6 15.52 18.79 15.97 18.93C16.71 19.17 17.39 19.13 17.92 19.05C18.52 18.96 19.75 18.31 20.01 17.58C20.27 16.85 20.27 16.22 20.19 16.09C20.11 15.96 19.9 15.89 19.59 15.73C19.28 15.57 17.76 14.82 17.48 14.72C17.2 14.62 17 14.57 16.8 14.87C16.6 15.18 16.03 15.89 15.85 16.09C15.68 16.29 15.5 16.32 15.19 16.16C14.88 16.01 13.88 15.68 12.7 14.62C11.78 13.8 11.16 12.79 10.98 12.48C10.8 12.18 10.96 12.01 11.12 11.86C11.26 11.72 11.43 11.49 11.59 11.31C11.74 11.13 11.8 11 11.9 10.79C12 10.59 11.95 10.41 11.87 10.25C11.8 10.1 11.19 8.59 10.93 7.97C10.68 7.37 10.43 7.45 10.24 7.44C10.07 7.44 9.86 7.35 9.53 7.35Z"/>
              </svg>
              <span>${isAr ? 'الطلب مباشرة عبر واتساب 💬' : 'Commander directement par WhatsApp 💬'}</span>
            </button>

            <div style="margin-top: 16px; text-align: center; font-size: 0.8rem; color: var(--color-text-muted);">
              ${isAr ? 'بتأكيدك للطلبية، سيتم الاتصال بك لتأكيد العنوان وبدء الشحن الفوري.' : 'En confirmant votre commande, notre service client vous contactera par téléphone pour valider l’expédition immédiate.'}
            </div>
          </form>
        </main>

        <!-- Order Summary Sidebar Right -->
        <aside class="checkout-sidebar">
          <h3 style="font-size: 1.25rem; margin-bottom: 24px; font-weight: 800;">
            ${isAr ? 'ملخص الطلبية' : 'Résumé de la Commande'}
          </h3>

          <!-- Items list -->
          <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; max-height: 380px; overflow-y: auto; padding-right: 8px;">
            ${items.map(item => {
              const primaryTitle = isAr ? (item.nameAr || item.name) : (item.nameFr || item.name);
              const secondaryTitle = isAr ? (item.subtitleAr || '') : (item.subtitleFr || '');
              const variantLabel = isAr 
                ? (item.weight ? `📦 ${item.weight}` : '')
                : (item.weight ? `📦 Format: ${item.weight}` : '');

              return `
              <div style="display: grid; grid-template-columns: 64px 1fr auto; gap: 14px; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.05);">
                <div style="position: relative;">
                  <img src="${item.image}" alt="${primaryTitle}" style="width: 64px; height: 80px; object-fit: cover; background: #fff; border: 1px solid var(--color-border); border-radius: 4px;">
                  <span style="position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; background-color: var(--color-dark); color: #fff; border-radius: 50%; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                    ${item.quantity}
                  </span>
                </div>
                <div>
                  <div class="font-heading" style="font-weight: 700; font-size: 0.95rem;">${primaryTitle}</div>
                  ${secondaryTitle ? `<div style="font-size: 0.75rem; color: var(--color-text-muted);">${secondaryTitle}</div>` : ''}
                  ${variantLabel ? `<div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">${variantLabel}</div>` : ''}
                </div>
                <div class="font-heading" style="font-weight: 700; font-size: 1rem; color: var(--color-dark);">
                  ${StoreUtils.formatMoney(item.price * item.quantity)}
                </div>
              </div>
            `;
            }).join('')}
          </div>

          <!-- Calculation details -->
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.92rem; padding-top: 16px; border-top: 1px solid var(--color-border);">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--color-text-secondary);">${isAr ? 'المجموع الفرعي' : 'Sous-total'}</span>
              <span class="font-heading" dir="ltr" style="font-weight: 700; text-align: ${isAr ? 'left' : 'right'};"><bdi dir="ltr">${StoreUtils.formatMoney(subtotal)}</bdi></span>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--color-text-secondary);">${isAr ? 'الشحن السريع (المغرب)' : 'Livraison Express (Maroc)'}</span>
              <span dir="ltr" style="text-align: ${isAr ? 'left' : 'right'};">${shipping === 0 ? `<strong style="color: var(--color-success)">${isAr ? 'مجاني 🚚' : 'Gratuit 🚚'}</strong>` : `<bdi dir="ltr">${StoreUtils.formatMoney(shipping)}</bdi>`}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1.5px solid var(--color-dark); font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800;">
              <span>${isAr ? 'المجموع الإجمالي' : 'Montant Total'}</span>
              <span style="color: #2F5233;" dir="ltr" style="text-align: ${isAr ? 'left' : 'right'};"><bdi dir="ltr">${StoreUtils.formatMoney(total)}</bdi></span>
            </div>
          </div>
        </aside>
      </div>
    `;
  },

  selectPayment(method) {
    this.selectedPayment = method;
    this.render();
  },

  handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const emailInput = document.getElementById("checkout-email");
    const email = emailInput ? emailInput.value.trim() : "";
    const phone = document.getElementById("checkout-phone").value.trim();
    const fullNameInput = document.getElementById("checkout-full-name");
    const fullName = fullNameInput ? fullNameInput.value.trim() : "";
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(" ") || "";
    const address = document.getElementById("checkout-address").value.trim();
    const apartment = document.getElementById("checkout-apartment").value.trim();
    const city = document.getElementById("checkout-city").value;
    const postal = document.getElementById("checkout-postal").value.trim();

    const cart = window.StoreCart;
    const orderNumber = `MA-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderNumber: orderNumber,
      date: new Date().toISOString(),
      customer: {
        fullName,
        name: fullName,
        firstName,
        lastName,
        email,
        phone
      },
      shippingAddress: {
        address,
        apartment,
        city,
        postal,
        country: "Maroc"
      },
      items: [...cart.items],
      paymentMethod: this.selectedPayment === 'cod' ? "Paiement à la livraison (Cash on Delivery)" : "Carte Bancaire",
      subtotal: cart.getSubtotal(),
      discount: cart.getDiscountAmount(),
      shipping: cart.getShippingCost(),
      total: cart.getTotal(),
      orderNote: cart.orderNote
    };

    // Save order in history (local backup)
    const existingOrders = StoreStorage.get(StoreStorage.KEYS.ORDERS, []);
    existingOrders.unshift(orderData);
    StoreStorage.set(StoreStorage.KEYS.ORDERS, existingOrders);

    // Save current active completed order for receipt page
    sessionStorage.setItem("atelier_latest_order", JSON.stringify(orderData));

    // Clear cart
    window.StoreCart.clear();

    // Persist order to MySQL database
    if (typeof fetch === 'function') {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).catch(e => console.warn('Database order sync skipped:', e.message))
        .finally(() => {
          window.location.href = `order-success.html?order=${orderNumber}`;
        });
      return;
    }

    // Fallback redirect
    window.location.href = `order-success.html?order=${orderNumber}`;
  },

  handleWhatsAppOrder() {
    const cart = window.StoreCart;
    const items = (cart && cart.items) || [];
    const isAr = window.I18N ? window.I18N.isRTL() : true;
    const config = window.STORE_CONFIG || {};
    const rawPhone = (config.contact && (config.contact.whatsapp || config.contact.phone)) || "+212708873060";
    const waNumber = rawPhone.replace(/[^\d]/g, '');

    if (items.length === 0) {
      alert(isAr ? 'سلة التسوق فارغة' : 'Votre panier est vide');
      return;
    }

    // Capture customer inputs if already typed in form
    const fullNameInput = document.getElementById("checkout-full-name");
    const fullName = fullNameInput ? fullNameInput.value.trim() : "";
    const phoneInput = document.getElementById("checkout-phone");
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const cityInput = document.getElementById("checkout-city");
    const city = cityInput ? cityInput.value : "";
    const addressInput = document.getElementById("checkout-address");
    const address = addressInput ? addressInput.value.trim() : "";
    const emailInput = document.getElementById("checkout-email");
    const email = emailInput ? emailInput.value.trim() : "";

    const total = cart.getTotal();
    const subtotal = cart.getSubtotal();
    const shipping = cart.getShippingCost();
    const discount = cart.getDiscountAmount();
    const orderNumber = `WA-${Math.floor(100000 + Math.random() * 900000)}`;

    let message = "";
    if (isAr) {
      message += `السلام عليكم ورحمة الله، دي إكس إن وكالو المغرب 🌿\n`;
      message += `أود تأكيد طلبيتي مباشرة عبر واتساب [${orderNumber}] :\n\n`;
      message += `📦 *المنتجات المطلوبة :*\n`;
      items.forEach((item, index) => {
        const title = item.nameAr || item.name || item.title || "";
        const size = item.weight ? ` (${item.weight})` : (item.size && item.size !== 'Standard' ? ` (${item.size})` : "");
        const lineTotal = item.price * item.quantity;
        if (item.quantity > 1) {
          message += `${index + 1}. *${title}*${size} : ${item.quantity} × ${StoreUtils.formatMoney(item.price)} = *${StoreUtils.formatMoney(lineTotal)}*\n`;
        } else {
          message += `${index + 1}. *${title}*${size} = *${StoreUtils.formatMoney(lineTotal)}*\n`;
        }
      });
      message += `\n💵 *تفاصيل الحساب والمبلغ :*\n`;
      message += `• مجموع المنتجات : ${StoreUtils.formatMoney(subtotal)}\n`;
      if (discount > 0) {
        message += `• التخفيض / الخصم : -${StoreUtils.formatMoney(discount)}\n`;
      }
      if (shipping === 0) {
        message += `• مصاريف الشحن : مجاني 🚚 (توصيل مجاني لكافة المدن)\n`;
      } else {
        message += `• مصاريف الشحن : ${StoreUtils.formatMoney(shipping)} 🚚 (توصيل سريع 24/48h بالمغرب)\n`;
      }
      message += `💰 *المجموع الإجمالي الصافي للدفع :* ${StoreUtils.formatMoney(total)} (الدفع نقداً عند الاستلام)\n\n`;
      message += `👤 *معلومات التوصيل :*\n`;
      message += `• الاسم : ${fullName || "سأحدده الآن"}\n`;
      message += `• الهاتف : ${phone || "سأحدده الآن"}\n`;
      message += `• المدينة : ${city || "سأحددها الآن"}\n`;
      if (address) message += `• العنوان : ${address}\n`;
      message += `\nشكراً لكم، في انتظار تأكيد وتجهيز الشحن !`;
    } else {
      message += `Bonjour DXN & Kallow Maroc 🌿\n`;
      message += `Je souhaite passer une commande directe via WhatsApp [${orderNumber}] :\n\n`;
      message += `📦 *Articles commandés :*\n`;
      items.forEach((item, index) => {
        const title = item.nameFr || item.name || item.title || "";
        const size = item.weight ? ` (${item.weight})` : (item.size && item.size !== 'Standard' ? ` (${item.size})` : "");
        const lineTotal = item.price * item.quantity;
        if (item.quantity > 1) {
          message += `${index + 1}. *${title}*${size} : ${item.quantity} × ${StoreUtils.formatMoney(item.price)} = *${StoreUtils.formatMoney(lineTotal)}*\n`;
        } else {
          message += `${index + 1}. *${title}*${size} = *${StoreUtils.formatMoney(lineTotal)}*\n`;
        }
      });
      message += `\n💵 *Détail du Règlement :*\n`;
      message += `• Sous-total articles : ${StoreUtils.formatMoney(subtotal)}\n`;
      if (discount > 0) {
        message += `• Remise : -${StoreUtils.formatMoney(discount)}\n`;
      }
      if (shipping === 0) {
        message += `• Frais de livraison : Gratuite 🚚 (Offre livraison offerte partout au Maroc)\n`;
      } else {
        message += `• Frais de livraison : ${StoreUtils.formatMoney(shipping)} 🚚 (Livraison express 24/48h partout au Maroc)\n`;
      }
      message += `💰 *Total net à payer :* ${StoreUtils.formatMoney(total)} (Paiement cash à la livraison)\n\n`;
      message += `👤 *Mes Coordonnées :*\n`;
      message += `• Nom complet : ${fullName || "À préciser"}\n`;
      message += `• Téléphone : ${phone || "À préciser"}\n`;
      message += `• Ville : ${city || "À préciser"}\n`;
      if (address) message += `• Adresse : ${address}\n`;
      message += `\nMerci de confirmer la prise en charge de ma commande !`;
    }

    // Save order data locally and to database (async non-blocking)
    const orderData = {
      orderNumber: orderNumber,
      date: new Date().toISOString(),
      customer: {
        fullName: fullName || "Client WhatsApp",
        name: fullName || "Client WhatsApp",
        phone: phone || "",
        email: email || ""
      },
      shippingAddress: {
        address: address || "",
        city: city || "",
        country: "Maroc"
      },
      items: [...items],
      paymentMethod: "WhatsApp (Paiement à la livraison)",
      subtotal: subtotal,
      discount: cart.getDiscountAmount(),
      shipping: cart.getShippingCost(),
      total: total,
      status: "pending_whatsapp"
    };

    try {
      const existingOrders = StoreStorage.get(StoreStorage.KEYS.ORDERS, []);
      existingOrders.unshift(orderData);
      StoreStorage.set(StoreStorage.KEYS.ORDERS, existingOrders);
      sessionStorage.setItem("atelier_latest_order", JSON.stringify(orderData));
      if (typeof fetch === 'function') {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        }).catch(() => {});
      }
    } catch (e) {}

    // Open WhatsApp
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.CheckoutController.init();
});
