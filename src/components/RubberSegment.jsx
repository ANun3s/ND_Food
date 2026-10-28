import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './RubberSegment.css';

const sizeMap = {
  sm: { height: 30, fontSize: 11, horizontalPadding: 10 },
  md: { height: 36, fontSize: 12, horizontalPadding: 14 },
  lg: { height: 44, fontSize: 14, horizontalPadding: 17 },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function normalizeItems(items) {
  return items.map((item) => {
    if (typeof item === 'string') return { value: item, label: item };
    return { ...item, value: String(item.value ?? item.label), label: item.label ?? item.value };
  });
}

export default function RubberSegment({
  items = [],
  value,
  defaultValue,
  onChange,
  trackColor = '#27272a',
  thumbColor = '#fafafa',
  textColor = '#fafafa',
  activeTextColor = '#18181b',
  size = 'md',
  radius = 10,
  inset = 3,
  equalSlots = true,
  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,
  draggable = true,
  disabled = false,
  className = '',
  'aria-label': ariaLabel = 'Segmented control',
  ariaLabel: ariaLabelAlias,
}) {
  const options = useMemo(() => normalizeItems(items), [items]);
  const controlled = value !== undefined;
  const initialIndex = Math.max(0, options.findIndex((item) => item.value === (defaultValue ?? value)));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [slots, setSlots] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [dragLeft, setDragLeft] = useState(0);
  const [thumbAnimation, setThumbAnimation] = useState({ x: 0, width: 0 });
  const rootRef = useRef(null);
  const buttonRefs = useRef([]);
  const activeRef = useRef(initialIndex);
  const dragRef = useRef(null);
  const activeSize = sizeMap[size] || sizeMap.md;
  const prefersReducedMotion = useReducedMotion();
  const selectedIndex = controlled
    ? Math.max(0, options.findIndex((item) => item.value === value))
    : activeIndex;

  const measureSlots = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const next = options.map((_, index) => {
      const rect = buttonRefs.current[index]?.getBoundingClientRect();
      return rect ? { left: rect.left - rootRect.left, width: rect.width } : { left: 0, width: 0 };
    });
    setSlots((previous) => {
      const unchanged = previous.length === next.length && next.every((slot, index) =>
        previous[index] && Math.abs(previous[index].left - slot.left) < 0.5 && Math.abs(previous[index].width - slot.width) < 0.5,
      );
      return unchanged ? previous : next;
    });
  }, [options.length]);

  useLayoutEffect(() => {
    measureSlots();
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measureSlots);
    observer.observe(root);
    buttonRefs.current.forEach((button) => button && observer.observe(button));
    return () => observer.disconnect();
  }, [measureSlots]);

  useEffect(() => {
    const slot = slots[selectedIndex];
    if (slot && thumbAnimation.width === 0) setThumbAnimation({ x: slot.left, width: slot.width });
  }, [selectedIndex, slots, thumbAnimation.width]);

  useEffect(() => {
    if (controlled) {
      const nextIndex = Math.max(0, options.findIndex((item) => item.value === value));
      activeRef.current = nextIndex;
      setActiveIndex(nextIndex);
      const slot = slots[nextIndex];
      if (slot) setThumbAnimation({ x: slot.left, width: slot.width });
    }
  }, [controlled, value, options, slots]);

  const selectIndex = useCallback((nextIndex, { fromDragX } = {}) => {
    if (disabled || !options.length) return;
    const index = clamp(nextIndex, 0, options.length - 1);
    const previousIndex = activeRef.current;
    if (index === previousIndex) {
      const slot = slots[index];
      if (slot && fromDragX !== undefined) setThumbAnimation({ x: slot.left, width: slot.width });
      return;
    }
    const target = slots[index];
    const previous = slots[previousIndex];
    if (target && previous) {
      const startLeft = fromDragX ?? previous.left;
      const distance = Math.abs(target.left - startLeft);
      const expandedWidth = Math.max(previous.width, target.width) + distance * (Math.max(0, stretch) / 100);
      const landingWidth = target.width + Math.min(Math.max(0, squash), target.width * 0.12);
      const movingRight = target.left >= startLeft;
      setThumbAnimation(prefersReducedMotion
        ? { x: target.left, width: target.width }
        : {
            x: movingRight
              ? [startLeft, startLeft, target.left, target.left]
              : [startLeft, target.left, target.left, target.left],
            width: [previous.width, Math.max(previous.width, expandedWidth), landingWidth, target.width],
          });
    }
    activeRef.current = index;
    if (!controlled) setActiveIndex(index);
    onChange?.(options[index].value, index);
  }, [controlled, disabled, onChange, options, prefersReducedMotion, slots, squash, stretch]);

  useEffect(() => {
    const onSync = (event) => {
      const requested = event.detail?.value;
      const index = options.findIndex((item) => item.value === requested);
      if (index >= 0) {
        selectIndex(index);
        buttonRefs.current[index]?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('nuvora:auth-mode-sync', onSync);
    return () => window.removeEventListener('nuvora:auth-mode-sync', onSync);
  }, [options, selectIndex]);

  const onPointerDown = (event) => {
    if (!draggable || disabled || event.button !== 0 || !slots[selectedIndex]) return;
    event.preventDefault();
    event.stopPropagation();
    const current = slots[selectedIndex];
    const now = performance.now();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: now,
      velocity: 0,
      startLeft: current.left,
      width: current.width,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragLeft(current.left);
    setDragging(true);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const root = rootRef.current;
    if (!root) return;
    const rootWidth = root.getBoundingClientRect().width;
    const nextLeft = clamp(drag.startLeft + event.clientX - drag.startX, 0, Math.max(0, rootWidth - drag.width));
    const now = performance.now();
    const elapsed = Math.max(1, now - drag.lastTime);
    drag.velocity = (event.clientX - drag.lastX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = now;
    setDragLeft(nextLeft);
  };

  const onPointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const root = rootRef.current;
    const rootWidth = root?.getBoundingClientRect().width || 0;
    const currentLeft = clamp(drag.startLeft + event.clientX - drag.startX, 0, Math.max(0, rootWidth - drag.width));
    const projectedLeft = clamp(currentLeft + drag.velocity * glide, 0, Math.max(0, rootWidth - drag.width));
    const projectedCenter = projectedLeft + drag.width / 2;
    const nearest = slots.reduce((best, slot, index) => {
      const distance = Math.abs(slot.left + slot.width / 2 - projectedCenter);
      return distance < best.distance ? { index, distance } : best;
    }, { index: selectedIndex, distance: Number.POSITIVE_INFINITY }).index;
    dragRef.current = null;
    setDragging(false);
    selectIndex(nearest, { fromDragX: currentLeft });
  };

  const handleKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % options.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = options.length - 1;
    else return;
    event.preventDefault();
    selectIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  if (!options.length) return null;
  const selectedSlot = slots[selectedIndex] || { left: 0, width: 0 };
  const motionTransition = prefersReducedMotion || dragging
    ? { duration: 0 }
    : {
        duration: Math.max(0.12, 0.46 / Math.max(0.25, speed)),
        times: [0, 0.48, 0.76, 1],
        ease: ['easeOut', 'easeInOut', 'easeOut'],
      };

  return (
    <div
      ref={rootRef}
      className={`rubber-segment rubber-segment--${size} ${equalSlots ? 'rubber-segment--equal' : ''} ${dragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
      role="radiogroup"
      aria-label={ariaLabelAlias || ariaLabel}
      aria-disabled={disabled || undefined}
      style={{
        '--rs-track': trackColor,
        '--rs-thumb': thumbColor,
        '--rs-text': textColor,
        '--rs-active-text': activeTextColor,
        '--rs-radius': `${radius}px`,
        '--rs-inset': `${inset}px`,
        '--rs-height': `${activeSize.height}px`,
        '--rs-font-size': `${activeSize.fontSize}px`,
        '--rs-padding-x': `${activeSize.horizontalPadding}px`,
      }}
    >
      {slots.length === options.length && (
        <motion.div
          className="rubber-segment__thumb"
          aria-hidden="true"
          initial={false}
          animate={dragging ? { x: dragLeft, width: selectedSlot.width } : thumbAnimation}
          transition={motionTransition}
          style={{
            left: 0,
            top: inset,
            bottom: inset,
            width: selectedSlot.width,
            borderRadius: `${Math.max(0, radius - inset)}px`,
            pointerEvents: draggable && !disabled ? 'auto' : 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      )}
      {options.map((item, index) => (
        <button
          key={item.value}
          ref={(element) => { buttonRefs.current[index] = element; }}
          type="button"
          className={`rubber-segment__option ${index === selectedIndex ? 'is-active' : ''}`}
          role="radio"
          aria-checked={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1}
          disabled={disabled}
          onClick={() => selectIndex(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          style={{ paddingInline: `calc(var(--rs-padding-x) + ${inset}px)` }}
        >
          <span className="rubber-segment__label">{item.icon && <span className="rubber-segment__icon" aria-hidden="true">{item.icon}</span>}{item.label}</span>
          <span className="rubber-segment__active-label" aria-hidden="true">{item.icon && <span className="rubber-segment__icon">{item.icon}</span>}{item.label}</span>
        </button>
      ))}
    </div>
  );
}
