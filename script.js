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
      if (href) {
        window.open(href, '_blank', 'noopener');
      }
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