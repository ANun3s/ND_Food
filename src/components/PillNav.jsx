import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './PillNav.css';

const DEFAULT_ITEMS = [
  { label: 'Home' },
  { label: 'Journal' },
  { label: 'Photos' },
  { label: 'About' },
];

/** Pill navigation adapted to work as the restaurant category filter. */
export default function PillNav({
  logo,
  logoAlt = 'Logo',
  logoHref = '#',
  items = DEFAULT_ITEMS,
  activeHref,
  defaultActiveIndex = 0,
  onItemClick,
  theme = 'light',
  layout = 'joined',
  size = 'md',
  surface = 'none',
  itemStyle = 'pill',
  hoverEffect = 'fill',
  indicator = 'dot',
  highlightColor = '#ed4c43',
  highlightTextColor = '#ffffff',
  className = '',
  ariaLabel = 'Categorias de restaurantes',
}) {
  const [selected, setSelected] = useState(defaultActiveIndex);
  const [hovered, setHovered] = useState(-1);
  const [focused, setFocused] = useState(-1);
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const dotRef = useRef(null);
  const controlled = activeHref !== undefined;
  const activeIndex = controlled ? Math.max(0, items.findIndex((item) => item.href === activeHref)) : selected;

  useLayoutEffect(() => {
    const track = trackRef.current;
    const activeItem = itemRefs.current[activeIndex];
    const dot = dotRef.current;
    if (!track || !activeItem || !dot) return;
    const position = () => {
      const trackRect = track.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      dot.style.transform = `translate3d(${itemRect.left - trackRect.left + itemRect.width / 2}px, 0, 0)`;
      const scrollContainer = track.closest('.restaurant-category-nav, .offers-category-nav');
      if (!scrollContainer) return;
      const containerRect = scrollContainer.getBoundingClientRect();
      if (itemRect.left < containerRect.left) scrollContainer.scrollLeft -= containerRect.left - itemRect.left;
      else if (itemRect.right > containerRect.right) scrollContainer.scrollLeft += itemRect.right - containerRect.right;
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(track);
    window.addEventListener('resize', position);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', position);
    };
  }, [activeIndex, items.length]);

  useEffect(() => {
    itemRefs.current.length = items.length;
  }, [items.length]);

  const choose = (item, index, event) => {
    if (item.href) event.preventDefault();
    if (!controlled) setSelected(index);
    onItemClick?.(item, index, event);
  };

  return (
    <nav
      className={`pill-nav${className ? ` ${className}` : ''}`}
      data-layout={layout}
      data-items={itemStyle}
      data-size={size}
      data-theme={theme}
      data-surface={surface}
      data-hover-effect={hoverEffect}
      data-react-pill-nav=""
      style={{ '--pn-pill': highlightColor, '--pn-pill-ink': highlightTextColor }}
      aria-label={ariaLabel}
    >
      {logo && <a className="pill-nav__logo" href={logoHref} aria-label={logoAlt}>{typeof logo === 'string' ? <img src={logo} alt="" /> : logo}</a>}
      <div className="pill-nav__bar">
        <div className="pill-nav__track" ref={trackRef}>
          <ul className="pill-nav__list">
            {items.map((item, index) => {
              const selectedItem = index === activeIndex;
              const Tag = item.href ? 'a' : 'button';
              const itemProps = item.href
                ? { href: item.href }
                : { type: 'button' };
              return (
                <li
                  className="pill-nav__slot"
                  data-active={selectedItem ? '' : undefined}
                  data-hover={hovered === index || focused === index ? '' : undefined}
                  key={`${item.label}-${index}`}
                  onPointerEnter={(event) => { if (event.pointerType !== 'touch') setHovered(index); }}
                  onPointerLeave={() => setHovered(-1)}
                >
                  <Tag
                    {...itemProps}
                    ref={(element) => { itemRefs.current[index] = element; }}
                    className="pill-nav__item"
                    aria-current={selectedItem ? 'true' : undefined}
                    aria-pressed={!item.href ? selectedItem : undefined}
                    onClick={(event) => choose(item, index, event)}
                    onFocus={() => setFocused(index)}
                    onBlur={() => setFocused(-1)}
                  >
                    {hoverEffect === 'fill' && <span className="pill-nav__fill" aria-hidden="true" />}
                    <span className="pill-nav__face">{item.icon}{item.label}</span>
                    {hoverEffect === 'fill' && <span className="pill-nav__face-alt" aria-hidden="true">{item.icon}{item.label}</span>}
                  </Tag>
                </li>
              );
            })}
          </ul>
          {indicator === 'dot' && <span className="pill-nav__dot" ref={dotRef} aria-hidden="true" />}
        </div>
      </div>
    </nav>
  );
}
