/* ============================================
   MADEVHUB — JavaScript
   ============================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* === STICKY HEADER === */
const header = document.getElementById('siteHeader');

function updateHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* === MOBILE NAVIGATION === */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

function closeNav() {
  if (!mainNav || !navToggle) return;
  mainNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNav();
  });

  document.addEventListener('click', event => {
    if (!mainNav.classList.contains('is-open')) return;
    if (mainNav.contains(event.target) || navToggle.contains(event.target)) return;
    closeNav();
  });
}

/* === SCROLL SPY === */
const navLinks = Array.from(document.querySelectorAll('.main-nav > a[href^="#"]:not(.btn)'));
const homeLink = navLinks.find(link => link.getAttribute('href') === '#top');
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(section => section && section !== document.body);

function markActive(hash) {
  navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === hash));
}

if (sections.length) {
  const spy = new IntersectionObserver(entries => {
    if (window.scrollY < 300) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) markActive('#' + entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(section => spy.observe(section));

  if (homeLink) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < 300) markActive('#top');
    }, { passive: true });

    markActive('#top');
  }
}

/* === SCROLL REVEAL === */
const reveals = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  reveals.forEach(element => element.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;

      setTimeout(() => entry.target.classList.add('visible'), index * 70);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

  reveals.forEach(element => revealObserver.observe(element));
}

/* === LANGUAGE TOGGLE === */
const langButtons = document.querySelectorAll('.lang-btn');

function setLang(lang) {
  const nextLang = lang === 'es' ? 'es' : 'en';
  document.documentElement.lang = nextLang;

  langButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.lang === nextLang);
  });

  document.querySelectorAll('[data-' + nextLang + ']').forEach(element => {
    const value = element.getAttribute('data-' + nextLang);

    if (!value) return;

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = value;
    } else {
      element.innerHTML = value;
    }
  });

  try {
    localStorage.setItem('madevhub-lang', nextLang);
  } catch (error) {
    /* storage unavailable — language still applies for this visit */
  }
}

window.setLang = setLang;

langButtons.forEach(button => {
  button.addEventListener('click', () => setLang(button.dataset.lang));
});

(function restoreLang() {
  let saved = null;

  try {
    saved = localStorage.getItem('madevhub-lang');
  } catch (error) {
    saved = null;
  }

  const browserLang = (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
  const initial = saved === 'es' || saved === 'en' ? saved : browserLang;

  if (initial === 'es') setLang('es');
})();

/* === SMOOTH SCROLL === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (event) {
    const selector = this.getAttribute('href');

    if (!selector || selector === '#') return;

    const target = document.querySelector(selector);

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  });
});

/* === FAQ ACCORDION === */
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('is-open');

    item.classList.toggle('is-open', !isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));

    const icon = button.querySelector('strong');
    if (icon) icon.textContent = isOpen ? '+' : '−';
  });
});

/* === HERO PARTICLE NETWORK === */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const heroSection = canvas ? canvas.closest('.hero') : null;

let particles = [];
let mouseX = -1000;
let mouseY = -1000;
let heroVisible = true;
let frameId = null;

function getParticleCount() {
  if (window.innerWidth <= 480) return 26;
  if (window.innerWidth <= 768) return 40;
  if (window.innerWidth <= 1024) return 60;
  return 110;
}

function getConnectionDistance() {
  if (window.innerWidth <= 480) return 90;
  if (window.innerWidth <= 768) return 110;
  if (window.innerWidth <= 1024) return 135;
  return 160;
}

function getMouseDistance() {
  return window.innerWidth <= 768 ? 110 : 210;
}

function resizeCanvas() {
  if (!canvas || !heroSection) return;

  canvas.width = heroSection.offsetWidth;
  canvas.height = heroSection.offsetHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = window.innerWidth <= 768 ? Math.random() * 1.5 + 0.6 : Math.random() * 2 + 0.9;
    this.isIce = Math.random() > 0.55;
  }

  update() {
    const mouseDist = getMouseDistance();

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouseDist) {
      const force = ((mouseDist - dist) / mouseDist) * 0.012;
      this.vx += dx * force;
      this.vy += dy * force;
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    if (speed > 1) {
      this.vx *= 0.985;
      this.vy *= 0.985;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isIce ? 'rgba(167, 139, 250, 0.7)' : 'rgba(34, 211, 238, 0.6)';
    ctx.fill();
  }
}

function createParticles() {
  if (!canvas) return;

  particles = [];
  const particleCount = getParticleCount();

  for (let index = 0; index < particleCount; index++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  const connectionDist = getConnectionDistance();
  const mouseDist = getMouseDistance();
  const isSmall = window.innerWidth <= 768;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= connectionDist) continue;

      let alpha = (1 - dist / connectionDist) * 0.2;
      if (isSmall) alpha *= 0.55;

      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.strokeStyle = 'rgba(167, 139, 250, ' + alpha + ')';
      ctx.lineWidth = isSmall ? 0.45 : 0.7;
      ctx.stroke();
    }

    const dxM = particles[i].x - mouseX;
    const dyM = particles[i].y - mouseY;
    const distM = Math.sqrt(dxM * dxM + dyM * dyM);

    if (distM >= mouseDist) continue;

    let alpha = (1 - distM / mouseDist) * 0.3;
    if (isSmall) alpha *= 0.45;

    ctx.beginPath();
    ctx.moveTo(particles[i].x, particles[i].y);
    ctx.lineTo(mouseX, mouseY);
    ctx.strokeStyle = 'rgba(34, 211, 238, ' + alpha + ')';
    ctx.lineWidth = isSmall ? 0.5 : 0.85;
    ctx.stroke();
  }
}

function animate() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  drawConnections();
  frameId = requestAnimationFrame(animate);
}

function startAnimation() {
  if (frameId === null) animate();
}

function stopAnimation() {
  if (frameId === null) return;

  cancelAnimationFrame(frameId);
  frameId = null;
}

if (canvas && ctx && heroSection && !prefersReducedMotion) {
  resizeCanvas();
  createParticles();
  startAnimation();

  let resizeTimer = null;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      createParticles();
    }, 150);
  });

  heroSection.addEventListener('mousemove', event => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  });

  heroSection.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Only animate while the hero is on screen.
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;

    if (heroVisible && !document.hidden) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }).observe(heroSection);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !heroVisible) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
}
