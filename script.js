/**
 * ED'S HOUSE FERNANDO - EMIL KOWALSKI MICRO-INTERACTION SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLiveHours();
  initMenuFilters();
  initLightbox();
  initWhatsAppOrderButtons();
  initBackToTop();
});

/* ==========================================================================
   1. NAVBAR & FLUID MOBILE DRAWER
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navList = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header with passive scroll listener
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle directly on primary navigation
  if (toggleBtn && navList) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      toggleBtn.classList.toggle('open', isOpen);
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('drawer-open', isOpen);
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navList.classList.contains('open')) {
          navList.classList.remove('open');
          toggleBtn.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('drawer-open');
        }
      });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('open')) {
        navList.classList.remove('open');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
      }
    });
  }

  // Performant Active Navigation Indicator via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   2. LIVE OPERATING HOURS (PARAGUAY TIMEZONE UTC-3)
   ========================================================================== */
function initLiveHours() {
  const statusPills = document.querySelectorAll('.live-status-pill');
  if (!statusPills.length) return;

  function updateStatus() {
    try {
      const now = new Date();
      const pyFormatter = new Intl.DateTimeFormat('es-PY', {
        timeZone: 'America/Asuncion',
        hour: 'numeric',
        hour12: false
      });
      
      const hour = parseInt(pyFormatter.format(now), 10);
      // Open from 18:00 (6 PM) to 02:00 AM
      const isOpen = (hour >= 18 || hour < 2);

      statusPills.forEach(pill => {
        const textSpan = pill.querySelector('.status-text');
        if (isOpen) {
          pill.classList.remove('closed');
          if (textSpan) textSpan.textContent = '¡Abierto Ahora!';
        } else {
          pill.classList.add('closed');
          if (textSpan) textSpan.textContent = 'Abre a las 18:00 hs';
        }
      });
    } catch {
      // Fallback
    }
  }

  updateStatus();
  setInterval(updateStatus, 60000);
}

/* ==========================================================================
   3. MENU CATEGORY FILTERING WITH STAGGERED MOTION
   ========================================================================== */
function initMenuFilters() {
  const tabButtons = document.querySelectorAll('.menu-tab-btn');
  const menuItems = document.querySelectorAll('.menu-item-card');

  if (!tabButtons.length || !menuItems.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-category');
      let visibleIndex = 0;

      menuItems.forEach(card => {
        const itemCategory = card.getAttribute('data-category');
        if (targetCategory === 'all' || itemCategory === targetCategory) {
          card.style.display = 'flex';
          card.classList.remove('animate-in');
          // Force reflow for clean restart of animation
          void card.offsetWidth;
          card.style.animationDelay = `${visibleIndex * 40}ms`;
          card.classList.add('animate-in');
          visibleIndex++;
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. TACTILE WHATSAPP ORDER GENERATOR + TOAST FEEDBACK
   ========================================================================== */
function initWhatsAppOrderButtons() {
  const WHATSAPP_PHONE = '595971906438'; // Sucursal Fernando de la Mora

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.item-order-btn');
    if (!btn) return;

    e.preventDefault();
    const card = btn.closest('.menu-item-card');
    if (!card) return;

    const title = card.querySelector('.item-title')?.textContent.trim() || 'un plato';
    const price = card.querySelector('.item-price')?.textContent.trim() || '';

    // Show instant feedback toast
    showToast(`🍔 Conectando con WhatsApp para pedir: ${title}...`);

    const message = `¡Hola ED'S House Fernando! 👋 Quiero hacer un pedido:\n\n🍔 *${title}* (${price})\n📍 *Sucursal:* Fernando de la Mora\n\n¿Me indican el tiempo estimado de entrega o retiro? ¡Muchas gracias!`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 280);
  });
}

function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('active');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('active');
  }, 2600);
}

/* ==========================================================================
   5. LIGHTBOX MODAL WITH SMOOTH SPRING SCALE
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('cartaLightbox');
  if (!modal) return;

  const modalImg = modal.querySelector('.lightbox-img');
  const modalCaption = modal.querySelector('.lightbox-caption');
  const closeBtn = modal.querySelector('.lightbox-close-btn');
  const triggers = document.querySelectorAll('[data-lightbox-src]');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-lightbox-src');
      const caption = trigger.getAttribute('data-caption') || 'Carta Oficial ED\'S House';

      if (modalImg && src) {
        modalImg.src = src;
        if (modalCaption) modalCaption.textContent = caption;
        modal.classList.add('active');
        document.body.classList.add('drawer-open');
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const backBtn = document.getElementById('backToTopBtn');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
