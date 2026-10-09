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


// ---- FREE RESOURCES & NEWSLETTER LEAD CAPTURE CATALOG ----
const FREE_RESOURCE_CATALOG = {
  'ap_stats': {
    title: 'AP® Statistics 2027 Inference Decision Tree & Cheat Sheet',
    downloadUrl: 'downloads/AP_Statistics_2027_Inference_Cheat_Sheet.html',
    filename: 'AP_Statistics_2027_Inference_Cheat_Sheet.html',
    badge: 'College Board CED 2027 Aligned',
    subject: 'AP® Statistics'
  },
  'ap_calc': {
    title: 'AP® Calculus AB/BC Existence Theorems & Formula Guide',
    downloadUrl: 'downloads/AP_Calculus_Theorems_Cheat_Sheet.html',
    filename: 'AP_Calculus_Theorems_Cheat_Sheet.html',
    badge: 'College Board CED Aligned',
    subject: 'AP® Calculus'
  },
  'trade': {
    title: 'Trade Math Rolling Offset & Multiplier Master Reference Guide',
    downloadUrl: 'downloads/Trade_Math_Offset_Guide.html',
    filename: 'Trade_Math_Offset_Guide.html',
    badge: 'UA Local & Journeyman Licensing Standard',
    subject: 'Trade Math'
  }
};

// Lead capture and instant download handler ("data collecting")
function handleFreeSignup(e, trackKey) {
  e.preventDefault();
  const form = e.target;
  const nameInput = form.querySelector('input[type="text"]') || document.getElementById('freeName');
  const emailInput = form.querySelector('input[type="email"]') || document.getElementById('freeEmail');
  const track = trackKey || document.getElementById('freeTrack')?.value || 'ap_stats';
  
  const name = nameInput ? nameInput.value.trim() : 'Student';
  const email = emailInput ? emailInput.value.trim() : '';

  if (!email) {
    alert('Please enter a valid email address.');
    return;
  }

  const resource = FREE_RESOURCE_CATALOG[track] || FREE_RESOURCE_CATALOG['ap_stats'];

  // Persistent Lead Collection in localStorage
  try {
    const leads = JSON.parse(localStorage.getItem('edupro_leads') || '[]');
    const newLead = {
      name: name,
      email: email,
      track: track,
      subject: resource.subject,
      resourceTitle: resource.title,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };
    leads.push(newLead);
    localStorage.setItem('edupro_leads', JSON.stringify(leads));
    console.log('✅ Lead captured successfully:', newLead);
  } catch (err) {
    console.error('Lead storage error:', err);
  }

  // Automatic download trigger
  const link = document.createElement('a');
  link.href = resource.downloadUrl;
  link.download = resource.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Transition form container to celebration & success state
  const parentContainer = form.closest('.lead-magnet-card') || form.closest('.free-signup-form') || form.parentElement;
  if (parentContainer) {
    parentContainer.innerHTML = `
      <div class="lead-magnet-success">
        <div class="lms-badge">🎉 RESOURCE UNLOCKED & DOWNLOAD STARTED</div>
        <h3>Welcome, ${name}!</h3>
        <p>Your free official guide <strong>${resource.title}</strong> has started downloading. We have also subscribed <strong>${email}</strong> to our weekly high-yield prep digest.</p>
        <div class="lms-actions">
          <a href="${resource.downloadUrl}" download="${resource.filename}" class="btn btn-primary">
            📥 Download Free Guide Again
          </a>
          <a href="${resource.downloadUrl}" target="_blank" class="btn btn-outline">
            👀 Open in Browser / Print
          </a>
        </div>
        <div class="lms-bonus">
          🏷️ <strong>Exclusive Welcome Gift:</strong> Use coupon code <strong>SCORE70</strong> for 70% off the complete Exam Vault at checkout!
        </div>
      </div>
    `;
  }
}

// Global Lead Export Helpers (for admin / data export)
window.getEduProLeads = function() {
  const leads = JSON.parse(localStorage.getItem('edupro_leads') || '[]');
  console.table(leads);
  return leads;
};

window.exportEduProLeads = function() {
  const leads = JSON.parse(localStorage.getItem('edupro_leads') || '[]');
  if (!leads.length) {
    alert('No leads collected yet in this browser session.');
    return;
  }
  const headers = ['Name', 'Email', 'Track', 'Subject', 'Resource', 'Timestamp', 'Page'];
  const rows = leads.map(l => [
    `"${l.name || ''}"`,
    `"${l.email || ''}"`,
    `"${l.track || ''}"`,
    `"${l.subject || ''}"`,
    `"${l.resourceTitle || ''}"`,
    `"${l.timestamp || ''}"`,
    `"${l.page || ''}"`
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `edupro_leads_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ---- FIRST-TIME VISITOR 50% AFFILIATE POPUP ----
function initFirstTimePopup() {
  const POPUP_SEEN_KEY = 'eps_affiliate_popup_seen';
  if (localStorage.getItem(POPUP_SEEN_KEY)) {
    return; // Already seen, do not bother repeat visitors
  }

  // Create Modal DOM if not present
  if (!document.getElementById('epsAffiliateModal')) {
    const modalHTML = `
      <div class="eps-modal-overlay" id="epsAffiliateModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="eps-modal-card">
          <button class="eps-modal-close" id="epsCloseModalBtn" aria-label="Close dialog">&times;</button>
          <div class="eps-modal-header">
            <span class="eps-modal-badge">🔥 EXCLUSIVE LAUNCH OFFER</span>
            <h2 class="eps-modal-title" id="modalTitle">Earn 50% Commission on Every Product Sale!</h2>
            <p class="eps-modal-subtitle">Partner with EduPro Suite. Earn 50% of the listed price on every course and exam prep vault you recommend to students, peers, or schools.</p>
          </div>
          <div class="eps-modal-body">
            <div class="eps-modal-perks">
              <div class="eps-perk-item">
                <span class="eps-perk-icon">💰</span>
                <div>
                  <strong>50% Instant Revenue Share</strong>
                  <small>Earn from $19.50 up to $162.50+ on every single customer purchase through your partner link.</small>
                </div>
              </div>
              <div class="eps-perk-item">
                <span class="eps-perk-icon">🎁</span>
                <div>
                  <strong>Free Review Copies & Promo Codes</strong>
                  <small>Receive free full-access digital review bundles and an exclusive 10% discount coupon for your followers.</small>
                </div>
              </div>
              <div class="eps-perk-item">
                <span class="eps-perk-icon">⚡</span>
                <div>
                  <strong>Automated Monthly Payouts</strong>
                  <small>Guaranteed direct deposits via Stripe or PayPal with 60-day tracking cookies and real-time click analytics.</small>
                </div>
              </div>
            </div>

            <div class="eps-modal-actions">
              <a href="affiliates.html" class="btn btn-primary btn-block eps-modal-btn" id="epsModalCta">Start Earning 50% Now — Join Free →</a>
              <button class="eps-modal-dismiss" id="epsModalDismissBtn">No thanks, I will continue browsing</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const modal = document.getElementById('epsAffiliateModal');
  const closeBtn = document.getElementById('epsCloseModalBtn');
  const dismissBtn = document.getElementById('epsModalDismissBtn');
  const ctaBtn = document.getElementById('epsModalCta');

  function dismissModal() {
    if (!modal) return;
    modal.classList.remove('active');
    localStorage.setItem(POPUP_SEEN_KEY, 'true');
  }

  // Show after 1.5 seconds delay for a smooth user experience
  setTimeout(() => {
    if (modal) modal.classList.add('active');
  }, 1500);

  if (closeBtn) closeBtn.addEventListener('click', dismissModal);
  if (dismissBtn) dismissBtn.addEventListener('click', dismissModal);
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      localStorage.setItem(POPUP_SEEN_KEY, 'true');
    });
  }

  // Close when clicking outside modal card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      dismissModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      dismissModal();
    }
  });
}

// Dev/Test helper
window.resetAffiliatePopup = function() {
  localStorage.removeItem('eps_affiliate_popup_seen');
  alert('Popup reset! Refresh the page to see it appear.');
};

// Initialize popup on window load
window.addEventListener('DOMContentLoaded', () => {
  initFirstTimePopup();
});

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
