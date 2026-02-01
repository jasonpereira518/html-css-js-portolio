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
/* document.addEventListener("DOMContentLoaded", () => {
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
}); */

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
  if (!buttons.length || !cards.length) return;

  const activeFilters = new Set();
  const allBtn = buttons.find(b => (b.dataset.filter || '').toLowerCase() === 'all');

  function applyFilters() {
    if (activeFilters.size === 0) {
      // No filters => show everything
      cards.forEach(card => card.classList.remove('is-hidden'));
    } else {
      const selected = [...activeFilters];

      cards.forEach(card => {
        const tags = (card.getAttribute('data-cat') || '')
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);

        const show = selected.some(tag => tags.includes(tag));
        card.classList.toggle('is-hidden', !show);
      });
    }

    // 🔥 Recalculate scroll progress after layout changes
    if (typeof window.updateScrollProgress === 'function') {
      // Let layout settle first
      requestAnimationFrame(() => {
        window.updateScrollProgress();
      });
    }
  }

  function resetToAll() {
    activeFilters.clear();
    buttons.forEach(b => b.classList.remove('active'));
    if (allBtn) allBtn.classList.add('active');
    applyFilters();
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = (btn.dataset.filter || '').toLowerCase();

      if (cat === 'all') {
        resetToAll();
        return;
      }

      // Toggle this filter
      const isActivating = !btn.classList.contains('active');
      btn.classList.toggle('active', isActivating);

      if (isActivating) {
        activeFilters.add(cat);
      } else {
        activeFilters.delete(cat);
      }

      // If no filters left, fall back to "All"
      if (activeFilters.size === 0) {
        resetToAll();
        return;
      }

      // Make sure "All" is off if any specific filters are on
      if (allBtn) allBtn.classList.remove('active');

      applyFilters();
    });
  });

  // Start with "All" selected and everything visible
  resetToAll();
});


// ==== Project hover videos ====
document.addEventListener("DOMContentLoaded", () => {
  // Any .project-card with a data-video-src gets a hover video
  const videoCards = document.querySelectorAll('.project-card[data-video-src]');

  videoCards.forEach(card => {
    const videoSrc = card.dataset.videoSrc;
    const mediaContainer = card.querySelector('.article-container');
    const img = mediaContainer ? mediaContainer.querySelector('.project-img') : null;

    if (!videoSrc || !mediaContainer || !img) return;

    // Create the <video> element
    const video = document.createElement('video');
    video.src = videoSrc;
    video.className = 'project-video';
    video.muted = true;        // needed for autoplay
    video.loop = true;         // keep going
    video.playsInline = true;  // iOS-friendly

    // Insert the video into the same container as the image
    mediaContainer.appendChild(video);

    // Helper: start (or resume) playback
    const playVideo = () => {
      video.play().catch(() => {
        // Autoplay blocked; user hovering again will retry.
      });
    };

    // On hover: show the video + play it
    card.addEventListener('mouseenter', () => {
      card.classList.add('show-video');
      playVideo();
    });

    // On unhover: hide the video visually but KEEP IT PLAYING
    card.addEventListener('mouseleave', () => {
      card.classList.remove('show-video');
      // IMPORTANT: do not pause() or reset currentTime,
      // so the video keeps playing behind the scenes.
    });

    // Preload enough data so it starts smoothly
    video.load();
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const marqueeTitles = document.querySelectorAll(".marquee-title");

  marqueeTitles.forEach(span => {
    const fullText = span.textContent.trim();

    // Create wrapper (track)
    const track = document.createElement("span");
    track.className = "marquee-track";

    // Two copies for seamless loop
    const t1 = document.createElement("span");
    t1.className = "marquee-text";
    t1.textContent = fullText;

    const t2 = t1.cloneNode(true);

    track.appendChild(t1);
    track.appendChild(t2);

    // Replace original span with the animated version
    span.replaceWith(track);
  });
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

// Highlight nav link as user scrolls
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#desktop-nav .nav-links a');

function activateLink() {
  let scrollY = window.scrollY + window.innerHeight / 3;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => link.classList.remove('active'));
      document
        .querySelector(`#desktop-nav a[href="#${sectionId}"]`)
        ?.classList.add('active');
    }
  });
}

window.addEventListener('scroll', activateLink);


// Scroll progress bar
// ===== Scroll Progress Bar =====
document.addEventListener('DOMContentLoaded', () => {
  const progressEl = document.getElementById('scroll-progress');
  if (!progressEl) return; // safety guard

  function updateScrollProgress() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const docHeight = doc.scrollHeight - window.innerHeight;

    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressEl.style.width = `${progress}%`;
  }

  // Expose globally so other scripts (like filters) can call it
  window.updateScrollProgress = updateScrollProgress;

  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress(); // initial
});



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

