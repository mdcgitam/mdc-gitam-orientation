(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Split hero title into words for stagger reveal ---------- */
  document.querySelectorAll('.hero-title .line').forEach(line => {
    const words = line.textContent.trim().split(' ');
    line.innerHTML = words.map((w, i) =>
      `<span class="reveal-word" style="transition-delay:${i * 60}ms">${w}${i < words.length - 1 ? '&nbsp;' : ''}</span>`
    ).join('');
  });

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    nav.classList.toggle('menu-open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    nav.classList.remove('menu-open');
  }));

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    '.reveal-up, .reveal-fade, .reveal-line, .hero-title .line, .mentor-grid, .exec-grid, .domain-grid, .guide-grid, .soc-flow, .break-grid, .tenure-grid'
  );
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Cursor glow ---------- */
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Timeline progress line ---------- */
  const timelineTrack = document.getElementById('timelineTrack');
  const timelineProgress = document.getElementById('timelineProgress');
  if (timelineTrack && timelineProgress) {
    const updateTimeline = () => {
      const rect = timelineTrack.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const visible = Math.min(Math.max(vh * 0.75 - rect.top, 0), total);
      const pct = total > 0 ? (visible / total) * 100 : 0;
      timelineProgress.style.height = pct + '%';
    };
    document.addEventListener('scroll', updateTimeline, { passive: true });
    window.addEventListener('resize', updateTimeline);
    updateTimeline();
  }

  /* ---------- Animated stat counters ---------- */
  const stats = document.querySelectorAll('.stat-num');
  if (stats.length) {
    const animateStat = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const isYear = target > 100;
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = isYear ? val : val;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const statIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      stats.forEach(s => statIO.observe(s));
    } else {
      stats.forEach(s => s.textContent = s.dataset.count);
    }
  }

  /* ---------- Domain filter tabs ---------- */
  const tabs = document.querySelectorAll('.domain-tab');
  const domainCards = document.querySelectorAll('.domain-card');
  const domainGrid = document.getElementById('domainGrid');
  const applyDomainFilter = (filter) => {
    domainCards.forEach(card => {
      card.classList.toggle('hidden', card.dataset.cat !== filter);
    });
    if (domainGrid) domainGrid.classList.toggle('domain-grid--technical', filter === 'technical');
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyDomainFilter(tab.dataset.filter);
    });
  });
  const initialTab = document.querySelector('.domain-tab.active') || tabs[0];
  if (initialTab) applyDomainFilter(initialTab.dataset.filter);

  /* ---------- Hero particle field canvas ---------- */
  const canvas = document.getElementById('fieldCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];
    const COLORS = ['#334EAC', '#708FD1', '#DAE3FF'];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.floor((w * h) / 16000), 90);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.5 + 0.15
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // connecting lines for nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(112,143,209,0.12)';
            ctx.lineWidth = 0.6;
            ctx.globalAlpha = 1 - dist / 120;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(tick);
  }

  /* ---------- Entry gate: plays music once on click, then reveals site ---------- */
  const bgMusic = document.getElementById('bgMusic');
  const entryGate = document.getElementById('entryGate');
  const entryGateBtn = document.getElementById('entryGateBtn');
  if (entryGate && entryGateBtn) {
    document.body.style.overflow = 'hidden';

    // Staggered entrance for the gate's text/button.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => entryGate.classList.add('entry-gate--ready'));
    });

    // Lightweight particle field behind the gate (mirrors the hero canvas).
    const entryCanvas = document.getElementById('entryCanvas');
    if (entryCanvas && !reduceMotion) {
      const ctx = entryCanvas.getContext('2d');
      let w, h, dpr, particles = [], raf;
      const COLORS = ['#334EAC', '#708FD1', '#DAE3FF'];
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = entryCanvas.offsetWidth; h = entryCanvas.offsetHeight;
        entryCanvas.width = w * dpr; entryCanvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(Math.floor((w * h) / 14000), 110);
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
          a: Math.random() * 0.5 + 0.15
        }));
      };
      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
        });
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(tick);
      };
      resize();
      window.addEventListener('resize', resize);
      raf = requestAnimationFrame(tick);
      entryGateBtn.addEventListener('click', () => cancelAnimationFrame(raf), { once: true });
    }

    entryGateBtn.addEventListener('click', () => {
      if (bgMusic) {
        bgMusic.volume = 1;
        bgMusic.play().catch(() => {});
      }
      showSplash();
      // Only fade the gate away once the splash panel is already fully
      // opaque (it fades in fast, in .2s) — this way the gate's fade
      // never exposes the raw homepage underneath, only the splash on
      // top of it. The slower, decorative motion (logo, text, glow)
      // keeps animating in independently after this point.
      setTimeout(() => {
        entryGate.classList.add('entry-gate--hidden');
        setTimeout(() => entryGate.remove(), 900);
      }, 320);
    }, { once: true });
  }

  /* ---------- Splash: M-D-C letters assemble, then hold until ~2s before the music ends ---------- */
  const splash = document.getElementById('splash');
  const splashLogo = document.getElementById('splashLogo');
  const splashLetters = document.querySelectorAll('.splash-letter');
  const splashFullnameWords = document.querySelectorAll('.splash-fullname-word');
  function showSplash() {
    if (!splash) { document.body.style.overflow = ''; return; }

    const startedAt = performance.now();
    requestAnimationFrame(() => splash.classList.add('splash--visible'));

    if (splashLogo) {
      splashLogo.addEventListener('animationend', (e) => {
        if (e.animationName === 'splashLogoDrop') {
          splashLogo.classList.add('splash-logo--floating');
        }
      });
    }

    // The build-up is timed off the track itself: the first half is spent
    // landing M, D, then C one at a time, THEN — only once all three have
    // assembled — "Meta Developer Communities" fades in beneath them.
    // The moment they're fully assembled (exactly the halfway point) is
    // when the wordmark takes over. Drop in a new song of any length and
    // this whole sequence rescales with it.
    const DEFAULT_DURATION = 18; // used only until real audio metadata is known
    let choreographed = false;
    let minHoldMs = (DEFAULT_DURATION / 2) * 1000 + 1300;

    const runChoreography = (duration) => {
      if (choreographed) return;
      choreographed = true;
      const total = (duration && isFinite(duration) && duration > 0) ? duration : DEFAULT_DURATION;
      const half = total / 2;
      const halfMs = half * 1000;
      // A full 1s pause on the plain panel before anything appears. The
      // letters then land, one after another, across the first ~55% of
      // what's left; once they've clearly settled, "Meta", "Developer"
      // and "Communities" each fade in on their own beat across the
      // remaining time; "splash--reveal" (the crossfade to the logo)
      // still lands right at the halfway point.
      const START_DELAY_MS = 1000;
      const remaining = Math.max(halfMs - START_DELAY_MS, 0);
      const letterGapMs = (remaining * 0.55) / Math.max(splashLetters.length, 1);
      splashLetters.forEach((el, i) => {
        setTimeout(() => el.classList.add('is-in'), START_DELAY_MS + i * letterGapMs);
      });
      const wordsStartMs = START_DELAY_MS + remaining * 0.62;
      const wordGapMs = (halfMs - wordsStartMs) / (splashFullnameWords.length + 1);
      splashFullnameWords.forEach((el, i) => {
        setTimeout(() => el.classList.add('is-in'), wordsStartMs + i * wordGapMs);
      });
      // Once assembled, "MDC" + "Meta Developer Communities" stay fully
      // visible for an extra beat (~2s) before the crossfade to "Welcome
      // To" + the logo — which happens together, in one swap.
      const HOLD_AFTER_ASSEMBLY_MS = 2000;
      setTimeout(() => splash.classList.add('splash--reveal'), halfMs + HOLD_AFTER_ASSEMBLY_MS);
      minHoldMs = half * 1000 + HOLD_AFTER_ASSEMBLY_MS + 1900; // + time for the logo drop and recruits caption to settle
    };

    if (bgMusic && bgMusic.readyState >= 1 && bgMusic.duration) {
      runChoreography(bgMusic.duration);
    } else if (bgMusic) {
      bgMusic.addEventListener('loadedmetadata', () => runChoreography(bgMusic.duration), { once: true });
      // Metadata usually arrives almost instantly; don't let a slow
      // network stall the entrance indefinitely.
      setTimeout(() => runChoreography(bgMusic.duration), 1500);
    } else {
      runChoreography(DEFAULT_DURATION);
    }

    const LEAD_TIME = 2; // seconds before the track ends to reveal the site
    const FALLBACK_MS = 20000; // used if audio metadata/events never fire at all
    let finished = false;

    const hideSplash = () => {
      if (finished) return;
      finished = true;
      splash.classList.remove('splash--visible');
      splash.classList.add('splash--hidden');
      document.body.style.overflow = '';
      setTimeout(() => splash.remove(), 2400);
    };
    // Never cut the entrance choreography short, even if the track is
    // very short or ends abruptly. Also always leave one last beat on
    // the logo before actually handing off to the homepage.
    const EXIT_HOLD_MS = 1000;
    const finishSplash = () => {
      const remaining = minHoldMs - (performance.now() - startedAt);
      const delay = Math.max(remaining, 0) + EXIT_HOLD_MS;
      setTimeout(hideSplash, delay);
    };

    if (bgMusic) {
      bgMusic.addEventListener('timeupdate', () => {
        if (bgMusic.duration && bgMusic.duration - bgMusic.currentTime <= LEAD_TIME) {
          finishSplash();
        }
      });
      bgMusic.addEventListener('ended', finishSplash);
      bgMusic.addEventListener('error', finishSplash);
      // Safety net in case autoplay was blocked or the file fails to load.
      setTimeout(() => {
        if (bgMusic.paused && bgMusic.currentTime === 0) finishSplash();
      }, FALLBACK_MS);
    } else {
      setTimeout(finishSplash, FALLBACK_MS);
    }
  }

})();
