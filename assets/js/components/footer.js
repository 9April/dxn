/**
 * Footer Component
 * Newsletter signup handler, Moroccan market footer links, legal policies, and currency.
 * Bilingual: Arabic (RTL) & French (LTR).
 */

window.FooterComponent = {
  mount(containerId = "site-footer-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const config = window.STORE_CONFIG;
    const isAr = window.I18N ? window.I18N.isRTL() : true;

    const brandTitle = isAr ? "دي إكس إن وكالو" : "DXN & KALLOW";
    const brandSub = isAr
      ? "منتجات الصحة والجمال الطبيعي بالمغرب"
      : "Santé, Bien-être & Beauté Naturelle au Maroc";

    container.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <!-- Brand Column -->
            <div class="footer-col-brand">
              <div class="brand-logo" style="color: #FFFFFF; margin-bottom: 12px; align-items: center; gap: 10px;">
                <img src="assets/logo.png" alt="DXN & KALLOW" style="width: 40px; height: 40px; object-fit: contain; border-radius: 6px;">
                <div class="brand-logo-text">
                  <span class="brand-logo-main" style="color: #FFFFFF; font-size: 1.3rem;">${brandTitle}</span>
                  <span class="brand-logo-sub" style="color: #888888; display: block; margin-top: 3px;">
                    ${brandSub}
                  </span>
                </div>
              </div>
              <p style="line-height: 1.7; font-size: 0.9rem;">
                ${isAr 
                  ? "متجرك المعتمد لمنتجات دي إكس إن (DXN) وكالو (Kallow) الطبيعية بالمغرب. نقدم تشكيلة راقية من المكملات العضوية، مستحضرات العناية الفائقة، والقهوة الصحية مع ضمان الجودة 100%."
                  : "Votre boutique officielle pour les produits naturels DXN et Kallow au Maroc. Découvrez nos gammes de compléments alimentaires au Ganoderma, cafés bien-être et soins dermo-cosmétiques certifiés 100% originaux."}
              </p>
              <div style="font-size: 0.84rem; color: #BBBBBB; display: flex; flex-direction: column; gap: 4px; margin-top: 10px;">
                <span>📍 ${isAr ? "طنجة، المملكة المغربية" : "Tanger, Royaume du Maroc"}</span>
                <span>📞 ${config.contact.phone}</span>
                <span>✉️ ${config.contact.email}</span>
              </div>
            </div>

            <!-- Shop Categories -->
            <div>
              <h4 class="footer-heading">${isAr ? "أقسام المتجر" : "Catégories"}</h4>
              <div class="footer-links">
                <a href="shop.html">${isAr ? "جميع المنتجات الطبيعية" : "Tous les Produits"}</a>
                <a href="shop.html?category=kallow">${isAr ? "كالو (Kallow)" : "Gamme Kallow"}</a>
                <a href="shop.html?category=skincare-beauty">${isAr ? "العناية بالبشرة والجمال" : "Soins de la Peau & Beauté"}</a>
                <a href="shop.html?category=personal-care-hygiene">${isAr ? "العناية الشخصية والنظافة" : "Soins Personnels & Hygiène"}</a>
                <a href="shop.html?category=health-supplements">${isAr ? "المكملات الغذائية" : "Compléments Alimentaires"}</a>
                <a href="shop.html?category=beverages-drinks">${isAr ? "المشروبات الصحية والقهوة" : "Boissons Santé & Cafés"}</a>
                <a href="shop.html?category=food-pantry">${isAr ? "الأغذية والمنتجات اليومية" : "Alimentation & Épicerie"}</a>
              </div>
            </div>

            <!-- Customer Service -->
            <div>
              <h4 class="footer-heading">${isAr ? "خدمة العملاء" : "Service Client"}</h4>
              <div class="footer-links">
                <a href="shipping-returns.html">${isAr ? "توصيل سريع 24/48h بالمغرب" : "Livraison Rapide 24/48h au Maroc"}</a>
                <a href="shipping-returns.html#returns">${isAr ? "الدفع عند الاستلام (COD)" : "Paiement à la Livraison (COD)"}</a>
                <a href="contact.html">${isAr ? "تواصل معنا" : "Contactez-nous"}</a>
                <a href="https://wa.me/${config.contact.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(config.contact.whatsappMessage)}" target="_blank" style="color: #25D366; font-weight: 600;">
                  ${isAr ? "دعم واتساب المباشر 💬" : "Assistance WhatsApp Directe 💬"}
                </a>
                <a href="admin.html" style="color: #D4AF37; font-weight: 600;">
                  ${isAr ? "لوحة الإدارة وإدارة المخزون" : "Tableau de Bord Admin & Stocks"}
                </a>
              </div>
            </div>

            <!-- Brand & Social -->
            <div>
              <h4 class="footer-heading">${isAr ? "عن المتجر" : "À Propos"}</h4>
              <div class="footer-links">
                <a href="about.html">${isAr ? "قصتنا ورؤيتنا الصحية" : "Notre Histoire & Vision Santé"}</a>
                <a href="about.html#craft">${isAr ? "ضمان الأصالة والمصداقية" : "Garantie d'Authenticité 100%"}</a>
                <a href="${config.social.instagram}" target="_blank">Instagram</a>
                <a href="${config.social.tiktok}" target="_blank">TikTok</a>
                <a href="${config.social.facebook}" target="_blank">Facebook</a>
              </div>
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="footer-bottom">
            <div>
              &copy; ${new Date().getFullYear()} ${brandTitle}. ${isAr ? "جميع الحقوق محفوظة." : "Tous droits réservés."}
            </div>

            <div style="display: flex; gap: 16px;">
              <a href="shipping-returns.html#privacy">${isAr ? "سياسة الخصوصية" : "Politique de Confidentialité"}</a>
              <span>•</span>
              <a href="shipping-returns.html#terms">${isAr ? "الشروط والأحكام" : "Conditions Générales"}</a>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #CCCCCC;">
              <span>${isAr ? "🇲🇦 المغرب" : "🇲🇦 Maroc"}</span>
              <span>|</span>
              <span>${isAr ? "الدرهم المغربي (درهم)" : "Dirham Marocain (MAD)"}</span>
            </div>
          </div>
        </div>
      </footer>
    `;

    this.bindNewsletter();
  },

  bindNewsletter() {
    const forms = document.querySelectorAll(".newsletter-form");
    const isAr = window.I18N ? window.I18N.isRTL() : true;

    forms.forEach(form => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = form.querySelector(".form-input");
        if (input && input.value.trim().length > 3) {
          const email = input.value.trim();
          try {
            fetch("/api/newsletter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email })
            }).catch(() => {});
          } catch (err) {}

          const msg = isAr 
            ? "شكراً لاشتراكك! تم تسجيل بريدك الإلكتروني بنجاح في نشرتنا البريدية."
            : "Merci pour votre inscription ! Votre adresse email a bien été enregistrée à notre newsletter.";

          if (window.StoreUtils && typeof window.StoreUtils.showToast === "function") {
            StoreUtils.showToast(msg, "success");
          } else {
            alert(msg);
          }
          input.value = "";
        }
      });
    });
  }
};
