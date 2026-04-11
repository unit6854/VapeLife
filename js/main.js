/* ============================================================
   VapeLife — main.js  (v2 Dark Luxury Edition)
============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ── 1. SCROLL PROGRESS BAR ──────────────────────────────────
  var scrollBar = document.getElementById('vlScrollProgress');
  var header = document.querySelector('#masthead, .site-header, #header, header.site-header, .header');

  // RAF ticking flag — shared by all scroll handlers so only one rAF
  // fires per frame regardless of how many listeners exist.
  var scrollTicking = false;

  function handleScroll() {
    // Scroll progress bar — uses transform: scaleX (GPU composited, no reflow)
    if (scrollBar) {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? scrollTop / docHeight : 0;
      scrollBar.style.transform = 'scaleX(' + pct + ')';
    }

    // Nav scroll state
    if (header) {
      header.classList.toggle('vl-scrolled', window.scrollY > 40);
      header.classList.toggle('scrolled', window.scrollY > 40); // legacy class
    }

    scrollTicking = false;
  }

  // Single throttled scroll listener via RAF ticking pattern
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(handleScroll);
    }
  }, { passive: true });


  // ── 3. CUSTOM CURSOR ───────────────────────────────────────
  var dot  = document.getElementById('vlCursorDot');
  var ring = document.getElementById('vlCursorRing');

  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    var mx = 0, my = 0, rx = 0, ry = 0;
    var rafId;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = 'translate3d(' + (mx - 5) + 'px,' + (my - 5) + 'px,0)';
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });

    function cursorLoop() {
      var dx = mx - rx, dy = my - ry;
      // Dead-zone: skip style update if movement is sub-pixel (saves GPU work)
      if (dx * dx + dy * dy > 0.04) {
        rx += dx * 0.14;
        ry += dy * 0.14;
        ring.style.transform = 'translate3d(' + (rx - 17) + 'px,' + (ry - 17) + 'px,0)';
      }
      rafId = requestAnimationFrame(cursorLoop);
    }
    cursorLoop();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(rafId); else cursorLoop();
    });

    // Event delegation for cursor expand — single listener on document
    // instead of one per interactive element
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, .vl-product-card, .vl-category-pill, .vl-deal-card, .vl-review-card, [data-vl-cursor-expand]')) {
        ring.classList.add('vl-cursor-expand');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, .vl-product-card, .vl-category-pill, .vl-deal-card, .vl-review-card, [data-vl-cursor-expand]')) {
        ring.classList.remove('vl-cursor-expand');
      }
    });
  }


  // ── 4. AGE GATE ─────────────────────────────────────────────
  var ageGate = document.getElementById('ageGate');
  if (ageGate) {
    if (sessionStorage.getItem('ageOk')) ageGate.classList.add('gone');
    var ageYes = document.getElementById('ageYes');
    var ageNo  = document.getElementById('ageNo');
    if (ageYes) {
      ageYes.addEventListener('click', function () {
        sessionStorage.setItem('ageOk', '1');
        ageGate.classList.add('gone');
        // CSS transition handles fade — remove from DOM after transition ends
        ageGate.addEventListener('transitionend', function () { ageGate.remove(); }, { once: true });
      });
    }
    if (ageNo) {
      ageNo.addEventListener('click', function () {
        window.location.href = 'https://www.google.com';
      });
    }
  }


  // ── 5. MOBILE NAV ───────────────────────────────────────────
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Event delegation for nav links
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('click', function (e) {
      if (mobileNav.classList.contains('open') &&
          !mobileNav.contains(e.target) &&
          !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }


  // ── 6. SCROLL REVEAL ───────────────────────────────────────
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('vl-revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('[data-vl-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });

    // Legacy fade-up support
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-up').forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    document.querySelectorAll('[data-vl-reveal]').forEach(function (el) {
      el.classList.add('vl-revealed');
    });
    document.querySelectorAll('.fade-up').forEach(function (el) {
      el.classList.add('visible');
    });
  }


  // ── 7. COUNTER ANIMATION ────────────────────────────────────
  function animateCounter(el, target, suffix, decimals, duration) {
    var start = performance.now();
    function update(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      var current  = target * eased;
      el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  var statsTriggered = false;
  var statsEl = document.querySelector('.vl-hero-stats');
  if (statsEl && 'IntersectionObserver' in window) {
    var statsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !statsTriggered) {
        statsTriggered = true;
        document.querySelectorAll('.vl-stat[data-vl-count]').forEach(function (stat) {
          var numEl    = stat.querySelector('.vl-stat-number');
          var target   = parseFloat(stat.dataset.vlCount);
          var suffix   = stat.dataset.vlSuffix  || '';
          var decimals = parseInt(stat.dataset.vlDecimal || 0);
          if (numEl) animateCounter(numEl, target, suffix, decimals, 2000);
        });
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsEl);
  }


  // ── 8. HERO PARTICLE CANVAS ────────────────────────────────
  var canvas = document.getElementById('vlHeroCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];

    // Reduce particle count on mobile for performance
    var PARTICLE_COUNT = window.innerWidth < 768 ? 20 : 60;

    function resizeCanvas() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();

    // ResizeObserver is more efficient than window resize for element size changes
    if (typeof ResizeObserver !== 'undefined') {
      var canvasRO = new ResizeObserver(function () { resizeCanvas(); });
      canvasRO.observe(canvas);
    } else {
      var resizeTicking = false;
      window.addEventListener('resize', function () {
        if (!resizeTicking) {
          resizeTicking = true;
          requestAnimationFrame(function () { resizeCanvas(); resizeTicking = false; });
        }
      }, { passive: true });
    }

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function (scatter) {
      this.x       = Math.random() * W;
      this.y       = scatter ? Math.random() * H : H + Math.random() * 80;
      this.size    = Math.random() * 2 + 0.5;
      this.speedY  = -(Math.random() * 0.4 + 0.1);
      this.speedX  = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life    = 0;
      this.maxLife = Math.random() * 200 + 100;
    };
    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life > this.maxLife || this.y < -20) this.reset(false);
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(61,255,143,' + (this.opacity * (1 - this.life / this.maxLife)) + ')';
      ctx.fill();
    };

    for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    var particleRafId;

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) { p.update(); p.draw(); });
      particleRafId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(particleRafId);
      } else {
        animateParticles();
      }
    });
  }


  // ── 9. CATEGORY PILL FILTER ────────────────────────────────
  // Cache NodeLists once at init — not on every filter click
  var cachedCards = document.querySelectorAll('.vl-product-card');
  var cachedPills = document.querySelectorAll('.vl-category-pill');

  function activateCategory(cat) {
    // Update active pill using cached list
    cachedPills.forEach(function (p) {
      p.classList.toggle('vl-active', p.dataset.vlCategory === cat);
    });
    // Animate cards with per-card stagger delay for smoothness
    var cardIndex = 0;
    cachedCards.forEach(function (card) {
      var show = cat === 'all' || card.dataset.vlCategory === cat;
      var delay = show ? (cardIndex * 30) : 0; // stagger visible cards 0, 30, 60ms…
      if (show) cardIndex++;
      card.style.transition    = 'opacity 280ms ' + delay + 'ms cubic-bezier(0.16,1,0.3,1), transform 280ms ' + delay + 'ms cubic-bezier(0.16,1,0.3,1)';
      card.style.opacity       = show ? '1'    : '0.15';
      card.style.transform     = show ? 'scale(1)' : 'scale(0.96)';
      card.style.pointerEvents = show ? 'auto' : 'none';
    });
  }

  // Event delegation — single listener on pills container instead of one per pill
  var pillsContainer = document.querySelector('.vl-category-pills');
  if (pillsContainer) {
    pillsContainer.addEventListener('click', function (e) {
      var pill = e.target.closest('.vl-category-pill');
      if (pill) activateCategory(pill.dataset.vlCategory);
    });
  }

  // Dropdown items + footer shop links → activate filter + scroll to shop section
  document.querySelectorAll('.drop-item[data-vl-category], .dropdown-footer a[data-vl-category], .fcol__grid a[data-vl-category]').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var cat    = item.dataset.vlCategory || 'all';
      var target = document.getElementById('shop');
      activateCategory(cat);
      if (target) {
        var navH = header ? header.offsetHeight : 80;
        var top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // Legacy .filter system (kept for backwards compat if old markup is present)
  var filters = document.querySelectorAll('.filter');
  var pcards  = document.querySelectorAll('.pcard');
  if (filters.length) {
    // Event delegation on a common ancestor
    var filterBar = filters[0].parentElement;
    if (filterBar) {
      filterBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter');
        if (!btn) return;
        filters.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.dataset.f;
        pcards.forEach(function (card) {
          var match = f === 'all' || card.dataset.cat === f;
          if (match) {
            card.style.display = '';
            card.classList.remove('visible');
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { card.classList.add('visible'); });
            });
          } else {
            card.style.display = 'none';
          }
        });
      });
    }
  }


  // ── 10. STICKY CATEGORY BAR ─────────────────────────────────
  var catBar = document.querySelector('.vl-category-bar');
  if (catBar && 'IntersectionObserver' in window) {
    var catObserver = new IntersectionObserver(
      function (entries) {
        catBar.classList.toggle('vl-stuck', entries[0].intersectionRatio < 1);
      },
      { threshold: [1], rootMargin: '-65px 0px 0px 0px' }
    );
    catObserver.observe(catBar);
  }


  // ── 11. 3D CARD TILT ────────────────────────────────────────
  // Event delegation — single listener on the product grid
  var productGrid = document.querySelector('.vl-product-grid');
  if (productGrid) {
    productGrid.addEventListener('mousemove', function (e) {
      var card = e.target.closest('.vl-product-card');
      if (!card) return;
      var r   = card.getBoundingClientRect();
      var x   = e.clientX - r.left;
      var y   = e.clientY - r.top;
      var cx  = r.width  / 2;
      var cy  = r.height / 2;
      var rotX = ((y - cy) / cy) * -5;
      var rotY = ((x - cx) / cx) *  5;
      card.style.transform = 'translateY(-6px) perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
    });
    productGrid.addEventListener('mouseleave', function (e) {
      var card = e.target.closest('.vl-product-card');
      if (card) card.style.transform = '';
    }, true);
    // Reset on card mouseleave (bubbles to grid)
    productGrid.addEventListener('mouseout', function (e) {
      var card = e.target.closest('.vl-product-card');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    });
  }

  // Legacy .pcard tilt
  document.querySelectorAll('.pcard').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r   = card.getBoundingClientRect();
      var x   = e.clientX - r.left;
      var y   = e.clientY - r.top;
      var cx  = r.width  / 2;
      var cy  = r.height / 2;
      var rotX = ((y - cy) / cy) * -5;
      var rotY = ((x - cx) / cx) *  5;
      card.style.transform = 'translateY(-6px) perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });


  // ── 12. RESERVE BUTTONS (prefill form) ──────────────────────
  // Event delegation — single listener on body
  document.body.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn--reserve, .vl-reserve-icon-btn');
    if (!btn) return;
    var card     = btn.closest('.pcard, .vl-product-card');
    var nameEl   = card ? card.querySelector('h3, .vl-card-name') : null;
    var priceEl  = card ? card.querySelector('.pcard__price, .vl-card-price') : null;
    var name     = btn.dataset.product || (nameEl ? nameEl.textContent : 'Product');
    var price    = btn.dataset.price   || (priceEl ? priceEl.textContent : '');
    var textarea = document.querySelector('.ftextarea, [name="product"]');
    if (textarea) {
      textarea.value = name + (price ? ' — ' + price : '');
      textarea.focus();
    }
    var reserveSection = document.querySelector('#reserve, .vl-reserve-section');
    if (reserveSection) {
      var navH = header ? header.offsetHeight : 80;
      var top = reserveSection.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });


  // ── 13. RESERVE FORM (Formspree) ────────────────────────────
  var reserveForm = document.getElementById('reserveForm');
  var reserveBtn  = document.getElementById('reserveBtn');
  var reserveMsg  = document.getElementById('reserveMsg');

  if (reserveForm) {
    reserveForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (reserveBtn) { reserveBtn.textContent = 'Sending...'; reserveBtn.disabled = true; }
      var data = new FormData(reserveForm);
      fetch(reserveForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.ok || (json.next && json.next.length)) {
            if (reserveBtn) {
              reserveBtn.textContent = '✓ Reservation Sent!';
              reserveBtn.style.background = 'var(--green, #3DFF8F)';
            }
            if (reserveMsg) {
              reserveMsg.textContent = 'Got it! Your product will be held for 24 hours.';
              reserveMsg.style.display = 'block';
            }
            var resetTimer = setTimeout(function () {
              if (reserveBtn) {
                reserveBtn.textContent = 'Reserve Now →';
                reserveBtn.style.background = '';
                reserveBtn.disabled = false;
              }
              if (reserveMsg) reserveMsg.style.display = 'none';
              reserveForm.reset();
            }, 4000);
            reserveForm._resetTimer = resetTimer;
          } else {
            if (reserveBtn) { reserveBtn.textContent = 'Try Again'; reserveBtn.disabled = false; }
          }
        })
        .catch(function () {
          if (reserveBtn) { reserveBtn.textContent = 'Reserve Now →'; reserveBtn.disabled = false; }
        });
    });
  }

  // ── DAILY DEALS — highlight today's card ────────────────────
  (function () {
    var jsDay  = new Date().getDay(); // 0=Sun, 1=Mon … 6=Sat
    var phpDay = jsDay === 0 ? 7 : jsDay; // convert to PHP date('N'): 1=Mon … 7=Sun
    var todayCard = document.querySelector('[data-deal-day="' + phpDay + '"]');
    if (todayCard) {
      todayCard.classList.add('vl-deal-card--active');
      var badge = document.createElement('div');
      badge.className = 'vl-deal-today-badge';
      badge.textContent = 'Today';
      todayCard.insertBefore(badge, todayCard.firstChild.nextSibling);
    }
  }());


  // ── 14. NEWSLETTER FORM ─────────────────────────────────────
  var newsletterForm = document.querySelector('#newsletterForm, .vl-newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = newsletterForm.querySelector('button');
      if (btn) {
        btn.textContent = '✓ Subscribed!';
        btn.disabled = true;
        // CSS transition handles the success state — setTimeout only for reset
        setTimeout(function () {
          btn.textContent = 'Subscribe';
          btn.disabled = false;
          newsletterForm.reset();
        }, 3000);
      }
    });
  }


  // ── 15. SMOOTH ANCHOR SCROLL ────────────────────────────────
  // Skip elements with data-vl-category — handled by the category delegated listener
  document.querySelectorAll('a[href*="#"]').forEach(function (anchor) {
    if (anchor.hasAttribute('data-vl-category')) return;

    anchor.addEventListener('click', function (e) {
      var href    = this.getAttribute('href') || '';
      var hashIdx = href.indexOf('#');
      if (hashIdx === -1) return;

      var id     = href.slice(hashIdx + 1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      var navH = header ? header.offsetHeight : 80;
      var top  = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

});
