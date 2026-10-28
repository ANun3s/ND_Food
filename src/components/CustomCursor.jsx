import { useEffect, useRef } from 'react';
import './CustomCursor.css';

const TARGETS = 'a[href], button:not(:disabled), [role="button"], .category, .food-card, .restaurant-card, .filter-pill';

function getTarget(node) {
  return node instanceof Element ? node.closest(TARGETS) : null;
}

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!cursor || !finePointer.matches || reducedMotion.matches) return undefined;

    const hide = () => {
      targetRef.current = null;
      cursor.classList.remove('is-visible');
    };

    const placeAround = (target) => {
      if (!target) {
        hide();
        return;
      }

      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        hide();
        return;
      }

      targetRef.current = target;
      cursor.style.width = `${rect.width}px`;
      cursor.style.height = `${rect.height}px`;
      cursor.style.left = `${rect.left}px`;
      cursor.style.top = `${rect.top}px`;
      cursor.style.borderRadius = getComputedStyle(target).borderRadius || '12px';
      cursor.classList.add('is-visible');
    };

    const onPointerOver = (event) => placeAround(getTarget(event.target));
    const onPointerOut = (event) => {
      const nextTarget = getTarget(event.relatedTarget);
      if (nextTarget) placeAround(nextTarget);
      else hide();
    };
    const onPointerMove = () => {
      if (targetRef.current?.isConnected) placeAround(targetRef.current);
      else hide();
    };

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onPointerMove, { passive: true, capture: true });
    window.addEventListener('resize', onPointerMove, { passive: true });

    return () => {
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onPointerMove, true);
      window.removeEventListener('resize', onPointerMove);
    };
  }, []);

  return <span className="nuvora-hover-cursor" ref={cursorRef} aria-hidden="true" />;
}
