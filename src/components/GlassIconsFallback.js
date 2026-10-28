(() => {
  const root = document.querySelector('#glass-icons-root');
  const dataNode = document.querySelector('#food-categories-data');
  if (!root || !dataNode || root.querySelector('.glass-icons')) return;

  const originalRootStyle = root.getAttribute('style');
  const categories = JSON.parse(dataNode.textContent);
  Object.assign(root.style, {
    display: 'block', position: 'relative', width: '100%', minWidth: '0',
    minHeight: '270px', marginTop: '0',
  });
  const colors = {
    red: 'linear-gradient(135deg,hsl(354 95% 68%),hsl(342 80% 52%))',
    orange: 'linear-gradient(135deg,hsl(38 100% 62%),hsl(20 94% 54%))',
    indigo: 'linear-gradient(135deg,hsl(236 90% 72%),hsl(246 64% 54%))',
    purple: 'linear-gradient(135deg,hsl(276 84% 70%),hsl(262 66% 52%))',
    pink: 'linear-gradient(135deg,hsl(326 92% 74%),hsl(314 70% 54%))',
    blue: 'linear-gradient(135deg,hsl(214 95% 66%),hsl(226 80% 50%))',
    green: 'linear-gradient(135deg,hsl(146 66% 54%),hsl(162 82% 34%))',
    graphite: 'linear-gradient(135deg,hsl(250 6% 46%),hsl(250 8% 22%))',
  };
  const marks = {
    hamburger: '<path d="M4 12h16M5 12c.3-3.7 3.2-6 7-6s6.7 2.3 7 6M6 15h12l1 4H5l1-4ZM8 9h.01M12 8h.01M16 9h.01"/>',
    pizza: '<path d="M4 5c5-3 11-3 16 0l-7 16L4 5Z"/><path d="m7 8 10-2M10 11h.01M14 13h.01M11 16h.01"/>',
    sushi: '<path d="M3 12h18l-2 6H5l-2-6ZM5 12l2-7h10l2 7M9 5v7M15 5v7M12 7v5"/>',
    acai: '<path d="M4 11h16l-2 8H6l-2-8ZM6 8c1-2 3-3 6-3s5 1 6 3M8 14h.01M12 15h.01M16 14h.01"/>',
    dessert: '<path d="M5 20 18 7l2 2L7 22H5v-2ZM13 12l-2-2 3-3 2 2M7 17l3 2M9 15l3 2M11 13l3 2"/>',
    drink: '<path d="M7 3h10l-1 18H8L7 3ZM8 8h8M9 12h6M12 3V1"/>',
    sandwich: '<path d="M4 10c0-3 3.5-6 8-6s8 3 8 6v1H4v-1ZM4 13h16v2l-2 1H6l-2-1v-2ZM6 18h12l2 2H4l2-2Z"/>',
    pasta: '<path d="M4 7c4-3 12-3 16 0M6 8c-1 4 1 8 4 11M10 8c-1 4 1 8 4 11M14 8c-1 4 1 8 4 11M4 7l2 1M20 7l-2 1"/>',
    salad: '<path d="M4 13h16l-2 7H6l-2-7ZM6 11c0-4 3-7 7-7M12 11c0-3 2-5 5-6M7 11c0-2-1-4-3-5"/>',
    coffee: '<path d="M5 8h12v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8ZM17 10h2a2 2 0 0 1 0 4h-2M8 4v2M12 3v3M16 4v2"/>',
    seafood: '<path d="M3 12s4-6 10-6c4 0 7 3 8 6-1 3-4 6-8 6-6 0-10-6-10-6ZM3 12l-2-3v6l2-3ZM13 10h.01M17 12h.01M13 14h.01"/>',
    brazilian: '<path d="M4 12h16l-2 8H6l-2-8ZM6 9c1-2 3-3 6-3s5 1 6 3M8 15h.01M12 16h.01M16 15h.01"/>',
    mexican: '<path d="M4 13a8 8 0 0 1 16 0H4ZM5 14l2 5h10l2-5M8 10h.01M12 8h.01M16 10h.01"/>',
    arabic: '<path d="M4 13h16l-2 6H6l-2-6ZM6 10c1-3 3-5 6-5s5 2 6 5M8 15h.01M12 16h.01M16 15h.01"/>',
    thai: '<path d="M3 14h18l-2 6H5l-2-6ZM5 11c1-4 4-6 7-6s6 2 7 6M9 8V5M15 9l2-2"/>',
    chinese: '<path d="M4 12h16l-2 7H6l-2-7ZM6 9c1-3 3-4 6-4s5 1 6 4M8 14h.01M12 15h.01M16 14h.01"/>',
    indian: '<path d="M3 13h18l-2 7H5l-2-7ZM5 10c1-3 4-5 7-5s6 2 7 5M8 15h.01M12 16h.01M16 15h.01"/>',
    korean: '<path d="M4 13h16l-2 6H6l-2-6ZM6 10c1-3 3-5 6-5s5 2 6 5M8 15h.01M12 16h.01M16 15h.01"/>',
    vegan: '<path d="M19 5c-8 0-13 4-13 10a5 5 0 0 0 5 5c6 0 9-7 8-15ZM7 18c2-4 5-6 9-9"/>',
    bakery: '<path d="M4 11a8 8 0 0 1 16 0v8H4v-8ZM8 8v4M12 6v6M16 8v4M4 15h16"/>',
  };
  const categoryFilters = {
    hamburger: 'Hambúrgueres', pizza: 'Pizzas', sushi: 'Japonesa', acai: 'Açaí',
    dessert: 'Sobremesas', drink: 'Bebidas', sandwich: 'Sanduíches', pasta: 'Massas',
    salad: 'Saladas', coffee: 'Cafés', seafood: 'Frutos do mar', brazilian: 'Comida brasileira',
    mexican: 'Mexicana', arabic: 'Árabe', thai: 'Tailandesa', chinese: 'Chinesa',
    indian: 'Indiana', korean: 'Coreana', vegan: 'Vegana', bakery: 'Padarias',
  };
  const grid = document.createElement('div');
  grid.className = 'glass-icons glass-icons--dark glass-icons--intro';
  grid.dataset.plate = 'tilt';
  grid.dataset.hover = 'press';
  grid.dataset.labels = 'hover';
  Object.assign(grid.style, {
    '--glass-icon-size': '96px', '--glass-icon-gap': '26px', '--glass-icon-columns': '12',
    '--glass-icon-radius': '29px', '--glass-icon-refraction': '.8', '--glass-icon-bevel': '.6',
    '--glass-icon-dispersion': '0', '--glass-icon-frost': '.2', '--glass-icon-shine': '.85',
    '--glass-icon-tint': 'rgba(223,223,223,.12)', '--glass-icon-ink': '#fff',
    '--glass-icon-tilt': '30deg', '--glass-icon-spread': '.5', '--glass-icon-parallax': '1',
    display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'flex-start', gap: '26px',
    width: '0', minWidth: '0', minHeight: '250px', padding: '72px 88px',
    boxSizing: 'border-box', overflowX: 'auto', overflowY: 'hidden',
    scrollbarWidth: 'none', scrollSnapType: 'none',
  });
  grid.style.setProperty('overscroll-behavior-inline', 'contain');
  grid.style.setProperty('-webkit-overflow-scrolling', 'touch');
  grid.style.setProperty('isolation', 'isolate');
  grid.style.setProperty('position', 'relative');
  grid.style.setProperty('scrollbar-width', 'none');
  grid.style.setProperty('color', 'rgba(244,244,245,.9)');
  grid.style.setProperty('max-width', '100%');

  const shell = document.createElement('div');
  shell.className = 'glass-icons-shell';
  Object.assign(shell.style, { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', minWidth: '0' });
  const makeArrow = (direction) => {
    const button = document.createElement('button');
    button.className = 'glass-icons-arrow';
    button.type = 'button';
    button.setAttribute('aria-label', direction < 0 ? 'Ver categorias anteriores' : 'Ver próximas categorias');
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}" /></svg>`;
    Object.assign(button.style, {
      display: 'grid', placeItems: 'center', flex: '0 0 44px', width: '44px', height: '44px',
      padding: '0', border: '1px solid rgba(196,59,50,.18)', borderRadius: '50%',
      background: '#fff', color: '#b73730', boxShadow: '0 5px 14px rgba(43,31,23,.1)', cursor: 'pointer',
    });
    button.firstElementChild.style.cssText = 'display:block;width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round';
    button.addEventListener('click', () => {
      const maxScroll = grid.scrollWidth - grid.clientWidth;
      if (maxScroll <= 1) return;

      const current = grid.scrollLeft;
      if (direction < 0 && current <= 2) {
        grid.scrollTo({ left: maxScroll, behavior: 'smooth' });
        return;
      }
      if (direction > 0 && current >= maxScroll - 2) {
        grid.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      const itemWidth = grid.firstElementChild?.getBoundingClientRect().width || 96;
      const itemGap = parseFloat(getComputedStyle(grid).columnGap) || 26;
      const visibleSlots = Number(grid.dataset.visibleSlots) || 3;
      const step = (itemWidth + itemGap) * visibleSlots;
      const target = Math.max(0, Math.min(maxScroll, current + direction * step));
      grid.scrollTo({ left: target, behavior: 'smooth' });
    });
    return button;
  };
  shell.append(makeArrow(-1), grid, makeArrow(1));

  categories.forEach((category, index) => {
    const item = document.createElement('a');
    item.className = 'glass-icon';
    item.href = `#/restaurantes/${encodeURIComponent(categoryFilters[category.icon] || category.label)}`;
    item.setAttribute('aria-label', category.label);
    Object.assign(item.style, {
      position: 'relative', isolation: 'isolate', display: 'grid', placeItems: 'center',
      flex: '0 0 96px', width: '96px', height: '96px', padding: '0', border: '0',
      borderRadius: '29px', background: 'transparent', color: 'rgba(255,255,255,.96)',
      textDecoration: 'none', cursor: 'pointer', scrollSnapAlign: 'center',
      WebkitTapHighlightColor: 'transparent',
    });
    item.style.setProperty('--glass-icon-color', colors[category.color] || colors.blue);
    item.style.setProperty('--glass-icon-index', index);

    const plate = document.createElement('span');
    plate.className = 'glass-icon__plate';
    plate.setAttribute('aria-hidden', 'true');
    Object.assign(plate.style, {
      position: 'absolute', inset: '0', zIndex: '0', overflow: 'hidden', borderRadius: '29px',
      background: colors[category.color] || colors.blue,
    });
    const image = document.createElement('img');
    image.className = 'glass-icon__photo';
    image.src = category.image;
    image.alt = '';
    image.loading = 'lazy';
    Object.assign(image.style, {
      position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%',
      maxWidth: 'none', objectFit: 'cover', borderRadius: 'inherit', opacity: '1', filter: 'saturate(1.12) contrast(1.03)',
    });
    plate.append(image);

    const glass = document.createElement('span');
    glass.className = 'glass-icon__glass';
    glass.setAttribute('aria-hidden', 'true');
    Object.assign(glass.style, {
      position: 'absolute', inset: '0', zIndex: '1', borderRadius: '29px',
      border: '1px solid rgba(255,255,255,.78)', background: 'rgba(223,223,223,.08)',
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,.8), 0 12px 25px rgba(28,22,18,.18)',
      backdropFilter: 'blur(2.8px) saturate(1.15)', WebkitBackdropFilter: 'blur(2.8px) saturate(1.15)',
    });

    const face = document.createElement('span');
    face.className = 'glass-icon__face';
    face.setAttribute('aria-hidden', 'true');
    Object.assign(face.style, {
      position: 'absolute', inset: '0', zIndex: '2', display: 'grid', placeItems: 'center',
      borderRadius: '29px', color: 'rgba(255,255,255,.96)', pointerEvents: 'none',
      filter: 'drop-shadow(0 1px 3px rgba(20,15,12,.8))',
    });
    face.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${marks[category.icon] || marks.brazilian}</svg>`;
    face.firstElementChild.style.cssText = 'display:block;width:40px;height:40px;opacity:.96';

    const label = document.createElement('span');
    label.className = 'glass-icon__label';
    label.textContent = category.label;
    Object.assign(label.style, {
      position: 'absolute', zIndex: '3', top: 'calc(100% + 12px)', left: '50%',
      transform: 'translateX(-50%)', minWidth: 'max-content', padding: '6px 10px',
      borderRadius: '999px', background: 'rgba(30,27,24,.88)', color: '#fff',
      font: '700 13px/1.2 system-ui,sans-serif', opacity: '0', pointerEvents: 'none',
      transition: 'opacity .2s ease',
    });
    item.addEventListener('pointerenter', () => { label.style.opacity = '1'; });
    item.addEventListener('focus', () => { label.style.opacity = '1'; });
    item.addEventListener('blur', () => { label.style.opacity = '0'; });
    item.addEventListener('pointerleave', () => { label.style.opacity = '0'; });
    item.append(plate, glass, face, label);
    item.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      item.style.setProperty('--pointer-x', `${x * 7}deg`);
      item.style.setProperty('--pointer-y', `${y * -7}deg`);
      item.style.setProperty('--shine-x', `${(x + .5) * 100}%`);
      item.style.setProperty('--shine-y', `${(y + .5) * 100}%`);
    });
    item.addEventListener('pointerleave', () => {
      item.style.removeProperty('--pointer-x');
      item.style.removeProperty('--pointer-y');
      item.style.removeProperty('--shine-x');
      item.style.removeProperty('--shine-y');
    });
    grid.append(item);
  });

  root.append(shell);

  const fitWholeIcons = () => {
    const requestedPadding = window.innerWidth <= 420 ? 64 : window.innerWidth <= 820 ? 76 : 88;
    const arrows = [...shell.querySelectorAll('.glass-icons-arrow')];
    const shellStyle = getComputedStyle(shell);
    const railStyle = getComputedStyle(grid);
    const shellGaps = parseFloat(shellStyle.columnGap) || 0;
    const arrowWidths = arrows.reduce((total, arrow) => total + arrow.getBoundingClientRect().width, 0);
    const availableWidth = shell.clientWidth - arrowWidths - shellGaps * arrows.length;
    const itemWidth = grid.firstElementChild?.getBoundingClientRect().width || 96;
    const itemGap = parseFloat(railStyle.columnGap) || 26;
    const safePadding = Math.max(0, Math.min(requestedPadding, (availableWidth - itemWidth) / 2));
    grid.style.padding = `72px ${safePadding}px`;
    const horizontalPadding = safePadding * 2;
    const visibleSlots = Math.max(1, Math.floor((availableWidth - horizontalPadding + itemGap) / (itemWidth + itemGap)));
    const railWidth = visibleSlots * (itemWidth + itemGap) - itemGap + horizontalPadding;

    grid.dataset.visibleSlots = String(visibleSlots);
    grid.style.flex = `0 0 ${railWidth}px`;
  };
  fitWholeIcons();
  const resizeObserver = new ResizeObserver(fitWholeIcons);
  resizeObserver.observe(shell);
  window.NuvoraGlassIconsFallback = {
    unmount() {
      resizeObserver.disconnect();
      shell.remove();
      if (originalRootStyle === null) root.removeAttribute('style');
      else root.setAttribute('style', originalRootStyle);
      delete window.NuvoraGlassIconsFallback;
    },
  };
})();
