// ============================================================
// Theme (persisted, respects system + explicit toggle)
// ============================================================
(function initTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  }
})();

document.getElementById('themeToggle').addEventListener('click', function () {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ============================================================
// Mobile menu
// ============================================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function () {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ============================================================
// Scroll reveal
// ============================================================
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal').forEach(function (el) {
    io.observe(el);
  });
} else {
  document.querySelectorAll('.reveal').forEach(function (el) {
    el.classList.add('in');
  });
}

// ============================================================
// Project filter
// ============================================================
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#projectGrid .project-card');
filterBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    filterBtns.forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    projectCards.forEach(function (card) {
      const cats = (card.getAttribute('data-cat') || '').split(' ');
      const show = filter === 'all' || cats.indexOf(filter) !== -1;
      card.style.display = show ? '' : 'none';
    });
  });
});

// ============================================================
// Footer year
// ============================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================================
// Contact form — secure backend endpoint (Vercel /api/contact)
// ============================================================
const CONTACT_API_URL =
  (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.contactApiUrl) ||
  (window.location.hostname.includes('github.io')
    ? 'https://oyelekeseun.vercel.app/api/contact'
    : '/api/contact');

document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('cfSubmit');
  const msg = document.getElementById('cfMsg');
  msg.className = 'form-msg';

  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  const website = document.getElementById('cf-website').value.trim();

  if (!name || !email || !subject || !message) {
    msg.textContent = 'Please fill in all fields.';
    msg.className = 'form-msg err';
    return;
  }

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const response = await fetch(CONTACT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message, website }),
    });

    if (!response.ok) {
      throw new Error('Could not send message');
    }

    msg.textContent = "Message sent — I'll get back to you within 24 hours.";
    msg.className = 'form-msg ok';
    this.reset();
  } catch (err) {
    const mailto =
      'mailto:oyelekeseun@outlook.com?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent('Name: ' + name + '\n\n' + message);
    msg.innerHTML =
      'Could not send automatically. <a href="' + mailto + '" style="color:inherit;font-weight:700;text-decoration:underline;">Click here to email directly</a>.';
    msg.className = 'form-msg err';
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
});
