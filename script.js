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

})();
