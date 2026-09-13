/* ============================================
   MADEVHUB — JavaScript
   Unified pricing version
   ============================================ */

// === CURSOR GLOW ===
const glow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', e => {
  if (glow) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }
});

// === SCROLL REVEAL ===
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

// === LANGUAGE TOGGLE ===
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === lang);
  });

  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    const val = el.getAttribute('data-' + lang);

    if (val) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    }
  });
}

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  if (window.innerWidth <= 480) {
    return 35;
  } else if (window.innerWidth <= 768) {
    return 50;
  } else if (window.innerWidth <= 1024) {
    return 90;
  } else {
    return 220;
  }
}

function getConnectionDistance() {
  if (window.innerWidth <= 480) {
    return 95;
  } else if (window.innerWidth <= 768) {
    return 110;
  } else if (window.innerWidth <= 1024) {
    return 140;
  } else {
    return 180;
  }
}

function getMouseDistance() {
  return window.innerWidth <= 768 ? 120 : 250;
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  if (!canvas) return;

  particles = [];
  const particleCount = getParticleCount();

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

document.addEventListener('mouseleave', () => {
  mouseX = -1000;
  mouseY = -1000;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = window.innerWidth <= 768 ? Math.random() * 1.8 + 0.8 : Math.random() * 2.5 + 1.2;
    this.isIce = Math.random() > 0.65;
  }

  update() {
    const mouseDist = getMouseDistance();

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) {
      this.vx *= -1;
    }

    if (this.y < 0 || this.y > canvas.height) {
      this.vy *= -1;
    }

    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < mouseDist) {
      const force = ((mouseDist - dist) / mouseDist) * 0.02;
      this.vx += dx * force;
      this.vy += dy * force;
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    if (speed > 1.2) {
      this.vx *= 0.98;
      this.vy *= 0.98;
    }
  }

  draw() {
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isIce ? 'rgba(0, 194, 255, 0.7)' : 'rgba(0, 232, 143, 0.65)';
    ctx.fill();
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
        let alpha = (1 - dist / connectionDist) * 0.25;

        if (window.innerWidth <= 768) {
          alpha = alpha * 0.55;
        }

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 232, 143, ${alpha})`;
        ctx.lineWidth = window.innerWidth <= 768 ? 0.5 : 0.8;
        ctx.stroke();
      }
    }

    const dxM = particles[i].x - mouseX;
    const dyM = particles[i].y - mouseY;
    const distM = Math.sqrt(dxM * dxM + dyM * dyM);

    if (distM < mouseDist) {
      let alpha = (1 - distM / mouseDist) * 0.45;

      if (window.innerWidth <= 768) {
        alpha = alpha * 0.45;
      }

      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = `rgba(0, 232, 143, ${alpha})`;
      ctx.lineWidth = window.innerWidth <= 768 ? 0.6 : 1;
      ctx.stroke();
    }
  }
}

function animate() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  drawConnections();
  requestAnimationFrame(animate);
}

resizeCanvas();
createParticles();
animate();
