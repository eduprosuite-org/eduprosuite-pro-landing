/* ============================================================ */
/* EDUPRO SUITE — MAIN JAVASCRIPT                               */
/* Countdown Timer, Tab Switchers, Billing Toggle, Coupon Copy  */
/* ============================================================ */

// ---- COUNTDOWN TIMER (2 weeks from page load baseline) ----
(function initCountdown() {
  const PROMO_END_KEY = 'eps_promo_end';
  let endTime = localStorage.getItem(PROMO_END_KEY);
  if (!endTime) {
    // Set 13 days + 23h from first visit
    endTime = Date.now() + (13 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000);
    localStorage.setItem(PROMO_END_KEY, endTime);
  }
  endTime = parseInt(endTime, 10);

  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, endTime - now);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = n => String(n).padStart(2, '0');
    const el = id => document.getElementById(id);

    if (el('cd-days'))  el('cd-days').textContent  = pad(d);
    if (el('cd-hours')) el('cd-hours').textContent = pad(h);
    if (el('cd-mins'))  el('cd-mins').textContent  = pad(m);
    if (el('cd-secs'))  el('cd-secs').textContent  = pad(s);

    // Sticky bar mini countdown
    const sticky = document.getElementById('sticky-countdown');
    if (sticky) sticky.textContent = `${pad(d)}d ${pad(h)}h ${pad(m)}m`;

    if (diff === 0) clearInterval(timer);
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
})();


// ---- BILLING TOGGLE (Monthly / Annual) ----
let isAnnual = false;
const prices = {
  'ap-pro':   { monthly: { main: '$29', old: '$65', period: '/month' }, annual: { main: '$19', old: '$29', period: '/month (billed annually)' }},
  'ap-elite': { monthly: { main: '$49', old: '$120', period: '/month' }, annual: { main: '$29', old: '$49', period: '/month (billed annually)' }}
};

function toggleBilling() {
  isAnnual = !isAnnual;
  const switchEl = document.querySelector('.toggle-switch');
  const monthlyLabel = document.getElementById('toggle-monthly');
  const annualLabel = document.getElementById('toggle-annual');

  if (isAnnual) {
    switchEl.classList.add('active');
    monthlyLabel.classList.remove('active');
    annualLabel.classList.add('active');
  } else {
    switchEl.classList.remove('active');
    monthlyLabel.classList.add('active');
    annualLabel.classList.remove('active');
  }

  // Update prices
  const mode = isAnnual ? 'annual' : 'monthly';
  for (const [key, val] of Object.entries(prices)) {
    const mainEl = document.getElementById(`${key}-main`);
    const oldEl  = document.getElementById(`${key}-old`);
    const periodEl = document.getElementById(`${key}-period`);
    if (mainEl) mainEl.textContent = val[mode].main;
    if (oldEl)  oldEl.textContent  = val[mode].old;
    if (periodEl) periodEl.textContent = val[mode].period;
  }
}


// ---- EXAM TRACK TABS (Hero Card) ----
function switchTrack(btn, trackId) {
  // Remove active from all tabs
  document.querySelectorAll('.track-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Hide all track content
  document.querySelectorAll('.track-content').forEach(t => t.classList.add('hidden'));
  const target = document.getElementById('track-' + trackId);
  if (target) target.classList.remove('hidden');
}

// ---- PRICING TRACK SELECTOR ----
function switchPriceTrack(btn, trackId) {
  document.querySelectorAll('.pt-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.price-track-content').forEach(t => t.classList.add('hidden'));
  const target = document.getElementById(trackId);
  if (target) target.classList.remove('hidden');
}


// ---- COPY COUPON CODE ----
function copyCoupon(el) {
  const code = el.textContent.trim();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => showCopyToast(code));
  } else {
    // Fallback
    const inp = document.createElement('input');
    inp.value = code;
    document.body.appendChild(inp);
    inp.select();
    document.execCommand('copy');
    document.body.removeChild(inp);
    showCopyToast(code);
  }
}

function showCopyToast(code) {
  const toast = document.createElement('div');
  toast.textContent = `✅ Code "${code}" copied to clipboard!`;
  toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.3);`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}


// ---- FREE RESOURCES SIGNUP ----
function handleFreeSignup(e) {
  e.preventDefault();
  const name  = document.getElementById('freeName')?.value || '';
  const email = document.getElementById('freeEmail')?.value || '';
  const track = document.getElementById('freeTrack')?.value || '';

  const trackNames = {
    'ap_stats': 'AP® Statistics Inference Decision Tree',
    'ap_calc':  'AP® Calculus Existence Theorems Sheet',
    'trade':    'Trade Math Rolling Offset Cheat Sheet'
  };

  // Simulate submission (in production, connect to Zoho Mail API / ConvertKit)
  alert(`🎉 Welcome, ${name || 'Student'}!\n\nYour Free Signup Bonus has been ACTIVATED:\n✅ 50 Flashcards Unlocked\n✅ 3 Diagnostic Mock Exams Unlocked\n✅ Virtual Quick Review Sheet Access\n\nWe have dispatched your direct access links to ${email}.\n(From: support@eduprosuite.pro)`);

  // Reset form
  e.target.reset();
}


// ---- NEWSLETTER SIGNUP ----
function handleNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('nlEmail')?.value || '';
  alert(`✅ Subscribed!\n\nWelcome to the EduPro Suite weekly digest, ${email}.\nYou'll receive high-yield exam tips and flash deals every Monday morning.`);
  e.target.reset();
}


// ---- MOBILE MENU TOGGLE ----
function toggleMobileMenu() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const isOpen = nav.classList.toggle('mobile-open');
  if (isOpen) {
    nav.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:68px;left:0;right:0;background:white;border-bottom:1px solid #e2e8f0;padding:16px 24px;gap:4px;box-shadow:0 8px 32px rgba(0,0,0,0.1);z-index:89;';
  } else {
    nav.style.cssText = 'display:none';
  }
}


// ---- STICKY HEADER SHADOW ON SCROLL ----
window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');
  if (header) {
    if (window.scrollY > 60) {
      header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    } else {
      header.style.boxShadow = 'none';
    }
  }
}, { passive: true });


// ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
