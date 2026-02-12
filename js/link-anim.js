document.addEventListener('DOMContentLoaded', () => {
  // create loader element
  const loader = document.createElement('div');
  loader.id = 'pageLoader';
  loader.className = 'page-loader';
  loader.innerHTML = '<div class="bar"></div><div class="spinner" aria-hidden="true"></div>';
  document.body.appendChild(loader);

  const BAR_DURATION = 700; // ms (match CSS)

  function isInternalLink(a) {
    try {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('tel:')) return false;
      if (a.target === '_blank' || a.hasAttribute('download')) return false;
      // relative links or same origin
      const url = new URL(href, location.href);
      return url.origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  // handle clicks on internal links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;

    // If it's an internal same-page hash link, smooth-scroll instead
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // remove focus for mouse click to avoid persistent underline
        if (e.detail !== 0) a.blur();
      }
      return;
    }

    if (!isInternalLink(a)) {
      // blur mouse-clicked external links to avoid focus-style remaining
      if (e.detail !== 0) a.blur();
      return;
    }

    // internal navigation: play loader then navigate
    e.preventDefault();
    // blur to remove focus outline/underline after click
    if (e.detail !== 0) a.blur();

    loader.classList.add('running');

    // ensure repaint
    void loader.offsetWidth;

    // after duration, navigate
    setTimeout(() => {
      const hrefFull = a.href;
      // small delay to allow spinner to finish
      window.location.href = hrefFull;
    }, BAR_DURATION);
  }, { passive: false });

  // Remove running class on load (in case of back/forward navigation)
  window.addEventListener('pageshow', () => {
    loader.classList.remove('running');
  });

  // For mouse users, remove focus after mouseup to prevent persistent focus-visible underline
  document.addEventListener('mouseup', (e) => {
    const a = e.target.closest('a[href]');
    if (a && e.button === 0) a.blur();
  });

});
