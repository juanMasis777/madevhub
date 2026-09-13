/* ============================================
   MADEVHUB — Mockup V2 JavaScript
   ============================================ */

const glow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', event => {
  if (!glow) return;
  glow.style.left = event.clientX + 'px';
  glow.style.top = event.clientY + 'px';
});

const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, index) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add('visible'), index * 70);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

reveals.forEach(element => observer.observe(element));

let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;

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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const targetSelector = anchor.getAttribute('href');
    const target = document.querySelector(targetSelector);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    document.querySelectorAll('.faq-item').forEach(otherItem => {
      otherItem.classList.remove('active');
    });

    if (!isActive) {
      item.classList.add('active');
    }
  });
});

const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let mouseX = -1000;
let mouseY = -1000;

function getParticleCount() {
  if (window.innerWidth <= 480) return 28;
  if (window.innerWidth <= 768) return 38;
  if (window.innerWidth <= 1024) return 60;
  return 125;
}

function getConnectionDistance() {
  if (window.innerWidth <= 480) return 80;
  if (window.innerWidth <= 768) return 95;
  if (window.innerWidth <= 1024) return 120;
  return 150;
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
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.radius = window.innerWidth <= 768 ? Math.random() * 1.5 + 0.7 : Math.random() * 2 + 1;
    this.isBlue = Math.random() > 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const mouseDistance = window.innerWidth <= 768 ? 100 : 220;

    if (distance < mouseDistance) {
      const force = ((mouseDistance - distance) / mouseDistance) * 0.012;
      this.vx += dx * force;
      this.vy += dy * force;
    }
  }

  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isBlue ? 'rgba(56, 213, 255, 0.55)' : 'rgba(72, 242, 213, 0.5)';
    ctx.fill();
  }
}

function createParticles() {
  if (!canvas) return;
  particles = [];
  for (let i = 0; i < getParticleCount(); i++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  if (!ctx) return;
  const connectionDistance = getConnectionDistance();

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionDistance) {
        const alpha = (1 - distance / connectionDistance) * 0.18;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(56, 213, 255, ${alpha})`;
        ctx.lineWidth = window.innerWidth <= 768 ? 0.5 : 0.8;
        ctx.stroke();
      }
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
