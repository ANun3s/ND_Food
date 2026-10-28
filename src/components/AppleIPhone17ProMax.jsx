import React, { useEffect, useRef } from 'react';
import { body, controls, glass, rotation, screenMatrix } from './iso/phone-geometry.js';
import './iso/phone.css';

function Solid({ part }) {
  const { paths, tone, id } = part;
  return <g className={`nd-solid nd-solid--${tone}`} data-part={id}>
    <path d={paths.fill} className="nd-solid-fill" />
    {paths.shades.map((d, i) => d && <path key={i} d={d} className={`nd-shade nd-shade-${i}`} />)}
    <path d={paths.top} className="nd-solid-top" />
    <path d={paths.outline} className="nd-edge" />
    <path d={paths.bevel} className="nd-bevel" />
  </g>;
}

export function IPhone17ProMax({ children, time = '9:41' }) {
  const host = useRef(null);
  useEffect(() => {
    const el = host.current;
    const observer = new ResizeObserver(([entry]) => el.style.setProperty('--nd-scale', entry.contentRect.width / 440));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <figure className="nd-phone-figure" aria-label="iPhone de frente com a versão móvel da ND Food">
    <div className="nd-phone-stage" ref={host}>
      <div className="nd-phone-canvas">
        <svg viewBox="0 0 440 700" className="nd-phone-svg" aria-hidden="true">
          <defs><filter id="nd-phone-shadow"><feGaussianBlur stdDeviation="15" /></filter></defs>
          <ellipse cx="220" cy="683" rx="128" ry="10" fill="currentColor" opacity=".16" filter="url(#nd-phone-shadow)" />
          <g transform={rotation}>{controls.filter(p => p.id.startsWith('left')).map(part => <Solid key={part.id} part={part}/>)}{body.map(part => <Solid key={part.id} part={part}/>)}{controls.filter(p => !p.id.startsWith('left')).map(part => <Solid key={part.id} part={part}/>)}</g>

        </svg>
        <div className="nd-display-layer">
          <svg viewBox="0 0 440 700" className="nd-phone-svg" aria-hidden="true"><g transform={rotation}>{glass.map(part=><Solid key={part.id} part={part}/>)}</g></svg>
          <div className="nd-screen-plane" style={{ transform: `matrix(${screenMatrix.join(',')})` }}>
            <div className="nd-screen-site">{children}</div>
            <div className="nd-screen-status" aria-hidden="true"><span>{time}</span><span>▮▮▮ ▰</span></div>
            <div className="nd-island" aria-hidden="true"><i/><b/></div>
            <div className="nd-screen-earpiece" aria-hidden="true"/>
            <span className="nd-home-bar" aria-hidden="true"/>
            <div className="nd-glass-light" aria-hidden="true"/>
          </div>
        </div>
      </div>
    </div>

  </figure>;
}

export default function IPhoneShowcase() {
  return <IPhone17ProMax><iframe className="nd-mobile-preview" src="./index.html#/restaurantes" title="ND Food em formato de celular" aria-hidden="true" tabIndex={-1} loading="lazy" scrolling="no" /></IPhone17ProMax>;
}
