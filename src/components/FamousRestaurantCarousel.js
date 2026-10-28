(() => {
  let cleanup = () => {};

  const mount = () => {
    cleanup();
    const stack = document.querySelector('#famous-restaurant-stack');
    const viewport = stack?.querySelector('.famous-horizontal-viewport');
    const track = viewport?.querySelector('.famous-horizontal-track');
    if (!stack || !viewport || !track) return;

    const progressFill = stack.querySelector('.famous-stack__progress i');
    const progressText = stack.querySelector('.famous-stack__progress b');
    const previous = document.querySelector('[data-famous-direction="previous"]');
    const next = document.querySelector('[data-famous-direction="next"]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let intendedIndex = null;
    let settleTimer = 0;
    let updateFrame = 0;

    const visibleCards = () => [...track.querySelectorAll('.famous-stack__card')].filter((card) => !card.hidden);
    const cardLeft = (card) => card.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft;
    const nearestIndex = (cards) => {
      const scrollLeft = viewport.scrollLeft;
      return cards.reduce((nearest, card, index) => (
        Math.abs(cardLeft(card) - scrollLeft) < Math.abs(cardLeft(cards[nearest]) - scrollLeft) ? index : nearest
      ), 0);
    };

    const update = () => {
      const cards = visibleCards();
      if (!cards.length) {
        if (previous) previous.disabled = true;
        if (next) next.disabled = true;
        if (progressFill) progressFill.style.transform = 'scaleX(0)';
        if (progressText) progressText.textContent = '00 / 00';
        return;
      }
      cards.forEach((card, index) => {
        const position = card.querySelector('.famous-stack__position');
        if (position) position.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      });
      const current = nearestIndex(cards);
      if (progressFill) progressFill.style.transform = `scaleX(${(current + 1) / cards.length})`;
      if (progressText) progressText.textContent = `${String(current + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      if (previous) previous.disabled = current <= 0;
      if (next) next.disabled = current >= cards.length - 1;
    };

    const move = (direction) => {
      const cards = visibleCards();
      if (!cards.length) return;
      const current = intendedIndex ?? nearestIndex(cards);
      intendedIndex = Math.max(0, Math.min(cards.length - 1, current + direction));
      const target = cards[intendedIndex];
      viewport.scrollTo({ left: Math.max(0, cardLeft(target)), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      if (reducedMotion.matches) {
        intendedIndex = null;
        update();
      }
    };
    const settle = () => {
      window.clearTimeout(settleTimer);
      intendedIndex = null;
      update();
    };
    const onScroll = () => {
      update();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 180);
    };
    const onPrevious = () => move(-1);
    const onNext = () => move(1);
    const onFilter = () => {
      window.clearTimeout(settleTimer);
      intendedIndex = null;
      viewport.scrollTo({ left: 0, behavior: 'auto' });
      cancelAnimationFrame(updateFrame);
      updateFrame = requestAnimationFrame(update);
    };
    const onResize = () => {
      intendedIndex = null;
      update();
    };
    previous?.addEventListener('click', onPrevious);
    next?.addEventListener('click', onNext);
    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.addEventListener('scrollend', settle);
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('nuvora:restaurant-filters-applied', onFilter);
    updateFrame = requestAnimationFrame(update);

    cleanup = () => {
      previous?.removeEventListener('click', onPrevious);
      next?.removeEventListener('click', onNext);
      viewport.removeEventListener('scroll', onScroll);
      viewport.removeEventListener('scrollend', settle);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('nuvora:restaurant-filters-applied', onFilter);
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(updateFrame);
      cleanup = () => {};
    };
  };

  window.addEventListener('nuvora:before-route-render', () => cleanup());
  window.addEventListener('nuvora:route-rendered', mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
