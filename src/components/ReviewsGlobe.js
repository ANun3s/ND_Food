(() => {
  const MAP_URL = new URL('../assets/maps/countries-50m.json', import.meta.url).href;
  const reviewLocations = {
    br: { lat: -23.55, lon: -46.63 }, us: { lat: 40.71, lon: -74.0 },
    mx: { lat: 19.43, lon: -99.13 }, fr: { lat: 48.85, lon: 2.35 },
    jp: { lat: 35.68, lon: 139.69 }, it: { lat: 41.9, lon: 12.5 },
  };
  let cleanup = () => {};

  function decodeArc(topology, index, cache) {
    const reversed = index < 0;
    const arcIndex = reversed ? ~index : index;
    let coords = cache.get(arcIndex);
    if (!coords) {
      let x = 0;
      let y = 0;
      coords = topology.arcs[arcIndex].map(([dx, dy]) => {
        x += dx;
        y += dy;
        return [x * topology.transform.scale[0] + topology.transform.translate[0], y * topology.transform.scale[1] + topology.transform.translate[1]];
      });
      cache.set(arcIndex, coords);
    }
    return reversed ? [...coords].reverse() : coords;
  }

  function joinRing(topology, arcIndexes, cache) {
    const points = [];
    arcIndexes.forEach((index) => {
      const arc = decodeArc(topology, index, cache);
      points.push(...(points.length ? arc.slice(1) : arc));
    });
    return points;
  }

  function paintMap(topology, relief = false) {
    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const cache = new Map();
    const dark = document.documentElement.dataset.theme === 'dark';
    ctx.fillStyle = relief ? '#171717' : dark ? '#171f29' : '#e6e8e6';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = relief ? '#171717' : dark ? 'rgba(146, 171, 186, .15)' : 'rgba(99, 122, 130, .17)';
    ctx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 10) {
      const y = (90 - lat) / 180 * height;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 10) {
      const x = ((lon + 90 + 360) % 360) / 360 * width;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    const drawRing = (ring) => {
      const points = joinRing(topology, ring, cache);
      if (!points.length) return;
      const projected = [];
      points.forEach(([lon, lat], i) => {
        let x = (lon + 90) / 360 * width;
        if (i && x - projected[i - 1][0] > width / 2) x -= width;
        if (i && x - projected[i - 1][0] < -width / 2) x += width;
        projected.push([x, (90 - lat) / 180 * height]);
      });
      [-width, 0, width].forEach((offset) => {
        ctx.moveTo(projected[0][0] + offset, projected[0][1]);
        projected.slice(1).forEach(([x, y]) => ctx.lineTo(x + offset, y));
        ctx.closePath();
      });
    };
    const countries = topology.objects.countries.geometries;
    countries.forEach((country, index) => {
      ctx.beginPath();
      const polygons = country.type === 'Polygon' ? [country.arcs] : country.arcs;
      polygons.forEach((polygon) => polygon.forEach(drawRing));
      ctx.fillStyle = relief ? '#a6a6a6' : dark ? ['#71685e', '#7a7064', '#665f57', '#827566'][index % 4] : ['#c9b394', '#d2bd9e', '#c1aa8c', '#d9c6aa'][index % 4];
      ctx.fill('evenodd');
      ctx.strokeStyle = relief ? '#a6a6a6' : dark ? '#ab967d' : '#99816a';
      ctx.lineWidth = relief ? 0 : 0.7;
      if (!relief) ctx.stroke();
    });
    if (!relief) {
      // Equator and tropics remain tied to their geographic latitude.
      [0, -23.44, 23.44].forEach((lat) => {
        ctx.beginPath();
        ctx.moveTo(0, (90 - lat) / 180 * height);
        ctx.lineTo(width, (90 - lat) / 180 * height);
        ctx.strokeStyle = dark ? 'rgba(230, 209, 174, .32)' : 'rgba(111, 93, 67, .3)';
        ctx.lineWidth = lat === 0 ? 1.6 : 0.8;
        ctx.setLineDash(lat === 0 ? [] : [3, 6]);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }
    return canvas;
  }

  function init(host) {
    cleanup();
    if (!host || host.dataset.globeReady === 'loading' || host.dataset.globeReady === 'ready') return;
    host.dataset.globeReady = 'loading';
    const surface = host.querySelector('[data-globe-surface]');
    const overlay = host.querySelector('[data-globe-overlay]');
    const loading = host.querySelector('[data-globe-loading]');
    const error = host.querySelector('[data-globe-error]');
    if (!surface || !overlay) return;

    let frame = 0;
    let observer;
    let renderer;
    let scene;
    let camera;
    let globe;
    let routeGroup;
    let texture;
    let reliefTexture;
    let selectedId = 'br';
    let active = true;
    let yaw = 0.82;
    let targetYaw = null;
    let lastTime = 0;
    let disposed = false;
    cleanup = () => { disposed = true; host.dataset.globeReady = ''; };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlayCtx = overlay.getContext('2d');

    const fail = () => {
      host.dataset.globeReady = 'error';
      if (loading) loading.hidden = true;
      if (error) error.hidden = false;
    };

    Promise.all([
      import('three'),
      fetch(MAP_URL).then((response) => { if (!response.ok) throw new Error('World Atlas indisponível'); return response.json(); }),
    ]).then(([THREE, topology]) => {
      if (disposed || !host.isConnected) return;
      const mapCanvas = paintMap(topology);
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 30);
      camera.position.set(0, 0, 8);
      camera.lookAt(0, 0, 0);
      try {
        renderer = new THREE.WebGLRenderer({ canvas: surface, alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch (webglError) { fail(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const geometry = new THREE.SphereGeometry(1.25, 112, 72);
      texture = new THREE.CanvasTexture(mapCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      reliefTexture = new THREE.CanvasTexture(paintMap(topology, true));
      reliefTexture.wrapS = THREE.RepeatWrapping;
      const material = new THREE.MeshStandardMaterial({ map: texture, bumpMap: reliefTexture, bumpScale: 0.018, roughness: 0.7, metalness: 0.12 });
      globe = new THREE.Mesh(geometry, material);
      scene.add(globe);
      scene.add(new THREE.HemisphereLight(0xfff8eb, 0x47546a, 1.65));
      const key = new THREE.DirectionalLight(0xfff5e9, 2.5);
      key.position.set(-3, 3, 5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xe8c7b5, 0.65);
      fill.position.set(4, -1, -3);
      scene.add(fill);

      // A fixed meridian instrument frames the rotating geographical sphere.
      const instrument = new THREE.Group();
      instrument.rotation.y = -0.34;
      scene.add(instrument);
      const brass = new THREE.MeshStandardMaterial({ color: '#a98b62', metalness: 0.58, roughness: 0.38 });
      const paleMetal = new THREE.MeshStandardMaterial({ color: '#ead6b3', metalness: 0.4, roughness: 0.42 });
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.405, 0.012, 8, 192), brass);
      instrument.add(hoop);
      const outer = new THREE.Mesh(new THREE.TorusGeometry(1.445, 0.004, 6, 192), paleMetal);
      instrument.add(outer);
      const ticks = [];
      for (let i = 0; i < 72; i += 1) {
        const angle = i / 72 * Math.PI * 2;
        const inside = i % 6 === 0 ? 1.365 : i % 3 === 0 ? 1.38 : 1.39;
        ticks.push(Math.cos(angle) * inside, Math.sin(angle) * inside, 0,
          Math.cos(angle) * 1.434, Math.sin(angle) * 1.434, 0);
      }
      const tickGeometry = new THREE.BufferGeometry();
      tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3));
      instrument.add(new THREE.LineSegments(tickGeometry, new THREE.LineBasicMaterial({ color: '#b79b76', transparent: true, opacity: 0.8 })));
      [-1, 1].forEach((pole) => {
        const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.13, 16), brass);
        spindle.position.y = pole * 1.325;
        instrument.add(spindle);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.029, 16, 12), paleMetal);
        cap.scale.y = 0.55;
        cap.position.y = pole * 1.263;
        instrument.add(cap);
      });
      routeGroup = new THREE.Group();
      const origin = reviewLocations.br;
      const toVector = ({ lat, lon }) => {
        const latR = THREE.MathUtils.degToRad(lat);
        const lonR = THREE.MathUtils.degToRad(lon);
        return new THREE.Vector3(Math.cos(latR) * Math.sin(lonR), Math.sin(latR), Math.cos(latR) * Math.cos(lonR)).multiplyScalar(1.257);
      };
      Object.entries(reviewLocations).forEach(([id, location]) => {
        if (id !== 'br') {
          const start = toVector(origin).normalize();
          const end = toVector(location).normalize();
          const points = [];
          for (let i = 0; i <= 64; i += 1) {
            const t = i / 64;
            const point = start.clone().lerp(end, t).normalize().multiplyScalar(1.257 + Math.sin(t * Math.PI) * 0.105);
            points.push(point);
          }
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({ color: 0xe77461, dashSize: 0.025, gapSize: 0.014, transparent: true, opacity: 0.55 }));
          line.computeLineDistances();
          line.userData.reviewRoute = true;
          line.userData.locationId = id;
          routeGroup.add(line);
        }
        const pin = new THREE.Group();
        pin.position.copy(toVector(location));
        pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pin.position.clone().normalize());
        const collar = new THREE.Mesh(new THREE.TorusGeometry(id === 'br' ? 0.038 : 0.029, 0.004, 6, 24), paleMetal);
        const core = new THREE.Mesh(new THREE.SphereGeometry(id === 'br' ? 0.021 : 0.016, 16, 12), new THREE.MeshBasicMaterial({ color: '#ef715f' }));
        core.position.z = 0.01;
        const halo = new THREE.Mesh(new THREE.RingGeometry(0.042, 0.05, 32), new THREE.MeshBasicMaterial({ color: '#ef715f', transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }));
        halo.position.z = 0.006;
        pin.add(collar, core, halo);
        pin.userData.locationId = id;
        pin.userData.halo = halo;
        routeGroup.add(pin);
      });
      globe.add(routeGroup);

      const resize = () => {
        const bounds = host.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const mobile = matchMedia('(max-width: 760px)').matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
        renderer.setPixelRatio(dpr);
        renderer.setSize(bounds.width, bounds.height, false);
        const radiusPx = mobile ? Math.min(bounds.width * 0.385, 160) : Math.min(bounds.width * 0.255, bounds.height * 0.335);
        const scale = radiusPx / 1.25;
        const centerY = mobile ? 222 : bounds.height * 0.5;
        camera.left = -bounds.width / (2 * scale);
        camera.right = bounds.width / (2 * scale);
        camera.top = centerY / scale;
        camera.bottom = -(bounds.height - centerY) / scale;
        camera.updateProjectionMatrix();
        overlay.width = Math.round(bounds.width * dpr);
        overlay.height = Math.round(bounds.height * dpr);
        overlay.style.width = `${bounds.width}px`;
        overlay.style.height = `${bounds.height}px`;
        overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();
      observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active && !reduced && !frame) frame = requestAnimationFrame(render); });
      observer.observe(host);

      const project = (location, width, height) => {
        const point = toVector(location).applyMatrix4(globe.matrixWorld);
        const facing = point.clone().normalize().z;
        point.project(camera);
        return { x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2, z: facing };
      };
      const drawOverlay = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        overlayCtx.clearRect(0, 0, width, height);

        Object.entries(reviewLocations).forEach(([id, location]) => {
          const p = project(location, width, height);
          const bubble = host.querySelector(`[data-globe-bubble="${id}"]`);
          if (bubble) {
            const mobile = matchMedia('(max-width: 760px)').matches;
            bubble.classList.toggle('is-behind', !mobile && p.z <= 0.08);
            bubble.setAttribute('tabindex', !mobile && p.z <= 0.08 ? '-1' : '0');
          }
          if (p.z <= 0.04) return;
          // Nodes and routes are drawn once in 3D. Only card connectors live here.
          if (bubble && !matchMedia('(max-width: 760px)').matches) {
            const stageRect = host.getBoundingClientRect();
            const rect = bubble.getBoundingClientRect();
            const left = rect.left - stageRect.left;
            const right = rect.right - stageRect.left;
            const top = rect.top - stageRect.top;
            const edgeX = left > width / 2 ? left : right;
            const edgeY = Math.max(top + 16, Math.min(top + rect.height - 16, p.y));
            overlayCtx.beginPath();
            overlayCtx.moveTo(p.x, p.y);
            overlayCtx.lineTo(edgeX, edgeY);
            overlayCtx.strokeStyle = id === selectedId ? 'rgba(230, 119, 98, .62)' : 'rgba(173, 148, 119, .25)';
            overlayCtx.lineWidth = 1;
            overlayCtx.stroke();
          }
        });
      };
      function render(time = 0) {
        frame = 0;
        if (!host.isConnected || !active) return;
        const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
        lastTime = time;
        if (!reduced) {
          if (targetYaw !== null) {
            yaw += (targetYaw - yaw) * Math.min(delta * 1.35, 1);
            if (Math.abs(targetYaw - yaw) < 0.004) targetYaw = null;
          } else yaw += delta * 0.065;
        }
        globe.rotation.y = yaw;
        globe.updateMatrixWorld(true);
        renderer.render(scene, camera);
        drawOverlay();
        if (!reduced && !document.hidden) frame = requestAnimationFrame(render);
      }
      const onThemeChange = () => {
        texture.image = paintMap(topology);
        texture.needsUpdate = true;
        material.roughness = document.documentElement.dataset.theme === 'dark' ? 0.66 : 0.76;
        renderer.render(scene, camera);
        drawOverlay();
      };
      window.addEventListener('nuvora:theme-change', onThemeChange);
      const onVisibility = () => { if (!document.hidden && active && !reduced && !frame) frame = requestAnimationFrame(render); };
      document.addEventListener('visibilitychange', onVisibility);
      const onResize = () => { resize(); renderer.render(scene, camera); drawOverlay(); };
      window.addEventListener('resize', onResize);
      const onSelect = (event) => {
        const id = event.detail?.id;
        selectedId = id;
        routeGroup.children.forEach((object) => {
          if (object.userData.reviewRoute) object.material.opacity = object.userData.locationId === id ? 1 : 0.35;
          if (object.userData.halo) object.userData.halo.scale.setScalar(object.userData.locationId === id ? 1.35 : 1);
        });
        host.querySelectorAll('[data-globe-bubble]').forEach((bubble) => bubble.classList.toggle('is-active', bubble.dataset.globeBubble === id));
        const location = reviewLocations[id];
        if (location) {
          const desired = -THREE.MathUtils.degToRad(location.lon);
          const difference = Math.atan2(Math.sin(desired - yaw), Math.cos(desired - yaw));
          targetYaw = yaw + difference;
          if (reduced) {
            yaw = targetYaw;
            targetYaw = null;
            render();
          }
        }
        drawOverlay();
      };
      window.addEventListener('nuvora:review-country-change', onSelect);
      if (loading) loading.hidden = true;
      host.dataset.globeReady = 'ready';
      frame = requestAnimationFrame(render);
      cleanup = () => {
        disposed = true;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        ro.disconnect();
        window.removeEventListener('nuvora:theme-change', onThemeChange);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('nuvora:review-country-change', onSelect);
        document.removeEventListener('visibilitychange', onVisibility);
        const geometries = new Set();
        const materials = new Set();
        scene.traverse((object) => {
          if (object.geometry) geometries.add(object.geometry);
          if (object.material) {
            (Array.isArray(object.material) ? object.material : [object.material]).forEach((item) => materials.add(item));
          }
        });
        geometries.forEach((item) => item.dispose());
        materials.forEach((item) => item.dispose());
        texture.dispose(); reliefTexture.dispose(); renderer.dispose();
        host.dataset.globeReady = '';
        cleanup = () => {};
      };
    }).catch((cause) => {
      if (disposed || !host.isConnected) return;
      console.error('Não foi possível inicializar o globo de avaliações:', cause);
      fail();
    });
  }

  const start = () => init(document.querySelector('[data-reviews-globe]'));
  window.addEventListener('nuvora:before-route-render', () => cleanup());
  window.addEventListener('nuvora:route-rendered', start);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
