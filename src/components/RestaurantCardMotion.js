const instanceKey = Symbol.for('nuvora.restaurant-card-motion');

function resetCard(card) {
  if (!card) return;
  card.style.removeProperty('--card-tilt-x');
  card.style.removeProperty('--card-tilt-y');
  card.classList.remove('is-pointer-active');
}

function initRestaurantCardMotion() {
  if (window[instanceKey]) return window[instanceKey];

  let activeCard = null;
  let frame = 0;
  let pendingCard = null;
  let next = { x: 0, y: 0 };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    if (reducedMotion.matches) {
      resetCard(activeCard);
      activeCard = null;
      pendingCard = null;
      return;
    }

    const card = event.target instanceof Element ? event.target.closest('.restaurant-card, .food-card') : null;
    if (card !== activeCard) {
      resetCard(activeCard);
      activeCard = card;
      if (card) card.classList.add('is-pointer-active');
    }
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    pendingCard = card;
    next = {
      x: (0.5 - y) * 7.2,
      y: (x - 0.5) * 8,
    };

    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pendingCard || pendingCard !== activeCard) return;
      pendingCard.style.setProperty('--card-tilt-x', `${next.x.toFixed(2)}deg`);
      pendingCard.style.setProperty('--card-tilt-y', `${next.y.toFixed(2)}deg`);
    });
  };

  const onPointerOut = (event) => {
    if (!activeCard || !(event.target instanceof Element)) return;
    if (!activeCard.contains(event.target)) return;
    if (event.relatedTarget instanceof Node && activeCard.contains(event.relatedTarget)) return;
    resetCard(activeCard);
    activeCard = null;
    pendingCard = null;
  };

  const onPointerCancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    resetCard(activeCard);
    activeCard = null;
    pendingCard = null;
  };
  const onMotionPreferenceChange = (event) => {
    if (!event.matches) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    onPointerCancel();
  };

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerout', onPointerOut, { passive: true });
  document.addEventListener('pointercancel', onPointerCancel, { passive: true });
  window.addEventListener('nuvora:before-route-render', onPointerCancel);
  window.addEventListener('blur', onPointerCancel);
  reducedMotion.addEventListener?.('change', onMotionPreferenceChange);

  const cleanup = () => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerout', onPointerOut);
    document.removeEventListener('pointercancel', onPointerCancel);
    window.removeEventListener('nuvora:before-route-render', onPointerCancel);
    window.removeEventListener('blur', onPointerCancel);
    reducedMotion.removeEventListener?.('change', onMotionPreferenceChange);
    if (frame) cancelAnimationFrame(frame);
    resetCard(activeCard);
    delete window[instanceKey];
  };

  window[instanceKey] = cleanup;
  return cleanup;
}

initRestaurantCardMotion();
