(() => {
  'use strict';

  const SERIES = {
    nexus: {
      namePrefix: 'IP PoE система видеонаблюдения со звуком',
      modelTag: 'ISON NEXUS PRO',
      resLabel: '3 МП (2304×1296), встроенный микрофон, PoE',
      skuPrefix: '021FP002-3',
      camPrices: { 2: 24900, 4: 36950, 8: 68900, 16: 129500 },
      images: [
        './assets/kit-1-main.png',
        './assets/kit-1-cam.png',
        './assets/kit-1-nvr.png',
        './assets/kit-3-main.jpg'
      ]
    },
    alfa: {
      namePrefix: 'IP система видеонаблюдения Sony Starvis',
      modelTag: 'ISON ALFA S Black',
      resLabel: '4 МП (2560×1440) матрица SONY, ночная съемка, PoE',
      skuPrefix: '021FPP244',
      camPrices: { 2: 49300, 4: 74900, 8: 138500, 16: 259000 },
      images: [
        './assets/kit-2-main.jpg',
        './assets/kit-2-cam.jpg',
        './assets/kit-2-nvr.jpg',
        './assets/kit-3-nvr.png'
      ]
    }
  };

  const HDD_OPTIONS = {
    0: { label: 'Без жесткого диска', price: 0 },
    1: { label: 'HDD 1 ТБ Surveillance 24/7', price: 6900 },
    2: { label: 'HDD 2 ТБ Surveillance 24/7', price: 10900 },
    4: { label: 'HDD 4 ТБ Surveillance 24/7', price: 17900 }
  };

  const CABLE_OPTIONS = {
    18: { label: 'Бухты UTP PoE по 18 м', perCam: 0 },
    30: { label: 'Бухты UTP PoE по 30 м', perCam: 450 },
    50: { label: 'Бухты UTP PoE по 50 м', perCam: 950 }
  };

  const BODY_OPTIONS = {
    bullet: 'Уличные цилиндрические IP67 (-40°C)',
    dome: 'Купольные внутренние/уличные',
    mixed: 'Комбинированные (улица + помещение)'
  };

  const state = {
    series: 'nexus',
    cams: 4,
    hdd: 1,
    cable: 18,
    body: 'bullet',
    activeImageIndex: 0
  };

  const cart = [];

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function formatRub(amount) {
    const num = Math.round(Number(amount) || 0);
    return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getConfigSummary() {
    const s = SERIES[state.series] || SERIES.nexus;
    const hddInfo = HDD_OPTIONS[state.hdd] || HDD_OPTIONS[0];
    const cableInfo = CABLE_OPTIONS[state.cable] || CABLE_OPTIONS[18];
    const bodyLabel = BODY_OPTIONS[state.body] || BODY_OPTIONS.bullet;

    const basePrice = s.camPrices[state.cams] ?? s.camPrices[4];
    const hddPrice = hddInfo.price;
    const cablePrice = cableInfo.perCam * state.cams;
    const total = basePrice + hddPrice + cablePrice;
    const oldTotal = Math.round((total * 1.14) / 100) * 100;
    const monthly = Math.round(total / 12);
    const sku = `${s.skuPrefix}-${state.cams}-${state.hdd}`;
    const title = `${s.namePrefix} ${s.modelTag} на ${state.cams} камеры`;

    return {
      seriesKey: state.series,
      series: s,
      cams: state.cams,
      hdd: state.hdd,
      hddInfo,
      cable: state.cable,
      cableInfo,
      body: state.body,
      bodyLabel,
      sku,
      title,
      total,
      oldTotal,
      monthly,
      image: s.images[0] || ''
    };
  }

  function showToast(message) {
    const container = $('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 3200);
  }

  function setActiveButton(selector, predicate) {
    $$(selector).forEach((btn) => {
      btn.classList.toggle('is-active', Boolean(predicate(btn)));
    });
  }

  function renderGallery(seriesData) {
    const mainImg = $('mainProductImg');
    const thumbsWrap = $('galleryThumbs');
    const images = Array.isArray(seriesData.images) ? seriesData.images : [];

    if (state.activeImageIndex >= images.length) {
      state.activeImageIndex = 0;
    }

    if (mainImg && images.length > 0) {
      mainImg.src = images[state.activeImageIndex];
      mainImg.alt = `${seriesData.modelTag} — фото ${state.activeImageIndex + 1}`;
    }

    if (!thumbsWrap) return;

    thumbsWrap.innerHTML = images
      .map((src, idx) => {
        const activeClass = idx === state.activeImageIndex ? ' is-active' : '';
        return `
          <button type="button" class="thumb-btn${activeClass}" data-index="${idx}" aria-label="Фото ${idx + 1}">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(seriesData.modelTag)} миниатюра ${idx + 1}" loading="lazy">
          </button>
        `;
      })
      .join('');

    $$('.thumb-btn', thumbsWrap).forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx) && images[idx]) {
          state.activeImageIndex = idx;
          if (mainImg) {
            mainImg.src = images[idx];
            mainImg.alt = `${seriesData.modelTag} — фото ${idx + 1}`;
          }
          $$('.thumb-btn', thumbsWrap).forEach((b, i) => {
            b.classList.toggle('is-active', i === idx);
          });
        }
      });
    });
  }

  function renderKitTable(cfg) {
    const tbody = $('kitListBody');
    if (!tbody) return;

    const nvrChannels = cfg.cams <= 4 ? 4 : cfg.cams <= 8 ? 8 : 16;
    const hddQty = cfg.hdd > 0 ? '1 шт.' : 'Опционально (слот SATA до 10 ТБ)';
    const hddDesc = cfg.hdd > 0
      ? `Жесткий диск для систем видеонаблюдения (${cfg.hddInfo.label})`
      : 'Жесткий диск для систем видеонаблюдения';

    const rows = [
      {
        name: `IP-камеры (${cfg.series.resLabel}, ${cfg.bodyLabel})`,
        qty: `${cfg.cams} шт.`
      },
      {
        name: `Сетевой PoE видеорегистратор ISON на ${nvrChannels} каналов`,
        qty: '1 шт.'
      },
      {
        name: hddDesc,
        qty: hddQty
      },
      {
        name: `Готовый обжатый кабель витая пара с PoE`,
        qty: `${cfg.cams} бухт × ${cfg.cable} м`
      },
      {
        name: 'Блок питания регистратора, USB-мышь, крепежный комплект, русская инструкция и гарантийный талон на 5 лет',
        qty: '1 компл.'
      }
    ];

    tbody.innerHTML = rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(row.qty)}</td>
          </tr>
        `
      )
      .join('');
  }

  function renderState(seriesChanged = false) {
    const cfg = getConfigSummary();

    setActiveButton('.series-btn', (btn) => btn.dataset.series === state.series);
    setActiveButton('.opt-cam', (btn) => Number(btn.dataset.cams) === state.cams);
    setActiveButton('.opt-hdd', (btn) => Number(btn.dataset.hdd) === state.hdd);
    setActiveButton('.opt-cable', (btn) => Number(btn.dataset.cable) === state.cable);
    setActiveButton('.opt-body', (btn) => btn.dataset.body === state.body);

    const titleEl = $('productTitle');
    if (titleEl) titleEl.textContent = cfg.title;

    const skuEl = $('productSku');
    if (skuEl) skuEl.textContent = cfg.sku;

    const totalEl = $('totalPrice');
    if (totalEl) totalEl.textContent = formatRub(cfg.total);

    const oldEl = $('oldPrice');
    if (oldEl) oldEl.textContent = formatRub(cfg.oldTotal);

    const monthlyEl = $('monthlyInstallment');
    if (monthlyEl) monthlyEl.textContent = `${formatRub(cfg.monthly)}/мес`;

    if (seriesChanged) {
      state.activeImageIndex = 0;
    }
    renderGallery(cfg.series);
    renderKitTable(cfg);
  }

  function renderCart() {
    const itemsEl = $('cartItems');
    const totalEl = $('cartTotal');
    const badgeEl = $('cartCountBadge');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalSum = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (badgeEl) {
      badgeEl.textContent = String(totalQty);
      badgeEl.classList.toggle('is-empty', totalQty === 0);
    }

    if (totalEl) {
      totalEl.textContent = formatRub(totalSum);
    }

    if (!itemsEl) return;

    if (cart.length === 0) {
      itemsEl.innerHTML = '<div class="cart-empty">Корзина пока пуста. Выберите конфигурацию комплекта и нажмите «В корзину».</div>';
      return;
    }

    itemsEl.innerHTML = cart
      .map(
        (item, idx) => `
          <div class="cart-item" data-cart-index="${idx}">
            <div class="cart-item__info">
              <div class="cart-item__title">${escapeHtml(item.title)}</div>
              <div class="cart-item__meta">Арт. ${escapeHtml(item.sku)} • ${escapeHtml(item.meta)}</div>
              <div class="cart-item__price">${formatRub(item.price * item.qty)}</div>
            </div>
            <div class="cart-item__controls">
              <button type="button" class="cart-qty-btn" data-action="dec" data-index="${idx}" aria-label="Уменьшить количество">−</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button type="button" class="cart-qty-btn" data-action="inc" data-index="${idx}" aria-label="Увеличить количество">+</button>
              <button type="button" class="cart-remove-btn" data-action="remove" data-index="${idx}" aria-label="Удалить товар">✕</button>
            </div>
          </div>
        `
      )
      .join('');
  }

  function openModal(el) {
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
  }

  function closeModal(el) {
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
  }

  function closeAllModals() {
    closeModal($('lightboxModal'));
    closeModal($('cartDrawer'));
    closeModal($('quickOrderModal'));
  }

  function bindConfigButtons() {
    $$('.series-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextSeries = btn.dataset.series;
        if (nextSeries && SERIES[nextSeries] && nextSeries !== state.series) {
          state.series = nextSeries;
          renderState(true);
        }
      });
    });

    $$('.opt-cam').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cams = Number(btn.dataset.cams);
        if (!Number.isNaN(cams)) {
          state.cams = cams;
          renderState(false);
        }
      });
    });

    $$('.opt-hdd').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hdd = Number(btn.dataset.hdd);
        if (!Number.isNaN(hdd) && HDD_OPTIONS[hdd]) {
          state.hdd = hdd;
          renderState(false);
        }
      });
    });

    $$('.opt-cable').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cable = Number(btn.dataset.cable);
        if (!Number.isNaN(cable) && CABLE_OPTIONS[cable]) {
          state.cable = cable;
          renderState(false);
        }
      });
    });

    $$('.opt-body').forEach((btn) => {
      btn.addEventListener('click', () => {
        const body = btn.dataset.body;
        if (body && BODY_OPTIONS[body]) {
          state.body = body;
          renderState(false);
        }
      });
    });
  }

  function bindTabs() {
    const tabBtns = $$('.tab-btn[data-tab]');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        if (!target) return;

        tabBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        $$('.tab-panel').forEach((panel) => {
          panel.classList.toggle('is-active', panel.id === `tab-${target}`);
        });
      });
    });
  }

  function bindLightbox() {
    const modal = $('lightboxModal');
    const lightboxImg = $('lightboxImg');
    const mainImg = $('mainProductImg');
    const zoomBtn = $('zoomBtn');
    const closeBtn = $('closeLightboxBtn');

    const openLightbox = () => {
      if (!modal || !lightboxImg || !mainImg) return;
      lightboxImg.src = mainImg.src;
      lightboxImg.alt = mainImg.alt || 'Увеличенное изображение комплекта';
      openModal(modal);
    };

    if (zoomBtn) zoomBtn.addEventListener('click', openLightbox);
    if (mainImg) mainImg.addEventListener('click', openLightbox);
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  }

  function bindCartAndForms() {
    const cartDrawer = $('cartDrawer');
    const openCartBtn = $('openCartBtn');
    const closeCartBtn = $('closeCartBtn');
    const addToCartBtn = $('addToCartBtn');
    const cartItemsEl = $('cartItems');
    const checkoutForm = $('checkoutForm');

    const quickModal = $('quickOrderModal');
    const oneClickBtn = $('oneClickBtn');
    const closeQuickBtn = $('closeQuickModalBtn');
    const quickSummary = $('quickSummary');
    const quickForm = $('quickOrderForm');

    if (openCartBtn) {
      openCartBtn.addEventListener('click', () => openModal(cartDrawer));
    }

    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => closeModal(cartDrawer));
    }

    if (cartDrawer) {
      cartDrawer.addEventListener('click', (e) => {
        if (e.target === cartDrawer) closeModal(cartDrawer);
      });
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const cfg = getConfigSummary();
        const meta = `${cfg.hddInfo.label}, кабель ${cfg.cable} м, ${cfg.bodyLabel}`;
        const existing = cart.find((item) => item.sku === cfg.sku && item.meta === meta);

        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({
            sku: cfg.sku,
            title: cfg.title,
            meta,
            price: cfg.total,
            qty: 1
          });
        }

        renderCart();
        openModal(cartDrawer);
        showToast('Комплект добавлен в корзину');
      });
    }

    if (cartItemsEl) {
      cartItemsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const idx = Number(btn.dataset.index);
        const action = btn.dataset.action;
        if (Number.isNaN(idx) || !cart[idx]) return;

        if (action === 'inc') {
          cart[idx].qty += 1;
        } else if (action === 'dec') {
          cart[idx].qty -= 1;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        } else if (action === 'remove') {
          cart.splice(idx, 1);
        }
        renderCart();
      });
    }

    if (oneClickBtn) {
      oneClickBtn.addEventListener('click', () => {
        const cfg = getConfigSummary();
        if (quickSummary) {
          quickSummary.textContent = `${cfg.title} (Арт. ${cfg.sku}) — ${formatRub(cfg.total)}`;
        }
        openModal(quickModal);
      });
    }

    if (closeQuickBtn) {
      closeQuickBtn.addEventListener('click', () => closeModal(quickModal));
    }

    if (quickModal) {
      quickModal.addEventListener('click', (e) => {
        if (e.target === quickModal) closeModal(quickModal);
      });
    }

    const handleOrderSubmit = (form, onSuccess) => {
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('input[name="name"], input[type="text"]');
        const phoneInput = form.querySelector('input[name="phone"], input[type="tel"]');

        const nameVal = nameInput ? nameInput.value.trim() : '';
        const phoneVal = phoneInput ? phoneInput.value.trim() : '';
        const digitsCount = phoneVal.replace(/\D/g, '').length;

        if (!nameVal) {
          showToast('Пожалуйста, укажите ваше имя');
          if (nameInput) nameInput.focus();
          return;
        }

        if (digitsCount < 7) {
          showToast('Пожалуйста, укажите корректный номер телефона');
          if (phoneInput) phoneInput.focus();
          return;
        }

        form.reset();
        onSuccess();
        showToast('Заявка отправлена! Инженер ISON свяжется с вами в течение 10 минут');
      });
    };

    handleOrderSubmit(checkoutForm, () => {
      cart.length = 0;
      renderCart();
      closeModal(cartDrawer);
    });

    handleOrderSubmit(quickForm, () => {
      closeModal(quickModal);
    });
  }

  function bindGlobalKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  function init() {
    bindConfigButtons();
    bindTabs();
    bindLightbox();
    bindCartAndForms();
    bindGlobalKeys();
    renderState(true);
    renderCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
