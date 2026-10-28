import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { STATIONS } from './PizzaKitchenGeometry.js';

/** Real geometry: X/Z form the kitchen floor; Y is physical height. */
export function createPizzaKitchenModel() {
  const group = new THREE.Group();
  group.name = 'ND Food · cozinha artesanal';
  const geometries = new Set(), materials = new Set();
  const material = (color, options={}) => { const m=new THREE.MeshStandardMaterial({color,roughness:.78,metalness:0,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,...options});materials.add(m);return m; };
  const palette={paper:material('#f2eee6'),edge: new THREE.LineBasicMaterial({color:'#1c1b19',transparent:true,opacity:.72}),metal:material('#d4d1cb',{metalness:.35,roughness:.4}),stone:material('#e8e4dd'),wood:material('#c5c0b5'),inset:material('#77736c'),inner:material('#3a3630'),cloth:material('#e5e1da'),dough:material('#ead1a4'),crust:material('#e0bb7e'),sauce:material('#a8422d'),cheese:material('#f2e2b1'),tomato:material('#ca513b'),seed:material('#f2c690'),basil:material('#667e4c'),toast:material('#80522d')};
  materials.add(palette.edge);palette.edge.toneMapped=false;
  const geo = g=>{geometries.add(g);return g;};
  function mesh(parent,g,m=palette.paper,outlined=true){const o=new THREE.Mesh(geo(g),m);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(outlined){const eg=geo(new THREE.EdgesGeometry(g,28));const e=new THREE.LineSegments(eg,palette.edge);o.add(e);}return o;}
  function at(o,x,z,y){o.position.set(x,y,z);return o;}
  function box(parent,x,z,y,w,d,h,m=palette.paper){return at(mesh(parent,new THREE.BoxGeometry(w,h,d),m),x,z,y+h/2);}
  function cylinder(parent,x,z,y,r,h,m=palette.paper,rt=r){return at(mesh(parent,new THREE.CylinderGeometry(rt,r,h,32,1),m),x,z,y+h/2);}
  function torus(parent,x,z,y,r,t,m=palette.paper){const o=mesh(parent,new THREE.TorusGeometry(r,t,10,48),m,false);o.rotation.x=Math.PI/2;return at(o,x,z,y);}
  function sphere(parent,x,z,y,r,m=palette.paper,s=[1,1,1]){const o=at(mesh(parent,new THREE.SphereGeometry(r,24,16),m,false),x,z,y);o.scale.set(...s);return o;}
  function rod(parent,a,b,r,m=palette.metal){const av=new THREE.Vector3(a[0],a[2],a[1]),bv=new THREE.Vector3(b[0],b[2],b[1]);const delta=bv.clone().sub(av);const o=mesh(parent,new THREE.CylinderGeometry(r,r,delta.length(),16),m);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;}
  function roundedShape(w,d,r){const s=new THREE.Shape(),x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function slab(parent,x,z,y,w,d,h,m=palette.stone,r=3){const g=new THREE.ExtrudeGeometry(roundedShape(w,d,r),{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.7,bevelThickness:.6,curveSegments:5});g.rotateX(-Math.PI/2);return at(mesh(parent,g,m),x,z,y);}
  function tray(parent,x,z,y,w=64,d=40){slab(parent,x,z,y,w,d,2,palette.paper,3);const h=11;slab(parent,x,z-d/2+1.5,y+2,w,3,h,palette.paper,1);slab(parent,x,z+d/2-1.5,y+2,w,3,h,palette.paper,1);slab(parent,x-w/2+1.5,z,y+2,3,d-6,h,palette.paper,1);slab(parent,x+w/2-1.5,z,y+2,3,d-6,h,palette.paper,1);for(let i=0;i<6;i++)sphere(parent,x+(i%3-1)*18,z+(Math.floor(i/3)-.5)*16,y+5,6,palette.paper,[1,.65,1]);}
  function table(name,position,w,d){const station=new THREE.Group();station.name=name;group.add(station);const [x,z]=position;for(const xx of[x-w/2+12,x+w/2-12])for(const zz of[z-d/2+12,z+d/2-12]){cylinder(station,xx,zz,4,3.2,97,palette.metal);cylinder(station,xx,zz,0,5.3,5,palette.inset);torus(station,xx,zz,89,3.4,.65,palette.metal);}
    slab(station,x,z,26,w-24,d-24,3,palette.metal,2);
    for(const zz of[z-d/2+12,z+d/2-12])rod(station,[x-w/2+12,zz,84],[x+w/2-12,zz,84],2.2);
    for(const xx of[x-w/2+12,x+w/2-12])rod(station,[xx,z-d/2+12,84],[xx,z+d/2-12,84],2.2);
    slab(station,x,z,100,w,d,9,palette.stone,4);
    slab(station,x,z,109,w-22,d-22,3,palette.paper,5);
    // Two rails physically retain the removable shelf, with visible screw heads.
    for(const zz of[z-d/2+12,z+d/2-12])for(const xx of[x-w/2+12,x+w/2-12])sphere(station,xx,zz+3,84,1.4,palette.inset);
    return station;
  }
  function bowl(parent,x,z,y,r,fill=''){const pts=[[0,0],[r*.55,0],[r*.7,3],[r*.93,14],[r,20],[r-.8,22],[r-3,22],[r-3.8,18],[r*.68,5],[0,5]].map(([a,b])=>new THREE.Vector2(a,b));at(mesh(parent,new THREE.LatheGeometry(pts,40),palette.paper),x,z,y);torus(parent,x,z,y+21,r-1.5,1.5,palette.metal);if(fill==='sauce')cylinder(parent,x,z,y+14,r-5,1,palette.inset);if(fill==='cheese')for(let i=0;i<16;i++){const a=i*2.399,rr=Math.sqrt(i/16)*(r-7),o=box(parent,x+Math.cos(a)*rr,z+Math.sin(a)*rr,y+15+i%3*.6,9,2,1.2,palette.paper);o.rotation.y=a;}if(fill==='tomato')for(const [dx,dz]of[[-6,-4],[6,-3],[0,6]])tomato(parent,x+dx,z+dz,y+19,5.5,false);if(fill==='basil')for(let i=0;i<5;i++)leaf(parent,x-8+i*4,z+(i%2)*5,y+18,8,palette.paper,i*.6);}
  function tomato(parent,x,z,y,r,colored=true){sphere(parent,x,z,y,r,colored?palette.tomato:palette.paper,[1,.85,1]);for(let j=0;j<5;j++){const a=j/5*Math.PI*2;rod(parent,[x,z,y+r*.82],[x+Math.cos(a)*r*.65,z+Math.sin(a)*r*.65,y+r*.92],.5,colored?palette.basil:palette.inset);}}
  function leaf(parent,x,z,y,len,m=palette.basil,angle=0){const s=new THREE.Shape();s.moveTo(-len/2,0);s.bezierCurveTo(-len/4,len*.52,len/3,len*.48,len/2,0);s.bezierCurveTo(len/3,-len*.4,-len/4,-len*.45,-len/2,0);const g=new THREE.ExtrudeGeometry(s,{depth:.5,bevelEnabled:true,bevelSize:.2,bevelThickness:.2,bevelSegments:1,curveSegments:5});g.rotateX(-Math.PI/2);const o=at(mesh(parent,g,m),x,z,y);o.rotation.y=angle;return o;}

  const doughStation=table('01 · bancada de massa',STATIONS.dough,158,134);
  {const[x,z]=STATIONS.dough;tray(doughStation,x-15,z-5,29);tray(doughStation,x-15,z-5,42);cylinder(doughStation,x-47,z-43,112,14,27);torus(doughStation,x-47,z-43,140,14,1);cylinder(doughStation,x-47,z-43,140,15,2);sphere(doughStation,x-47,z-43,145,4,palette.metal,[1,.6,1]);for(let i=0;i<3;i++)sphere(doughStation,x-54,z+12+i*14,116,6,palette.paper,[1,.7,1]);slab(doughStation,x+33,z-41,112,30,19,1,palette.metal,2);rod(doughStation,[x+20,z-48,116],[x+46,z-48,116],2.5,palette.wood);}
  const toppingStation=table('02 · ingredientes',STATIONS.toppings,162,142);
  {const[x,z]=STATIONS.toppings;tray(toppingStation,x-10,z,29);bowl(toppingStation,x-51,z-42,112,19,'sauce');bowl(toppingStation,x-3,z-62,112,17,'cheese');bowl(toppingStation,x+48,z-40,112,18,'tomato');bowl(toppingStation,x+59,z+6,112,15,'basil');tomato(toppingStation,x-61,z+26,119,7,false);tomato(toppingStation,x-54,z+40,118,6,false);leaf(toppingStation,x-59,z+48,114,13,palette.paper);slab(toppingStation,x-48,z+54,112,34,11,1,palette.metal,2);rod(toppingStation,[x-62,z+57,115],[x-49,z+57,115],2,palette.wood);}
  const servingStation=table('04 · saída',STATIONS.serving,144,124);
  {const[x,z]=STATIONS.serving;tray(servingStation,x-10,z,29);cylinder(servingStation,x+47,z-37,112,10,25);for(let i=0;i<3;i++){rod(servingStation,[x+43+i*4,z-37,133],[x+43+i*4,z-37,157],.8,palette.metal);for(let j=0;j<3;j++)rod(servingStation,[x+42+i*4+j*.8,z-37,157],[x+42+i*4+j*.8,z-37,162],.3,palette.metal);}for(let i=0;i<3;i++)slab(servingStation,x-43,z-31,112+i*1.6,22,24,1.4,palette.cloth,1);}

  // Hollow brick oven: the mouth is a real opening, never a stencil or flat black box.
  const oven=new THREE.Group();oven.name='03 · forno a lenha';group.add(oven);
  slab(oven,145,-103,0,230,229,9,palette.stone,3);
  box(oven,47,-103,9,34,229,93,palette.stone);box(oven,243,-103,9,34,229,93,palette.stone);box(oven,145,-205,9,164,24,93,palette.stone);
  slab(oven,145,-103,102,250,247,10,palette.stone,5);
  cylinder(oven,145,-103,112,105,3,palette.stone);cylinder(oven,145,-103,115.05,94,.15,palette.inner);
  // Log cradle and cut rings occupy the open base niche.
  for(let row=0;row<2;row++)for(let i=0;i<4;i++){const x=87+i*36,z=-38+(row%2)*-9,y=23+row*24;const o=at(mesh(oven,new THREE.CylinderGeometry(10.5,11.5,92,16),palette.wood),x,z,y);o.rotation.x=Math.PI/2;for(const end of[-46,46])for(const r of[4,7.5]){const ring=mesh(oven,new THREE.TorusGeometry(r,.35,4,24),palette.inset,false);ring.position.set(x,y,z+end);} }
  // A continuous rear dome meets a barrel vault at z=-103. The complete front face
  // is an extruded arch ring, so no sampled sphere triangles can seal its opening.
  function brickCell(points,mat){const vertices=[];for(const[a,b,c,d]of[[0,1,2,3],[7,6,5,4],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]])for(const i of[a,b,c,a,c,d])vertices.push(...points[i].toArray());const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();mesh(oven,g,mat,true);}
  const domeAt=(lat,az,r=103)=>new THREE.Vector3(145+r*Math.cos(lat)*Math.sin(az),115+r*1.095*Math.sin(lat),-103+r*Math.cos(lat)*Math.cos(az));
  for(let row=0;row<8;row++)for(let col=0;col<16;col++){const la=row/8*Math.PI/2,lb=(row+1)/8*Math.PI/2,aa=Math.PI/2+col/16*Math.PI,ab=Math.PI/2+(col+1)/16*Math.PI;brickCell([domeAt(la,aa),domeAt(la,ab),domeAt(lb,ab),domeAt(lb,aa),domeAt(la,aa,96),domeAt(la,ab,96),domeAt(lb,ab,96),domeAt(lb,aa,96)],row%3===0?palette.paper:palette.stone);}
  const vaultAt=(a,z,inner=false)=>new THREE.Vector3(145+(inner?96:103)*Math.cos(a),115+(inner?105:113)*Math.sin(a),z);
  for(let row=0;row<5;row++)for(let col=-1;col<18;col++){const shift=(row%2)*.5,a=Math.max(0,(col+shift)/18*Math.PI),b=Math.min(Math.PI,(col+1+shift)/18*Math.PI),back=-103+row*19,front=back+19;if(b<=a)continue;brickCell([vaultAt(a,back),vaultAt(b,back),vaultAt(b,front),vaultAt(a,front),vaultAt(a,back,true),vaultAt(b,back,true),vaultAt(b,front,true),vaultAt(a,front,true)],row%3===0?palette.paper:palette.stone);}
  // Individual voussoirs leave 122 units of clear entrance width.
  for(let i=0;i<13;i++){const a=i/13*Math.PI+.012,b=(i+1)/13*Math.PI-.012,s=new THREE.Shape();s.moveTo(Math.cos(a)*103,Math.sin(a)*113);s.lineTo(Math.cos(b)*103,Math.sin(b)*113);s.lineTo(Math.cos(b)*61,Math.sin(b)*69);s.lineTo(Math.cos(a)*61,Math.sin(a)*69);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:18,bevelEnabled:true,bevelThickness:.6,bevelSize:.6,bevelSegments:2});at(mesh(oven,g,palette.paper),145,-8,115);}
  slab(oven,145,7.5,108,162,31,7,palette.stone,3);
  cylinder(oven,145,-122,223,21,65,palette.stone);torus(oven,145,-122,227,23,2,palette.metal);cylinder(oven,145,-122,287,25,5,palette.metal);for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5])rod(oven,[145+Math.cos(a)*18,-122+Math.sin(a)*18,292],[145+Math.cos(a)*18,-122+Math.sin(a)*18,305],1.6);cylinder(oven,145,-122,305,28,4,palette.stone);
  const thermometer=at(mesh(oven,new THREE.CylinderGeometry(7,7,3,24),palette.metal),145,12,196);thermometer.rotation.x=Math.PI/2;const dial=at(mesh(oven,new THREE.CircleGeometry(5.4,24),palette.paper,false),145,13.6,196);rod(oven,[145,14,196],[148,14,199],.5,palette.inset);
  const rack=new THREE.Group();rack.name='Pás e escova';group.add(rack);slab(rack,312,-92,0,40,105,6,palette.metal,3);for(const z of[-132,-49])rod(rack,[312,z,6],[312,z,190],3);rod(rack,[312,-132,176],[312,-49,176],3);for(let i=0;i<3;i++){const z=-120+i*32;rod(rack,[317,z,54],[317,z,174],2,palette.wood);const bladeGeometry=new THREE.ExtrudeGeometry(roundedShape(22,31,7),{depth:1.3,bevelEnabled:true,bevelSize:.4,bevelThickness:.3,bevelSegments:2,curveSegments:6});const paddle=at(mesh(rack,bladeGeometry,palette.metal),317,z,38);if(i===2)for(let j=0;j<7;j++)rod(rack,[309+j*2,z,28],[309+j*2,z,20],.55,palette.inset);}

  // Bake stationary parts by material: hundreds of crafted pieces cost a handful of draws.
  group.updateMatrixWorld(true);
  const batches=new Map(),staticNodes=[];
  group.traverse(node=>{if(!node.isMesh&&!node.isLineSegments)return;const key=node.isLineSegments?'contours':node.material.uuid;if(!batches.has(key))batches.set(key,{material:node.material,lines:node.isLineSegments,parts:[]});let copy=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();copy.applyMatrix4(node.matrixWorld);for(const name of Object.keys(copy.attributes))if(name!=='position'&&name!=='normal')copy.deleteAttribute(name);if(node.isLineSegments)copy.deleteAttribute('normal');batches.get(key).parts.push(copy);staticNodes.push(node);});
  for(const node of staticNodes)node.removeFromParent();
  for(const batch of batches.values()){const merged=geo(mergeGeometries(batch.parts,false));for(const part of batch.parts)part.dispose();const object=batch.lines?new THREE.LineSegments(merged,batch.material):new THREE.Mesh(merged,batch.material);object.castShadow=!batch.lines;object.receiveShadow=!batch.lines;object.name=batch.lines?'Traços da cozinha':'Estrutura estática';group.add(object);}

  const fireMat=material('#ef7429',{emissive:'#e35e1a',emissiveIntensity:1.25,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false});
  const coreMat=material('#ffd892',{emissive:'#ffbe63',emissiveIntensity:1.1,side:THREE.DoubleSide,transparent:true,opacity:.82,depthWrite:false});
  const flameShape=new THREE.Shape();flameShape.moveTo(-9,0);flameShape.bezierCurveTo(-17,13,-3,18,1,35);flameShape.bezierCurveTo(7,21,5,17,9,24);flameShape.bezierCurveTo(17,11,13,3,9,0);flameShape.closePath();
  const flames=[];for(let i=0;i<7;i++){const f=new THREE.Group();oven.add(f);at(f,i<4?95:195,-22-(i%4)*23,116);f.scale.x=.62;f.scale.z=.62;for(let j=0;j<2;j++){const m=mesh(f,new THREE.ShapeGeometry(flameShape,10),fireMat,false);m.rotation.y=j*Math.PI/2;}const core=mesh(f,new THREE.ShapeGeometry(flameShape,10),coreMat,false);core.scale.set(.5,.6,.5);core.position.z=.5;flames.push(f);}
  const fireLight=new THREE.PointLight('#ff9e45',1.5,135,2);fireLight.position.set(145,141,-65);oven.add(fireLight);

  // The sole colored subject moves as one rigid assembly, supported by a separate peel.
  const moving=new THREE.Group();moving.name='Pizza · parcours';group.add(moving);
  const pizza=new THREE.Group();moving.add(pizza);
  cylinder(pizza,0,0,0,36.4,4.5,palette.dough);const crust=torus(pizza,0,0,5,33.2,3.8,palette.crust);crust.scale.y=.85;
  const sauce=cylinder(pizza,0,0,4.7,29.7,.6,palette.sauce);sauce.name='Molho';
  const cheese=[];for(let i=0;i<28;i++){const a=i*2.399,r=5+Math.sqrt(i/28)*23,x=Math.cos(a)*r,z=Math.sin(a)*r;const o=slab(pizza,x,z,5.4,8,2.8,.8,palette.cheese,.8);o.rotation.y=a;cheese.push({object:o,y:5.4});}
  const slices=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2,x=Math.cos(a)*21,z=Math.sin(a)*21,part=new THREE.Group();pizza.add(part);at(part,x,z,6.4);cylinder(part,0,0,0,6,1.3,palette.tomato);torus(part,0,0,1.25,4.7,.45,palette.tomato);for(let j=0;j<5;j++){const aa=j/5*Math.PI*2;sphere(part,Math.cos(aa)*3,Math.sin(aa)*3,1.4,.65,palette.seed,[.65,.35,1]);}slices.push(part);}
  const basil=new THREE.Group();pizza.add(basil);leaf(basil,-6,0,8.5,16,palette.basil,.3);leaf(basil,15,10,8.5,12,palette.basil,1.2);leaf(basil,-17,-10,8.5,11,palette.basil,-.6);
  const baked=new THREE.Group();pizza.add(baked);for(let i=0;i<19;i++){const a=i/19*Math.PI*2;sphere(baked,Math.cos(a)*33.2,Math.sin(a)*33.2,8,1.25,palette.toast,[1,.18,.7]);}
  const peel=new THREE.Group();moving.add(peel);slab(peel,0,0,-2.4,86,88,1.5,palette.metal,17);rod(peel,[0,41,-1],[0,148,-1],2.3,palette.wood);torus(peel,0,149,-1,3,.6,palette.metal);
  const roller=new THREE.Group();group.add(roller);rod(roller,[-43,0,11],[43,0,11],9,palette.wood);rod(roller,[-62,0,11],[-43,0,11],3.5,palette.wood);rod(roller,[43,0,11],[62,0,11],3.5,palette.wood);
  const ladle=new THREE.Group();group.add(ladle);const bowlShape=new THREE.SphereGeometry(10,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2);const scoop=mesh(ladle,bowlShape,palette.metal);scoop.scale.y=.4;rod(ladle,[6,0,0],[30,0,40],1.5,palette.metal);
  const hand=new THREE.Group();group.add(hand);sphere(hand,0,0,0,9,palette.paper,[1.1,.45,.7]);for(let i=0;i<4;i++)rod(hand,[-8+i*5,0,-1],[-8+i*5,11,0],1.8,palette.paper);

  const subjectEdge=palette.edge.clone();materials.add(subjectEdge);subjectEdge.toneMapped=false;
  moving.traverse(node=>{if(node.isLineSegments)node.material=subjectEdge;});
  const subjectMaterials=['dough','crust','sauce','cheese','tomato','seed','basil','toast'].map(key=>palette[key]);
  for(const m of subjectMaterials)m.transparent=true;
  const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
  const range=(t,a,b)=>smooth((t-a)/(b-a));
  const envelope=(t,a,b,c,d)=>range(t,a,b)*(1-range(t,c,d));
  const rawDough=new THREE.Color('#ead1a4'),bakedDough=new THREE.Color('#cf9852'),rawCrust=new THREE.Color('#e0bb7e'),bakedCrust=new THREE.Color('#bb7b3c');
  function update(frame){const t=frame.t;at(moving,frame.world[0],frame.world[1],frame.world[2]);moving.visible=frame.opacity>.01;moving.scale.setScalar(1);for(const m of subjectMaterials)m.opacity=frame.opacity;palette.toast.opacity=frame.opacity*frame.baked;subjectEdge.opacity=palette.edge.opacity*frame.opacity;pizza.scale.set(frame.dough,1,frame.dough);sauce.scale.set(frame.sauce,1,frame.sauce);sauce.visible=frame.sauce>.01;peel.visible=frame.peel>.05;peel.position.z=-(1-frame.peel)*28;
    cheese.forEach(({object,y},i)=>{const p=range(t,16+i*.08,16.7+i*.08);object.visible=p>.01;object.position.y=y+28*(1-p);});slices.forEach((o,i)=>{const p=range(t,19+i*.25,19.8+i*.25);o.visible=p>.01;o.position.y=6.4+32*(1-p);});basil.visible=t>=21.8;basil.scale.setScalar(range(t,21.8,23));baked.visible=frame.baked>.05;palette.dough.color.copy(rawDough).lerp(bakedDough,frame.baked);palette.crust.color.copy(rawCrust).lerp(bakedCrust,frame.baked);
    roller.visible=frame.roller>.02;at(roller,STATIONS.dough[0],STATIONS.dough[1]+Math.sin((t-1)*2.3)*20,STATIONS.dough[2]+2);roller.rotation.x=Math.sin(t*2.3)*.5;
    ladle.visible=frame.ladle>.02;at(ladle,STATIONS.toppings[0]+Math.cos((t-9)*2.3)*24*frame.sauce,STATIONS.toppings[1]+Math.sin((t-9)*2.3)*24*frame.sauce,122);hand.visible=envelope(t,15.7,16.3,22.5,23.4)>.02;at(hand,STATIONS.toppings[0]+Math.sin(t*1.5)*22,STATIONS.toppings[1],147);
    flames.forEach((f,i)=>{f.scale.y=1.3+.13*Math.sin(t*Math.PI*56/48+i*1.7)+.06*Math.sin(t*Math.PI*82/48+i);f.rotation.y=Math.sin(t*2+i)*.08;});fireLight.intensity=1.5+.15*Math.sin(t*2.4);
  }
  function setTheme(dark){const colors=dark?{paper:'#47433d',metal:'#77736d',stone:'#3b3833',wood:'#555047',inset:'#24211d',inner:'#171512',cloth:'#504b44'}:{paper:'#f2eee6',metal:'#d4d1cb',stone:'#e8e4dd',wood:'#c5c0b5',inset:'#77736c',inner:'#3a3630',cloth:'#e5e1da'};for(const[k,c]of Object.entries(colors))palette[k].color.set(c);palette.edge.color.set(dark?'#ffffff':'#000000');palette.edge.opacity=dark?.88:.72;subjectEdge.color.copy(palette.edge.color);subjectEdge.opacity=palette.edge.opacity;}
  function dispose(){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();group.clear();}
  return {group,update,setTheme,dispose,stations:STATIONS};
}
