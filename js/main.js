/* Split-screen intro animation */
const splitIntro = document.getElementById('splitIntro');
if (splitIntro) {
  requestAnimationFrame(() => {
    setTimeout(() => splitIntro.classList.add('open'), 250);
  });
  splitIntro.addEventListener('transitionend', () => {
    splitIntro.classList.add('done');
  }, { once: true });
  // safety net in case transitionend never fires
  setTimeout(() => splitIntro.classList.add('done'), 2500);
}

document.getElementById('year').textContent = new Date().getFullYear();

/* Header shrink/scroll style */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 12);
});

/* Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});
mainNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* Nossos Números: segment tabs */
const numTabs = document.querySelectorAll('.num-tab');
const numPanels = document.querySelectorAll('.num-panel');
numTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    numTabs.forEach(t => t.classList.remove('active'));
    numPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.numtab).classList.add('active');
  });
});

/* Service cards: tap-to-reveal on touch devices (hover already works via CSS) */
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('click', () => {
    const isActive = card.classList.contains('active');
    document.querySelectorAll('.svc-card.active').forEach(c => {
      if (c !== card) c.classList.remove('active');
    });
    card.classList.toggle('active', !isActive);
  });
});

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Safety net: never leave content permanently invisible if the observer
// misses an element (fast anchor-jumps, edge cases, etc.)
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
}, 2000);

/* Video autoplay reinforcement (some browsers block declarative autoplay on file:// or data-URI sources) */
document.querySelectorAll('.logo-anim-video').forEach(video => {
  video.muted = true;
  const tryPlay = () => video.play().catch(() => {});
  tryPlay();
  document.addEventListener('click', tryPlay, { once: true });
});

/* Cookie consent banner */
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');
const COOKIE_KEY = 'durar_cookie_consent';
const GA_ID = 'G-YR15WBT79Z';

function loadGoogleAnalytics() {
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

try {
  const existingConsent = localStorage.getItem(COOKIE_KEY);
  if (!existingConsent) {
    setTimeout(() => cookieBanner.classList.add('show'), 900);
  } else if (existingConsent === 'accepted') {
    loadGoogleAnalytics();
  }
} catch (e) { /* localStorage indisponível — ignora */ }

function setCookieConsent(value) {
  try { localStorage.setItem(COOKIE_KEY, value); } catch (e) {}
  cookieBanner.classList.remove('show');
  if (value === 'accepted') loadGoogleAnalytics();
}
cookieAccept && cookieAccept.addEventListener('click', () => setCookieConsent('accepted'));
cookieReject && cookieReject.addEventListener('click', () => setCookieConsent('rejected'));
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      status.textContent = 'Mensagem enviada! Vamos responder em breve.';
      status.className = 'form-status show ok';
      form.reset();
    } else {
      throw new Error('Falha no envio');
    }
  } catch (err) {
    status.textContent = 'Não foi possível enviar agora. Tente novamente ou nos chame no WhatsApp.';
    status.className = 'form-status show err';
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});
