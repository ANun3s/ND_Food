import * as THREE from 'three';
import { clamp, smoothstep, createBurger } from './BurgerSceneModel.js';

// Live Server skips the React/Vite entry. In that case this mounts the same 3D model directly.
if (!import.meta.env?.DEV && !import.meta.env?.PROD) {
  const host = document.getElementById('burger-scene-root');
  const story = host?.closest('[data-burger-story]');
  const stage = story?.querySelector('.hero');

  if (host && story && stage) {
    const canvas = document.createElement('canvas');
    canvas.className = 'burger-scene-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      canvas.remove();
    }

    if (renderer) {
      host.prepend(canvas);
      window.NuvoraBurgerScrollFallback?.unmount?.(host);
      host.classList.remove('burger-webgl-fallback');
      host.classList.add('burger-webgl-active');
      story.classList.remove('burger-story--static');

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.22;
      renderer.shadowMap.enabled = false;

      const scene = new THREE.Scene();
      // Transparent canvas follows the page theme without rebuilding the scene.
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
      camera.position.set(5.15, 4.9, 10.78);
      camera.lookAt(0, 1.05, 0);
      scene.add(new THREE.HemisphereLight('#fffaf3', '#8f5736', 2.15));
      const key = new THREE.DirectionalLight('#fff4dd', 3.1);
      key.position.set(-3.8, 7.5, 5.5);
      scene.add(key);
      const fill = new THREE.DirectionalLight('#f7c58a', 1.3);
      fill.position.set(5, 3, -3.5);
      scene.add(fill);
      const rim = new THREE.DirectionalLight('#ffffff', 0.8);
      rim.position.set(-4, 2.5, -4);
      scene.add(rim);

      const layers = createBurger(scene);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const progressBar = host.querySelector('[data-burger-progress]');
      const stepCounter = host.querySelector('[data-burger-step]');
      const status = host.querySelector('[data-burger-status]');
      let isVisible = false;
      let progress = reducedMotion.matches ? 1 : 0;
      let raf = 0;
      let lastPhase = '';

      const renderAt = (amount) => {
        const value = reducedMotion.matches ? 1 : clamp(amount);
        progress = value;
        layers.forEach((group) => {
          const index = group.userData.explodeIndex;
          const delay = index * 0.085;
          const local = smoothstep(clamp((value - delay) / (1 - delay)));
          group.position.y = group.userData.homeY + (index - 3) * 0.34 * (1 - local);
          const tilt = (index % 2 === 0 ? 1 : -1) * 0.055 * (1 - local);
          group.rotation.x = tilt * 0.55;
          group.rotation.z = tilt;
        });
        if (progressBar) progressBar.style.transform = `scaleX(${value.toFixed(3)})`;
        if (stepCounter) stepCounter.textContent = String(Math.min(6, Math.floor(value * 6) + 1)).padStart(2, '0');
        const phase = value < 0.22 ? 'apart' : value < 0.93 ? 'assembling' : 'ready';
        if (phase !== lastPhase && status) {
          status.textContent = phase === 'apart'
            ? 'Role para montar seu próximo sabor.'
            : phase === 'assembling'
              ? 'Cada camada encontra seu lugar.'
              : 'Pronto para matar a fome.';
          lastPhase = phase;
        }
        renderer.render(scene, camera);
      };
      const measureProgress = () => {
        const travel = Math.max(1, story.offsetHeight - stage.offsetHeight);
        const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
        renderAt((stickyTop - story.getBoundingClientRect().top) / travel);
      };
      const schedule = () => {
        if (!isVisible || raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          measureProgress();
        });
      };
      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        schedule();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) schedule();
      }, { rootMargin: '80px' });
      intersectionObserver.observe(host);
      const onMotionChange = () => {
        story.classList.toggle('burger-story--static', reducedMotion.matches);
        renderAt(reducedMotion.matches ? 1 : progress);
        schedule();
      };
      const onVisibility = () => {
        if (document.visibilityState === 'visible') schedule();
      };
      window.addEventListener('scroll', schedule, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      reducedMotion.addEventListener?.('change', onMotionChange);
      resize();
      measureProgress();

      window.NuvoraDestroyStandaloneBurger = () => {
        window.removeEventListener('scroll', schedule);
        document.removeEventListener('visibilitychange', onVisibility);
        reducedMotion.removeEventListener?.('change', onMotionChange);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        if (raf) cancelAnimationFrame(raf);
        const textures = new Set();
        scene.traverse((object) => {
          object.geometry?.dispose();
          if (object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((item) => {
              if (item.bumpMap) textures.add(item.bumpMap);
              item.dispose();
            });
          }
        });
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
        canvas.remove();
        host.classList.remove('burger-webgl-active');
        host.classList.add('burger-webgl-fallback');
        window.NuvoraBurgerScrollFallback?.mount?.(host);
      };
    }
  }
}
