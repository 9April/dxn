/**
 * About Page Controller
 * Mounts header, footer, and handles complete bilingual translations (Arabic & French).
 */

document.addEventListener("DOMContentLoaded", () => {
  if (window.HeaderComponent) window.HeaderComponent.mount();
  if (window.FooterComponent) window.FooterComponent.mount();

  const isAr = window.I18N ? window.I18N.isRTL() : true;
  applyAboutTranslations(isAr);
});

function applyAboutTranslations(isAr) {
  document.title = isAr 
    ? "من نحن ورؤيتنا الصحية | دي إكس إن وكالو المغرب"
    : "À Propos & Notre Histoire | DXN & KALLOW Maroc";

  // Breadcrumbs
  const breadcrumbs = document.querySelector(".pdp-breadcrumbs");
  if (breadcrumbs) {
    breadcrumbs.innerHTML = `
      <a href="index.html">${isAr ? 'الرئيسية' : 'Accueil'}</a>
      <span>/</span>
      <span>${isAr ? 'من نحن' : 'À Propos'}</span>
    `;
  }

  // Hero Section
  const heroTag = document.getElementById("about-hero-tag");
  if (heroTag) heroTag.textContent = isAr ? "من نحن ورؤيتنا" : "NOTRE HISTOIRE & MISSION";

  const heroTitle = document.getElementById("about-hero-title");
  if (heroTitle) {
    heroTitle.textContent = isAr 
      ? "شغف الطبيعة ونقاء المكونات لصحتك وجمالك" 
      : "La Passion de la Nature & l'Excellence du Bien-Être";
  }

  const heroDesc = document.getElementById("about-hero-desc");
  if (heroDesc) {
    heroDesc.textContent = isAr
      ? "متجرك المعتمد لمنتجات دي إكس إن (DXN) وكالو (Kallow) الطبيعية بالمغرب. نلتزم بتوفير أرقى منتجات فطر الريشي والسبيرولينا ومستحضرات التجميل الفاخرة لتعزيز صحتك وجمالك الطبيعي."
      : "Votre boutique officielle de référence pour les produits naturels DXN et Kallow au Maroc. Nous nous engageons à offrir l'excellence du Ganoderma (Reishi), de la spiruline et des soins dermo-cosmétiques de haute performance pour votre vitalité et votre bien-être au quotidien.";
  }

  // Genesis Section
  const genBadge = document.getElementById("about-gen-badge");
  if (genBadge) genBadge.textContent = isAr ? "قصتنا وانطلاقتنا" : "ORIGINES & ENGAGEMENT";

  const genTitle = document.getElementById("about-gen-title");
  if (genTitle) genTitle.textContent = isAr ? "لماذا دي إكس إن وكالو في المغرب؟" : "Pourquoi DXN & Kallow au Maroc ?";

  const genP1 = document.getElementById("about-gen-p1");
  if (genP1) {
    genP1.textContent = isAr
      ? "انطلقت فكرتنا من قناعة راسخة: الصحة الحقيقية والجمال الدائم ينبعان من التغذية الخلوية المتوازنة والمكونات الطبيعية النقية. في عالم مليء بالمنتجات المعالجة كيميائياً، أردنا أن نوفر للمستهلك المغربي بديلاً طبيعياً 100%، أصلياً وموثوقاً يجمع بين قوة العلاج الطبي التقليدي وأحدث معايير الجودة العالمية."
      : "Notre mission est née d'une conviction profonde : la véritable santé et la beauté durable proviennent d'une nutrition cellulaire équilibrée et d'actifs naturels purs. Face aux cosmétiques industriels et aux produits ultra-transformés, nous offrons aux consommateurs marocains des solutions 100% naturelles, certifiées et bienfaisantes associant sagesse ancestrale et rigueur scientifique moderne.";
  }

  const genP2 = document.getElementById("about-gen-p2");
  if (genP2) {
    genP2.textContent = isAr
      ? "عبر شراكتنا مع العلامتين الرائدتين عالمياً، DXN المتخصصة في فطر الريشي والأغذية الفائقة، وKallow المتخصصة في مستحضرات العناية الفاخرة المعتمدة على الألوفيرا وزيت الأرغان، نوفر لك حلولاً متكاملة للعناية بالبشرة، دعم المناعة، وتجديد الحيوية اليومية مع توصيل سريع وموثوق لكافة مدن المملكة."
      : "En collaborant directement avec deux marques d'exception — DXN, leader mondial du champignon Reishi (Ganoderma) et des super-aliments bien-être, et Kallow, marque de dermo-cosmétique d'exception sublimant l'aloe vera et les huiles précieuses — nous vous garantissons des soins holistiques d'une efficacité prouvée, livrés rapidement partout au Maroc.";
  }

  const showcaseImg = document.getElementById("about-showcase-img");
  if (showcaseImg) {
    showcaseImg.src = "assets/dxn-africa.jpeg";
  }

  // Pillars Headings
  const pillarsTitle = document.getElementById("about-pillars-title");
  if (pillarsTitle) pillarsTitle.textContent = isAr ? "ركائزنا وقيمنا الأساسية" : "Nos Piliers & Valeurs Fondamentales";

  const pillar1Title = document.getElementById("about-p1-title");
  const pillar1Desc = document.getElementById("about-p1-desc");
  if (pillar1Title) pillar1Title.textContent = isAr ? "🍄 فطر الريشي والأغذية الفائقة (DXN)" : "🍄 Ganoderma & Super-Aliments (DXN)";
  if (pillar1Desc) {
    pillar1Desc.textContent = isAr
      ? "تعتمد منتجات DXN على فطر الجانوديرما لوسيدوم (الفطر الريشي) المعروف بملك الأعشاب، لدعم توازن الجسم، تقوية جهاز المناعة، ومقاومة الإرهاق والسموم بفعالية مثبتة."
      : "Les produits DXN reposent sur le Ganoderma Lucidum (Reishi pur), surnommé le roi des herbes médicinales, pour stimuler l'immunité, détoxifier l'organisme et restaurer une énergie vitale constante.";
  }

  const pillar2Title = document.getElementById("about-p2-title");
  const pillar2Desc = document.getElementById("about-p2-desc");
  if (pillar2Title) pillar2Title.textContent = isAr ? "🌿 العناية الطبيعية الفاخرة (Kallow)" : "🌿 Dermo-Cosmétique Sensorielle (Kallow)";
  if (pillar2Desc) {
    pillar2Desc.textContent = isAr
      ? "تركيبات غنية بالألوفيرا، البابونج، وحمض الهيالورونيك مصممة لترطيب وتغذية وشد البشرة دون مواد كيميائية ضارة، لتمنحك إشراقة شبابية ونضارة طبيعية."
      : "Des formules exclusives enrichies en aloe vera, spiruline, camomille et huiles précieuses pour hydrater, raffermir et illuminer la peau sans aucun composant irritant ni perturbateur.";
  }

  const pillar3Title = document.getElementById("about-p3-title");
  const pillar3Desc = document.getElementById("about-p3-desc");
  if (pillar3Title) pillar3Title.textContent = isAr ? "🚚 خدمة وتوصيل سريع بالمغرب" : "🚚 Engagement & Proximité au Maroc";
  if (pillar3Desc) {
    pillar3Desc.textContent = isAr
      ? "شحن سريع خلال 24 إلى 48 ساعة لجميع مدن المغرب، خدمة الدفع عند الاستلام مع إمكانية فحص المنتج، وخدمة عملاء متخصصة عبر واتساب للإجابة عن كافة استفساراتك."
      : "Livraison express sous 24 à 48h dans toutes les villes du Maroc, paiement en espèces sécurisé à la livraison, et un service client dédié par WhatsApp pour vous conseiller 7j/7.";
  }

  // CTA Section
  const ctaTitle = document.getElementById("about-cta-title");
  if (ctaTitle) ctaTitle.textContent = isAr ? "ابدأ رحلتك نحو صحة وجمال طبيعيين اليوم" : "Commencez Votre Voyage Vers le Bien-Être Naturel";

  const ctaBtn = document.getElementById("about-cta-btn");
  if (ctaBtn) ctaBtn.textContent = isAr ? "تصفح منتجاتنا في المتجر" : "Explorer Notre Boutique en Ligne";
}
