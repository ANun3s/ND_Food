(() => {
  const mounted = new WeakMap();
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => value * value * (3 - 2 * value);
  const offsets = { upper: -112, lettuce: 82, tomato: 49, cheese: 23, patty: -12, bottom: 0 };

  const unmount = (host) => {
    const cleanup = mounted.get(host);
    if (cleanup) cleanup();
    mounted.delete(host);
  };

  const mount = (host) => {
    unmount(host);
    const story = host?.closest('[data-burger-story]');
    const svg = host?.querySelector('.burger-scene-fallback');
    const stage = story?.querySelector('.hero');
    if (!story || !svg || !stage) return;
    const layers = [...svg.querySelectorAll('[data-burger-layer]')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const progressFill = host.querySelector('[data-burger-progress]');
    const step = host.querySelector('[data-burger-step]');
    const status = host.querySelector('[data-burger-status]');
    let raf = 0;
    let visible = true;
    let lastStatus = '';

    const adaptMotion = () => story.classList.toggle('burger-story--static', reduceMotion.matches);
    adaptMotion();
    layers.forEach((layer) => {
      layer.style.transformBox = 'fill-box';
      layer.style.transformOrigin = 'center';
      layer.style.willChange = 'transform';
    });

    const render = () => {
      raf = 0;
      const travel = Math.max(1, story.offsetHeight - stage.offsetHeight);
      const progress = reduceMotion.matches ? 1 : clamp(((Number.parseFloat(getComputedStyle(stage).top) || 0) - story.getBoundingClientRect().top) / travel);
      layers.forEach((layer) => {
        const delay = Number(layer.dataset.burgerDelay || 0);
        const local = smooth(clamp((progress - delay) / (1 - delay)));
        const offset = offsets[layer.dataset.burgerLayer] || 0;
        const angle = (layer.dataset.burgerLayer === 'upper' ? -1 : 1) * 2.2 * (1 - local);
        layer.style.transform = `translate3d(0, ${(offset * (1 - local)).toFixed(2)}px, 0) rotate(${angle.toFixed(2)}deg)`;
      });
      if (progressFill) progressFill.style.transform = `scaleX(${progress.toFixed(3)})`;
      if (step) step.textContent = String(Math.min(6, Math.floor(progress * 6) + 1)).padStart(2, '0');
      const nextStatus = progress < 0.22 ? 'apart' : progress < 0.93 ? 'assembling' : 'ready';
      if (status && nextStatus !== lastStatus) {
        status.textContent = nextStatus === 'apart'
          ? 'Role para montar seu próximo sabor.'
          : nextStatus === 'assembling'
            ? 'Cada camada encontra seu lugar.'
            : 'Pronto para matar a fome.';
        lastStatus = nextStatus;
      }
    };
    const schedule = () => {
      if (!visible || raf) return;
      raf = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, { rootMargin: '100px' });
    const onMotionChange = () => {
      adaptMotion();
      schedule();
    };
    observer.observe(host);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    reduceMotion.addEventListener?.('change', onMotionChange);
    schedule();

    mounted.set(host, () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduceMotion.removeEventListener?.('change', onMotionChange);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      layers.forEach((layer) => { layer.style.willChange = ''; });
    });
  };

  window.NuvoraBurgerScrollFallback = { mount, unmount };
  const initialHost = document.getElementById('burger-scene-root');
  if (initialHost) mount(initialHost);
})();
