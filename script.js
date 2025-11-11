function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open")
    icon.classList.toggle("open")
}



// ===== LinkedIn Referrer Lock for Resume Button =====
// How it works:
// - If the visitor came from LinkedIn (linkedin.com or lnkd.in) OR the URL includes ?src=li,
//   we disable the Resume button and show a friendly message instead of opening the PDF.
// - We remember the state in sessionStorage so navigation within your site keeps it locked.
// - If you visit directly (not from LinkedIn) or append ?src=direct, the lock is cleared.

(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function getHostname(url) {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  function isLinkedInHost(host) {
    return (
      !!host &&
      (host === 'lnkd.in' ||
       host.endsWith('.linkedin.com') ||
       host === 'linkedin.com')
    );
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function lockResume(btn) {
    if (!btn) return;
    btn.classList.add('disabled');
    btn.setAttribute('aria-disabled', 'true');
    btn.title = 'Resume disabled for visitors coming from LinkedIn.';
    // Remove any previous listeners by cloning (safe guard if code runs twice)
    const lockedBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(lockedBtn, btn);

    lockedBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Friendly message; you can swap this for a toast/snackbar if you have one
      alert(
        "To protect my privacy, the resume isn’t available when coming from LinkedIn.\n\n" +
        "Please visit my site directly (or email me via the Contact section) if you'd like a copy."
      );
    });
  }

  function unlockResume(btn) {
    if (!btn) return;
    btn.classList.remove('disabled');
    btn.removeAttribute('aria-disabled');
    btn.removeAttribute('title');

    // Remove any previous listeners by cloning (ensures clean state)
    const freshBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(freshBtn, btn);

    const href = freshBtn.getAttribute('data-href');

    freshBtn.addEventListener('click', function () {
      if (!href) return;

      const modal   = document.getElementById('resume-modal');
      const frame   = document.getElementById('resume-frame');
      const dlBtn   = document.getElementById('resume-download');

      if (!modal || !frame) {
        // Fallback: open in new tab if modal isn't present
        window.open(href, '_blank', 'noopener');
        return;
      }

      // Set/refresh PDF source
      if (frame.src !== href) {
        frame.src = href;
      }

      // Wire the Download button (always points at href)
      if (dlBtn) {
        dlBtn.onclick = () => {
          window.open(href, "_blank", "noopener");
        };
      }

      // Open modal + lock body scroll
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  }



  onReady(function () {
    const btn = document.getElementById('resume-btn');
    if (!btn) return;

    const refHost = getHostname(document.referrer);
    const qp = getQueryParam('src');

    // Explicit overrides via query param
    const forceLI = qp && qp.toLowerCase() === 'li';
    const forceDirect = qp && qp.toLowerCase() === 'direct';

    // Did this session originate from LinkedIn?
    let fromLinkedIn = sessionStorage.getItem('cameFromLinkedIn') === '1';

    // If this exact page load has a LI referrer or ?src=li, mark it
    if (isLinkedInHost(refHost) || forceLI) {
      fromLinkedIn = true;
      sessionStorage.setItem('cameFromLinkedIn', '1');
    }

    // If explicitly direct, clear the lock (useful for testing or sharing a “direct” link)
    if (forceDirect) {
      fromLinkedIn = false;
      sessionStorage.removeItem('cameFromLinkedIn');
    }

    if (fromLinkedIn) {
      lockResume(btn);
    } else {
      unlockResume(btn);
    }
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const modal    = document.getElementById("resume-modal");
  const closeBtn = modal ? modal.querySelector(".resume-close") : null;
  const backdrop = modal ? modal.querySelector(".resume-backdrop") : null;

  function closeResumeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");  // re-enable scrolling
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeResumeModal);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeResumeModal);
  }

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeResumeModal();
    }
  });
});


// ===== Hide custom cursor when over PDF iframe =====
document.addEventListener("DOMContentLoaded", () => {
  const pdfFrame = document.getElementById("resume-frame");
  const cursor = document.querySelector(".custom-cursor");

  if (pdfFrame && cursor) {
    pdfFrame.addEventListener("mouseenter", () => {
      cursor.style.opacity = "0";
    });
    pdfFrame.addEventListener("mouseleave", () => {
      cursor.style.opacity = "1";
    });
  }
});



// Header Typewriter Effect
document.addEventListener("DOMContentLoaded", function () {
  const target = document.getElementById("typewriter");
  const phrases = [
    "Software Developer",
    "Data Analyst",
    "AI/ML Engineer",
    "Life-Long Learner"
  ];

  let phraseIndex = 0;
  let letterIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;   // ms per letter
  const deletingSpeed = 60;  // ms per letter
  const delayBetween = 1200; // pause between phrases

  function type() {
    const currentPhrase = phrases[phraseIndex];
    if (!isDeleting) {
      // typing
      target.textContent = currentPhrase.slice(0, letterIndex + 1);
      letterIndex++;
      if (letterIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(type, delayBetween);
        return;
      }
    } else {
      // deleting
      target.textContent = currentPhrase.slice(0, letterIndex - 1);
      letterIndex--;
      if (letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(type, speed);
  }

  type();
});


// ===== Project Filters =====
document.addEventListener('DOMContentLoaded', () => {
  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  const cards   = Array.from(document.querySelectorAll('.project-card'));
  const activeFilters = new Set();

  function applyFilters() {
    // If no filters selected, show all
    if (activeFilters.size === 0) {
      cards.forEach(card => card.classList.remove('is-hidden'));
      return;
    }

    cards.forEach(card => {
      const tags = (card.getAttribute('data-cat') || '')
        .toLowerCase()
        .split(/\s+/);
      // show if card has ANY selected tag
      const show = [...activeFilters].some(tag => tags.includes(tag));
      card.classList.toggle('is-hidden', !show);
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = (btn.getAttribute('data-filter') || '').toLowerCase();

      if (cat === 'all') {
        // Reset everything if "All" clicked
        activeFilters.clear();
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
        return;
      }

      // Toggle button state
      btn.classList.toggle('active');
      const isActive = btn.classList.contains('active');

      // Manage "All" button state
      const allBtn = buttons.find(b => b.dataset.filter === 'all');
      if (isActive) activeFilters.add(cat);
      else activeFilters.delete(cat);
      if (allBtn) allBtn.classList.remove('active');

      // Apply filters
      applyFilters();
    });
  });

  // Start with "All" active
  applyFilters();
});



const cursor = document.querySelector(".custom-cursor");

let mouseX = -10, mouseY = -10;
let cursorX = 0, cursorY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.4;
  cursorY += (mouseY - cursorY) * 0.4;
  cursor.style.top = `${cursorY}px`;
  cursor.style.left = `${cursorX}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.addEventListener("mousedown", () => cursor.classList.add("click"));
document.addEventListener("mouseup",   () => cursor.classList.remove("click"));

document.addEventListener("mouseleave", () => {
  cursor.style.opacity = 0; // hide when cursor leaves window
});
document.addEventListener("mouseenter", () => {
  cursor.style.opacity = 1; // show again when it re-enters
});



document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("last-updated");
  if (el) {
    const date = new Date(document.lastModified);
    const formatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    el.textContent = `Last updated: ${formatted}`;
  }
});


console.log("%c👋 Hey there! Curious dev? Let's connect on LinkedIn!!", 
  "color:#00aaff; font-size:14px; font-weight:bold;"
);
console.log("%c🔗 https://www.linkedin.com/in/jasonpereira518/", 
  "color:#0077b5; font-size:14px; text-decoration:underline;"
);

// ===== Scroll Highlighting using IntersectionObserver =====
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);

        if (entry.isIntersecting) {
          navLinks.forEach((el) => el.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    {
      threshold: 0.4, // 40% of section visible = active
    }
  );

  sections.forEach((section) => observer.observe(section));
});



// Scroll progress bar
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  let ticking = false;

  function updateBar() {
    const doc = document.documentElement;
    const scrollTop = window.pageYOffset || doc.scrollTop || 0;
    const max = (doc.scrollHeight - doc.clientHeight) || 1; // avoid divide-by-zero
    const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    bar.style.width = pct + '%';
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateBar);
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  window.addEventListener('load', requestTick);

  // Initial paint
  updateBar();
})();


// ===== Jason Mode Keyboard Shortcut (press "J") =====
document.addEventListener("keydown", (e) => {
  // Ignore if typing in an input or textarea
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
    return;
  }

  if (e.key === "j" || e.key === "J") {
    // Optional: small delay or animation hook could go here
    window.location.href = "extras/jason-mode.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const jasonNote = document.querySelector(".jason-mode-note");
  if (!jasonNote) return; // safety

  function checkBottom() {
    const doc = document.documentElement;
    const scrollTop = window.pageYOffset || doc.scrollTop || 0;
    const viewportHeight = window.innerHeight || doc.clientHeight;
    const fullHeight = doc.scrollHeight || document.body.scrollHeight;

    // How close to the bottom before we show it
    const threshold = 120; // px from bottom

    if (scrollTop + viewportHeight >= fullHeight - threshold) {
      jasonNote.classList.add("visible");
    } else {
      jasonNote.classList.remove("visible");
    }
  }

  // Run on scroll and on load
  window.addEventListener("scroll", checkBottom, { passive: true });
  checkBottom();
});


/*
// =============================
document.addEventListener("DOMContentLoaded", () => {
  // Load EmailJS credentials (from environment or fallback config.js)
  const EMAILJS_PUBLIC_KEY =
    import.meta?.env?.VITE_EMAILJS_PUBLIC_KEY || window?.env?.EMAILJS_PUBLIC_KEY;
  const EMAILJS_SERVICE_ID =
    import.meta?.env?.VITE_EMAILJS_SERVICE_ID || window?.env?.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID =
    import.meta?.env?.VITE_EMAILJS_TEMPLATE_ID || window?.env?.EMAILJS_TEMPLATE_ID;

  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    console.error("❌ Missing EmailJS credentials! Check your .env or config.js file.");
    return;
  }

  // Initialize EmailJS
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  // Form elements
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("cf-submit");
  const statusEl = document.getElementById("cf-status");

  if (!form) return; // If contact form isn't on page

  let lastSentAt = 0; // basic rate-limit

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("cf-name")?.value.trim();
    const email = document.getElementById("cf-email")?.value.trim();
    const subject = document.getElementById("cf-subject")?.value.trim();
    const message = document.getElementById("cf-message")?.value.trim();
    const honey = document.getElementById("cf-company")?.value.trim(); // honeypot

    // Stop bots or invalid submissions
    if (honey !== "" || !name || !email || !message) {
      statusEl.textContent = "Please fill out all required fields.";
      return;
    }

    // Rate-limit (10 seconds)
    const now = Date.now();
    if (now - lastSentAt < 10000) {
      statusEl.textContent = "Please wait a few seconds before sending again.";
      return;
    }

    // UI feedback
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    statusEl.textContent = "";

    try {
      const params = {
        from_name: name,
        reply_to: email,
        subject: subject || "(No subject)",
        message: message,
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);

      statusEl.textContent = "Message sent! I’ll get back to you soon.";
      form.reset();
      lastSentAt = now;
    } catch (err) {
      console.error("EmailJS error:", err);
      statusEl.textContent = "Something went wrong. Please try again.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
    }
  });
});

*/

