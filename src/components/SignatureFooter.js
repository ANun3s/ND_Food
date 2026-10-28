const footer = document.querySelector('.nuvora-footer');
if (footer) {
  const wordmark = footer.querySelector('.nuvora-footer__wordmark');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  footer.querySelector('[data-footer-year]').textContent = String(new Date().getFullYear());
  footer.querySelector('[data-footer-top]').addEventListener('click', () => {
    const heading = document.querySelector('main:not([hidden]) h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  const updateCurrent = () => {
    const current = location.hash.startsWith('#/') ? location.hash.split('/').slice(0, 2).join('/') : '#/';
    footer.querySelectorAll('nav a').forEach((link) => {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('nuvora:route-rendered', updateCurrent);
  updateCurrent();

  let visible = false;
  let frame = 0;
  const paint = () => {
    frame = 0;
    if (reduced.matches || !visible || document.hidden) return;
    const rect = wordmark.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    wordmark.style.setProperty('--footer-shift', `${(1 - progress) * 20}px`);
  };
  const schedule = () => {
    if (visible && !reduced.matches && !document.hidden && !frame) frame = requestAnimationFrame(paint);
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { rootMargin: '40px' });
  observer.observe(wordmark);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      wordmark.style.removeProperty('--footer-shift');
    } else schedule();
  });
}
