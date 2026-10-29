/**
 * Homepage Controller
 * Mounts hero banner, featured collection, brand statement, categories grid,
 * wellness routines banner, 4-pillar trust badges, new arrivals, and newsletter.
 * Full bilingual support (Arabic & French).
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mount Header & Footer
  if (window.HeaderComponent) window.HeaderComponent.mount();
  if (window.FooterComponent) window.FooterComponent.mount();

  const isAr = window.I18N ? window.I18N.isRTL() : true;
  let deletedIds = [];
  try {
    const rawDeleted = localStorage.getItem("atelier_deleted_product_ids_v2");
    if (rawDeleted) deletedIds = JSON.parse(rawDeleted);
  } catch(e) {}
  const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);

  const products = (window.STORE_PRODUCTS || []).filter(p => 
    p && 
    !deletedSet.has(p.id) && 
    p.status !== 'disabled' && 
    p.isActive !== false && 
    p.disabled !== true
  );
  const categories = window.STORE_CATEGORIES || [];

  let featuredSliderInstance = null;
  let arrivalsSliderInstance = null;

  // 3. Render Product Grids & Mount Sliders
  const renderGrids = () => {
    // 3a. Best-Sellers Focus Slider
    const featuredItems = products.filter(p => p.isFeatured && !p.isBundle && p.id !== 'pack-trio-tshirts');
    if (featuredSliderInstance && typeof featuredSliderInstance.destroy === 'function') {
      featuredSliderInstance.destroy();
    }
    featuredSliderInstance = initFeaturedSlider(featuredItems);

    // 3b. New Arrivals & Daily Selections with Daily Random Switch
    if (arrivalsSliderInstance && typeof arrivalsSliderInstance.destroy === 'function') {
      arrivalsSliderInstance.destroy();
    }
    const candidateArrivals = products.filter(p => !p.isBundle && p.id !== 'pack-trio-tshirts');
    const dailyArrivals = getDailyShuffledProducts(candidateArrivals, 16);
    arrivalsSliderInstance = initArrivalsSlider(dailyArrivals);
  };

  function initFeaturedSlider(featuredItems) {
    const track = document.getElementById("featured-products-grid");
    const container = document.getElementById("featured-slider-container");
    const prevBtn = document.getElementById("featured-slider-prev");
    const nextBtn = document.getElementById("featured-slider-next");
    const dotsContainer = document.getElementById("featured-slider-dots");
    if (!track || !featuredItems || featuredItems.length === 0) return null;

    // Render slides wrapped in .featured-slider-slide
    track.innerHTML = featuredItems.map((p, idx) => `
      <div class="featured-slider-slide" data-index="${idx}">
        ${window.ProductCardComponent.render(p)}
      </div>
    `).join('');

    const slides = Array.from(track.querySelectorAll('.featured-slider-slide'));
    const total = slides.length;
    let currentIndex = 0;
    let autoPlayTimer = null;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w > 991) return 5;
      if (w > 768) return 3;
      return 1;
    }

    function getMaxIndex() {
      const visible = getVisibleCount();
      return Math.max(0, total - visible);
    }

    function updateSlideStates() {
      const visibleCount = getVisibleCount();
      const isRtl = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';

      // Clean old classes
      slides.forEach(slide => {
        slide.classList.remove('is-side', 'is-side-left', 'is-side-right', 'is-middle', 'is-center');
      });

      if (visibleCount === 5) {
        // Desktop: 1 side left (faded), 3 in middle (focused), 1 side right (faded)
        slides.forEach((slide, idx) => {
          const relPos = idx - currentIndex;
          if (relPos === 0) {
            slide.classList.add('is-side', 'is-side-left');
          } else if (relPos === 1 || relPos === 3) {
            slide.classList.add('is-middle');
          } else if (relPos === 2) {
            slide.classList.add('is-middle', 'is-center');
          } else if (relPos === 4) {
            slide.classList.add('is-side', 'is-side-right');
          } else {
            slide.classList.add('is-side');
          }
        });
      } else if (visibleCount === 3) {
        // Tablet: 1 side left, 1 middle center, 1 side right
        slides.forEach((slide, idx) => {
          const relPos = idx - currentIndex;
          if (relPos === 0) {
            slide.classList.add('is-side', 'is-side-left');
          } else if (relPos === 1) {
            slide.classList.add('is-middle', 'is-center');
          } else if (relPos === 2) {
            slide.classList.add('is-side', 'is-side-right');
          } else {
            slide.classList.add('is-side');
          }
        });
      } else {
        // Mobile: 1 center card focused
        slides.forEach((slide, idx) => {
          if (idx === currentIndex) {
            slide.classList.add('is-middle', 'is-center');
          } else {
            slide.classList.add('is-side');
          }
        });
      }

      // Smooth translation & mobile viewport centering
      if (slides.length > 0) {
        const firstSlide = slides[0];
        const slideRect = firstSlide.getBoundingClientRect();
        const gap = window.innerWidth <= 768 ? 14 : 18;
        const step = slideRect.width + gap;
        let offset = currentIndex * step;

        if (visibleCount === 1) {
          const viewport = container.querySelector('.featured-slider-viewport') || container;
          const viewportWidth = viewport.clientWidth || window.innerWidth;
          const centerMargin = (viewportWidth - slideRect.width) / 2;
          offset = currentIndex * step - centerMargin;
        }

        if (isRtl) {
          track.style.transform = `translateX(${offset}px)`;
        } else {
          track.style.transform = `translateX(-${offset}px)`;
        }
      }

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.featured-slider-dot');
        const dotCount = dots.length;
        if (dotCount > 0) {
          const maxIndex = getMaxIndex();
          const activeDotIdx = maxIndex > 0 ? Math.round((currentIndex / maxIndex) * (dotCount - 1)) : 0;
          dots.forEach((dot, dIdx) => {
            dot.classList.toggle('active', dIdx === activeDotIdx);
          });
        }
      }
    }

    function goTo(index) {
      const maxIndex = getMaxIndex();
      if (index > maxIndex) {
        currentIndex = 0; // Wrap around smoothly
      } else if (index < 0) {
        currentIndex = maxIndex;
      } else {
        currentIndex = index;
      }
      updateSlideStates();
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    // Render Dots
    if (dotsContainer) {
      const maxIndex = getMaxIndex();
      const dotCount = Math.min(maxIndex + 1, 8);
      dotsContainer.innerHTML = Array.from({ length: dotCount }, (_, i) => `
        <button class="featured-slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>
      `).join('');

      dotsContainer.onclick = (e) => {
        const dot = e.target.closest('.featured-slider-dot');
        if (dot) {
          const dIdx = parseInt(dot.getAttribute('data-index'));
          const maxIdx = getMaxIndex();
          const targetIndex = Math.round((dIdx / (dotCount - 1)) * maxIdx);
          goTo(targetIndex);
          restartAutoplay();
        }
      };
    }

    // Prev / Next button listeners
    if (prevBtn) {
      prevBtn.onclick = () => {
        prev();
        restartAutoplay();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        next();
        restartAutoplay();
      };
    }

    // Clicking on faded side slides or any slide smoothly centers it into the middle!
    slides.forEach((slide, idx) => {
      slide.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        const visibleCount = getVisibleCount();
        const centerOffset = Math.floor(visibleCount / 2);
        const targetIndex = Math.max(0, Math.min(getMaxIndex(), idx - centerOffset));
        if (targetIndex !== currentIndex) {
          goTo(targetIndex);
          restartAutoplay();
        }
      });
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      pauseAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      const isRtl = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          if (isRtl) prev(); else next();
        } else {
          if (isRtl) next(); else prev();
        }
      }
      restartAutoplay();
    }, { passive: true });

    // Autoplay
    function startAutoplay() {
      stopAutoplay();
      autoPlayTimer = setInterval(() => {
        next();
      }, 3500);
    }

    function stopAutoplay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function pauseAutoplay() {
      stopAutoplay();
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (container) {
      container.addEventListener('mouseenter', pauseAutoplay);
      container.addEventListener('mouseleave', startAutoplay);
    }

    // Resize listener with debounce
    let resizeTimer;
    const resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateSlideStates();
      }, 100);
    };
    window.addEventListener('resize', resizeHandler);

    // Initial positioning after DOM layout settles
    requestAnimationFrame(() => {
      updateSlideStates();
      setTimeout(updateSlideStates, 80);
    });
    startAutoplay();

    return {
      destroy: () => {
        stopAutoplay();
        window.removeEventListener('resize', resizeHandler);
      },
      update: () => {
        updateSlideStates();
      }
    };
  }

  // Deterministic daily pseudo-random generator: switches products every single day consistently
  function getDailySeed() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function seededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function getDailyShuffledProducts(candidateProducts, count = 16) {
    if (!candidateProducts || candidateProducts.length === 0) return [];
    const seed = getDailySeed();
    const rng = seededRandom(seed);
    const arr = [...candidateProducts];
    // Fisher-Yates shuffle with daily seed
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
  }

  function initArrivalsSlider(dailyArrivals) {
    const track = document.getElementById("new-arrivals-grid");
    const container = document.getElementById("arrivals-slider-container");
    const prevBtn = document.getElementById("arrivals-slider-prev");
    const nextBtn = document.getElementById("arrivals-slider-next");
    const dotsContainer = document.getElementById("arrivals-slider-dots");
    if (!track || !dailyArrivals || dailyArrivals.length === 0) return null;

    // Render slides wrapped in .arrivals-slider-slide
    track.innerHTML = dailyArrivals.map((p, idx) => `
      <div class="arrivals-slider-slide" data-index="${idx}">
        ${window.ProductCardComponent.render(p)}
      </div>
    `).join('');

    const slides = Array.from(track.querySelectorAll('.arrivals-slider-slide'));
    const total = slides.length;
    let currentIndex = 0;
    let autoPlayTimer = null;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w > 1100) return 4;
      if (w > 768) return 3;
      return 1;
    }

    function getMaxIndex() {
      const visible = getVisibleCount();
      return Math.max(0, total - visible);
    }

    function updateTrackPosition() {
      const isRtl = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
      const visibleCount = getVisibleCount();
      if (slides.length > 0) {
        const firstSlide = slides[0];
        const slideRect = firstSlide.getBoundingClientRect();
        const gap = window.innerWidth <= 768 ? 14 : (window.innerWidth <= 1100 ? 16 : 20);
        const step = slideRect.width + gap;
        let offset = currentIndex * step;

        if (visibleCount === 1) {
          const viewport = container.querySelector('.arrivals-slider-viewport') || container;
          const viewportWidth = viewport.clientWidth || window.innerWidth;
          const centerMargin = (viewportWidth - slideRect.width) / 2;
          offset = currentIndex * step - centerMargin;
        }

        if (isRtl) {
          track.style.transform = `translateX(${offset}px)`;
        } else {
          track.style.transform = `translateX(-${offset}px)`;
        }
      }

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.arrivals-slider-dot');
        const dotCount = dots.length;
        if (dotCount > 0) {
          const maxIndex = getMaxIndex();
          const activeDotIdx = maxIndex > 0 ? Math.round((currentIndex / maxIndex) * (dotCount - 1)) : 0;
          dots.forEach((dot, dIdx) => {
            dot.classList.toggle('active', dIdx === activeDotIdx);
          });
        }
      }
    }

    function goTo(index) {
      const maxIndex = getMaxIndex();
      if (index > maxIndex) {
        currentIndex = 0;
      } else if (index < 0) {
        currentIndex = maxIndex;
      } else {
        currentIndex = index;
      }
      updateTrackPosition();
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    // Render Dots
    if (dotsContainer) {
      const maxIndex = getMaxIndex();
      const dotCount = Math.min(maxIndex + 1, 8);
      dotsContainer.innerHTML = Array.from({ length: dotCount }, (_, i) => `
        <button class="arrivals-slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>
      `).join('');

      dotsContainer.onclick = (e) => {
        const dot = e.target.closest('.arrivals-slider-dot');
        if (dot) {
          const dIdx = parseInt(dot.getAttribute('data-index'));
          const maxIdx = getMaxIndex();
          const targetIndex = Math.round((dIdx / (dotCount - 1)) * maxIdx);
          goTo(targetIndex);
          restartAutoplay();
        }
      };
    }

    // Prev / Next button listeners
    if (prevBtn) {
      prevBtn.onclick = () => {
        prev();
        restartAutoplay();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        next();
        restartAutoplay();
      };
    }

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      pauseAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      const isRtl = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          if (isRtl) prev(); else next();
        } else {
          if (isRtl) next(); else prev();
        }
      }
      restartAutoplay();
    }, { passive: true });

    // Autoplay (every 3.5s)
    function startAutoplay() {
      stopAutoplay();
      autoPlayTimer = setInterval(() => {
        next();
      }, 3500);
    }

    function stopAutoplay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function pauseAutoplay() {
      stopAutoplay();
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    if (container) {
      container.addEventListener('mouseenter', pauseAutoplay);
      container.addEventListener('mouseleave', startAutoplay);
    }

    // Resize listener with debounce
    let resizeTimer;
    const resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateTrackPosition();
      }, 100);
    };
    window.addEventListener('resize', resizeHandler);

    requestAnimationFrame(() => {
      updateTrackPosition();
      setTimeout(updateTrackPosition, 80);
    });
    startAutoplay();

    return {
      destroy: () => {
        stopAutoplay();
        window.removeEventListener('resize', resizeHandler);
      },
      update: () => {
        updateTrackPosition();
      }
    };
  }

  renderGrids();

  // 2. Apply Page Content Translations
  applyHomeTranslations(isAr);
  window.addEventListener("language:changed", (e) => {
    const newIsAr = e.detail && e.detail.lang === "ar";
    applyHomeTranslations(newIsAr);
    renderGrids();
    renderCategoryGrid(newIsAr);
  });

  // 5. Render Category Grid Cards (Main Departments)
  const categoryGrid = document.getElementById("category-grid-container");
  const objPosMap = {
    'A': 'left',
    'B': 'right',
    'D': 'right',
    'E': 'right',
    'K': 'center'
  };

  function renderCategoryGrid(currentIsAr) {
    if (!categoryGrid) return;
    const mainCategories = window.CategoryManager 
      ? window.CategoryManager.getMainCategories() 
      : (window.STORE_MAIN_CATEGORIES || []);

    categoryGrid.innerHTML = mainCategories.map(main => {
      const isAvailable = main.active !== false;
      const link = isAvailable ? `shop.html?category=${main.slug}` : `javascript:void(0)`;
      const catName = currentIsAr ? (main.nameAr || main.name) : (main.nameFr || main.name);

      // Recalculate live product count for this main department
      const count = products.filter(p => !p.isBundle && p.id !== 'pack-trio-tshirts' && (
        (main.slug === 'kallow' && (p.brand === 'Kallow' || (p.id && p.id.startsWith('kallow')) || (Array.isArray(p.collections) && p.collections.includes('kallow')))) ||
        (main.subcategories || []).includes(p.category) ||
        p.categoryGroup === main.slug ||
        p.mainCategory === main.slug
      )).length;

      const subPreview = currentIsAr ? (main.subPreviewAr || '') : (main.subPreviewFr || '');
      const codeLabel = currentIsAr ? `قسم ${main.code}` : `Rayon ${main.code}`;
      const ctaLabel = currentIsAr ? 'استكشف' : 'Découvrir';
      const objPos = objPosMap[main.code] ? `object-position: ${objPosMap[main.code]};` : '';

      return `
        <a href="${link}" class="category-card ${!isAvailable ? 'inactive' : ''}" data-category-slug="${main.slug}" data-category-code="${main.code}">
          <img src="${main.image}" alt="${catName}" class="category-card-bg" style="${objPos}" loading="lazy">
          <div class="category-card-overlay"></div>
          <div class="category-card-badge">
            <span>${main.icon || '🌿'}</span>
            <span>${codeLabel}</span>
          </div>
          <div class="category-card-content">
            <span class="category-card-eyebrow">${codeLabel}</span>
            <h3 class="category-card-title">${catName}</h3>
            ${subPreview ? `<p class="category-card-subpreview">${subPreview}</p>` : ''}
            <div class="category-card-foot-row">
              <span class="category-card-count-badge">${count} ${currentIsAr ? 'منتج' : 'articles'}</span>
              <span class="category-card-link-cta">${ctaLabel} ${currentIsAr ? '←' : '→'}</span>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }

  renderCategoryGrid(isAr);

  // 5b. Brand Statement Video Sound Toggle & Autoplay Trigger
  const soundBtn = document.getElementById("brand-video-sound-btn");
  const soundIcon = document.getElementById("brand-sound-icon");
  const videoIframe = document.getElementById("brand-statement-iframe");
  let isVideoMuted = true;

  function triggerVideoPlay() {
    if (videoIframe && videoIframe.contentWindow) {
      try {
        videoIframe.contentWindow.postMessage(JSON.stringify({
          event: "command",
          func: "playVideo",
          args: []
        }), "*");
        videoIframe.contentWindow.postMessage(JSON.stringify({
          event: "command",
          func: "mute",
          args: []
        }), "*");
      } catch (err) {}
    }
  }

  if (videoIframe) {
    videoIframe.addEventListener("load", () => {
      setTimeout(triggerVideoPlay, 400);
      setTimeout(triggerVideoPlay, 1200);
    });
    ["scroll", "touchstart", "click"].forEach(evt => {
      window.addEventListener(evt, triggerVideoPlay, { once: true, passive: true });
    });
    setTimeout(triggerVideoPlay, 800);
    setTimeout(triggerVideoPlay, 2200);
  }

  if (soundBtn && videoIframe) {
    soundBtn.addEventListener("click", () => {
      isVideoMuted = !isVideoMuted;
      const cmd = isVideoMuted ? "mute" : "unMute";
      try {
        videoIframe.contentWindow.postMessage(JSON.stringify({
          event: "command",
          func: cmd,
          args: []
        }), "*");
      } catch (err) {}
      if (soundIcon) {
        soundIcon.textContent = isVideoMuted ? "🔇" : "🔊";
      }
      soundBtn.title = isVideoMuted 
        ? (isAr ? "تشغيل الصوت" : "Activer le son") 
        : (isAr ? "كتم الصوت" : "Couper le son");
    });
  }

  // 5c. Bundle Section Fading Products Controller (Not a slider, smooth cross-fade)
  function initBundleFadeShowcase() {
    const showcase = document.getElementById("bundle-fade-showcase");
    const indicators = document.getElementById("bundle-fade-indicators");
    if (!showcase) return;

    const groups = Array.from(showcase.querySelectorAll(".bundle-fade-group"));
    if (groups.length <= 1) return;

    let currentGroupIdx = 0;
    let fadeTimer = null;

    function showGroup(idx) {
      currentGroupIdx = (idx + groups.length) % groups.length;
      groups.forEach((g, i) => {
        g.classList.toggle("active", i === currentGroupIdx);
      });
      if (indicators) {
        const dots = indicators.querySelectorAll(".bundle-fade-dot");
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === currentGroupIdx);
        });
      }
    }

    function nextGroup() {
      showGroup(currentGroupIdx + 1);
    }

    function startTimer() {
      stopTimer();
      fadeTimer = setInterval(nextGroup, 3600);
    }

    function stopTimer() {
      if (fadeTimer) clearInterval(fadeTimer);
    }

    showcase.addEventListener("mouseenter", stopTimer);
    showcase.addEventListener("mouseleave", startTimer);

    if (indicators) {
      indicators.addEventListener("click", (e) => {
        const dot = e.target.closest(".bundle-fade-dot");
        if (dot) {
          const idx = parseInt(dot.getAttribute("data-index"), 10);
          showGroup(idx);
          startTimer();
        }
      });
    }

    startTimer();
  }

  initBundleFadeShowcase();

  // 6. Newsletter form submission
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const email = input ? input.value.trim() : "";
      if (!email) return;

      try {
        await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const msg = isAr ? "✓ تم الاشتراك بنجاح في النشرة البريدية!" : "✓ Inscription réussie à la newsletter !";
        if (window.StoreToast) {
          window.StoreToast.show(msg, "success");
        } else {
          alert(msg);
        }
        input.value = "";
      } catch (err) {
        const msg = isAr ? "✓ شكراً لاشتراكك!" : "✓ Inscription prise en compte !";
        if (window.StoreToast) window.StoreToast.show(msg, "success");
        input.value = "";
      }
    });
  }
});

function applyHomeTranslations(isAr) {
  // Document Title
  document.title = isAr 
    ? "دي إكس إن وكالو المغرب | متجر الصحة والجمال الطبيعي 100%"
    : "DXN & KALLOW Maroc | Boutique Santé, Bien-Être & Beauté 100% Naturelle";

  // Hero Background Banner (Header Ar.png for Arabic, Header fr.png for French)
  const heroImg = document.getElementById("home-hero-bg-img");
  if (heroImg) {
    heroImg.src = isAr ? "assets/Header/Header Ar.png" : "assets/Header/Header fr.png";
    heroImg.alt = isAr ? "منتجات دي إكس إن وكالو الطبيعية بالمغرب" : "Produits Naturels DXN & Kallow Maroc";
  }

  // Hero Section
  const heroTagline = document.getElementById("home-hero-tagline");
  if (heroTagline) {
    heroTagline.textContent = isAr 
      ? "🌿 DXN & KALLOW MAROC • الصحة والعافية الطبيعية" 
      : "🌿 DXN & KALLOW MAROC • SANTÉ & BIEN-ÊTRE NATUREL";
  }

  const heroTitle = document.getElementById("home-hero-title");
  if (heroTitle) {
    heroTitle.textContent = isAr 
      ? "منتجات طبيعية 100% لصحتك وجمالك" 
      : "Des Produits 100% Naturels pour Votre Santé & Votre Beauté";
  }

  const heroDesc = document.getElementById("home-hero-desc");
  if (heroDesc) {
    heroDesc.textContent = isAr 
      ? "اكتشف أرقى مكملات فطر الريشي والسبيرولينا والقهوة الصحية من دي إكس إن (DXN)، ومستحضرات العناية بالبشرة الفاخرة من كالو (Kallow). منتجات أصلية مع توصيل سريع بالمغرب والدفع عند الاستلام."
      : "Découvrez les bienfaits du Ganoderma (Reishi), de la spiruline et des cafés bien-être DXN, ainsi que les soins dermo-cosmétiques de luxe Kallow. Produits 100% authentiques avec livraison express au Maroc et paiement à la livraison.";
  }

  const heroCta1 = document.getElementById("home-hero-cta1");
  if (heroCta1) heroCta1.textContent = isAr ? "تسوق الآن" : "Acheter Maintenant";

  const heroCta2 = document.getElementById("home-hero-cta2");
  if (heroCta2) heroCta2.textContent = isAr ? "تصفح المجموعات" : "Découvrir les Gammes";

  // Featured Section
  const featBadge = document.getElementById("home-featured-badge");
  if (featBadge) featBadge.textContent = isAr ? "مختارات حصرية" : "SÉLECTION EXCLUSIVE";

  const featTitle = document.getElementById("home-featured-title");
  if (featTitle) featTitle.textContent = isAr ? "أفضل المنتجات وأكثرها طلباً" : "Nos Meilleurs Produits & Best-Sellers";

  const featSubtitle = document.getElementById("home-featured-subtitle");
  if (featSubtitle) {
    featSubtitle.textContent = isAr
      ? "مجموعة مميزة من المنتجات الصحية ومستحضرات التجميل الطبيعية الأكثر مبيعاً وتقييماً من عملائنا في المغرب."
      : "Sélection des produits naturels les plus plébiscités et recommandés par nos clients au Maroc.";
  }

  const viewAllBtn = document.getElementById("home-view-all-btn");
  if (viewAllBtn) viewAllBtn.textContent = isAr ? "عرض جميع المنتجات ←" : "Voir Tous les Produits →";

  // Vision Statement Section
  const visionTag = document.getElementById("home-vision-tag");
  if (visionTag) visionTag.textContent = isAr ? "رؤيتنا ورسالتنا" : "NOTRE VISION & ENGAGEMENT";

  const visionTitle = document.getElementById("home-vision-title");
  if (visionTitle) {
    visionTitle.textContent = isAr 
      ? "صحتك وجمالك يبدآن من الطبيعة النقية" 
      : "Votre Santé et Votre Beauté Commencent par la Pureté de la Nature";
  }

  const visionText = document.getElementById("home-vision-text");
  if (visionText) {
    visionText.textContent = isAr
      ? "نلتزم بتقديم أفضل ما جادت به الطبيعة من مستخلصات فطر الريشي والسبيرولينا والألوفيرا. جميع منتجاتنا معتمدة، أصلية 100%، وخالية من المكونات الكيميائية الضارة لضمان حيوية دائمة ونقاء لا مثيل له."
      : "Nous nous engageons à offrir le meilleur des extraits naturels de champignon Reishi, de spiruline et d'aloe vera. Tous nos produits sont certifiés, 100% authentiques et formulés pour votre vitalité et votre bien-être au quotidien.";
  }

  const visionBtn = document.getElementById("home-vision-btn");
  if (visionBtn) visionBtn.textContent = isAr ? "تعرف على قصتنا ورؤيتنا ←" : "Découvrir Notre Histoire & Vision →";

  // Categories Section
  const catsTitle = document.getElementById("home-cats-title");
  if (catsTitle) catsTitle.textContent = isAr ? "استكشف أقسام المتجر" : "Explorer les Catégories";

  const catsSub = document.getElementById("home-cats-subtitle");
  if (catsSub) {
    catsSub.textContent = isAr
      ? "تصفح تشكيلتنا الشاملة من القهوة الصحية، مستحضرات العناية بالبشرة، والمكملات العضوية لدعم مناعتك."
      : "Parcourez notre gamme complète : cafés santé, soins de la peau et compléments bio pour votre immunité.";
  }

  // Promo Banner Section
  const promoTag = document.getElementById("home-promo-tag");
  if (promoTag) promoTag.textContent = isAr ? "✨ باقات وعروض حصرية" : "✨ SÉLECTION COFFRETS & ROUTINES";

  const promoTitle = document.getElementById("home-promo-title");
  if (promoTitle) promoTitle.textContent = isAr ? "عروض وباقات العناية المتكاملة" : "ROUTINES BIEN-ÊTRE & SOINS COMPLETS";

  const promoText = document.getElementById("home-promo-text");
  if (promoText) {
    promoText.textContent = isAr
      ? "اجمع بين التغذية الخلوية المتطورة من دي إكس إن (DXN) وروتين العناية بالبشرة الفاخر من كالو (Kallow) لتحصل على نتائج استثنائية وأسعار تفضيلية."
      : "Associez la puissance de la nutrition cellulaire DXN à l'excellence des rituels cosmétiques Kallow pour des résultats visibles et un bien-être durable.";
  }

  const promoBtn1 = document.getElementById("home-promo-btn1");
  if (promoBtn1) promoBtn1.textContent = isAr ? "اكتشف العروض الحصرية →" : "DÉCOUVRIR LES OFFRES →";

  const promoBtn2 = document.getElementById("home-promo-btn2");
  if (promoBtn2) promoBtn2.textContent = isAr ? "تصفح الكتالوج الكامل" : "VOIR LE CATALOGUE COMPLET";

  // Bundle Fade Cards
  document.querySelectorAll(".bundle-fade-name").forEach(el => {
    const text = isAr ? el.getAttribute("data-ar") : el.getAttribute("data-fr");
    if (text) el.textContent = text;
  });

  // Trust Badges
  const badge1Title = document.getElementById("trust-badge-1-title");
  const badge1Desc = document.getElementById("trust-badge-1-desc");
  if (badge1Title) badge1Title.textContent = isAr ? "شحن سريع 24/48 ساعة" : "Livraison Express 24/48h";
  if (badge1Desc) badge1Desc.textContent = isAr ? "توصيل مضمون لكافة مدن المغرب" : "Expédition rapide partout au Maroc";

  const badge2Title = document.getElementById("trust-badge-2-title");
  const badge2Desc = document.getElementById("trust-badge-2-desc");
  if (badge2Title) badge2Title.textContent = isAr ? "الدفع عند الاستلام (COD)" : "Paiement à la Livraison";
  if (badge2Desc) badge2Desc.textContent = isAr ? "ادفع نقداً بعد استلام وفحص طلبيتك" : "Réglez en espèces à la réception";

  const badge3Title = document.getElementById("trust-badge-3-title");
  const badge3Desc = document.getElementById("trust-badge-3-desc");
  if (badge3Title) badge3Title.textContent = isAr ? "أصلي وطبيعي 100%" : "100% Naturel & Certifié";
  if (badge3Desc) badge3Desc.textContent = isAr ? "منتجات معتمدة ومضمونة الجودة" : "Qualité garantie directement de la source";

  const badge4Title = document.getElementById("trust-badge-4-title");
  const badge4Desc = document.getElementById("trust-badge-4-desc");
  if (badge4Title) badge4Title.textContent = isAr ? "خدمة عملاء واتساب" : "Support Client WhatsApp";
  if (badge4Desc) badge4Desc.textContent = isAr ? "استشارات وإجابة سريعة 7 أيام" : "Conseils personnalisés 7j/7";

  // New Arrivals & Daily Selections Section
  const arrBadge = document.getElementById("home-arrivals-badge");
  if (arrBadge) arrBadge.textContent = isAr ? "وصل حديثاً" : "NOUVEAUTÉS";

  const arrDailyBadge = document.getElementById("home-arrivals-daily-badge");
  if (arrDailyBadge) arrDailyBadge.textContent = isAr ? "✨ مختارات اليوم المتجددة" : "✨ SÉLECTIONS DU JOUR";

  const arrTitle = document.getElementById("home-arrivals-title");
  if (arrTitle) arrTitle.textContent = isAr ? "أحدث المنتجات والمختارات اليومية" : "NOUVELLES ARRIVAGES & SÉLECTIONS";

  const arrSubtitle = document.getElementById("home-arrivals-subtitle");
  if (arrSubtitle) {
    arrSubtitle.textContent = isAr
      ? "تشكيلة متجددة يومياً من أرقى منتجات دي إكس إن وكالو الطبيعية لروتينك الصحي."
      : "Sélection exclusive renouvelée chaque jour parmi nos dernières gammes naturelles DXN & Kallow.";
  }

  const arrViewAllBtn = document.getElementById("home-arrivals-view-all-btn");
  if (arrViewAllBtn) arrViewAllBtn.textContent = isAr ? "تصفح جميع الواصل حديثاً ←" : "Voir Toutes les Nouveautés →";

  // Newsletter Section
  const newsTag = document.getElementById("home-news-tag");
  if (newsTag) newsTag.textContent = isAr ? "النشرة البريدية الحصرية" : "NEWSLETTER PRIVÉE";

  const newsTitle = document.getElementById("home-news-title");
  if (newsTitle) newsTitle.textContent = isAr ? "انضم إلى مجتمع دي إكس إن وكالو" : "REJOIGNEZ LA COMMUNAUTÉ DXN & KALLOW";

  const newsText = document.getElementById("home-news-text");
  if (newsText) {
    newsText.textContent = isAr
      ? "اشترك لتصلك أحدث النصائح الصحية، روتين العناية الطبيعي، والعروض الخاصة حصرياً في المغرب."
      : "Inscrivez-vous pour recevoir en avant-première nos conseils santé, rituels beauté naturelle et offres exclusives au Maroc.";
  }

  const newsInput = document.getElementById("home-news-input");
  if (newsInput) {
    newsInput.placeholder = isAr ? "بريدك الإلكتروني (مثال: contact@domaine.ma)" : "Votre adresse email (ex: contact@domaine.ma)";
  }

  const newsBtn = document.getElementById("home-news-btn");
  if (newsBtn) newsBtn.textContent = isAr ? "اشتراك" : "S'INSCRIRE";

  const newsNote = document.getElementById("home-news-note");
  if (newsNote) {
    newsNote.textContent = isAr
      ? "🔒 لا نرسل رسائل مزعجة أبداً. يمكنك إلغاء الاشتراك في أي وقت."
      : "🔒 Aucun spam. Désinscription possible en un clic.";
  }
}
