import * as k from './iso/iso-kit.mjs';

const WIDTH = 1000;
const HEIGHT = 500;
const PLATFORM = { x: -198, y: -108, w: 396, d: 216, r: 13 };
const ROAD_Y = 39;
const ROUTE_Y = 51;
const SHOP = { x: -164, y: -88, w: 78, d: 58, r: 3 };
const HOME = { x: 88, y: -88, w: 78, d: 58, r: 3 };
const RIDER_SCALE = 1.15;
const P = k.fitProjection(
  [...k.boxCorners(PLATFORM, -13, 0), ...k.boxCorners(SHOP, 0, 66), ...k.boxCorners(HOME, 0, 66), [-185, ROAD_Y, 5], [175, ROAD_Y, 5], [0, 0, 76]],
  WIDTH,
  HEIGHT,
  { pad: 32, azimuth: 65, elevation: 30 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (path, style) => k.lineSvg(path, style);
const poly3 = (points, className, closed = true) => `<path class="${className}" d="${k.pathOf(points.map(at), closed)}"/>`;
const box = (plan, z, height, tone = 'hi', className = '') => S(k.slabOf(plan, z, height, P, 8, Math.min(plan.r || 0, 1)), { tone, className });
const faceY = (x, y, z, width, height, className) => poly3([[x,y,z],[x+width,y,z],[x+width,y,z+height],[x,y,z+height]], className);
const circleXZ = (x, y, z, radius, className, steps = 32) => poly3(Array.from({ length: steps }, (_, i) => {
  const angle = Math.PI * 2 * i / steps;
  return [x + Math.cos(angle) * radius, y, z + Math.sin(angle) * radius];
}), className);
const screenText = (point, text, className, size = 5) => {
  const [x, y] = at(point);
  return `<text x="${x}" y="${y}" class="${className}" font-size="${size}">${text}</text>`;
};

function bag(x, y, z) {
  return box({x:x-4,y:y-3.5,w:8,d:7,r:1},z,9,'mid','dj-bag')
    + faceY(x-3,y+3.6,z+2,6,4,'dj-bag-label')
    + poly3([[x-2,y,z+9],[x-2,y,z+12],[x+2,y,z+12],[x+2,y,z+9]],'dj-bag-handle',false);
}

function street() {
  return [
    box({x:-184,y:28,w:368,d:45,r:12},0,2.3,'mid','dj-clean-road'),
    ...[-118,145].map(x=>box({x:x-12,y:-29,w:24,d:57,r:3},0,1.5,'hi','dj-clean-path')),
  ].join('');
}

function shop() {
  const x=SHOP.x,y=SHOP.y,w=SHOP.w,d=SHOP.d;
  const out=[
    box({x:x-3,y:y-3,w:w+6,d:d+6,r:5},0,2,'mid','dj-shop-foundation'),
    box(SHOP,2,49,'hi','dj-shop-body'),
    box({x:x-3,y:y-3,w:w+6,d:d+6,r:4},51,4,'mid','dj-clean-roof'),
    faceY(x+8,y+d+.35,4,30,28,'dj-shop-window-frame'),
    faceY(x+10,y+d+.5,6,26,24,'dj-glass'),
    faceY(x+46,y+d+.4,2,20,36,'dj-shop-door'),
    faceY(x+49,y+d+.6,5,14,30,'dj-door-panel'),
    box({x:x+7,y:y+d+1,w:33,d:6,r:1},15,3,'mid','dj-counter'),
    box({x:x+4,y:y+d+2,w:39,d:16,r:2},32,2,'hi','dj-awning'),
    screenText([x+39,y+d+1,44],'ND FOOD','dj-store-lettering',6),
  ];
  for(let i=0;i<6;i++)out.push(poly3([[x+5+i*6,y+d+2,34],[x+8+i*6,y+d+2,34],[x+8+i*6,y+d+18,34],[x+5+i*6,y+d+18,34]],'dj-awning-red'));
  return out.join('');
}

function house() {
  const x=HOME.x,y=HOME.y,w=HOME.w,d=HOME.d,h=43;
  return [
    box({x:x-3,y:y-3,w:w+6,d:d+6,r:5},0,2,'mid','dj-home-foundation'),
    box(HOME,2,h,'hi','dj-home-body'),
    poly3([[x+w,y,h],[x+w,y+d/2,h+22],[x+w,y+d,h]],'dj-clean-gable'),
    poly3([[x-4,y-4,h],[x-4,y+d/2,h+22],[x+w+4,y+d/2,h+22],[x+w+4,y-4,h]],'dj-roof-back'),
    poly3([[x-4,y+d/2,h+22],[x+w+4,y+d/2,h+22],[x+w+4,y+d+4,h],[x-4,y+d+4,h]],'dj-roof-front'),
    faceY(x+7,y+d+.5,5,24,24,'dj-home-window-frame'),
    faceY(x+9,y+d+.7,7,20,20,'dj-window-warm'),
    faceY(x+42,y+d+.5,2,25,35,'dj-home-door'),
    faceY(x+45,y+d+.7,5,19,29,'dj-home-door-inset'),
    box({x:x+39,y:y+d,w:31,d:7,r:2},0,2,'mid','dj-home-step'),
    circleXZ(x+19,y+d+.9,19,4,'dj-customer-skin'),
    faceY(x+13,y+d+.9,8,12,7,'dj-customer-shirt'),
    `<g data-customer-arm>${poly3([[x+15,y+d+1,11],[x+21,y+d+1,13],[x+21,y+d+1,16]],'dj-customer-arm',false)}</g>`,
    box({x:x+20,y:y+d+4,w:15,d:7,r:1},2,6,'lo','dj-delivery-table'),
    S(k.cylinder(x+27,y+d+7,4,8,.5,P,24),{tone:'hi',className:'dj-plate'}),
    S(k.cylinder(x+27,y+d+7,2.2,8.6,.35,P,20),{tone:'red',className:'dj-meal'}),
  ].join('');
}

function motorcycle() {
  const out=[];
  for(const x of [-14,14])out.push(
    circleXZ(x,1,8.5,8.5,'dj-tire'),
    circleXZ(x,1.2,8.5,5,'dj-rim'),
    `<path data-wheel-spokes="${x}" data-wheel-y="1.3" class="dj-spokes"/>`,
    circleXZ(x,1.4,8.5,1.7,'dj-hub'),
  );
  out.push(
    poly3([[-14,2,8.5],[-7,2,20],[7,2,20],[14,2,8.5]],'dj-fork',false),
    box({x:-13,y:-4,w:25,d:8,r:3},12,8,'mid','dj-clean-bike'),
    box({x:-13,y:-4,w:15,d:8,r:2},21,3,'lo','dj-seat'),
    poly3([[14,2,8.5],[10,2,27],[15,2,27]],'dj-handlebar',false),
    box({x:-26,y:-7,w:14,d:14,r:2},21,13,'mid','dj-delivery-box'),
    box({x:-27,y:-8,w:16,d:16,r:2},34,2,'mid','dj-box-lid'),
    poly3([[-5,4,26],[3,4,19],[0,4,11],[4,4,11]],'dj-clean-leg',false),
    box({x:-8,y:-4,w:9,d:8,r:3},25,14,'hi','dj-clean-jacket'),
    poly3([[-2,4,35],[5,4,28],[13,4,27]],'dj-clean-arm',false),
    box({x:-8,y:-5,w:14,d:10,r:5},38,12,'hi','dj-clean-helmet'),
    circleXZ(-1,5.1,44,6,'dj-clean-helmet-front'),
    faceY(0,5.2,42,5,4,'dj-visor'),
  );
  return out.join('');
}

function sceneSvg() {
  const shopStop = at([-118, ROUTE_Y, 0]);
  const homeStop = at([145, ROUTE_Y, 0]);
  const payPosition = at([HOME.x+53, HOME.y+HOME.d+9, 7]);
  const route = k.segment([-181,ROUTE_Y,2.5],[145,ROUTE_Y,2.5],P);
  const movingBike = motorcycle();
  const centre=at([0,0,0]);
  const scaleAroundOrigin=`translate(${centre[0]} ${centre[1]}) scale(${RIDER_SCALE}) translate(${-centre[0]} ${-centre[1]})`;
  const vehicle = `<g data-delivery-rider class="dj-moving-rider"><g transform="${scaleAroundOrigin}"><g data-bike-suspension>${movingBike}</g></g></g>`;
  const deliveryExtras = [
    `<g class="dj-payment" data-journey-object="payment" transform="translate(${payPosition[0]-13.5} ${payPosition[1]-39})"><rect x="0" y="0" width="27" height="37" rx="4" class="dj-payment-phone"/><rect x="3" y="5" width="21" height="24" rx="2" class="dj-payment-screen"/><text x="13.5" y="16" class="dj-payment-pix">PIX</text><circle cx="13.5" cy="24" r="2.3" class="dj-payment-check"/></g>`,
  ].join('');
  const body = [
    '<defs><linearGradient id="dj-road-shine" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#494644"/><stop offset="1" stop-color="#302f30"/></linearGradient><radialGradient id="dj-window-light"><stop stop-color="#fff1c9"/><stop offset="1" stop-color="#e5b66e"/></radialGradient></defs>',
    street(), shop(), house(),
    L(route,{tone:'lit',className:'dj-route-line'}),
    `<g class="dj-location-pin dj-location-pin--shop"><circle cx="${shopStop[0]}" cy="${shopStop[1]-8}" r="8"/><circle cx="${shopStop[0]}" cy="${shopStop[1]-8}" r="2.6"/></g>`,
    `<g class="dj-location-pin dj-location-pin--home"><circle cx="${homeStop[0]}" cy="${homeStop[1]-8}" r="8"/><circle cx="${homeStop[0]}" cy="${homeStop[1]-8}" r="2.6"/></g>`,
    deliveryExtras,
    vehicle,
    `<g data-transit-package>${bag(0,0,0)}</g>`,
  ];
  return k.figureSvg({
    width:WIDTH,
    height:HEIGHT,
    standalone:'light',
    className:'delivery-journey__svg',
    label:'Diorama isométrico em ciclo: o motoboy chega ao restaurante ND Food, retira a sacola, percorre a rua até uma casa, recebe o pagamento, entrega o pedido e a cliente começa a refeição.',
    body,
  });
}

const phaseTable = [
  { until:.12, phase:'arrival', step:'pickup', status:'Motoboy chegando ao restaurante' },
  { until:.25, phase:'pickup', step:'pickup', status:'Retirando seu pedido' },
  { until:.65, phase:'ride', step:'ride', status:'Seu pedido está a caminho' },
  { until:.77, phase:'pay', step:'pay', status:'Pagamento na entrega' },
  { until:.88, phase:'handoff', step:'pay', status:'Pagamento recebido • pedido entregue' },
  { until:.97, phase:'enjoy', step:'enjoy', status:'Entrega concluída • bom apetite' },
  { until:1, phase:'reset', step:'enjoy', status:'Entrega concluída • bom apetite' },
];
const clamp = (value) => Math.max(0,Math.min(1,value));
const smooth = (value) => { const t=clamp(value); return t*t*t*(t*(t*6-15)+10); };
function mount() {
  const section=document.querySelector('[data-delivery-journey]');
  const scene=section?.querySelector('[data-journey-scene]');
  const art=scene?.querySelector('[data-journey-art]');
  if(!scene || !art || scene.dataset.mounted)return;
  scene.dataset.mounted='true';
  art.innerHTML=sceneSvg();
  const svg=art.querySelector('svg');
  const rider=svg.querySelector('[data-delivery-rider]');
  const suspension=svg.querySelector('[data-bike-suspension]');
  const parcel=svg.querySelector('[data-transit-package]');
  const spokes=[...svg.querySelectorAll('[data-wheel-spokes]')];
  const arm=svg.querySelector('[data-customer-arm]');
  const status=scene.querySelector('[data-journey-status]');
  const fill=scene.querySelector('[data-journey-progress]');
  const progress=scene.querySelector('[role="progressbar"]');
  const toggle=section.querySelector('[data-journey-toggle]');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration=22000;
  let raf=0, visible=false, paused=false, elapsed=0, previous=0, lastPhase='';
  const origin=at([0,0,0]);
  const moveTo=(node,world)=>{
    const point=at(world);
    node.setAttribute('transform',`translate(${(point[0]-origin[0]).toFixed(2)} ${(point[1]-origin[1]).toFixed(2)})`);
  };
  const interpolate=(from,to,t,lift=0)=>from.map((v,i)=>v+(to[i]-v)*smooth(t)+(i===2?Math.sin(smooth(t)*Math.PI)*lift:0));
  const paint=(cycle,still=false)=>{
    const entry=phaseTable.find(item=>cycle<item.until)||phaseTable.at(-1);
    if(entry.phase!==lastPhase || still){
      lastPhase=entry.phase;
      scene.dataset.phase=still?'still':entry.phase;
      status.textContent=still?'Da retirada à entrega, acompanhe cada etapa do pedido':entry.status;
      const steps=['pickup','ride','pay','enjoy'];
      section.querySelectorAll('[data-journey-step]').forEach(item=>{
        const current=item.dataset.journeyStep===entry.step;
        item.classList.toggle('is-current',current);
        item.classList.toggle('is-complete',steps.indexOf(item.dataset.journeyStep)<steps.indexOf(entry.step));
        if(current)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
      });
    }
    let x=-181;
    let speed=0;
    if(cycle<.12){const t=cycle/.12;x+=63*smooth(t);speed=16*t*t*(1-t)*(1-t);}
    else if(cycle<.25)x=-118;
    else if(cycle<.65){const t=(cycle-.25)/.4;x=-118+263*smooth(t);speed=16*t*t*(1-t)*(1-t);}
    else x=145;
    const fade=still?1:Math.min(smooth(cycle/.025),1-smooth((cycle-.965)/.035));
    moveTo(rider,[x,ROUTE_Y,2.5]);
    rider.style.opacity=String(fade);
    suspension.setAttribute('transform',`translate(0 ${still?0:Math.sin(cycle*160)*speed*.2})`);
    for(const wheel of spokes){
      const wx=Number(wheel.dataset.wheelSpokes),wy=Number(wheel.dataset.wheelY||0),angle=-(x+181)/(8.5*RIDER_SCALE);
      wheel.setAttribute('d',Array.from({length:6},(_,i)=>{
        const a=angle+i*Math.PI/3;
        return k.segment([wx,wy,8.5],[wx+Math.cos(a)*4.8,wy,8.5+Math.sin(a)*4.8],P);
      }).join(''));
    }
    const counter=[SHOP.x+25,SHOP.y+SHOP.d+5,18];
    const carrier=[x-20*RIDER_SCALE,ROUTE_Y,2.5+36*RIDER_SCALE];
    const doorstep=[HOME.x+52,HOME.y+HOME.d+4,2];
    const table=[HOME.x+27,HOME.y+HOME.d+7,9];
    let packagePosition=counter;
    if(cycle>=.16 && cycle<.25)packagePosition=interpolate(counter,carrier,(cycle-.16)/.075,12);
    else if(cycle>=.25 && cycle<.77)packagePosition=carrier;
    else if(cycle>=.77 && cycle<.88)packagePosition=interpolate(carrier,doorstep,(cycle-.77)/.085,10);
    else if(cycle>=.88)packagePosition=interpolate(doorstep,table,(cycle-.88)/.045,8);
    moveTo(parcel,packagePosition);
    parcel.style.opacity=String(cycle>.92?1-smooth((cycle-.92)/.025):fade);
    const eating=!still && entry.phase==='enjoy'?Math.sin((cycle-.88)*160)*2:0;
    arm.setAttribute('transform',`translate(0 ${eating})`);
    const value=still?100:Math.round(Math.min(cycle/.92,1)*100);
    progress.setAttribute('aria-valuenow',String(value));
    fill.style.transform=`scaleX(${value/100})`;
  };
  const running=()=>visible&&!document.hidden&&!paused&&!reduced.matches;
  const render=now=>{
    raf=0;
    if(!running()){previous=0;return;}
    if(previous)elapsed+=Math.min(now-previous,100);
    previous=now;
    paint((elapsed%duration)/duration);
    raf=requestAnimationFrame(render);
  };
  const sync=()=>{
    const active=running();
    scene.dataset.visible=String(active);
    if(active&&!raf){previous=0;raf=requestAnimationFrame(render);}
    else if(!active){cancelAnimationFrame(raf);raf=0;previous=0;}
  };
  toggle?.addEventListener('click',()=>{
    paused=!paused;
    toggle.textContent=paused?'Continuar animação':'Pausar animação';
    toggle.setAttribute('aria-pressed',String(paused));
    sync();
  });
  const onMotion=()=>{
    if(toggle)toggle.hidden=reduced.matches;
    if(reduced.matches)paint(.5,true);
    else{lastPhase='';paint((elapsed%duration)/duration);}
    sync();
  };
  if(window.IntersectionObserver){
    new IntersectionObserver((entries)=>{visible=entries.at(-1).isIntersecting;sync();},{threshold:.12}).observe(scene);
  }else visible=true;
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener?.('change',onMotion);
  onMotion();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
window.addEventListener('nuvora:route-rendered',mount);
