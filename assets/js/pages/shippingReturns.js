/**
 * Shipping & Returns Page Controller
 * Handles dynamic bilingual translations (Arabic & French) for shipping delays,
 * Moroccan city rates, Cash on Delivery, and authenticity & return guarantees.
 */

document.addEventListener("DOMContentLoaded", () => {
  if (window.HeaderComponent) window.HeaderComponent.mount();
  if (window.FooterComponent) window.FooterComponent.mount();

  const isAr = window.I18N ? window.I18N.isRTL() : true;
  applyShippingTranslations(isAr);
});

function applyShippingTranslations(isAr) {
  document.title = isAr 
    ? "الشحن والتوصيل بالمغرب | دي إكس إن وكالو المغرب"
    : "Livraison & Retours au Maroc | DXN & KALLOW Maroc";

  // Breadcrumbs
  const breadcrumbs = document.querySelector(".pdp-breadcrumbs");
  if (breadcrumbs) {
    breadcrumbs.innerHTML = `
      <a href="index.html">${isAr ? 'الرئيسية' : 'Accueil'}</a>
      <span>/</span>
      <span>${isAr ? 'الشحن والتوصيل بالمغرب' : 'Livraison & Retours'}</span>
    `;
  }

  // Header Title & Subtitle
  const badge = document.getElementById("ship-badge");
  if (badge) badge.textContent = isAr ? "التوصيل والضمانات بالمغرب" : "EXPÉDITIONS & GARANTIES AU MAROC";

  const title = document.getElementById("ship-title");
  if (title) title.textContent = isAr ? "الشحن، التوصيل وسياسة الضمان بالمغرب" : "LIVRAISON & GARANTIES AU MAROC";

  const subtitle = document.getElementById("ship-subtitle");
  if (subtitle) {
    subtitle.textContent = isAr
      ? "كافة المعلومات العملية حول مواعيد الشحن السريع لكافة المدن المغربية، خدمة الدفع عند الاستلام، وضمان جودة وأصالة منتجاتنا الطبيعية 100%."
      : "Toutes les informations pratiques sur nos expéditions express dans tout le Maroc, le paiement à la livraison et notre garantie d'authenticité 100%.";
  }

  // Section 1: Delays & Rates
  const s1Title = document.getElementById("ship-s1-title");
  if (s1Title) s1Title.textContent = isAr ? "1. مواعيد وأسعار التوصيل السريع" : "1. DÉLAIS & TARIFS DE LIVRAISON EXPRESS";

  const s1Desc = document.getElementById("ship-s1-desc");
  if (s1Desc) {
    s1Desc.textContent = isAr
      ? "تُشحن جميع الطلبيات يومياً من مركزنا اللوجستي بطنجة عبر شبكة شركائنا لنقل الإرساليات السريعة لضمان وصول المنتجات في أفضل ظروف الحفظ والسلامة."
      : "Toutes les commandes sont expédiées quotidiennement depuis notre centre logistique à Tanger via nos transporteurs partenaires express pour préserver la qualité optimale des produits.";
  }

  const s1List = document.getElementById("ship-s1-list");
  if (s1List) {
    s1List.innerHTML = isAr ? `
      <li><strong>طنجة، تطوان، أصيلة :</strong> التوصيل خلال 24 ساعة عمل (35 درهم أو <strong>مجاناً للطلبيات ابتداءً من 500 درهم</strong>).</li>
      <li><strong>الدار البيضاء، الرباط، القنيطرة، مراكش، فاس، مكناس، أكادير، وجدة :</strong> التوصيل خلال 24 إلى 48 ساعة عمل (35 درهم أو <strong>مجاناً ابتداءً من 500 درهم</strong>).</li>
      <li><strong>الأقاليم الجنوبية وباقي المدن (العيون، الداخلة، الناظور، بني ملال، خريبكة...) :</strong> التوصيل خلال 48 إلى 72 ساعة عمل.</li>
    ` : `
      <li><strong>Tanger, Tétouan & Asilah :</strong> Livraison en 24h ouvrables (35 MAD ou <strong>GRATUITE dès 500 MAD</strong> d'achat).</li>
      <li><strong>Casablanca, Rabat, Kénitra, Marrakech, Fès, Meknès, Agadir, Oujda :</strong> Livraison sous 24 à 48h ouvrables (35 MAD ou <strong>GRATUITE dès 500 MAD</strong>).</li>
      <li><strong>Provinces du Sud et autres villes (Laâyoune, Dakhla, Nador, Béni Mellal, Khouribga...) :</strong> Livraison sous 48 à 72h ouvrables.</li>
    `;
  }

  // Section 2: COD
  const s2Title = document.getElementById("ship-s2-title");
  if (s2Title) s2Title.textContent = isAr ? "2. الدفع عند الاستلام (Cash on Delivery)" : "2. PAIEMENT SÉCURISÉ À LA LIVRAISON (COD)";

  const s2Desc1 = document.getElementById("ship-s2-desc1");
  if (s2Desc1) {
    s2Desc1.innerHTML = isAr
      ? "حرصاً على راحتكم وثقتكم التامة، نعتمد نظام <strong>الدفع نقداً عند استلام طلبيتك وفحصها</strong>."
      : "Pour votre confort et votre sécurité absolue, nous privilégions le <strong>paiement en espèces à la livraison</strong> après vérification de votre colis.";
  }

  const s2Desc2 = document.getElementById("ship-s2-desc2");
  if (s2Desc2) {
    s2Desc2.textContent = isAr
      ? "يتصل بكم المندوب هاتفياً لتحديد وقت ومكان التسليم المناسب. تفحصون طردكم وتدفعون المبلغ الدقيق لطلبيتكم بالدرهم المغربي دون أي رسوم إضافية مخفية."
      : "Le livreur vous contacte systématiquement par téléphone avant son passage pour convenir du créneau exact. Vous vérifiez votre colis et réglez le montant exact en dirhams marocains (MAD), sans aucun frais caché.";
  }

  // Section 3: Guarantee & Authenticity
  const s3Title = document.getElementById("ship-s3-title");
  if (s3Title) s3Title.textContent = isAr ? "3. ضمان الأصالة والمطابقة 100%" : "3. GARANTIE D'AUTHENTICITÉ & CONFORMITÉ 100%";

  const s3Desc1 = document.getElementById("ship-s3-desc1");
  if (s3Desc1) {
    s3Desc1.innerHTML = isAr
      ? "جميع منتجات دي إكس إن (DXN) وكالو (Kallow) المتوفرة بمتجرنا <strong>أصلية، معتمدة ومحفوظة وفق أعلى معايير السلامة الصحية</strong>، ومغلفة بختم المصنع الأصلي."
      : "Tous les produits DXN et Kallow disponibles sur notre boutique sont <strong>100% originaux, certifiés et scellés d'origine</strong> conformément aux normes sanitaires les plus strictes.";
  }

  const s3CondTitle = document.getElementById("ship-s3-cond-title");
  if (s3CondTitle) s3CondTitle.textContent = isAr ? "سياسة الاستبدال والتعويض :" : "Conditions d'échange & de conformité :";

  const s3List = document.getElementById("ship-s3-list");
  if (s3List) {
    s3List.innerHTML = isAr ? `
      <li>في حال استلام منتج تالف أو غير مطابق لطلبكم، نتحمل مسؤولية استبداله فوراً وبشكل مجاني خلال <strong>7 أيام عمل</strong>.</li>
      <li>يجب أن تظل المنتجات بغلافها الأصلي غير مفتوح حفاظاً على السلامة الصحية للمكملات ومستحضرات التجميل.</li>
      <li>لطلب الاستبدال، يكفي إرسال رسالة مباشرة إلى فريق الدعم عبر واتساب مصحوبة برقم طلبيتك وصورة للمنتج.</li>
    ` : `
      <li>En cas de produit non conforme ou endommagé durant le transport, nous prenons en charge son remplacement immédiat et gratuit sous <strong>7 jours ouvrables</strong>.</li>
      <li>Les produits doivent être intacts, dans leur emballage protecteur d'origine non descellé pour préserver la sécurité sanitaire des compléments et soins.</li>
      <li>Pour toute demande, un simple message à notre support WhatsApp avec votre numéro de commande et une photo suffit.</li>
    `;
  }

  const s3ContactText = document.getElementById("ship-s3-contact");
  if (s3ContactText) {
    s3ContactText.innerHTML = isAr
      ? "لأي استفسار بخصوص شحنتكم، تواصلوا معنا مباشرة عبر واتساب على الرقم <strong>+212 708-873060</strong>."
      : "Pour toute assistance concernant votre expédition, contactez directement notre support WhatsApp au <strong>+212 708-873060</strong>.";
  }

  // Section 4: Privacy
  const s4Title = document.getElementById("ship-s4-title");
  if (s4Title) s4Title.textContent = isAr ? "4. الخصوصية وحماية البيانات الشخصية" : "4. CONFIDENTIALITÉ & PROTECTION DES DONNÉES";

  const s4Desc = document.getElementById("ship-s4-desc");
  if (s4Desc) {
    s4Desc.textContent = isAr
      ? "امتثالاً للقوانين الجاري بها العمل بالمملكة المغربية (القانون رقم 09-08)، تُستخدم بياناتكم الشخصية (الاسم، رقم الهاتف، العنوان) حصرياً لمعالجة وتسليم طلبياتكم ولا يتم مشاركتها أبداً مع أي طرف ثالث."
      : "Conformément aux réglementations en vigueur au Maroc (loi 09-08), vos coordonnées (nom, téléphone, adresse) sont utilisées exclusivement pour l'acheminement de vos commandes et ne sont jamais transmises à des tiers sans votre accord.";
  }
}
