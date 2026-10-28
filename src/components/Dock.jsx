import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  Store01Icon,
  Tag01Icon,
  ReceiptIcon,
  StarIcon,
  Search01Icon,
  Location01Icon,
  UserCircleIcon,
  ShoppingBag03Icon,
} from '@hugeicons/core-free-icons';
import './Dock.css';

const glyph = (icon) => <HugeiconsIcon icon={icon} size="1em" strokeWidth={1.8} />;
const ROUTES = [
  { id: 'inicio', label: 'Início', href: '#/', icon: Home01Icon },
  { id: 'restaurantes', label: 'Restaurantes', href: '#/restaurantes', icon: Store01Icon },
  { id: 'ofertas', label: 'Ofertas', href: '#/ofertas', icon: Tag01Icon },
  { id: 'pedidos', label: 'Meus pedidos', href: '#/pedidos', icon: ReceiptIcon },
  { id: 'avaliacoes', label: 'Avaliações', href: '#/avaliacoes', icon: StarIcon },
];

const readActiveRoute = () => {
  const route = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return route === 'restaurante' ? 'restaurantes' : route || 'inicio';
};

function CheckMark() {
  return <svg className="dock-menu-check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>;
}

function MenuRows({ rows, onClose, closeTimerRef, submenu, setSubmenu }) {
  return rows.map((row, index) => {
    if (row.separator) return <span className="dock-menu-separator" role="separator" key={`separator-${index}`} />;
    const hasSubmenu = Boolean(row.items?.length);
    return (
      <div
        className={`dock-menu-row-wrap${hasSubmenu ? ' has-submenu' : ''}${submenu === index ? ' submenu-open' : ''}`}
        key={`${row.label}-${index}`}
        onPointerEnter={() => {
          window.clearTimeout(closeTimerRef.current);
          setSubmenu(hasSubmenu ? index : null);
        }}
        onPointerLeave={() => {
          if (hasSubmenu) closeTimerRef.current = window.setTimeout(() => setSubmenu(null), 220);
        }}
      >
        <button
          className="dock-menu-row"
          type="button"
          role="menuitem"
          aria-haspopup={hasSubmenu ? 'menu' : undefined}
          aria-expanded={hasSubmenu ? submenu === index : undefined}
          disabled={row.disabled}
          onClick={() => {
            if (hasSubmenu) {
              setSubmenu((current) => current === index ? null : index);
              return;
            }
            row.onClick?.();
            onClose();
          }}
        >
          <span className="dock-menu-row-label">{row.checked !== undefined && <span className="dock-menu-check-slot">{row.checked && <CheckMark />}</span>}{row.label}</span>
          {row.badge !== undefined && <span className="dock-menu-badge">{row.badge}</span>}
          {hasSubmenu && <svg className="dock-menu-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3.5 4.5 4.5L6 12.5" /></svg>}
        </button>
        {hasSubmenu && <div className="dock-submenu" data-dock-menu role="menu" aria-label={row.label}><MenuRows rows={row.items} onClose={onClose} closeTimerRef={closeTimerRef} submenu={null} setSubmenu={() => {}} /></div>}
      </div>
    );
  });
}

function DockContextMenu({ menu, rows, onClose, onExited, onEnter }) {
  const menuRef = useRef(null);
  const closeTimerRef = useRef(0);
  const [submenu, setSubmenu] = useState(null);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) onClose(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose(true);
        return;
      }
      const menuItems = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])].filter((item) => !item.disabled);
      const currentIndex = menuItems.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next = event.key === 'ArrowDown'
          ? (currentIndex + 1) % menuItems.length
          : (currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1);
        menuItems[next]?.focus();
      }
      if (event.key === 'ArrowRight' && currentIndex >= 0) {
        const sub = menuItems[currentIndex]?.parentElement?.querySelector('.dock-submenu [role="menuitem"]');
        if (sub) { event.preventDefault(); sub.focus(); }
      }
      if (event.key === 'ArrowLeft' && menuItems.length) {
        const parent = document.activeElement?.closest('.dock-submenu')?.previousElementSibling;
        if (parent) { event.preventDefault(); parent.focus(); }
      }
      if (event.key === 'Tab') onClose(false);
    };
    const onScroll = () => onClose(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    const first = menuRef.current?.querySelector('[role="menuitem"]:not(:disabled)');
    if (menu.keyboard) first?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.clearTimeout(closeTimerRef.current);
    };
  }, [menu.keyboard, onClose]);

  if (!rows?.length) return null;
  const viewportWidth = window.innerWidth || 320;
  const viewportHeight = window.innerHeight || 320;
  const menuWidth = Math.min(280, Math.max(0, viewportWidth - 16));
  const menuHeight = Math.min(420, Math.max(0, viewportHeight - 16));
  const left = Math.max(8, Math.min(menu.x, viewportWidth - menuWidth - 8));
  const top = Math.max(8, Math.min(menu.y, viewportHeight - menuHeight - 8));
  const position = {
    left: `${left}px`,
    top: `${top}px`,
    '--menu-origin-x': `${Math.max(18, Math.min(218, menu.x - 16))}px`,
  };

  return createPortal(
    <div className={`dock-context-menu${menu.closing ? ' is-closing' : ''}`} ref={menuRef} style={position} data-dock-menu role="menu" aria-label="Ações da ND Food" onAnimationEnd={(event) => {
      if (menu.closing && event.currentTarget === event.target) onExited(menu.restore);
    }} onPointerEnter={onEnter}>
      <MenuRows rows={rows} onClose={() => onClose(false)} closeTimerRef={closeTimerRef} submenu={submenu} setSubmenu={setSubmenu} />
    </div>,
    document.body,
  );
}

export default function Dock({
  baseItemSize = 64,
  magnification = 88,
  panelHeight = 96,
  distance = 190,
  position = 'top',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  bounce = true,
}) {
  const dockRef = useRef(null);
  const itemRefs = useRef([]);
  const searchRef = useRef(null);
  const motionRef = useRef(new Map());
  const pointerRef = useRef({ x: 0, y: 0, inside: false });
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const focusRef = useRef(-1);
  const pressRef = useRef(null);
  const skipClickRef = useRef(-1);
  const wakeRef = useRef(null);
  const closeMenuRef = useRef(null);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme);
    window.addEventListener('nuvora:theme-change', sync);
    sync();
    return () => window.removeEventListener('nuvora:theme-change', sync);
  }, []);
  const [active, setActive] = useState(readActiveRoute);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [springEnabled, setSpringEnabled] = useState(true);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nuvora-cart') || '[]').reduce((sum, [, item]) => sum + item.quantity, 0);
    } catch {
      return 0;
    }
  });
  const [menu, setMenu] = useState(null);
  const settingsRef = useRef(null);

  const navigate = useCallback((href) => {
    window.location.hash = href.slice(1);
  }, []);
  const toggleSearch = useCallback(() => setSearchOpen((open) => !open), []);
  const navMenu = [
    { label: 'Ir para Início', onClick: () => navigate('#/') },
    { separator: true },
    { label: 'Navegar', items: [
      ...ROUTES.map((route) => ({ label: route.label, onClick: () => navigate(route.href) })),
      { label: 'Sacola', onClick: () => navigate('#/sacola') },
    ] },
    { separator: true },
    { label: 'Preferências', items: [
      { label: 'Mostrar nomes', checked: showLabels, onClick: () => setShowLabels((value) => !value) },
      { label: 'Animação com mola', checked: springEnabled, onClick: () => setSpringEnabled((value) => !value) },
    ] },
    { separator: true },
    { label: 'Buscar pratos', onClick: () => setSearchOpen(true) },
  ];

  const items = [
    ...ROUTES.map((route) => ({ ...route, onClick: () => navigate(route.href), menu: route.id === 'inicio' ? navMenu : undefined })),
    { separator: true },
    { id: 'tema', label: theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro', className: 'theme-toggle', glyph: (<span className="theme-glyph"><svg className="theme-glyph__sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><svg className="theme-glyph__moon" viewBox="0 0 24 24"><path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7Z"/></svg></span>), themeToggle: true },
    { id: 'buscar', label: 'Buscar', icon: Search01Icon, onClick: toggleSearch, className: 'dock-search-toggle' },
    { id: 'endereco', label: 'Endereço', icon: Location01Icon, className: 'location-button', onClick: () => {} },
    { id: 'entrar', label: 'Entrar', icon: UserCircleIcon, className: 'login-button', onClick: () => navigate('#/entrar') },
    { separator: true },
    { id: 'sacola', label: 'Sacola', icon: ShoppingBag03Icon, href: '#/sacola', badge: cartCount || undefined, className: 'cart-button', onClick: () => navigate('#/sacola') },
  ];

  settingsRef.current = { items, baseItemSize, magnification, distance, spring, springEnabled, bounce, position };

  useEffect(() => {
    const onHashChange = () => setActive(readActiveRoute());
    const onCartChange = (event) => setCartCount(event.detail?.count ?? 0);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('nuvora:cart-change', onCartChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('nuvora:cart-change', onCartChange);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => { wakeRef.current?.(); }, [springEnabled, magnification, baseItemSize, distance]);

  useEffect(() => {
    const root = dockRef.current;
    if (!root) return undefined;
    let alive = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stateFor = (index) => {
      if (!motionRef.current.has(index)) {
        motionRef.current.set(index, { size: settingsRef.current.baseItemSize, velocity: 0, lift: 0, rise: 0, launch: 0, gravity: 0, hopping: false });
      }
      return motionRef.current.get(index);
    };

    const tick = (now) => {
      frameRef.current = 0;
      if (!alive) return;
      const config = settingsRef.current;
      const dt = Math.min(1 / 30, Math.max(0.001, (now - (lastFrameRef.current || now)) / 1000));
      lastFrameRef.current = now;
      const pointer = pointerRef.current;
      const steps = reducedMotion ? 1 : Math.max(1, Math.ceil(dt * 240));
      const h = dt / steps;
      const mass = Math.max(0.01, config.springEnabled ? config.spring.mass : 0.1);
      const stiffness = config.springEnabled ? config.spring.stiffness : 150;
      const damping = config.springEnabled ? config.spring.damping : 12;
      const k = stiffness / mass;
      const c = damping / mass;
      let moving = false;

      config.items.forEach((item, index) => {
        const node = itemRefs.current[index];
        if (!node || item.separator) return;
        const motion = stateFor(index);
        const rect = node.getBoundingClientRect();
        const center = config.position === 'left' || config.position === 'right' ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
        const pointerPosition = config.position === 'left' || config.position === 'right' ? pointer.y : pointer.x;
        const isFocused = focusRef.current === index && !pointer.inside;
        const focusPosition = isFocused ? center : (pointer.inside ? pointerPosition : null);
        const reach = focusPosition === null ? 1 : Math.abs(focusPosition - center) / Math.max(1, config.distance);
        const target = config.baseItemSize + (config.magnification - config.baseItemSize) * (reach < 1 ? Math.cos((reach * Math.PI) / 2) ** 2 : 0);

        if (reducedMotion) {
          motion.size = target;
          motion.velocity = 0;
          motion.lift = 0;
          motion.hopping = false;
        } else {
          for (let step = 0; step < steps; step += 1) {
            motion.velocity = (motion.velocity + h * k * (target - motion.size)) / (1 + h * c + h * h * k);
            motion.size += motion.velocity * h;
            if (!motion.hopping) continue;
            motion.rise -= motion.gravity * h;
            motion.lift += motion.rise * h;
            if (motion.lift > 0) continue;
            motion.lift = 0;
            motion.rise *= -0.36;
            if (motion.rise < motion.launch * 0.2) {
              motion.rise = 0;
              motion.hopping = false;
              node.removeAttribute('data-hop');
            }
          }
        }

        if (Math.abs(motion.velocity) < 0.01 && Math.abs(target - motion.size) < 0.01) {
          motion.size = target;
          motion.velocity = 0;
        } else moving = true;
        if (motion.hopping) moving = true;

        const tile = node.firstElementChild;
        const tileScale = motion.size / Math.max(1, config.baseItemSize);
        node.style.width = `${motion.size.toFixed(2)}px`;
        node.style.height = `${motion.size.toFixed(2)}px`;
        if (tile) tile.style.transform = `translate3d(-50%, ${-motion.lift.toFixed(2)}px, 0) scale(${tileScale.toFixed(4)})`;
      });

      if (moving) frameRef.current = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!alive || frameRef.current) return;
      lastFrameRef.current = performance.now();
      frameRef.current = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const onMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      pointerRef.current = { x: event.clientX, y: event.clientY, inside: true };
      wake();
    };
    const onLeave = () => {
      pointerRef.current.inside = false;
      wake();
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', wake, { passive: true });
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(frameRef.current);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', wake);
      wakeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!menu || menu.closing) return undefined;
    const owner = itemRefs.current[menu.index];
    const onDown = (event) => {
      const target = event.target;
      if (target instanceof Element && (target.closest('[data-dock-menu]') || owner?.contains(target))) return;
      closeMenuRef.current?.(false);
    };
    const onScroll = () => closeMenuRef.current?.(false);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [menu]);

  const startHop = (index) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !bounce) return;
    const state = motionRef.current.get(index) ?? {
      size: baseItemSize, velocity: 0, lift: 0, rise: 0, launch: 0, gravity: 0, hopping: false,
    };
    motionRef.current.set(index, state);
    const node = itemRefs.current[index];
    if (!state || !node || state.hopping) return;
    const height = state.size * 0.4;
    state.gravity = (8 * height) / (0.38 * 0.38);
    state.launch = (state.gravity * 0.38) / 2;
    state.rise = state.launch;
    state.hopping = true;
    node.setAttribute('data-hop', '');
    wakeRef.current?.();
  };

  const openContextMenu = (index, event, keyboard = false) => {
    const item = settingsRef.current.items[index];
    if (!item?.menu?.length) return false;
    const rect = itemRefs.current[index]?.getBoundingClientRect();
    const x = keyboard ? (rect?.left ?? 0) + (rect?.width ?? 0) / 2 : event.clientX;
    const y = keyboard ? (rect?.bottom ?? 0) + 10 : Math.max(event.clientY, rect?.bottom ?? event.clientY) + 10;
    setMenu({ index, x: Math.max(8, Math.min(x - 12, window.innerWidth - 236)), y, keyboard, closing: false });
    pointerRef.current.inside = true;
    pointerRef.current.x = x;
    pointerRef.current.y = y;
    wakeRef.current?.();
    return true;
  };

  const closeContextMenu = useCallback((restore = false) => {
    setMenu((current) => current ? { ...current, closing: true, restore } : current);
  }, []);
  const finishContextMenu = (restore) => {
    const index = menu?.index;
    setMenu(null);
    if (restore) itemRefs.current[index]?.focus({ preventScroll: true });
  };
  closeMenuRef.current = closeContextMenu;

  const beginPress = (event, index) => {
    if (event.button !== 0 || !items[index]?.menu?.length) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const press = { index, timer: 0, moved: false };
    press.timer = window.setTimeout(() => {
      pressRef.current = null;
      skipClickRef.current = index;
      openContextMenu(index, { clientX: startX, clientY: startY });
    }, 450);
    pressRef.current = press;
    const cancel = (moveEvent) => {
      if (moveEvent.type === 'pointermove' && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 10) return;
      window.clearTimeout(press.timer);
      window.removeEventListener('pointermove', cancel);
      window.removeEventListener('pointerup', cancel);
      window.removeEventListener('pointercancel', cancel);
      if (pressRef.current === press) pressRef.current = null;
    };
    window.addEventListener('pointermove', cancel, { passive: true });
    window.addEventListener('pointerup', cancel, { once: true });
    window.addEventListener('pointercancel', cancel, { once: true });
  };

  const cancelPress = () => {
    if (!pressRef.current) return;
    window.clearTimeout(pressRef.current.timer);
    pressRef.current = null;
  };

  const onItemKeyDown = (event, index) => {
    const order = items.flatMap((item, itemIndex) => item.separator ? [] : [itemIndex]);
    const at = order.indexOf(index);
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10') || event.key === 'ArrowDown') {
      if (openContextMenu(index, event, true)) event.preventDefault();
      return;
    }
    let next;
    if (event.key === 'ArrowLeft') next = order[(at - 1 + order.length) % order.length];
    if (event.key === 'ArrowRight') next = order[(at + 1) % order.length];
    if (event.key === 'Home') next = order[0];
    if (event.key === 'End') next = order[order.length - 1];
    if (next !== undefined) {
      event.preventDefault();
      itemRefs.current[next]?.focus();
    }
  };

  const dockStyle = {
    '--dock-base': `${baseItemSize}px`,
    '--dock-peak': `${magnification}px`,
    '--dock-thickness': `${panelHeight}px`,
    '--dock-gap': '18px',
  };

  return (
    <div className="dock-component" ref={dockRef}>
      <nav className={`dock-panel dock-panel--${position}`} style={dockStyle} aria-label="Navegação e ações da ND Food" role="toolbar" data-react-dock>
        {items.map((item, index) => item.separator ? (
          <span className="dock-separator" aria-hidden="true" key={`separator-${index}`} />
        ) : (
          <button
            key={item.id}
            ref={(node) => { itemRefs.current[index] = node; }}
            className={`dock-item${active === item.id ? ' is-active' : ''}${item.className ? ` ${item.className}` : ''}`}
            style={{ '--dock-index': index }}
            type="button"
            data-dock-item
            data-theme-toggle={item.themeToggle || undefined}
            aria-pressed={item.themeToggle ? theme === 'dark' : undefined}
            aria-label={item.themeToggle ? 'Tema escuro' : item.label}
            aria-current={active === item.id ? 'page' : undefined}
            aria-haspopup={item.menu?.length ? 'menu' : undefined}
            aria-expanded={item.menu?.length ? menu?.index === index && !menu.closing : undefined}
            title={item.label}
            onPointerDown={(event) => beginPress(event, index)}
            onPointerUp={cancelPress}
            onPointerCancel={cancelPress}
            onContextMenu={(event) => {
              if (!item.menu?.length) return;
              event.preventDefault();
              cancelPress();
              openContextMenu(index, event);
            }}
            onClick={() => {
              if (skipClickRef.current === index) { skipClickRef.current = -1; return; }
              startHop(index);
              item.onClick?.();
            }}
            onFocus={() => { focusRef.current = index; wakeRef.current?.(); }}
            onBlur={(event) => {
              if (!dockRef.current?.contains(event.relatedTarget)) {
                focusRef.current = -1;
                wakeRef.current?.();
              }
            }}
            onKeyDown={(event) => onItemKeyDown(event, index)}
          >
            <span className="dock-tile">
              <span className="dock-face" aria-hidden="true">{item.glyph || glyph(item.icon)}</span>
            </span>
            {item.badge !== undefined && <span className="dock-badge" aria-hidden="true">{item.badge}</span>}
            {active === item.id && <span className="dock-dot" aria-hidden="true" />}
            {showLabels && <span className="dock-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="dock-search-panel" id="dock-search-panel" hidden={!searchOpen}>
        <label className="search-box">
          {glyph(Search01Icon)}
          <input ref={searchRef} id="search" type="search" placeholder="Busque por pratos ou restaurantes" aria-label="Busque por pratos ou restaurantes" />
        </label>
      </div>

      {menu && <DockContextMenu menu={menu} rows={items[menu.index]?.menu} onClose={closeContextMenu} onExited={finishContextMenu} onEnter={() => wakeRef.current?.()} />}
    </div>
  );
}
