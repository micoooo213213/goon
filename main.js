/* ── ELARA Hotel — main.js ── */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── PAGE NAVIGATION ─── */
  const pages   = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta, [data-page]');
  const nav      = document.getElementById('nav');

  function showPage(id) {
    pages.forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    const target = document.getElementById(id);
    if (target) {
      target.style.display = 'block';
      // Force reflow for transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target.classList.add('active');
        });
      });
    }
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === id);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-run page-specific animations
    triggerPageAnimations(id);
  }

  // Handle all navigation clicks
  document.body.addEventListener('click', e => {
    const el = e.target.closest('[data-page]') || e.target.closest('.nav-link');
    if (!el) return;
    const page = el.dataset.page || el.getAttribute('data-page');
    if (!page) return;
    e.preventDefault();
    showPage(page);
  });

  // Handle href="#page" links
  document.body.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href').replace('#', '');
    if (document.getElementById(hash) && document.getElementById(hash).classList.contains('page')) {
      e.preventDefault();
      showPage(hash);
    }
  });

  // Init: show home
  showPage('home');

  /* ─── SCROLL: Nav style ─── */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  /* ─── CURSOR GLOW ─── */
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9999;
    width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle,rgba(200,169,110,0.06) 0%,transparent 70%);
    transform:translate(-50%,-50%);transition:left 0.4s ease,top 0.4s ease;
    left:-200px;top:-200px;
  `;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });

  /* ─── INTERSECTION OBSERVER (scroll reveals) ─── */
  const revealEls = document.querySelectorAll('.glass-card, .glass-panel, .feature-card, .treatment, .stat');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function initObserver() {
    document.querySelectorAll('.glass-card, .glass-panel').forEach((el, i) => {
      if (!el.closest('.nav')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ${i * 0.05}s ease, transform 0.6s ${i * 0.05}s ease`;
        observer.observe(el);
      }
    });
  }

  /* ─── PAGE ANIMATIONS ─── */
  function triggerPageAnimations(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    // Re-init cards in new page
    page.querySelectorAll('.glass-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.6s ${0.1 + i * 0.07}s ease, transform 0.6s ${0.1 + i * 0.07}s ease`;
      setTimeout(() => observer.observe(el), 10);
    });
    page.querySelectorAll('.glass-panel').forEach((el, i) => {
      if (!el.closest('.nav')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.6s ${0.2 + i * 0.1}s ease, transform 0.6s ${0.2 + i * 0.1}s ease`;
        setTimeout(() => observer.observe(el), 10);
      }
    });

    // Animate hero title lines per page
    const lines = page.querySelectorAll('.page-hero-title, .hero-eyebrow, .page-hero-sub');
    lines.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.7s ${0.15 + i * 0.12}s ease, transform 0.7s ${0.15 + i * 0.12}s ease`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }));
    });

    // Stat counter animation
    if (pageId === 'home') {
      animateCounters();
    }
  }

  /* ─── COUNTER ANIMATION ─── */
  function animateCounters() {
    const statNums = document.querySelectorAll('.stat-num');
    statNums.forEach(el => {
      const raw = el.textContent.trim();
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      const suffix = raw.replace(/[0-9.]/g, '');
      if (!num) return;
      let start = null;
      const duration = 1400;
      const step = ts => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (Number.isInteger(num)
          ? Math.round(eased * num)
          : (eased * num).toFixed(0)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      // Trigger when visible
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(step);
          obs.disconnect();
        }
      });
      obs.observe(el);
    });
  }

  /* ─── PARALLAX ORBS ─── */
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    document.querySelectorAll('.orb-1').forEach(o => {
      o.style.transform = `translate(${x * 0.6}px, ${y * 0.6}px) scale(1)`;
    });
    document.querySelectorAll('.orb-2').forEach(o => {
      o.style.transform = `translate(${-x * 0.4}px, ${-y * 0.4}px) scale(1)`;
    });
  });

  /* ─── GLASS CARD TILT ─── */
  document.body.addEventListener('mousemove', e => {
    const card = e.target.closest('.glass-card');
    if (!card) { return; }
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-6px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
    card.style.transition = 'transform 0.1s linear, box-shadow 0.3s ease, border-color 0.3s ease';
  });
  document.body.addEventListener('mouseleave', e => {
    const card = e.target.closest('.glass-card');
    if (card) {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease';
    }
  }, true);

  /* ─── BOOKING FORM ─── */
  const bookingBtn = document.querySelector('.booking-btn');
  if (bookingBtn) {
    bookingBtn.addEventListener('click', () => {
      bookingBtn.textContent = 'Checking…';
      bookingBtn.style.opacity = '0.7';
      setTimeout(() => {
        bookingBtn.textContent = '✓ Available!';
        bookingBtn.style.opacity = '1';
        bookingBtn.style.background = 'linear-gradient(135deg, #6ec88a, #4aaa66)';
        setTimeout(() => {
          bookingBtn.textContent = 'Check Availability';
          bookingBtn.style.background = '';
        }, 2500);
      }, 1200);
    });
  }

  // Initial observer
  initObserver();
  animateCounters();

});
