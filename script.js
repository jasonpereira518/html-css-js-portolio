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


// ==== Project hover preview (image/video) ====
document.addEventListener("DOMContentLoaded", () => {
  const cards = Array.from(document.querySelectorAll(".project-card"));
  const preview = document.getElementById("project-hover-preview");
  const previewImg = document.getElementById("project-hover-preview-image");
  const previewVideo = document.getElementById("project-hover-preview-video");
  const previewTitle = document.getElementById("project-hover-preview-title");
  const desktopHoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!cards.length || !preview || !previewImg || !previewVideo || !desktopHoverCapable) return;

  let activeCard = null;
  let hideTimer = null;
  let lastPointerX = 0;
  let lastPointerY = 0;
  const PREVIEW_MAX_WIDTH = 360;
  const PREVIEW_MAX_HEIGHT = 300;
  const PREVIEW_FALLBACK_WIDTH = 280;
  const PREVIEW_FALLBACK_HEIGHT = 210;

  const clearHideTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  const isVideoSrc = (src) => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(src || "");

  const setPreviewSizeFromMedia = (mediaWidth, mediaHeight) => {
    const width = Number(mediaWidth) || PREVIEW_FALLBACK_WIDTH;
    const height = Number(mediaHeight) || PREVIEW_FALLBACK_HEIGHT;
    const scale = Math.min(1, PREVIEW_MAX_WIDTH / width, PREVIEW_MAX_HEIGHT / height);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    preview.style.width = `${targetWidth}px`;
    preview.style.height = `${targetHeight}px`;

    if (activeCard && preview.classList.contains("is-visible")) {
      placePreview(activeCard, lastPointerX, lastPointerY);
    }
  };

  const setPreviewMedia = (card) => {
    const fallbackImg = card.querySelector(".project-img");
    const explicitSrc = card.dataset.previewSrc || card.dataset.videoSrc || (fallbackImg ? fallbackImg.src : "");
    const explicitType = (card.dataset.previewType || "").toLowerCase().trim();
    const mediaType = explicitType === "video" || explicitType === "image"
      ? explicitType
      : (isVideoSrc(explicitSrc) ? "video" : "image");

    if (!explicitSrc) return false;

    if (mediaType === "video") {
      if (previewVideo.src !== explicitSrc) previewVideo.src = explicitSrc;
      previewVideo.hidden = false;
      previewImg.hidden = true;
      if (previewVideo.videoWidth && previewVideo.videoHeight) {
        setPreviewSizeFromMedia(previewVideo.videoWidth, previewVideo.videoHeight);
      } else {
        setPreviewSizeFromMedia(PREVIEW_FALLBACK_WIDTH, PREVIEW_FALLBACK_HEIGHT);
      }
      previewVideo.play().catch(() => {});
    } else {
      if (previewImg.src !== explicitSrc) previewImg.src = explicitSrc;
      previewImg.hidden = false;
      previewVideo.hidden = true;
      previewVideo.pause();
      previewVideo.removeAttribute("src");
      previewVideo.load();
      if (previewImg.naturalWidth && previewImg.naturalHeight) {
        setPreviewSizeFromMedia(previewImg.naturalWidth, previewImg.naturalHeight);
      } else if (fallbackImg && fallbackImg.naturalWidth && fallbackImg.naturalHeight) {
        setPreviewSizeFromMedia(fallbackImg.naturalWidth, fallbackImg.naturalHeight);
      } else {
        setPreviewSizeFromMedia(PREVIEW_FALLBACK_WIDTH, PREVIEW_FALLBACK_HEIGHT);
      }
    }

    if (previewTitle) {
      const titleEl = card.querySelector(".project-title");
      const marqueeTextEl = titleEl ? titleEl.querySelector(".marquee-text") : null;
      const text = marqueeTextEl
        ? marqueeTextEl.textContent
        : (titleEl ? titleEl.textContent : "");
      previewTitle.textContent = (text || "").trim();
    }

    return true;
  };

  previewImg.addEventListener("load", () => {
    if (previewImg.naturalWidth && previewImg.naturalHeight) {
      setPreviewSizeFromMedia(previewImg.naturalWidth, previewImg.naturalHeight);
    }
  });

  previewVideo.addEventListener("loadedmetadata", () => {
    if (previewVideo.videoWidth && previewVideo.videoHeight) {
      setPreviewSizeFromMedia(previewVideo.videoWidth, previewVideo.videoHeight);
    }
  });

  const placePreview = (card, pointerX = null, pointerY = null) => {
    const cardRect = card.getBoundingClientRect();
    const previewRect = preview.getBoundingClientRect();
    const gap = 26;
    const viewportPad = 14;
    const resolvedPointerX = pointerX ?? (cardRect.left + (cardRect.width / 2));
    const resolvedPointerY = pointerY ?? (cardRect.top + (cardRect.height / 2));
    const verticalLift = Math.min(56, previewRect.height * 0.2);

    let left = resolvedPointerX + gap;
    let top = resolvedPointerY - verticalLift;

    if (left + previewRect.width > window.innerWidth - viewportPad) {
      left = resolvedPointerX - previewRect.width - gap;
    }

    if (left < viewportPad) {
      left = Math.max(viewportPad, window.innerWidth - previewRect.width - viewportPad);
    }

    if (top + previewRect.height > window.innerHeight - viewportPad) {
      top = window.innerHeight - previewRect.height - viewportPad;
    }

    top = Math.max(viewportPad, top);

    preview.style.left = `${Math.round(left)}px`;
    preview.style.top = `${Math.round(top)}px`;

    const cardCenterX = resolvedPointerX || (cardRect.left + (cardRect.width / 2));
    const previewCenterX = left + (previewRect.width / 2);
    const isRightSide = previewCenterX >= cardCenterX;
    preview.classList.toggle("is-right-side", isRightSide);
    preview.classList.toggle("is-left-side", !isRightSide);
  };

  const showPreview = (card) => {
    clearHideTimer();
    if (!setPreviewMedia(card)) return;

    if (activeCard && activeCard !== card) {
      activeCard.classList.remove("is-preview-active");
    }

    activeCard = card;
    activeCard.classList.add("is-preview-active");

    preview.classList.add("is-visible");
    placePreview(card, lastPointerX, lastPointerY);
  };

  const hidePreview = () => {
    clearHideTimer();
    hideTimer = setTimeout(() => {
      preview.classList.remove("is-visible");
      previewVideo.pause();
      if (activeCard) activeCard.classList.remove("is-preview-active");
      activeCard = null;
    }, 70);
  };

  cards.forEach((card) => {
    card.addEventListener("mouseenter", (event) => {
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      showPreview(card);
    });
    card.addEventListener("mousemove", (event) => {
      if (activeCard !== card || !preview.classList.contains("is-visible")) return;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      placePreview(card, lastPointerX, lastPointerY);
    });
    card.addEventListener("mouseleave", hidePreview);
    card.addEventListener("focusin", () => {
      const rect = card.getBoundingClientRect();
      lastPointerX = rect.left + (rect.width / 2);
      lastPointerY = rect.top + (rect.height / 2);
      showPreview(card);
    });
    card.addEventListener("focusout", hidePreview);
  });

  window.addEventListener("scroll", () => {
    if (activeCard && preview.classList.contains("is-visible")) {
      placePreview(activeCard, lastPointerX, lastPointerY);
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (activeCard && preview.classList.contains("is-visible")) {
      placePreview(activeCard, lastPointerX, lastPointerY);
    }
  });
});


// ===== RIGHT SIDECAR =====
document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("right-sidecar");
  const overlay = document.getElementById("right-sidecar-overlay");
  const peek = document.getElementById("right-sidecar-peek");
  const closeBtn = document.getElementById("right-sidecar-close");
  const listEl = document.getElementById("right-sidecar-list");
  const updatedEl = document.getElementById("right-sidecar-updated");

  if (!panel || !overlay || !peek || !listEl) return;

  const EDGE_TRIGGER_PX = 38;
  const PEEK_HIDE_MS = 1000;
  const LIVE_REFRESH_MS = 60000;

  let isOpen = false;
  let isPeeking = false;
  let hideTimer = null;

  function clearHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function showPeek() {
    if (isOpen) return;
    clearHideTimer();
    isPeeking = true;
    panel.classList.add("peeking");
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "false");
    overlay.classList.remove("visible");
  }

  function hidePanelFully() {
    clearHideTimer();
    isOpen = false;
    isPeeking = false;
    panel.classList.remove("peeking", "open");
    panel.setAttribute("aria-hidden", "true");
    overlay.classList.remove("visible");
  }

  function scheduleHide() {
    if (isOpen) return;
    clearHideTimer();
    hideTimer = setTimeout(hidePanelFully, PEEK_HIDE_MS);
  }

  function openPanel() {
    clearHideTimer();
    isOpen = true;
    isPeeking = false;
    panel.classList.remove("peeking");
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    overlay.classList.add("visible");
    loadRightSidecarData(listEl, updatedEl);
  }

  function closePanel() {
    if (!isOpen) return;
    isOpen = false;
    isPeeking = true;
    panel.classList.remove("open");
    panel.classList.add("peeking");
    panel.setAttribute("aria-hidden", "false");
    overlay.classList.remove("visible");
    scheduleHide();
  }

  document.addEventListener("mousemove", (e) => {
    if (isOpen) return;
    const nearRightEdge = window.innerWidth - e.clientX <= EDGE_TRIGGER_PX;

    if (nearRightEdge) {
      showPeek();
    } else if (isPeeking) {
      scheduleHide();
    }
  });

  peek.addEventListener("click", (e) => {
    e.stopPropagation();
    openPanel();
  });

  panel.addEventListener("click", (e) => {
    if (!isOpen) {
      e.stopPropagation();
      openPanel();
    }
  });

  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    closePanel();
  });

  overlay.addEventListener("click", closePanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closePanel();
    }
  });

  document.addEventListener("click", (e) => {
    if (!isOpen) return;
    if (!panel.contains(e.target)) {
      closePanel();
    }
  });

  panel.addEventListener("mouseenter", () => {
    if (!isOpen) clearHideTimer();
  });

  panel.addEventListener("mouseleave", () => {
    if (!isOpen && isPeeking) {
      scheduleHide();
    }
  });

  const refreshRightSidecarData = () => loadRightSidecarData(listEl, updatedEl);
  refreshRightSidecarData();
  window.setInterval(refreshRightSidecarData, LIVE_REFRESH_MS);
});

async function loadRightSidecarData(listEl, updatedEl) {
  try {
    const res = await fetch("./json/building-now.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load building-now.json");

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (updatedEl) {
      updatedEl.textContent = formatRightSidecarDaysAgo(data.lastUpdated);
    }

    if (!items.length) {
      listEl.innerHTML = `<p class="right-sidecar-item-description">Nothing added yet — update building-now.json.</p>`;
      return;
    }

    listEl.innerHTML = items.map(item => {
      const name = escapeRightSidecarHtml(item.name || "Untitled");
      const description = escapeRightSidecarHtml(item.description || "");
      const status = escapeRightSidecarHtml(item.status || "Active");
      const statusClass = getRightSidecarStatusClass(item.status);

      return `
        <article class="right-sidecar-item">
          <span class="right-sidecar-live-dot" aria-hidden="true"></span>
          <div>
            <div class="right-sidecar-item-top">
              <h3 class="right-sidecar-item-name">${name}</h3>
              <span class="right-sidecar-status ${statusClass}">${status}</span>
            </div>
            <p class="right-sidecar-item-description">${description}</p>
          </div>
        </article>
      `;
    }).join("");
  } catch (err) {
    console.error("Error loading right sidecar data:", err);
    listEl.innerHTML = `<p class="right-sidecar-item-description">Couldn’t load this panel right now.</p>`;
    if (updatedEl) updatedEl.textContent = "Update unavailable";
  }
}

function getRightSidecarStatusClass(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "shipping") return "right-sidecar-status--shipping";
  if (normalized === "in progress") return "right-sidecar-status--in-progress";
  if (normalized === "exploring") return "right-sidecar-status--exploring";
  return "right-sidecar-status--default";
}

function formatRightSidecarDaysAgo(dateString) {
  if (!dateString) return "Updated recently";

  const inputDate = new Date(dateString);
  if (Number.isNaN(inputDate.getTime())) return "Updated recently";

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcInput = Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  const diffDays = Math.max(0, Math.floor((utcNow - utcInput) / msPerDay));

  if (diffDays === 0) return "Updated today";
  if (diffDays === 1) return "Updated 1 day ago";
  return `Updated ${diffDays} days ago`;
}

function escapeRightSidecarHtml(str) {
  return String(str).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}



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

if (cursor) {
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
}

document.addEventListener("mousedown", () => cursor.classList.add("click"));
document.addEventListener("mouseup",   () => cursor.classList.remove("click"));

document.addEventListener("mouseleave", () => {
  cursor.style.opacity = 0; // hide when cursor leaves window
});
document.addEventListener("mouseenter", () => {
  cursor.style.opacity = 1; // show again when it re-enters
});


document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("last-updated");
  if (!el) return;

  try {
    const res = await fetch(
      "https://api.github.com/repos/jasonpereira518/html-css-js-portolio"
    );

    if (!res.ok) throw new Error("GitHub API failed");

    const data = await res.json();

    const date = new Date(data.pushed_at);

    el.textContent = "Last updated: " + date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  } catch (err) {
    console.error(err);
    el.textContent = "Last updated: unavailable";
  }
});



/* document.addEventListener("DOMContentLoaded", () => {
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
}); */


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
// ===== Certifications Show More / Less =====
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("certs-toggle-btn");
  const hiddenCerts = document.querySelectorAll(".cert-hidden");

  // If no hidden certs exist, hide the button
  if (!toggleBtn) return;
  if (!hiddenCerts.length) {
    toggleBtn.parentElement.style.display = "none";
    return;
  }

  let expanded = false;

  toggleBtn.addEventListener("click", () => {
    expanded = !expanded;

    hiddenCerts.forEach(cert => {
      cert.style.display = expanded ? "grid" : "none";
    });

    toggleBtn.textContent = expanded ? "Show less" : "Show more";
    toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");

    // Optional: keep scroll progress accurate if you use your progress bar
    if (typeof window.updateScrollProgress === "function") {
      requestAnimationFrame(() => window.updateScrollProgress());
    }
  });
});


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
  if (!jasonNote) return;

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

  function updateJasonNote() {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const fullHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

    const scrollingUp = currentScrollY < lastScrollY;
    const nearBottom = currentScrollY + viewportHeight >= fullHeight - 120;

    if (scrollingUp || nearBottom) {
      jasonNote.classList.add("visible");
    } else {
      jasonNote.classList.remove("visible");
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener("scroll", updateJasonNote, { passive: true });
  updateJasonNote();
});

// ===== Hide ticker when reaching page bottom =====

document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.getElementById("work-ticker");
  if (!ticker) return;

  const threshold = 80; // px from bottom before hiding

  function updateTicker() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    const nearBottom = scrollTop + viewportHeight >= fullHeight - threshold;

    if (nearBottom) {
      ticker.classList.add("work-ticker--hidden");
    } else {
      ticker.classList.remove("work-ticker--hidden");
    }
  }

  window.addEventListener("scroll", updateTicker, { passive: true });
  updateTicker();
});

// ===== Mouse Dot Glow Background =====
document.addEventListener("DOMContentLoaded", () => {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (document.querySelector(".mouse-dot-glow")) return;

  const glowLayer = document.createElement("div");
  glowLayer.className = "mouse-dot-glow";
  document.body.prepend(glowLayer);

  let mouseX = -9999;
  let mouseY = -9999;
  let rafId = null;
  let hasCursor = false;

  const paintGlow = () => {
    document.documentElement.style.setProperty("--mouse-x", `${mouseX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${mouseY}px`);
    rafId = null;
  };

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!hasCursor) {
        hasCursor = true;
        glowLayer.classList.add("is-active");
      }
      if (!rafId) {
        rafId = requestAnimationFrame(paintGlow);
      }
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => {
    hasCursor = false;
    glowLayer.classList.remove("is-active");
    mouseX = -9999;
    mouseY = -9999;
    if (!rafId) {
      rafId = requestAnimationFrame(paintGlow);
    }
  });
});

/*
document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.getElementById("work-ticker");
  const toggle = document.getElementById("work-ticker-toggle");

  if (!ticker || !toggle) return;

  toggle.addEventListener("click", () => {
    const isHidden = ticker.classList.toggle("work-ticker--hidden");
    toggle.setAttribute("aria-expanded", isHidden ? "false" : "true");
  });
});*/


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

// ===== Full-Screen Terminal Takeover =====
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("terminal-overlay");
  const outputEl = document.getElementById("terminal-output");
  const bootEl = document.getElementById("terminal-boot");
  const inputEl = document.getElementById("terminal-input");
  const statusEl = document.getElementById("terminal-status");
  const promptEl = document.getElementById("terminal-prompt-label");
  const introEl = document.getElementById("terminal-intro");
  const introLine1 = document.getElementById("terminal-intro-line1");
  const introLine2 = document.getElementById("terminal-intro-line2");
  const introLine3 = document.getElementById("terminal-intro-line3");
  const pagerPrevBtn = document.getElementById("terminal-page-prev");
  const pagerNextBtn = document.getElementById("terminal-page-next");
  const pagerLabel = document.getElementById("terminal-page-label");

  if (
    !overlay ||
    !outputEl ||
    !bootEl ||
    !inputEl ||
    !statusEl ||
    !promptEl ||
    !introEl ||
    !introLine1 ||
    !introLine2 ||
    !introLine3
  ) return;

  const CANONICAL_COMMANDS = ["ask", "list", "show", "open", "help"];
  const ENTITY_TYPES = ["projects", "experience", "education", "certifications", "leadership", "skills", "contact", "about", "live"];
  const TYPE_ALIASES = {
    project: "projects",
    projects: "projects",
    portfolio: "projects",
    work: "projects",
    internship: "experience",
    internships: "experience",
    experience: "experience",
    role: "experience",
    roles: "experience",
    education: "education",
    school: "education",
    schools: "education",
    cert: "certifications",
    certs: "certifications",
    certification: "certifications",
    certifications: "certifications",
    leadership: "leadership",
    involvement: "leadership",
    skill: "skills",
    skills: "skills",
    contact: "contact",
    links: "contact",
    about: "about",
    bio: "about",
    live: "live",
    now: "live"
  };

  const EASTER_EGGS = {
    matrix: [
      "Wake up, visitor.",
      "The portfolio has you.",
      "Follow the blue glow."
    ],
    "whoami++": [
      "user: visitor",
      "access: read-only",
      "mode: cinematic query console"
    ],
    trophy: [
      "Achievements unlocked:",
      " - Eagle Scout",
      " - TEDxUNC Speaker",
      " - Duke AI Hackathon Winner"
    ],
    hacktheplanet: [
      "Simulating breach vector...",
      "Payload attached.",
      "Relax. This terminal is read-only."
    ],
    redpill: ["No exits from the rabbit hole."],
    bluepill: ["Session stabilized. Continuing in normal reality."]
  };

  const state = {
    isOpen: false,
    booting: false,
    commandHistory: [],
    historyIndex: -1,
    restoreFocusEl: null,
    liveCache: null,
    isMobile: window.matchMedia("(max-width: 840px)").matches,
    entities: [],
    paginator: null,
    pendingSelection: null
  };

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function normalizeWhitespace(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function slugify(text) {
    return normalizeWhitespace(text)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function tokenize(input) {
    const tokens = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    while ((match = re.exec(input))) {
      tokens.push(match[1] ?? match[2] ?? match[3]);
    }
    return tokens;
  }

  function line(text, type = "") {
    const p = document.createElement("p");
    p.className = "terminal-line" + (type ? ` terminal-line--${type}` : "");
    if (Math.random() < 0.25) {
      p.classList.add("glitch");
    }
    const content = String(text ?? "");
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(content)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (start > lastIndex) {
        p.appendChild(document.createTextNode(content.slice(lastIndex, start)));
      }

      const anchor = document.createElement("a");
      anchor.href = match[0];
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "terminal-link";
      anchor.textContent = match[0];
      p.appendChild(anchor);

      lastIndex = end;
    }

    if (lastIndex < content.length) {
      p.appendChild(document.createTextNode(content.slice(lastIndex)));
    }

    outputEl.appendChild(p);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function clearOutput() {
    outputEl.innerHTML = "";
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setIntroCopy(l1, l2, l3 = "") {
    introLine1.textContent = l1;
    introLine2.textContent = l2;
    introLine3.textContent = l3;
  }

  function activeScrollPanel() {
    return state.booting ? bootEl : outputEl;
  }

  function extractFirstText(element, selector) {
    const n = element?.querySelector(selector);
    return normalizeWhitespace(n ? n.textContent : "");
  }

  function inferTypeFromText(text) {
    const words = tokenize(text.toLowerCase());
    for (const word of words) {
      if (TYPE_ALIASES[word]) return TYPE_ALIASES[word];
    }
    return null;
  }

  function scoreCandidate(item, terms) {
    if (!terms.length) return 1;
    let score = 0;
    const name = item.name.toLowerCase();
    const summary = item.summary.toLowerCase();
    const corpus = item.searchable.toLowerCase();

    for (const term of terms) {
      if (name === term) score += 15;
      if (name.includes(term)) score += 8;
      if (summary.includes(term)) score += 4;
      if (corpus.includes(term)) score += 2;
      if (item.type.includes(term)) score += 3;
      if (item.id.includes(term)) score += 4;
    }
    return score;
  }

  function searchEntities(query, allowedTypes = null, limit = 7) {
    const terms = tokenize(query.toLowerCase()).filter(Boolean);
    let pool = state.entities;
    if (allowedTypes && allowedTypes.length) {
      const allow = new Set(allowedTypes);
      pool = pool.filter((item) => allow.has(item.type));
    }
    return pool
      .map((item) => ({ item, score: scoreCandidate(item, terms) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function suggestCanonical(token) {
    return CANONICAL_COMMANDS
      .map((cmd) => ({ cmd, dist: levenshtein(token, cmd) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
      .map((row) => row.cmd);
  }

  async function loadLiveData() {
    if (state.liveCache) return state.liveCache;
    try {
      const res = await fetch("./json/building-now.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.liveCache = await res.json();
      return state.liveCache;
    } catch (_err) {
      return null;
    }
  }

  async function rebuildEntities() {
    const entities = [];

    const aboutSummary = normalizeWhitespace(
      document.querySelector("#about .text-container p")?.textContent || ""
    );
    entities.push({
      type: "about",
      id: "about",
      name: "About Jason",
      summary: aboutSummary,
      searchable: aboutSummary,
      lines: [aboutSummary],
      links: []
    });

    const skillCards = document.querySelectorAll("#skills .skills-section-container .details-container");
    const skillItems = [];
    skillCards.forEach((card) => {
      card.querySelectorAll(".skill-item").forEach((item) => {
        skillItems.push({
          name: extractFirstText(item, ".skill-name"),
          level: extractFirstText(item, ".skill-level")
        });
      });
    });
    skillItems.forEach((skill) => {
      const summary = `${skill.name} (${skill.level})`;
      entities.push({
        type: "skills",
        id: slugify(skill.name),
        name: skill.name,
        summary,
        searchable: summary,
        lines: [summary],
        links: []
      });
    });

    document.querySelectorAll("#experience .experience-card").forEach((card) => {
      const role = extractFirstText(card, ".experience-role");
      const org = extractFirstText(card, ".experience-org");
      const dates = extractFirstText(card, ".experience-dates");
      const bullets = Array.from(card.querySelectorAll(".experience-bullets li")).map((li) => normalizeWhitespace(li.textContent));
      const links = Array.from(card.querySelectorAll("button.project-btn")).map((btn) => ({
        label: normalizeWhitespace(btn.textContent),
        url: (btn.getAttribute("onclick") || "").match(/https?:\/\/[^'"]+/)?.[0] || ""
      })).filter((x) => x.url);
      const name = `${role} @ ${org}`;
      const summary = `${name} · ${dates}`;
      entities.push({
        type: "experience",
        id: slugify(name),
        name,
        summary,
        searchable: [name, dates, ...bullets].join(" "),
        lines: [name, dates, ...bullets],
        links
      });
    });

    document.querySelectorAll("#projects .project-card").forEach((card) => {
      const title = extractFirstText(card, ".project-title .marquee-text") || extractFirstText(card, ".project-title");
      const meta = extractFirstText(card, ".project-meta");
      const categories = normalizeWhitespace(card.getAttribute("data-cat")).split(" ").filter(Boolean);
      const links = Array.from(card.querySelectorAll("button.project-btn")).map((btn) => ({
        label: normalizeWhitespace(btn.textContent),
        url: (btn.getAttribute("onclick") || "").match(/https?:\/\/[^'"]+/)?.[0] || ""
      })).filter((x) => x.url);
      entities.push({
        type: "projects",
        id: slugify(title),
        name: title,
        summary: meta,
        searchable: [title, meta, categories.join(" ")].join(" "),
        lines: [title, meta, `Categories: ${categories.join(", ")}`],
        links
      });
    });

    document.querySelectorAll("#leadership .details-container").forEach((card) => {
      const title = extractFirstText(card, "h3");
      if (!title) return;
      const subtitle = extractFirstText(card, "h4");
      const details = normalizeWhitespace(card.querySelector("p")?.textContent || "");
      entities.push({
        type: "leadership",
        id: slugify(title),
        name: title,
        summary: subtitle,
        searchable: [title, subtitle, details].join(" "),
        lines: [title, subtitle, details],
        links: []
      });
    });

    document.querySelectorAll("#education .edu-item .edu-card").forEach((card) => {
      const school = extractFirstText(card, ".edu-school");
      const degree = extractFirstText(card, ".edu-degree");
      const years = extractFirstText(card, ".edu-years");
      const highlights = Array.from(card.querySelectorAll(".edu-highlights li")).map((li) => normalizeWhitespace(li.textContent));
      entities.push({
        type: "education",
        id: slugify(school),
        name: school,
        summary: `${degree} · ${years}`,
        searchable: [school, degree, years, ...highlights].join(" "),
        lines: [school, degree, years, ...highlights],
        links: []
      });
    });

    document.querySelectorAll("#certs-list .cert-row").forEach((row) => {
      const name = extractFirstText(row, ".cert-name");
      const issuer = extractFirstText(row, ".cert-issuer");
      const credential = extractFirstText(row, ".cert-id span");
      const url = row.querySelector(".cert-btn")?.href || "";
      entities.push({
        type: "certifications",
        id: slugify(name),
        name,
        summary: issuer,
        searchable: [name, issuer, credential].join(" "),
        lines: [name, issuer, `Credential: ${credential}`],
        links: url ? [{ label: "Credential", url }] : []
      });
    });

    const email = normalizeWhitespace(document.querySelector("#contact .contact-info-container a:not([href])")?.textContent || "");
    const contactLinks = Array.from(document.querySelectorAll("#contact .contact-info-container a[href]")).map((a) => ({
      label: normalizeWhitespace(a.textContent),
      url: a.href
    }));
    entities.push({
      type: "contact",
      id: "contact",
      name: "Contact",
      summary: email || "Contact links",
      searchable: [email, ...contactLinks.map((x) => `${x.label} ${x.url}`)].join(" "),
      lines: [email ? `Email: ${email}` : "Contact", ...contactLinks.map((x) => `${x.label}: ${x.url}`)],
      links: contactLinks
    });

    const live = await loadLiveData();
    if (live) {
      const lines = [live.title || "What I'm Building Now", live.subtitle || "", `Last updated: ${live.lastUpdated || "unknown"}`];
      (live.items || []).forEach((item) => {
        lines.push(`${item.status} - ${item.name} - ${item.description}`);
      });
      entities.push({
        type: "live",
        id: "live",
        name: live.title || "What I'm Building Now",
        summary: live.subtitle || "",
        searchable: lines.join(" "),
        lines,
        links: []
      });
    }

    state.entities = entities;
  }

  function setPagination(rows, title) {
    const pageSize = state.isMobile ? 5 : 8;
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    state.paginator = {
      title,
      rows,
      page: 1,
      totalPages,
      pageSize
    };
    renderPaginationPage();
  }

  function clearPagination() {
    state.paginator = null;
    state.pendingSelection = null;
    updatePaginationControls();
  }

  function updatePaginationControls() {
    if (!pagerPrevBtn || !pagerNextBtn || !pagerLabel) return;
    if (!state.paginator || state.paginator.totalPages <= 1) {
      pagerPrevBtn.disabled = true;
      pagerNextBtn.disabled = true;
      pagerLabel.textContent = "Page —";
      return;
    }
    pagerPrevBtn.disabled = state.paginator.page <= 1;
    pagerNextBtn.disabled = state.paginator.page >= state.paginator.totalPages;
    pagerLabel.textContent = `Page ${state.paginator.page}/${state.paginator.totalPages}`;
  }

  function renderPaginationPage() {
    if (!state.paginator) return;
    const { title, rows, page, pageSize, totalPages } = state.paginator;
    const start = (page - 1) * pageSize;
    const view = rows.slice(start, start + pageSize);
    clearOutput();
    line(`${title} (${page}/${totalPages})`, "dim");
    view.forEach((row) => line(row));
    updatePaginationControls();
  }

  function goToNextPage() {
    if (!state.paginator) return;
    if (state.paginator.page >= state.paginator.totalPages) return;
    state.paginator.page += 1;
    renderPaginationPage();
  }

  function goToPrevPage() {
    if (!state.paginator) return;
    if (state.paginator.page <= 1) return;
    state.paginator.page -= 1;
    renderPaginationPage();
  }

  function showHelp(topic = "") {
    clearPagination();
    if (!topic) {
      const rows = [
        "Canonical commands:",
        " - ask <question>",
        " - list <entity-type> [filter words]",
        " - show <entity-type> <identifier or phrase>",
        " - open <entity reference>",
        " - help [command]",
        "",
        "Entity types:",
        " - projects, experience, education, certifications, leadership, skills, contact, about, live",
        "",
        "Examples:",
        " - ask what projects are focused on AI",
        " - list projects ai",
        " - show project case closed",
        " - open linkedin",
        "",
        "Pagination:",
        "Use arrows (← / →) or keyboard Left/Right while input is empty."
      ];
      rows.forEach((row) => line(row, row.startsWith(" -") ? "" : "dim"));
      return;
    }
    line(`help ${topic}`, "dim");
    if (!CANONICAL_COMMANDS.includes(topic)) {
      line(`Unknown help topic "${topic}".`, "warn");
      return;
    }
    if (topic === "ask") line("ask <question> - broad query over the portfolio dataset");
    if (topic === "list") line("list <entity-type> [filters] - list matching entities");
    if (topic === "show") line("show <entity-type> <phrase> - show detailed entity info");
    if (topic === "open") line("open <entity reference> - preview target then open link");
    if (topic === "help") line("help [command] - show command documentation");
  }

  function renderEntity(entity) {
    clearPagination();
    line(`${entity.type.toUpperCase()} - ${entity.name}`, "dim");
    entity.lines.forEach((row) => line(row));
    if (entity.links.length) {
      line("Links:", "dim");
      entity.links.forEach((l) => line(` - ${l.label}: ${l.url}`));
    }
  }

  function renderCandidates(candidates, action) {
    const rows = candidates.map((row, idx) => `${idx + 1}. [${row.item.type}] ${row.item.name} — ${row.item.summary}`);
    setPagination(rows, "Multiple matches");
    state.pendingSelection = { action, candidates };
    line("Type a number to choose one result.", "warn");
  }

  function handleList(entityType, filterText) {
    const type = TYPE_ALIASES[entityType] || inferTypeFromText(entityType) || null;
    if (!type) {
      line("Usage: list <entity-type> [filters]", "warn");
      line(`Try one of: ${ENTITY_TYPES.join(", ")}`, "dim");
      return;
    }
    const results = searchEntities(filterText || type, [type], 100).map((row) => row.item);
    if (!results.length) {
      line(`No ${type} results for "${filterText || "that filter"}".`, "warn");
      return;
    }
    const rows = results.map((item) => `[${item.type}] ${item.name} — ${item.summary}`);
    setPagination(rows, `List ${type}`);
  }

  function handleShow(entityType, phrase) {
    const explicitType = TYPE_ALIASES[entityType] || inferTypeFromText(entityType);
    const inferredType = explicitType || inferTypeFromText(phrase || "");
    const text = normalizeWhitespace(phrase || entityType || "");
    if (!text) {
      line("Usage: show <entity-type> <identifier or phrase>", "warn");
      return;
    }
    const matches = searchEntities(text, inferredType ? [inferredType] : null, 6);
    if (!matches.length) {
      line(`No match for "${text}".`, "warn");
      line(`Try: show project case closed`, "dim");
      return;
    }
    if (matches.length > 1 && matches[0].score - matches[1].score < 4) {
      renderCandidates(matches, "show");
      return;
    }
    renderEntity(matches[0].item);
  }

  function resolveOpenCandidates(referenceText) {
    const text = normalizeWhitespace(referenceText || "");
    if (!text) return [];
    if (/^https?:\/\//i.test(text)) {
      return [{ score: 100, label: text, url: text }];
    }
    return searchEntities(text, null, 6)
      .flatMap((row) => row.item.links.map((l) => ({ score: row.score, label: `${row.item.name} · ${l.label}`, url: l.url })))
      .sort((a, b) => b.score - a.score);
  }

  function handleOpen(referenceText) {
    const candidates = resolveOpenCandidates(referenceText);
    if (!candidates.length) {
      line(`Could not resolve open target for "${referenceText}".`, "warn");
      line("Try: open linkedin | open case closed | open github", "dim");
      return;
    }

    if (candidates.length > 1 && candidates[0].score - candidates[1].score < 4) {
      const rows = candidates.slice(0, 6).map((c, idx) => `${idx + 1}. ${c.label} — ${c.url}`);
      setPagination(rows, "Multiple link targets");
      state.pendingSelection = {
        action: "open_url",
        candidates: candidates.slice(0, 6).map((c) => ({
          item: {
            type: "link",
            name: c.label,
            summary: c.url,
            lines: [c.label, c.url],
            links: [{ label: "Open", url: c.url }]
          }
        }))
      };
      line("Type a number to choose a link target.", "warn");
      return;
    }

    const match = candidates[0];
    clearPagination();
    line(`Preview: ${match.label}`, "dim");
    line(`Opening: ${match.url}`);
    window.open(match.url, "_blank", "noopener");
  }

  function handleAsk(question) {
    const q = normalizeWhitespace(question);
    if (!q) {
      line("Usage: ask <question>", "warn");
      return;
    }
    const inferredType = inferTypeFromText(q);
    const matches = searchEntities(q, inferredType ? [inferredType] : null, 6);
    if (!matches.length) {
      line("I couldn't find a strong match in the portfolio data.", "warn");
      line("Try: ask about internships, projects, certifications, or contact info.", "dim");
      return;
    }
    if (matches.length > 1 && matches[0].score - matches[1].score < 4) {
      renderCandidates(matches, "show");
      return;
    }
    renderEntity(matches[0].item);
  }

  function parseNaturalInput(rawInput) {
    const raw = normalizeWhitespace(rawInput);
    const lower = raw.toLowerCase();
    const tokens = tokenize(lower);
    if (!tokens.length) return null;

    const maybeNum = Number.parseInt(tokens[0], 10);
    if (!Number.isNaN(maybeNum) && String(maybeNum) === tokens[0]) {
      return { command: "__select__", index: maybeNum };
    }

    if (EASTER_EGGS[lower]) return { command: "__egg__", egg: lower };

    if (CANONICAL_COMMANDS.includes(tokens[0])) {
      const command = tokens[0];
      const args = raw.slice(command.length).trim();
      return { command, args };
    }

    if (lower.startsWith("open ")) return { command: "open", args: raw.slice(5).trim() };
    if (lower.startsWith("show ")) return { command: "show", args: raw.slice(5).trim() };
    if (lower.startsWith("list ")) return { command: "list", args: raw.slice(5).trim() };
    if (lower.startsWith("help")) return { command: "help", args: raw.slice(4).trim() };
    if (lower.startsWith("what ") || lower.startsWith("tell me") || lower.startsWith("show me")) {
      return { command: "ask", args: raw };
    }

    const closest = suggestCanonical(tokens[0]);
    const closeDist = closest.length ? levenshtein(tokens[0], closest[0]) : 999;
    if (closeDist <= 2 && !TYPE_ALIASES[tokens[0]]) {
      return { command: "__unknown__", token: tokens[0] };
    }
    return { command: "ask", args: raw };
  }

  async function execute(rawInput) {
    const input = normalizeWhitespace(rawInput);
    if (!input) return;

    line(`${promptEl.textContent} ${input}`, "cmd");

    const parsed = parseNaturalInput(input);
    if (!parsed) return;

    if (parsed.command === "__egg__") {
      clearPagination();
      EASTER_EGGS[parsed.egg].forEach((row) => line(row, "dim"));
      return;
    }

    if (parsed.command === "__unknown__") {
      const suggestions = suggestCanonical(parsed.token);
      clearPagination();
      line(`Unknown command "${parsed.token}".`, "error");
      line(`Did you mean: ${suggestions.join(", ")}`, "warn");
      line("Use help for command examples.", "dim");
      return;
    }

    if (parsed.command === "__select__") {
      if (!state.pendingSelection || !state.pendingSelection.candidates.length) {
        line("No active selection context.", "warn");
        return;
      }
      const idx = parsed.index - 1;
      if (idx < 0 || idx >= state.pendingSelection.candidates.length) {
        line(`Invalid selection: ${parsed.index}`, "warn");
        return;
      }
      const selected = state.pendingSelection.candidates[idx].item;
      if (state.pendingSelection.action === "open" || state.pendingSelection.action === "open_url") {
        const link = selected.links[0];
        if (!link) {
          line("Selected item has no openable link.", "warn");
          return;
        }
        clearPagination();
        line(`Preview: ${selected.name} · ${link.label}`, "dim");
        line(`Opening: ${link.url}`);
        window.open(link.url, "_blank", "noopener");
        return;
      }
      renderEntity(selected);
      return;
    }

    if (parsed.command === "help") {
      const topic = tokenize(parsed.args)[0]?.toLowerCase() || "";
      showHelp(topic);
      return;
    }

    if (parsed.command === "list") {
      const parts = tokenize(parsed.args);
      const typeToken = parts[0] || "";
      const filterText = parts.slice(1).join(" ");
      handleList(typeToken, filterText);
      return;
    }

    if (parsed.command === "show") {
      const parts = tokenize(parsed.args);
      const first = parts[0] || "";
      const typeGuess = TYPE_ALIASES[first] ? first : "";
      const phrase = typeGuess ? parts.slice(1).join(" ") : parts.join(" ");
      handleShow(typeGuess || first, phrase);
      return;
    }

    if (parsed.command === "open") {
      handleOpen(parsed.args);
      return;
    }

    if (parsed.command === "ask") {
      handleAsk(parsed.args);
      return;
    }

    const suggestions = suggestCanonical(parsed.command || "");
    line(`Unknown command "${parsed.command || "input"}".`, "error");
    line(`Try: ${suggestions.join(", ")}`, "dim");
  }

  function autocomplete() {
    const raw = inputEl.value;
    const tokens = tokenize(raw);
    if (!tokens.length) return;
    if (tokens.length === 1 && !raw.endsWith(" ")) {
      const t = tokens[0].toLowerCase();
      const matches = CANONICAL_COMMANDS.filter((cmd) => cmd.startsWith(t));
      if (matches.length === 1) {
        inputEl.value = `${matches[0]} `;
      } else if (matches.length > 1) {
        line(`Suggestions: ${matches.join(", ")}`, "dim");
      }
    }
  }

  function trapFocus(event) {
    if (event.key === "Tab" && state.isOpen) {
      event.preventDefault();
      inputEl.focus();
    }
  }

  async function runBootSequence() {
    state.booting = true;
    overlay.classList.add("booting");
    inputEl.disabled = true;
    bootEl.innerHTML = "";

    const bootLines = [
      "[boot] matrix shell initialized...",
      "[boot] loading content graph...",
      "[boot] natural-language command core armed...",
      "[boot] allowed commands: ask/list/show/open/help",
      "[boot] style profile locked: dark matrix + blue + high glitch"
    ];

    for (const text of bootLines) {
      const p = document.createElement("p");
      p.className = "terminal-line terminal-line--dim";
      p.textContent = text;
      bootEl.appendChild(p);
      bootEl.scrollTop = bootEl.scrollHeight;
      await wait(state.isMobile ? 200 : 360);
    }

    await wait(state.isMobile ? 180 : 360);
    overlay.classList.remove("booting");
    inputEl.disabled = false;
    state.booting = false;
  }

  async function runTakeoverIntro() {
    overlay.classList.add("takeover-intro");
    introEl.setAttribute("aria-hidden", "false");
    setIntroCopy("UNAUTHORIZED SIGNAL", "probing portfolio surface...");

    const sequence = [
      ["ACCESS VECTOR FOUND", "decrypting content graph...", "routing blue matrix shell"],
      ["DEFENSE LAYER BYPASSED", "switching to command relay...", "query interface online"],
      ["ROOT MIRROR LIVE", "injecting terminal control...", "read-only boundary enforced"]
    ];

    for (let i = 0; i < sequence.length; i++) {
      const [l1, l2, l3] = sequence[i];
      setIntroCopy(l1, l2, l3);
      await wait(state.isMobile ? 650 : 1050);
    }

    setIntroCopy("ACCESS GRANTED", "terminal control acquired", "welcome to command system v2");
    await wait(state.isMobile ? 420 : 850);
    overlay.classList.remove("takeover-intro");
    introEl.setAttribute("aria-hidden", "true");
    setIntroCopy("", "", "");
  }

  async function openTerminal() {
    if (state.isOpen) return;
    state.restoreFocusEl = document.activeElement;
    state.isOpen = true;
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("terminal-open");

    // Fixed global visual profile.
    document.body.setAttribute("data-terminal-glitch", "high");
    document.body.setAttribute("data-terminal-motion", "full");
    overlay.style.setProperty("--terminal-fg", "#9ad8ff");
    overlay.style.setProperty("--terminal-fg-dim", "#63a8d8");
    overlay.style.setProperty("--terminal-border", "rgba(154, 216, 255, 0.26)");
    overlay.style.setProperty("--terminal-glow", "rgba(74, 176, 255, 0.25)");

    setStatus("Type help for available commands.");
    clearPagination();

    inputEl.disabled = true;
    await runTakeoverIntro();

    await rebuildEntities();
    await runBootSequence();

    clearOutput();
    line("ACCESS GRANTED - Terminal command system v2 online.", "dim");
    line("Use: ask, list, show, open, help");
    line("Long outputs: click arrows or press Left/Right.", "dim");
    updatePaginationControls();
    inputEl.focus();
  }

  function closeTerminal() {
    if (!state.isOpen) return;
    state.isOpen = false;
    overlay.classList.remove("active", "booting");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("terminal-open");
    inputEl.blur();
    if (state.restoreFocusEl && typeof state.restoreFocusEl.focus === "function") {
      state.restoreFocusEl.focus();
    }
  }

  document.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const typingTarget = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);

    if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      if (!state.isOpen && typingTarget) return;
      if (state.isOpen && active === inputEl) return;
      event.preventDefault();
      if (state.isOpen) closeTerminal();
      else openTerminal();
      return;
    }

    if (!state.isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeTerminal();
      return;
    }

    trapFocus(event);
  });

  overlay.addEventListener("mousedown", () => {
    if (!state.isOpen) return;
    if (document.activeElement !== inputEl) inputEl.focus();
  });

  overlay.addEventListener(
    "wheel",
    (event) => {
      if (!state.isOpen) return;
      const inScrollable = event.target.closest("#terminal-output, #terminal-boot");
      if (inScrollable) return;
      const panel = activeScrollPanel();
      panel.scrollTop += event.deltaY;
      event.preventDefault();
    },
    { passive: false }
  );

  if (pagerPrevBtn) pagerPrevBtn.addEventListener("click", goToPrevPage);
  if (pagerNextBtn) pagerNextBtn.addEventListener("click", goToNextPage);
  updatePaginationControls();

  inputEl.addEventListener("keydown", async (event) => {
    if (!state.isOpen || state.booting) return;

    if (event.key === "Enter") {
      event.preventDefault();
      const value = inputEl.value;
      if (value.trim()) {
        state.commandHistory.push(value);
        state.historyIndex = state.commandHistory.length;
      }
      inputEl.value = "";
      await execute(value);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!state.commandHistory.length) return;
      state.historyIndex = Math.max(0, state.historyIndex - 1);
      inputEl.value = state.commandHistory[state.historyIndex] || "";
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!state.commandHistory.length) return;
      state.historyIndex = Math.min(state.commandHistory.length, state.historyIndex + 1);
      inputEl.value = state.commandHistory[state.historyIndex] || "";
      return;
    }

    if (event.key === "ArrowLeft" && !inputEl.value.trim()) {
      event.preventDefault();
      goToPrevPage();
      return;
    }

    if (event.key === "ArrowRight" && !inputEl.value.trim()) {
      event.preventDefault();
      goToNextPage();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      autocomplete();
    }
  });
});
