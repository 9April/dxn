/**
 * Contact Page Controller
 * Mounts header, footer, WhatsApp link, and full dynamic bilingual translations.
 */

document.addEventListener("DOMContentLoaded", () => {
  if (window.HeaderComponent) window.HeaderComponent.mount();
  if (window.FooterComponent) window.FooterComponent.mount();

  const isAr = window.I18N ? window.I18N.isRTL() : true;
  applyContactTranslations(isAr);
  setupContactForm(isAr);
});

function applyContactTranslations(isAr) {
  document.title = isAr 
    ? "اتصل بنا وخدمة العملاء | دي إكس إن وكالو المغرب"
    : "Contact & Service Client | DXN & KALLOW Maroc";

  // Breadcrumbs
  const breadcrumbs = document.querySelector(".pdp-breadcrumbs");
  if (breadcrumbs) {
    breadcrumbs.innerHTML = `
      <a href="index.html">${isAr ? 'الرئيسية' : 'Accueil'}</a>
      <span>/</span>
      <span>${isAr ? 'اتصل بنا' : 'Contact'}</span>
    `;
  }

  // Header Title
  const badge = document.getElementById("contact-badge");
  if (badge) badge.textContent = isAr ? "خدمة العملاء والاستشارات" : "ASSISTANCE DÉDIÉE";

  const title = document.getElementById("contact-title");
  if (title) title.textContent = isAr ? "تواصل معنا" : "CONTACTEZ-NOUS";

  const sub = document.getElementById("contact-subtitle");
  if (sub) {
    sub.textContent = isAr
      ? "لديك استفسار حول المنتجات، طلبيتك، أو طريقة الاستخدام؟ فريقنا في المغرب رهن إشارتك لتقديم أفضل النصائح الصحية والمتابعة السريعة."
      : "Une question sur nos produits naturels, votre commande ou leur mode d'utilisation ? Notre équipe au Maroc vous répond avec plaisir et bienveillance.";
  }

  // Info Column Headings
  const directHeading = document.getElementById("contact-direct-heading");
  if (directHeading) directHeading.textContent = isAr ? "قنوات التواصل المباشرة" : "COORDONNÉES DIRECTES";

  const waHeading = document.getElementById("contact-wa-heading");
  if (waHeading) waHeading.textContent = isAr ? "دعم واتساب الفوري والمباشر" : "Support WhatsApp Direct";

  const waDesc = document.getElementById("contact-wa-desc");
  if (waDesc) {
    waDesc.textContent = isAr
      ? "إجابة سريعة واستشارات فورية خلال أقل من 30 دقيقة (من الإثنين إلى السبت : 09:00 - 20:00)"
      : "Réponse rapide et conseils personnalisés en moins de 30 minutes (Lun - Sam : 9h-20h)";
  }

  const waBtn = document.getElementById("contact-wa-btn");
  if (waBtn) waBtn.textContent = isAr ? "تواصل عبر واتساب الآن 💬" : "OUVRIR WHATSAPP →";

  // Contact details labels
  const lblHub = document.getElementById("contact-lbl-hub");
  if (lblHub) lblHub.textContent = isAr ? "📍 مركز التوزيع والخدمة" : "📍 Centre de Distribution & Siège";

  const hubText = document.getElementById("contact-hub-text");
  if (hubText) hubText.textContent = isAr ? "طنجة، المملكة المغربية" : "Tanger, Royaume du Maroc";

  const phoneText = document.getElementById("contact-phone-text");
  if (phoneText && config.contact && config.contact.phone) {
    phoneText.textContent = config.contact.phone;
  }

  const lblPhone = document.getElementById("contact-lbl-phone");
  if (lblPhone) lblPhone.textContent = isAr ? "📞 الهاتف المباشر" : "📞 Téléphone";

  const lblEmail = document.getElementById("contact-lbl-email");
  if (lblEmail) lblEmail.textContent = isAr ? "✉️ البريد الإلكتروني" : "✉️ Email";

  const lblHours = document.getElementById("contact-lbl-hours");
  if (lblHours) lblHours.textContent = isAr ? "🕒 أوقات العمل والدعم" : "🕒 Horaires de Support";

  const hoursText = document.getElementById("contact-hours-text");
  if (hoursText) hoursText.textContent = isAr ? "من الإثنين إلى السبت : 09:00 - 20:00" : "Du Lundi au Samedi : 09h00 - 20h00";

  // Form
  const formHeading = document.getElementById("contact-form-heading");
  if (formHeading) formHeading.textContent = isAr ? "أرسل لنا رسالة مباشرة" : "ENVOYEZ-NOUS UN MESSAGE";

  const lblName = document.getElementById("contact-lbl-name");
  if (lblName) lblName.textContent = isAr ? "الاسم الكامل *" : "Nom complet *";

  const lblTel = document.getElementById("contact-lbl-tel");
  if (lblTel) lblTel.textContent = isAr ? "رقم الهاتف بالمغرب *" : "Numéro de Téléphone (Maroc) *";

  const lblMail = document.getElementById("contact-lbl-mail");
  if (lblMail) lblMail.textContent = isAr ? "البريد الإلكتروني *" : "Adresse Email *";

  const lblSubj = document.getElementById("contact-lbl-subj");
  if (lblSubj) lblSubj.textContent = isAr ? "موضوع الرسالة" : "Sujet de votre demande";

  const subjSelect = document.getElementById("c-subject");
  if (subjSelect) {
    subjSelect.innerHTML = isAr ? `
      <option value="advice">استشارة حول المنتجات وطريقة الاستخدام</option>
      <option value="order">متابعة وتأكيد طلبية</option>
      <option value="shipping">استفسار حول مدة وتكلفة الشحن</option>
      <option value="wholesale">طلبات الجملة والشراكة</option>
      <option value="other">استفسار عام آخر</option>
    ` : `
      <option value="advice">Conseils produits & mode d'utilisation</option>
      <option value="order">Suivi & confirmation de commande</option>
      <option value="shipping">Délais & modalités de livraison</option>
      <option value="wholesale">Commandes groupées & Partenariat</option>
      <option value="other">Autre demande générale</option>
    `;
  }

  const lblMsg = document.getElementById("contact-lbl-msg");
  if (lblMsg) lblMsg.textContent = isAr ? "نص الرسالة *" : "Votre message *";

  const msgInput = document.getElementById("c-message");
  if (msgInput) {
    msgInput.placeholder = isAr ? "اكتب استفسارك هنا..." : "Écrivez votre message ici...";
  }

  const submitBtn = document.getElementById("contact-submit-btn");
  if (submitBtn) submitBtn.textContent = isAr ? "إرسال الرسالة الآن ⚡" : "ENVOYER LE MESSAGE ⚡";

  // Setup WhatsApp Link
  const config = window.STORE_CONFIG || {};
  const waLink = document.getElementById("contact-wa-link");
  if (waLink && config.contact) {
    const rawNumber = (config.contact.whatsapp || "+212708873060").replace(/[^\d]/g, '');
    const prefill = isAr 
      ? "السلام عليكم، أود الاستفسار عن منتجات دي إكس إن وكالو."
      : "Bonjour, je souhaite des informations sur vos produits naturels DXN & Kallow.";
    waLink.href = `https://wa.me/${rawNumber}?text=${encodeURIComponent(prefill)}`;
  }
}

function setupContactForm(isAr) {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("c-name")?.value.trim() || "";
    const successMsg = isAr 
      ? `✓ شكراً لك يا ${name}! تم استلام رسالتك وسيتواصل معك فريقنا في أقرب وقت.`
      : `✓ Merci ${name} ! Votre message a bien été envoyé. Notre équipe vous répondra très rapidement.`;

    if (window.StoreToast) {
      window.StoreToast.show(successMsg, "success");
    } else {
      alert(successMsg);
    }
    form.reset();
  });
}
