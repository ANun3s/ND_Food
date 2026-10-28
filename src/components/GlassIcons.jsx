import React, { useEffect, useRef } from 'react';

const gradients = {
  blue: 'linear-gradient(135deg, hsl(214 95% 66%), hsl(226 80% 50%))',
  purple: 'linear-gradient(135deg, hsl(276 84% 70%), hsl(262 66% 52%))',
  red: 'linear-gradient(135deg, hsl(354 95% 68%), hsl(342 80% 52%))',
  indigo: 'linear-gradient(135deg, hsl(236 90% 72%), hsl(246 64% 54%))',
  orange: 'linear-gradient(135deg, hsl(38 100% 62%), hsl(20 94% 54%))',
  green: 'linear-gradient(135deg, hsl(146 66% 54%), hsl(162 82% 34%))',
  pink: 'linear-gradient(135deg, hsl(326 92% 74%), hsl(314 70% 54%))',
  graphite: 'linear-gradient(135deg, hsl(250 6% 46%), hsl(250 8% 22%))',
};

const tintWithOpacity = (color, opacity) => {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color);
  if (!match) return `rgba(223, 223, 223, ${opacity})`;
  const hex = match[1].length === 3 ? [...match[1]].map((part) => part + part).join('') : match[1];
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/** Glass icon grid styled for the category photos while keeping React Bits' prop API. */
export default function GlassIcons({
  items = [], size = 82, gap = 66, columns = 3, roundness = 0.6,
  refraction = 0.8, bevel = 0.6, dispersion = 0, frost = 0.2,
  shine = 0.85, tint = '#dfdfdf', tintOpacity = 0.2, iconColor,
  plate = 'tilt', tilt = 30, spread = 0.5, hover = 'press',
  parallax = 1, labels = 'hover', intro = true, theme = 'dark',
  className = '', style = {},
}) {
  const scrollRef = useRef(null);
  useEffect(() => {
    const rail = scrollRef.current;
    const shell = rail?.parentElement;
    if (!rail || !shell) return undefined;

    const fitWholeIcons = () => {
      const arrows = [...shell.querySelectorAll('.glass-icons-arrow')];
      const shellStyle = getComputedStyle(shell);
      const railStyle = getComputedStyle(rail);
      const shellGaps = parseFloat(shellStyle.columnGap) || 0;
      const arrowWidths = arrows.reduce((total, arrow) => total + arrow.getBoundingClientRect().width, 0);
      const availableWidth = shell.clientWidth - arrowWidths - shellGaps * arrows.length;
      const firstItem = rail.firstElementChild;
      const itemWidth = firstItem?.getBoundingClientRect().width || size;
      const itemGap = parseFloat(railStyle.columnGap) || gap;
      const requestedPadding = Math.max(parseFloat(railStyle.paddingLeft), parseFloat(railStyle.paddingRight));
      const safePadding = Math.max(0, Math.min(requestedPadding, (availableWidth - itemWidth) / 2));
      rail.style.paddingInline = `${safePadding}px`;
      const horizontalPadding = safePadding * 2;
      const visibleSlots = Math.max(1, Math.floor((availableWidth - horizontalPadding + itemGap) / (itemWidth + itemGap)));
      const railWidth = visibleSlots * (itemWidth + itemGap) - itemGap + horizontalPadding;

      rail.dataset.visibleSlots = String(visibleSlots);
      rail.style.flex = `0 0 ${railWidth}px`;
    };

    fitWholeIcons();
    const observer = new ResizeObserver(fitWholeIcons);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [size, gap]);

  const scrollCategories = (direction) => {
    const rail = scrollRef.current;
    if (!rail) return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    if (maxScroll <= 1) return;

    const current = rail.scrollLeft;
    if (direction < 0 && current <= 2) {
      rail.scrollTo({ left: maxScroll, behavior: 'smooth' });
      return;
    }
    if (direction > 0 && current >= maxScroll - 2) {
      rail.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    const firstItem = rail.firstElementChild;
    const itemWidth = firstItem?.getBoundingClientRect().width || size;
    const itemGap = parseFloat(getComputedStyle(rail).columnGap) || gap;
    const visibleSlots = Number(rail.dataset.visibleSlots) || 3;
    const step = (itemWidth + itemGap) * visibleSlots;
    const target = Math.max(0, Math.min(maxScroll, current + direction * step));
    rail.scrollTo({ left: target, behavior: 'smooth' });
  };
  const rootStyle = {
    ...style,
    '--glass-icon-size': `${size}px`,
    '--glass-icon-gap': `${gap}px`,
    '--glass-icon-columns': columns,
    '--glass-icon-radius': `${Math.round(size * 0.5 * roundness)}px`,
    '--glass-icon-refraction': refraction,
    '--glass-icon-bevel': bevel,
    '--glass-icon-dispersion': dispersion,
    '--glass-icon-frost': frost,
    '--glass-icon-shine': shine,
    '--glass-icon-tint': tintWithOpacity(tint, tintOpacity),
    '--glass-icon-ink': iconColor || '#ffffff',
    '--glass-icon-tilt': `${tilt}deg`,
    '--glass-icon-spread': spread,
    '--glass-icon-parallax': parallax,
  };

  return (
    <div className="glass-icons-shell">
      <button className="glass-icons-arrow" type="button" aria-label="Ver categorias anteriores" onClick={() => scrollCategories(-1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <div
        ref={scrollRef}
        className={`glass-icons glass-icons--${theme} ${intro ? 'glass-icons--intro' : ''} ${className}`.trim()}
        style={rootStyle}
        data-plate={plate}
        data-hover={hover}
        data-labels={labels}
        aria-label="Categorias de comida"
      >
        {items.map((item, index) => {
          const Tag = item.href ? 'a' : 'button';
          const color = gradients[item.color] || item.color || gradients.blue;
          return (
            <Tag
              key={item.id || item.label || index}
              className={`glass-icon ${item.className || ''}`.trim()}
              href={item.href}
              type={item.href ? undefined : 'button'}
              aria-label={item.label}
              onClick={item.onClick}
              style={{ '--glass-icon-color': color, '--glass-icon-index': index }}
              onPointerMove={(event) => {
                if (event.pointerType === 'touch') return;
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                event.currentTarget.style.setProperty('--pointer-x', `${x * 7}deg`);
                event.currentTarget.style.setProperty('--pointer-y', `${y * -7}deg`);
                event.currentTarget.style.setProperty('--shine-x', `${(x + 0.5) * 100}%`);
                event.currentTarget.style.setProperty('--shine-y', `${(y + 0.5) * 100}%`);
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.removeProperty('--pointer-x');
                event.currentTarget.style.removeProperty('--pointer-y');
                event.currentTarget.style.removeProperty('--shine-x');
                event.currentTarget.style.removeProperty('--shine-y');
              }}
            >
              <span className="glass-icon__plate" aria-hidden="true">
                <img className="glass-icon__photo" src={item.image} alt="" loading="lazy" />
              </span>
              <span className="glass-icon__glass" aria-hidden="true" />
              <span className="glass-icon__face" aria-hidden="true">{item.icon}</span>
              {labels !== 'none' && item.label && <span className="glass-icon__label">{item.label}</span>}
            </Tag>
          );
        })}
      </div>
      <button className="glass-icons-arrow" type="button" aria-label="Ver próximas categorias" onClick={() => scrollCategories(1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}
