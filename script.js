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
    ctx.fillStyle = this.isIce ? 'rgba(0, 212, 255, 0.68)' : 'rgba(0, 232, 143, 0.6)';
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
      ctx.strokeStyle = 'rgba(0, 212, 255, ' + alpha + ')';
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
    ctx.strokeStyle = 'rgba(0, 232, 143, ' + alpha + ')';
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

/* === BARRA DE PROGRESO DE LECTURA === */
const progressBar = document.getElementById('scrollProgressBar');

if (progressBar) {
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.width = Math.min(ratio, 1) * 100 + '%';
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

/* === PALABRA ROTATIVA DEL TITULAR === */
const rotatorWords = {
  en: ['Restaurants', 'Barbershops', 'Clinics', 'Gyms', 'Cleaning Crews', 'Your Business'],
  es: ['Restaurantes', 'Barberías', 'Clínicas', 'Gimnasios', 'Empresas de Limpieza', 'Tu Negocio']
};

if (!prefersReducedMotion) {
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const typeLoop = () => {
    const rotator = document.getElementById('heroRotator');

    if (!rotator) {
      setTimeout(typeLoop, 600);
      return;
    }

    const words = rotatorWords[document.documentElement.lang] || rotatorWords.en;
    const word = words[wordIndex % words.length];

    charIndex += deleting ? -1 : 1;
    rotator.textContent = word.slice(0, charIndex);

    let delay = deleting ? 45 : 85;

    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = 2200;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex++;
      delay = 350;
    }

    setTimeout(typeLoop, delay);
  };

  setTimeout(typeLoop, 1400);
}

/* === LUZ QUE SIGUE AL CURSOR EN LAS TARJETAS === */
const spotlightSelector = '.service-card, .ai-card, .price-card, .contact-item';

document.querySelectorAll(spotlightSelector).forEach(card => card.classList.add('spotlight'));

document.addEventListener('pointermove', event => {
  const card = event.target.closest(spotlightSelector);

  if (!card) return;

  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mx', event.clientX - rect.left + 'px');
  card.style.setProperty('--my', event.clientY - rect.top + 'px');
}, { passive: true });

/* === FILTROS DEL PORTAFOLIO === */
const filterButtons = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card');
const filterCount = document.getElementById('filterCount');

function applyFilter(filter) {
  let shown = 0;

  workCards.forEach(card => {
    const cat = card.dataset.cat;
    const match = filter === 'all' || cat === filter || cat === 'all';

    card.classList.toggle('is-hidden', !match);

    if (!match) return;

    shown++;

    if (prefersReducedMotion) return;

    card.classList.add('is-entering');
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-entering')));
  });

  if (filterCount) {
    filterCount.textContent = shown + (document.documentElement.lang === 'es' ? ' proyectos' : ' projects');
  }
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(other => other.classList.toggle('is-active', other === button));
    applyFilter(button.dataset.filter);
  });
});

if (filterButtons.length) {
  applyFilter('all');
}

/* === DEMO DE CHATBOT === */
const demoScript = {
  en: {
    greeting: "Hi! I'm the MADEVHUB assistant. Ask me anything — this is exactly how a chatbot would answer for your own business.",
    qa: [
      ['How much is a website?', 'Packages start at $195.99 for a landing page and go up to $2,997 for a full site. Every one includes a free domain and hosting for the first year, plus 100% ownership. Want me to recommend the right one for your business?'],
      ['How long does it take?', 'Between 7 and 14 days, depending on the package. The Smart Landing ships in 7 days and the Professional in 14. The clock starts once we have your content.'],
      ['Do you build chatbots?', "Yes — that's what I am. We train an assistant on your services, prices and hours, and it answers on your website and WhatsApp 24/7. It can also book appointments and pass hot leads straight to you."],
      ['Can you automate my work?', 'Usually, yes. Forms, quotes, invoices, follow-ups and reports can run on their own by connecting the tools you already use. Tell us what eats the most time and we will tell you what can be automated.'],
      ['I want to talk to a human', "Of course — that's the right call for a real quote. Tap 'Get a Free Quote' or write to us on WhatsApp at +1 (305) 975-4420 and a person replies, usually within 24 hours."]
    ]
  },
  es: {
    greeting: '¡Hola! Soy el asistente de MADEVHUB. Pregúntame lo que quieras — así de rápido respondería un chatbot para tu propio negocio.',
    qa: [
      ['¿Cuánto cuesta una página?', 'Los paquetes van desde $195.99 por una landing hasta $2,997 por un sitio completo. Todos incluyen dominio y hosting gratis el primer año, más el 100% de la propiedad. ¿Te recomiendo el indicado para tu negocio?'],
      ['¿Cuánto tarda?', 'Entre 7 y 14 días, según el paquete. La Landing Inteligente sale en 7 días y el Sitio Profesional en 14. El conteo empieza cuando tenemos tu contenido.'],
      ['¿Hacen chatbots?', 'Sí — soy uno. Entrenamos un asistente con tus servicios, precios y horarios, y responde en tu web y por WhatsApp 24/7. También puede agendar citas y pasarte los clientes interesados.'],
      ['¿Pueden automatizar mi trabajo?', 'Casi siempre sí. Formularios, cotizaciones, facturas, seguimientos y reportes pueden funcionar solos conectando las herramientas que ya usas. Cuéntanos qué te consume más tiempo y te decimos qué se puede automatizar.'],
      ['Quiero hablar con una persona', 'Claro, y para una cotización real es lo correcto. Toca "Cotización Gratis" o escríbenos por WhatsApp al +1 (305) 975-4420 y te responde una persona, normalmente en menos de 24 horas.']
    ]
  }
};

const demoLog = document.getElementById('aiDemoLog');
const demoChips = document.getElementById('aiDemoChips');

if (demoLog && demoChips) {
  let demoBusy = false;

  const demoLang = () => (demoScript[document.documentElement.lang] ? document.documentElement.lang : 'en');

  const addMessage = (text, who) => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg is-' + who;
    bubble.textContent = text;
    demoLog.appendChild(bubble);
    demoLog.scrollTop = demoLog.scrollHeight;
    return bubble;
  };

  const addTyping = () => {
    const dots = document.createElement('div');
    dots.className = 'chat-typing';
    dots.innerHTML = '<i></i><i></i><i></i>';
    demoLog.appendChild(dots);
    demoLog.scrollTop = demoLog.scrollHeight;
    return dots;
  };

  const answer = (question, reply, chip) => {
    if (demoBusy) return;

    demoBusy = true;
    chip.disabled = true;
    addMessage(question, 'user');

    const dots = addTyping();

    setTimeout(() => {
      dots.remove();
      addMessage(reply, 'bot');
      demoBusy = false;
    }, prefersReducedMotion ? 200 : 900 + Math.min(reply.length * 4, 900));
  };

  const renderDemo = () => {
    const script = demoScript[demoLang()];

    demoLog.innerHTML = '';
    demoChips.innerHTML = '';
    demoBusy = false;

    addMessage(script.greeting, 'bot');

    script.qa.forEach(([question, reply]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chat-chip';
      chip.textContent = question;
      chip.addEventListener('click', () => answer(question, reply, chip));
      demoChips.appendChild(chip);
    });
  };

  renderDemo();

  // El demo se vuelve a armar cuando cambia el idioma.
  document.querySelectorAll('.lang-btn').forEach(button => {
    button.addEventListener('click', () => setTimeout(renderDemo, 60));
  });
}

/* El contador de proyectos sigue el idioma activo. */
if (filterButtons.length) {
  document.querySelectorAll('.lang-btn').forEach(button => {
    button.addEventListener('click', () => setTimeout(() => {
      const active = document.querySelector('.filter-btn.is-active');
      applyFilter(active ? active.dataset.filter : 'all');
    }, 60));
  });
}

/* === PARALLAX SUAVE DEL FONDO DEL HERO === */
const heroBg = document.querySelector('.hero-bg');

if (heroBg && !prefersReducedMotion) {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      const offset = Math.min(window.scrollY, window.innerHeight) * 0.18;
      heroBg.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
      ticking = false;
    });
  }, { passive: true });
}
