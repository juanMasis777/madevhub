/* ============================================
   MADEVHUB — JavaScript
   Premium mockup redesign version
   ============================================ */

// === CURSOR GLOW ===
const glow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', event => {
  if (!glow) return;

  glow.style.left = event.clientX + 'px';
  glow.style.top = event.clientY + 'px';
});

// === SCROLL REVEAL ===
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), index * 70);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(element => observer.observe(element));

// === LANGUAGE TOGGLE ===
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-btn').forEach(button => {
    button.classList.toggle('active', button.textContent.trim().toLowerCase() === lang);
  });

  document.querySelectorAll('[data-' + lang + ']').forEach(element => {
    const value = element.getAttribute('data-' + lang);

    if (!value) return;

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = value;
    } else {
      element.innerHTML = value;
    }
  });
}

window.setLang = setLang;

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(event) {
    const selector = this.getAttribute('href');

    if (!selector || selector === '#') return;

    const target = document.querySelector(selector);

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === FAQ ACCORDION ===
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('is-open');

    item.classList.toggle('is-open', !isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));

    const icon = button.querySelector('strong');
    if (icon) {
      icon.textContent = isOpen ? '+' : '−';
    }
  });
});

// === PARTICLE NETWORK ===
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let particles = [];
let mouseX = -1000;
let mouseY = -1000;

function getParticleCount() {
  if (window.innerWidth <= 480) return 30;
  if (window.innerWidth <= 768) return 45;
  if (window.innerWidth <= 1024) return 70;
  return 145;
}

function getConnectionDistance() {
  if (window.innerWidth <= 480) return 90;
  if (window.innerWidth <= 768) return 110;
  if (window.innerWidth <= 1024) return 135;
  return 165;
}

function getMouseDistance() {
  return window.innerWidth <= 768 ? 110 : 220;
}

function resizeCanvas() {
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.radius = window.innerWidth <= 768 ? Math.random() * 1.6 + 0.7 : Math.random() * 2.1 + 1;
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
      const force = ((mouseDist - dist) / mouseDist) * 0.014;
      this.vx += dx * force;
      this.vy += dy * force;
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    if (speed > 1.05) {
      this.vx *= 0.985;
      this.vy *= 0.985;
    }
  }

  draw() {
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isIce ? 'rgba(0, 217, 255, 0.68)' : 'rgba(41, 223, 197, 0.62)';
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
  if (!ctx) return;

  const connectionDist = getConnectionDistance();
  const mouseDist = getMouseDistance();

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDist) {
        let alpha = (1 - dist / connectionDist) * 0.22;
        if (window.innerWidth <= 768) alpha *= 0.55;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
        ctx.lineWidth = window.innerWidth <= 768 ? 0.45 : 0.75;
        ctx.stroke();
      }
    }

    const dxM = particles[i].x - mouseX;
    const dyM = particles[i].y - mouseY;
    const distM = Math.sqrt(dxM * dxM + dyM * dyM);

    if (distM < mouseDist) {
      let alpha = (1 - distM / mouseDist) * 0.32;
      if (window.innerWidth <= 768) alpha *= 0.45;

      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = `rgba(41, 223, 197, ${alpha})`;
      ctx.lineWidth = window.innerWidth <= 768 ? 0.5 : 0.9;
      ctx.stroke();
    }
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
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

document.addEventListener('mousemove', event => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

document.addEventListener('mouseleave', () => {
  mouseX = -1000;
  mouseY = -1000;
});

resizeCanvas();
createParticles();
animate();
