// Performance and UX enhancements

// Lazy-load images using IntersectionObserver
(function () {
  'use strict';

  const lazySelector = 'img[data-src], image[data-href]';

  function onIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.tagName.toLowerCase() === 'img') {
          el.src = el.dataset.src;
          el.removeAttribute('data-src');
        } else if (el.tagName.toLowerCase() === 'image') {
          el.setAttribute('href', el.dataset.href);
          el.removeAttribute('data-href');
        }
        observer.unobserve(el);
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(onIntersection, {
      rootMargin: '100px 0px',
      threshold: 0.01
    });
    document.querySelectorAll(lazySelector).forEach(img => observer.observe(img));
  } else {
    // Fallback: load all
    document.querySelectorAll(lazySelector).forEach(el => {
      if (el.tagName.toLowerCase() === 'img') el.src = el.dataset.src;
      if (el.tagName.toLowerCase() === 'image') el.setAttribute('href', el.dataset.href);
    });
  }

  // Prefetch links on hover for faster navigation (work images links)
  const links = document.querySelectorAll('a[href^="#"], .work__img');
  links.forEach(link => {
    let timer;
    link.addEventListener('pointerenter', () => {
      timer = setTimeout(() => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('http')) {
          const linkEl = document.createElement('link');
          linkEl.rel = 'prefetch';
          linkEl.href = href;
          document.head.appendChild(linkEl);
        }
      }, 65); // small delay to avoid accidental hovers
    });
    link.addEventListener('pointerleave', () => clearTimeout(timer));
  });

  // Navigation toggle for mobile
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('show'));
    // close on link click
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('show')));
  }

  // Register Service Worker for basic caching (if supported)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW registration failed:', err));
    });
  }

  // Run low-priority tasks during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Example: warm up fonts by creating a hidden image using font-display swap
      document.fonts && document.fonts.ready && document.fonts.ready.then(() => { /* fonts ready */ });
    }, { timeout: 2000 });
  }

})();
