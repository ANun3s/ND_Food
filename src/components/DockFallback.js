(() => {
  const host = document.querySelector('#dock-root');
  if (!host) return;

  const startFallback = () => {
    const panel = host.querySelector('.dock-panel');
    if (!panel || panel.hasAttribute('data-react-dock')) return;
    const nodes = [...panel.querySelectorAll('[data-dock-item]')];
    if (!nodes.length) return;

    const base = Number.parseFloat(getComputedStyle(panel).getPropertyValue('--dock-base')) || 62;
    const peak = Number.parseFloat(getComputedStyle(panel).getPropertyValue('--dock-max')) || 84;
    const distance = 200;
    const states = nodes.map(() => ({ size: base, velocity: 0, lift: 0, rise: 0, hopping: false }));
    const pointer = { x: 0, inside: false };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let lastTime = 0;
    let pressTimer = 0;
    let suppressClick = false;
    let activeMenu;

    const animate = (time) => {
      frame = 0;
      const dt = Math.min(1 / 30, Math.max(.001, (time - (lastTime || time)) / 1000));
      lastTime = time;
      const steps = reduce ? 1 : Math.max(1, Math.ceil(dt * 240));
      const h = dt / steps;
      let moving = false;
      nodes.forEach((node, index) => {
        const state = states[index];
        const rect = node.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const reach = pointer.inside ? Math.abs(pointer.x - center) / distance : 1;
        const target = base + (peak - base) * (reach < 1 ? Math.cos((reach * Math.PI) / 2) ** 2 : 0);
        if (reduce) {
          state.size = target;
          state.velocity = 0;
          state.lift = 0;
          state.hopping = false;
        } else {
          for (let step = 0; step < steps; step += 1) {
            state.velocity = (state.velocity + h * (150 / .1) * (target - state.size)) / (1 + h * (12 / .1) + h * h * (150 / .1));
            state.size += state.velocity * h;
            if (!state.hopping) continue;
            state.rise -= state.gravity * h;
            state.lift += state.rise * h;
            if (state.lift > 0) continue;
            state.lift = 0;
            state.rise *= -.36;
            if (state.rise < state.launch * .2) state.hopping = false;
          }
        }
        if (Math.abs(state.velocity) < .01 && Math.abs(target - state.size) < .01) {
          state.size = target;
          state.velocity = 0;
        } else moving = true;
        if (state.hopping) moving = true;
        node.style.width = `${state.size.toFixed(2)}px`;
        node.style.height = `${state.size.toFixed(2)}px`;
        const face = node.querySelector('.dock-face');
        if (face) face.style.transform = `translateY(${-state.lift.toFixed(2)}px)`;
      });
      if (moving) frame = requestAnimationFrame(animate);
    };
    const wake = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    };
    const onMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      pointer.x = event.clientX;
      pointer.inside = true;
      wake();
    };
    const onLeave = () => { pointer.inside = false; wake(); };
    panel.addEventListener('pointermove', onMove);
    panel.addEventListener('pointerleave', onLeave);

    const closeMenu = () => {
      activeMenu?.remove();
      activeMenu = null;
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onMenuKey);
    };
    const onOutside = (event) => { if (!activeMenu?.contains(event.target)) closeMenu(); };
    const onMenuKey = (event) => {
      if (event.key === 'Escape') { closeMenu(); return; }
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      const buttons = [...activeMenu.querySelectorAll('[role="menuitem"]')];
      const at = buttons.indexOf(document.activeElement);
      const next = event.key === 'ArrowDown' ? (at + 1) % buttons.length : (at <= 0 ? buttons.length - 1 : at - 1);
      event.preventDefault();
      buttons[next]?.focus();
    };
    const route = (label, href) => ({ label, action: () => { window.location.hash = href; } });
    const renderMenuRows = (rows, menu) => rows.forEach((row) => {
      if (row.separator) {
        const separator = document.createElement('span');
        separator.className = 'dock-menu-separator';
        separator.setAttribute('role', 'separator');
        menu.append(separator);
        return;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dock-menu-row';
      button.setAttribute('role', 'menuitem');
      button.textContent = row.label;
      if (row.items) {
        button.setAttribute('aria-haspopup', 'menu');
        const sub = document.createElement('div');
        sub.className = 'dock-submenu';
        sub.setAttribute('role', 'menu');
        button.addEventListener('pointerenter', () => button.parentElement.classList.add('submenu-open'));
        button.addEventListener('focus', () => button.parentElement.classList.add('submenu-open'));
        renderMenuRows(row.items, sub);
        const wrap = document.createElement('div');
        wrap.className = 'dock-menu-row-wrap has-submenu';
        wrap.append(button, sub);
        menu.append(wrap);
      } else {
        button.addEventListener('click', () => { row.action?.(); closeMenu(); });
        const wrap = document.createElement('div');
        wrap.className = 'dock-menu-row-wrap';
        wrap.append(button);
        menu.append(wrap);
      }
    });
    const openMenu = (node, x, y) => {
      closeMenu();
      const menu = document.createElement('div');
      menu.className = 'dock-context-menu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Navegação da ND Food');
      menu.setAttribute('data-dock-menu', '');
      menu.style.left = `clamp(8px, ${Math.min(x - 12, innerWidth - 236)}px, calc(100vw - 236px))`;
      menu.style.top = `clamp(8px, ${Math.min(y + 10, innerHeight - 280)}px, calc(100vh - 280px))`;
      const pages = [route('Início', '#/'), route('Restaurantes', '#/restaurantes'), route('Ofertas', '#/ofertas'), route('Meus pedidos', '#/pedidos'), route('Sacola', '#/sacola')];
      renderMenuRows([
        route('Ir para Início', '#/'),
        { separator: true },
        { label: 'Navegar', items: pages },
        { separator: true },
        route('Buscar pratos', '#/restaurantes'),
      ], menu);
      document.body.append(menu);
      activeMenu = menu;
      document.addEventListener('pointerdown', onOutside);
      document.addEventListener('keydown', onMenuKey);
      menu.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
      wake();
    };

    nodes.forEach((node, index) => {
      node.addEventListener('click', (event) => {
        if (suppressClick) { event.preventDefault(); suppressClick = false; return; }
        if (reduce) return;
        const state = states[index];
        const height = state.size * .4;
        state.gravity = (8 * height) / (.38 * .38);
        state.launch = (state.gravity * .38) / 2;
        state.rise = state.launch;
        state.hopping = true;
        wake();
      });
      node.addEventListener('contextmenu', (event) => {
        if (!node.hasAttribute('data-context-menu')) return;
        event.preventDefault();
        openMenu(node, event.clientX, event.clientY);
      });
      node.addEventListener('pointerdown', (event) => {
        if (!node.hasAttribute('data-context-menu') || event.button !== 0) return;
        clearTimeout(pressTimer);
        const { clientX, clientY } = event;
        pressTimer = setTimeout(() => {
          suppressClick = true;
          openMenu(node, clientX, clientY);
        }, 450);
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => node.addEventListener(name, () => clearTimeout(pressTimer)));
      node.addEventListener('keydown', (event) => {
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
          event.preventDefault();
          const rect = node.getBoundingClientRect();
          openMenu(node, rect.left + rect.width / 2, rect.bottom);
        }
      });
    });

    const observer = new MutationObserver(() => {
      if (host.querySelector('[data-react-dock]')) {
        closeMenu();
        cancelAnimationFrame(frame);
        panel.removeEventListener('pointermove', onMove);
        panel.removeEventListener('pointerleave', onLeave);
        observer.disconnect();
      }
    });
    observer.observe(host, { childList: true, subtree: true });
  };

  const waitForReact = () => {
    if (host.querySelector('[data-react-dock]')) return;
    if (!host.querySelector('.dock-panel')) {
      setTimeout(waitForReact, 100);
      return;
    }
    setTimeout(() => {
      if (!host.querySelector('[data-react-dock]')) startFallback();
    }, 700);
  };

  waitForReact();
})();
