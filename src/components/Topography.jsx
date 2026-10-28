import { useEffect, useRef } from 'react';
import './Topography.css';

/** Lightweight React Bits inspired contour field for the reviews city map. */
export default function Topography({
  color = '#ef4444', lineCount = 22, lineWidth = 1.2, elevation = 1,
  foreground = 0.2, tilt = 32, speed = 0.25, direction = 'forward',
  glow = 0.6, depthOfField = 0.4, fog = 0.35, hoverEffect = 'lift', clickEffect = 'pulse',
}) {
  const canvasRef = useRef(null);
  const interactionRef = useRef({ x: 0.5, y: 0.5, inside: false, pulseAt: 0, pulse: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;
    const interactionSurface = canvas.parentElement || canvas;
    const ctx = context;
    const interaction = interactionRef.current;
    let width = 1;
    let height = 1;
    let frame = 0;
    let start = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const move = (event) => {
      const box = canvas.getBoundingClientRect();
      interaction.x = (event.clientX - box.left) / box.width;
      interaction.y = (event.clientY - box.top) / box.height;
      interaction.inside = true;
    };
    const leave = () => { interaction.inside = false; };
    const click = (event) => {
      const box = canvas.getBoundingClientRect();
      interaction.pulse = { x: event.clientX - box.left, y: event.clientY - box.top };
      interaction.pulseAt = performance.now();
    };
    interactionSurface.addEventListener('pointermove', move);
    interactionSurface.addEventListener('pointerleave', leave);
    interactionSurface.addEventListener('pointerdown', click);

    const draw = (now) => {
      frame = 0;
      if (!start) start = now;
      const elapsed = reduceMotion ? 0 : (now - start) / 1000 * speed * (direction === 'backward' ? -1 : 1);
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((tilt * Math.PI) / 180);
      const extent = Math.hypot(width, height) * 0.64;
      const lineTotal = Math.max(8, Math.min(48, Math.round(lineCount)));
      const pointerX = (interaction.x - 0.5) * width;
      const pointerY = (interaction.y - 0.5) * height;
      const pulseAge = now - interaction.pulseAt;

      for (let index = 0; index < lineTotal; index += 1) {
        const radius = 18 + (index / lineTotal) * extent;
        const focus = index / lineTotal;
        const blur = 1 - Math.abs(focus - 0.46) * depthOfField;
        const alpha = Math.max(0.08, (0.18 + foreground * 0.62) * (1 - fog * focus) * blur);
        ctx.beginPath();
        const points = 180;
        for (let point = 0; point <= points; point += 1) {
          const angle = (point / points) * Math.PI * 2;
          const wave = Math.sin(angle * 3 + elapsed * 2 + index * 0.12) * 13
            + Math.sin(angle * 5 - elapsed + index * 0.17) * 7
            + Math.cos(angle * 2 + elapsed * 0.7) * 8;
          let x = Math.cos(angle) * (radius + wave) * 1.16;
          let y = Math.sin(angle) * (radius + wave) * 0.62;
          if (hoverEffect === 'lift' && interaction.inside) {
            const dx = x - pointerX;
            const dy = y - pointerY;
            const lift = Math.exp(-(dx * dx + dy * dy) / 23000) * elevation * 18;
            y -= lift;
          }
          if (point === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(0.45, lineWidth * (0.58 + focus * 0.38));
        ctx.shadowColor = color;
        ctx.shadowBlur = glow * (1.4 + (1 - focus) * 4);
        ctx.stroke();
      }
      ctx.restore();
      if (clickEffect === 'pulse' && interaction.pulse && pulseAge < 1100) {
        const progress = pulseAge / 1100;
        ctx.beginPath();
        ctx.arc(interaction.pulse.x, interaction.pulse.y, progress * Math.max(width, height) * 0.46, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = (1 - progress) * 0.55;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      interactionSurface.removeEventListener('pointermove', move);
      interactionSurface.removeEventListener('pointerleave', leave);
      interactionSurface.removeEventListener('pointerdown', click);
    };
  }, [color, lineCount, lineWidth, elevation, foreground, tilt, speed, direction, glow, depthOfField, fog, hoverEffect, clickEffect]);

  return <canvas ref={canvasRef} className="topography-canvas" aria-hidden="true" />;
}
