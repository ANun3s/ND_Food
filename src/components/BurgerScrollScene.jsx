import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { clamp, smoothstep, createBurger } from './BurgerSceneModel.js';

function StaticBurger() {
  return (
    <svg className="burger-scene-fallback" viewBox="0 0 420 420" role="img" aria-label="Hambúrguer artesanal com pão, alface, tomate, queijo e carne">
      <defs>
        <linearGradient id="fallback-bun" x1="0" x2="0.8" y1="0" y2="1"><stop stopColor="#f4c474"/><stop offset="1" stopColor="#cf762c"/></linearGradient>
        <linearGradient id="fallback-beef" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#75452d"/><stop offset="1" stopColor="#3f2418"/></linearGradient>
        <filter id="fallback-shadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <ellipse cx="210" cy="348" rx="133" ry="18" fill="#7f4b2b" opacity=".14" filter="url(#fallback-shadow)"/>
      <g data-burger-layer="bottom"><path d="M77 323Q87 304 119 301h183q33 3 42 22l-7 32H84z" fill="url(#fallback-bun)"/><path d="M84 324q123-21 259 0l-7 31H84z" fill="#b96528" opacity=".33"/><path d="M110 315q78-10 181 1" fill="none" stroke="#ffe1a1" strokeWidth="4" opacity=".55" strokeLinecap="round"/></g>
      <g data-burger-layer="patty" data-burger-delay=".1"><path d="M90 195q15-19 39-20h160q31 3 42 22l-8 35q-18 14-34 3t-34 0t-34 0t-34 0t-34 0t-34 0t-28-5z" fill="url(#fallback-beef)"/><path d="M96 204q96-17 215 0M100 220q107-14 222 0" fill="none" stroke="#a66a43" strokeWidth="2" opacity=".5" strokeLinecap="round"/><g fill="#321c14" opacity=".72"><circle cx="132" cy="195" r="3"/><circle cx="161" cy="216" r="2.6"/><circle cx="195" cy="190" r="2.7"/><circle cx="230" cy="215" r="3"/><circle cx="267" cy="193" r="2.8"/><circle cx="300" cy="214" r="2.5"/><circle cx="321" cy="197" r="2"/><circle cx="122" cy="222" r="2"/></g></g>
      <g data-burger-layer="cheese"><path d="m95 229 228 0-3 33-32-8-13 24-29-20-67 4-27 20-18-24-37 9z" fill="#f3ad31"/><path d="m99 231 219 0" stroke="#ffe183" strokeWidth="3" opacity=".8"/></g>
      <g data-burger-layer="tomato" data-burger-delay=".18"><path d="M92 261q116-14 235 0l-7 20H97z" fill="#d84737"/><path d="M100 264q111-11 216 0" fill="none" stroke="#ff9a73" strokeWidth="3" opacity=".75"/><g fill="#ffd0a2"><ellipse cx="150" cy="270" rx="3" ry="1.4"/><ellipse cx="175" cy="266" rx="3" ry="1.4"/><ellipse cx="204" cy="270" rx="3" ry="1.4"/><ellipse cx="230" cy="266" rx="3" ry="1.4"/><ellipse cx="260" cy="270" rx="3" ry="1.4"/><ellipse cx="286" cy="266" rx="3" ry="1.4"/></g></g>
      <g data-burger-layer="lettuce" data-burger-delay=".24"><path d="M73 281q28-16 56 0t56 0t56 0t56 0t56 0l-11 23q-29 16-58 0t-58 0t-58 0t-58 0t-29 0z" fill="#4e8738"/><path d="M74 282q28-15 56 0t56 0t56 0t56 0t56 0" fill="none" stroke="#aad76b" strokeWidth="4" strokeLinecap="round"/><path d="M92 294q25-12 50 0t52 0t53 0t53 0t52 0" fill="none" stroke="#83b954" strokeWidth="3" opacity=".9"/></g>
      <g data-burger-layer="upper" data-burger-delay=".12"><path d="M79 167q16-20 42-23 84-11 177 0 31 4 44 24l-8 19H88z" fill="#b86429"/><path d="M81 168q7-57 54-75 78-31 150 0 45 21 54 75-16 15-31 0t-32 0t-32 0t-32 0t-32 0t-32 0t-32 0t-32 0t-35 0z" fill="url(#fallback-bun)"/><path d="M110 132q15-36 50-48M260 85q32 8 51 37" fill="none" stroke="#ffdda0" strokeWidth="5" opacity=".65" strokeLinecap="round"/>{[[145,117],[180,99],[214,110],[250,95],[283,115],[322,135],[115,143],[225,137],[274,144],[171,130],[245,128],[300,96]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx="7" ry="3.5" fill="#fff0cc" transform={`rotate(-22 ${cx} ${cy})`}/>)}</g>
    </svg>
  );
}

export default function BurgerScrollScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const story = host?.closest('[data-burger-story]');
    const stage = story?.querySelector('.hero');
    if (!canvas || !host || !story || !stage) return undefined;
    window.NuvoraBurgerScrollFallback?.unmount?.(host);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      host.classList.add('burger-webgl-fallback');
      window.NuvoraBurgerScrollFallback?.mount?.(host);
      return () => window.NuvoraBurgerScrollFallback?.unmount?.(host);
    }
    host.classList.remove('burger-webgl-fallback');
    story.classList.remove('burger-story--static');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();
    // Transparent canvas follows the page theme without rebuilding the scene.
    const camera = new THREE.PerspectiveCamera(32, host.clientWidth / Math.max(1, host.clientHeight), 0.1, 40);
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
    let isVisible = false;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let progress = reducedMotion.matches ? 1 : 0;
    let lastPhase = '';
    const status = host.querySelector('[data-burger-status]');
    const progressBar = host.querySelector('[data-burger-progress]');
    const stepCounter = host.querySelector('[data-burger-step]');

    const renderAt = (amount) => {
      const p = reducedMotion.matches ? 1 : clamp(amount);
      progress = p;
      layers.forEach((group) => {
        const index = group.userData.explodeIndex;
        const delay = index * 0.085;
        const local = smoothstep(clamp((p - delay) / (1 - delay)));
        const explodeOffset = (index - 3) * 0.34;
        group.position.y = group.userData.homeY + explodeOffset * (1 - local);
        const tilt = (index % 2 === 0 ? 1 : -1) * 0.055 * (1 - local);
        group.rotation.x = tilt * 0.55;
        group.rotation.z = tilt;
      });
      if (progressBar) progressBar.style.transform = `scaleX(${p.toFixed(3)})`;
      if (stepCounter) stepCounter.textContent = String(Math.min(6, Math.floor(p * 6) + 1)).padStart(2, '0');
      const phase = p < 0.22 ? 'apart' : p < 0.93 ? 'assembling' : 'ready';
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
      const rect = story.getBoundingClientRect();
      renderAt((stickyTop - rect.top) / travel);
    };
    const scheduleRender = () => {
      if (!isVisible || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measureProgress();
      });
    };
    const onScroll = () => scheduleRender();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') scheduleRender();
    };
    const onMotionChange = () => {
      renderAt(reducedMotion.matches ? 1 : progress);
      scheduleRender();
    };

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      scheduleRender();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) scheduleRender();
    }, { rootMargin: '80px' });
    intersectionObserver.observe(host);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener?.('change', onMotionChange);
    measureProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener?.('change', onMotionChange);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
      const textures = new Set();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
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
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="burger-scene-canvas" aria-hidden="true" />
      <StaticBurger />
      <div className="burger-scene-kicker" aria-hidden="true"><span></span> UM CLÁSSICO, CAMADA POR CAMADA</div>
      <div className="burger-scene-cue" aria-hidden="true">
        <span className="burger-scroll-glyph"><i></i></span>
        <span>Role para montar</span>
        <span className="burger-scene-counter"><span data-burger-step>01</span> <b>/ 06</b></span>
      </div>
      <div className="burger-scene-progress" aria-hidden="true"><span data-burger-progress /></div>
      <p className="visually-hidden" aria-live="polite" data-burger-status></p>
    </>
  );
}
