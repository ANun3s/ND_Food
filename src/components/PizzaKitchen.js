import { STATIONS, project, mouthPath, staticKitchen, pizzaArt, toolsArt } from './PizzaKitchenGeometry.js';
export { STATIONS } from './PizzaKitchenGeometry.js';
export const PIZZA_DURATION = 48;
export const PIZZA_STEPS = [
  ['Massa', 'A massa ganha forma.', 'Na primeira bancada, a massa é aberta do centro até a borda.'],
  ['Molho', 'Da massa à bancada de montagem.', 'A pá leva a massa para receber o molho de tomate.'],
  ['Ingredientes', 'Cada ingrediente, no seu lugar.', 'Queijo, tomate e manjericão completam a receita.'],
  ['Ao forno', 'O próximo destino é o forno.', 'A pizza cruza a cozinha sobre a pá e entra no forno a lenha.'],
  ['Assando', 'O calor transforma a receita.', 'O queijo derrete enquanto a borda ganha os pontos de forno.'],
  ['Pronta', 'Do forno à mesa de saída.', 'A pizza assada sai na pá e repousa na tábua, pronta para servir.'],
];
const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { const t = clamp(n); return t*t*(3-2*t); };
const windowAt = (t,a,b) => ease((t-a)/(b-a));
const show = (t,a,b,c,d) => windowAt(t,a,b)*(1-windowAt(t,c,d));
const mix = (a,b,p) => a.map((n,i)=>n+(b[i]-n)*p);
export function pizzaFrame(seconds) {
  const t=((seconds%PIZZA_DURATION)+PIZZA_DURATION)%PIZZA_DURATION;
  const toAssembly=windowAt(t,6,8), approach=windowAt(t,25,28), enter=windowAt(t,28,31), exit=windowAt(t,40.8,42.5), serve=windowAt(t,42.5,45);
  const portal=[145,65,116];
  let world=mix(STATIONS.dough,STATIONS.toppings,toAssembly);
  world=mix(world,portal,approach);world=mix(world,STATIONS.oven,enter);
  world=mix(world,portal,exit);world=mix(world,STATIONS.serving,serve);
  const lift=14*Math.sin(toAssembly*Math.PI)+14*Math.sin(approach*Math.PI)+14*Math.sin(serve*Math.PI)+3*Math.max(show(t,5.2,6,8,8.6),show(t,24,25,31,32),show(t,40,40.8,45,45.7));
  world[2]+=lift;
  const [x,y]=project(...world);
  return { t, step:Math.min(5,Math.floor(t/8)), x,y,world,lift,
    station:toAssembly<1?'dough':enter<1?'toppings':serve<1?'oven':'serving',
    dough:.47+.53*windowAt(t,.9,5), sauce:windowAt(t,9,14),
    peel:Math.max(show(t,5.2,5.9,8,8.6),show(t,24,25,31,32),show(t,40,40.8,45,45.7)),
    roller:show(t,.5,1,4.8,5.6),ladle:show(t,8.5,9,14.2,15.3),
    baked:windowAt(t,34,40),opacity:windowAt(t,0,.6)*(1-windowAt(t,47,48)) };
}
let instance=0;
function kitchenArt(id){return `<svg class="pk-art" viewBox="120 10 850 760" role="img" aria-labelledby="${id}-title ${id}-desc">
<title id="${id}-title">O circuito de uma pizza artesanal</title><desc id="${id}-desc">Quatro estações separadas de uma cozinha tradicional em perspectiva: bancada de massa, mesa de ingredientes, forno a lenha e tábua de saída. A mesma pizza percorre o circuito apoiada na pá.</desc>
<defs><clipPath id="${id}-mouth"><path d="${mouthPath}"/></clipPath><clipPath id="${id}-pizza-depth"><path data-pk="depth-front" d="M0 0H1100V800H0Z"/><path d="${mouthPath}"/></clipPath>
<radialGradient id="${id}-heat"><stop stop-color="#ffac40" stop-opacity=".95"/><stop offset=".7" stop-color="#c44715" stop-opacity=".65"/><stop offset="1" stop-color="#421e10" stop-opacity=".15"/></radialGradient>
<linearGradient id="${id}-flame" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#c44517"/><stop offset=".5" stop-color="#ff9a35"/><stop offset="1" stop-color="#ffe5a4"/></linearGradient></defs>
<g class="pk-lines">${staticKitchen(id)}<g data-pk="depth" clip-path="url(#${id}-pizza-depth)"><g data-pk="moving">${pizzaArt()}</g></g>${toolsArt()}</g></svg>`;}
export function mountPizzaKitchen(root) {
  if (root.dataset.pizzaMounted) return;
  root.dataset.pizzaMounted = 'true';
  const id = `pizza-kitchen-${++instance}`;
  root.innerHTML = `<div class="pk-intro"><div><p class="pk-eyebrow">FEITA COM TEMPO. SERVIDA COM CARINHO.</p><h2>Da massa ao <em>primeiro pedaço.</em></h2></div><p>Entre na nossa cozinha e acompanhe o preparo, um detalhe de cada vez.</p></div>
    <div class="pk-frame"><div class="pk-frame-top"><span>FIG. 01</span><span>ND FOOD / POR DENTRO DA COZINHA</span></div>
    <div class="pk-stage">${kitchenArt(id)}</div>
    <div class="pk-readout"><span data-pk="counter">01 / 06</span><div><h3 data-pk="title"></h3><p data-pk="caption"></p></div><span class="pk-cycle">PREPARO ARTESANAL</span></div>
    <div class="pk-timeline"><button type="button" class="pk-play" data-pk="play" aria-label="Pausar animação">Pausar</button><label class="pk-sr" for="${id}-seek">Etapa do preparo da pizza</label><input id="${id}-seek" data-pk="seek" type="range" min="0" max="47.99" step="0.01" value="0" aria-valuetext="Massa"/><span class="pk-loop">EM LOOP</span></div></div>
    <nav class="pk-steps" aria-label="Etapas do preparo">${PIZZA_STEPS.map(([name],i)=>`<button type="button" data-step="${i}"><span>0${i+1}</span>${name}</button>`).join('')}</nav>`;
  const refs = Object.fromEntries([...root.querySelectorAll('[data-pk]')].map(el=>[el.dataset.pk,el]));
  const cheese = [...root.querySelectorAll('[data-cheese]')], toppings = [...root.querySelectorAll('[data-topping]')], flames=[...root.querySelectorAll('[data-flame]')], buttons=[...root.querySelectorAll('[data-step]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let time = motion.matches ? 46 : 0, paused = motion.matches, visible = false, raf = 0, last = 0, activeStep = -1, scene3d = null, sceneLoading = false, destroyed = false;
  const attr = (el,key,value) => el.setAttribute(key,String(value));
  function draw() {
    const f=pizzaFrame(time), t=f.t;
    if (scene3d) scene3d.update(f);
    const frontIntercept=95+.86*(-8)-f.world[2];
    attr(refs['depth-front'],'d',t>=25&&t<=44?`M0 ${frontIntercept}L1100 ${550+frontIntercept}V800H0Z`:'M0 0H1100V800H0Z');
    attr(refs.moving,'transform',`translate(${f.x} ${f.y})`);attr(refs.moving,'opacity',f.opacity);
    attr(refs.dough,'transform',`translate(510 350) scale(${f.dough}) translate(-510 -350)`);
    attr(refs.sauce,'opacity',f.sauce);attr(refs.sauce,'transform',`translate(510 350) scale(${.05+.95*f.sauce}) translate(-510 -350)`);
    attr(refs.peel,'opacity',f.peel);
    const rollerPosition=project(STATIONS.dough[0],STATIONS.dough[1]+Math.sin((t-1)*2.3)*20,STATIONS.dough[2]+2);
    attr(refs.roller,'opacity',f.roller);attr(refs.roller,'transform',`translate(${rollerPosition})`);
    const angle=(t-9)*2.3,lp=project(STATIONS.toppings[0]+Math.cos(angle)*24*f.sauce,STATIONS.toppings[1]+Math.sin(angle)*24*f.sauce,121);
    attr(refs.ladle,'opacity',f.ladle);attr(refs.ladle,'transform',`translate(${lp})`);
    cheese.forEach((el,i)=>{const p=windowAt(t,16+i*.12,16.7+i*.12);attr(el,'opacity',p);attr(el,'transform',`translate(0 ${-30*(1-p)})`);});
    toppings.forEach((el,i)=>{const p=windowAt(t,19+i*.25,19.8+i*.25);attr(el,'opacity',p);attr(el,'transform',`translate(0 ${-32*(1-p)})`);});
    attr(refs.basil,'opacity',windowAt(t,21.8,23));attr(refs.baked,'opacity',f.baked);refs.dough.style.setProperty('--pk-bake',`${f.baked*100}%`);
    const hand=project(STATIONS.toppings[0]+Math.sin(t*1.5)*22,STATIONS.toppings[1],145);
    attr(refs.sprinkle,'opacity',show(t,15.7,16.3,22.5,23.4));attr(refs.sprinkle,'transform',`translate(${hand}) rotate(${Math.sin(t)*7})`);
    attr(refs.steam,'opacity',show(t,43.5,44.5,46.5,47.8)*.45);attr(refs.steam,'transform',`translate(${f.x} ${f.y-(motion.matches?0:Math.sin(t*1.8)*4)})`);
    flames.forEach((el,i)=>{const flicker=motion.matches?1:1+Math.sin(t*Math.PI*56/PIZZA_DURATION+i*1.7)*.1+Math.sin(t*Math.PI*82/PIZZA_DURATION+i)*.04;attr(el,'transform',`translate(0 ${Number(el.dataset.baseY)*(1-flicker)}) scale(1 ${flicker})`);});
    if(document.activeElement!==refs.seek) refs.seek.value=String(t);
    if(f.step!==activeStep){activeStep=f.step;refs.counter.textContent=`0${f.step+1} / 06`;refs.title.textContent=PIZZA_STEPS[f.step][1];refs.caption.textContent=PIZZA_STEPS[f.step][2];buttons.forEach((b,i)=>{b.classList.toggle('is-active',i===f.step);if(i===f.step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});refs.seek.setAttribute('aria-valuetext',PIZZA_STEPS[f.step][0]);}
    refs.play.textContent=paused?'Reproduzir':'Pausar';refs.play.setAttribute('aria-label',paused?'Reproduzir animação':'Pausar animação');
    root.dataset.playing=String(!paused);
  }
  function tick(now){raf=0;if(!root.isConnected){cleanup();return;}if(!visible||document.hidden||paused)return;time=(time+(last?Math.min((now-last)/1000,.05):0))%PIZZA_DURATION;last=now;draw();raf=requestAnimationFrame(tick);}
  async function loadScene() {
    if(sceneLoading || destroyed)return;
    sceneLoading=true;
    try {
      const {createPizzaKitchenScene}=await import('./PizzaKitchenScene.js');
      if(destroyed || !root.isConnected)return;
      scene3d=createPizzaKitchenScene(root.querySelector('.pk-stage'),pizzaFrame(time));
    } catch { /* The complete SVG and controls remain usable if WebGL is unavailable. */ }
  }
  function run(){if(!raf&&visible&&!document.hidden&&!paused){last=0;raf=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  refs.play.addEventListener('click',()=>{paused=!paused;draw();if(paused)stop();else run();});
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{time=i*8+3.5;paused=true;stop();draw();}));
  refs.seek.addEventListener('input',()=>{time=Number(refs.seek.value);paused=true;stop();draw();});
  const observer = new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;if(visible){loadScene();run();}else stop();},{rootMargin:'100px'});observer.observe(root);
  const onVisibility=()=>{if(document.hidden)stop();else run();}; document.addEventListener('visibilitychange',onVisibility);
  const onMotion=()=>{if(motion.matches){paused=true;stop();time=46;draw();}};motion.addEventListener('change',onMotion);
  function cleanup(){destroyed=true;scene3d?.dispose();stop();observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',onMotion);}
  draw();
  return cleanup;
}
function mountAll(){document.querySelectorAll('[data-pizza-kitchen]').forEach(mountPizzaKitchen);}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountAll,{once:true});else mountAll();document.addEventListener('nuvora:route-rendered',mountAll);}
