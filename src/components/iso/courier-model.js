import * as k from './iso-kit.mjs';

// A small solid model in the same world coordinates as the delivery street.
// All surfaces are projected once; only placement and wheel spokes move at runtime.
export function courierModel(projection) {
  const faces=[];
  // Warm, softened materials share the clay, wood and sage tones of the street scene.
  const palette={red:'#b95245',darkRed:'#884138',jacket:'#bd705b',jacketShade:'#975544',rubber:'#302d29',metal:'#887d6e',chrome:'#b6a891',engine:'#5c544a',fabric:'#49423a',boot:'#302b27',helmet:'#dfd0b7',visor:'#657e77',skin:'#c99065',light:'#ffe2a2'};
  const add=(a,b)=>a.map((n,i)=>n+b[i]);
  const sub=(a,b)=>a.map((n,i)=>n-b[i]);
  const mul=(a,n)=>a.map(v=>v*n);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>mul(a,1/(Math.hypot(...a)||1));
  const center=points=>points.reduce((a,p)=>add(a,mul(p,1/points.length)),[0,0,0]);
  const light=unit([-0.4,-0.6,1]);
  const azimuth=projection.azimuth*Math.PI/180,elevation=projection.elevation*Math.PI/180;
  const viewer=[Math.cos(azimuth)*Math.cos(elevation),Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation)];
  const shade=(material,normal)=>{
    const rgb=(palette[material]||material).slice(1).match(/../g).map(n=>parseInt(n,16));
    const n=unit(normal),amount=.84+.16*Math.max(0,n.reduce((a,v,i)=>a+v*light[i],0));
    return `rgb(${rgb.map(v=>Math.round(v*amount)).join(',')})`;
  };
  const polygon=(points,material,normal)=>{
    const n=normal||cross(sub(points[1],points[0]),sub(points[2],points[0]));
    if(n.reduce((sum,v,i)=>sum+v*viewer[i],0)<=0)return;
    faces.push({depth:k.depthOf(center(points),projection),markup:`<path d="${k.pathOf(points.map(p=>k.iso(p,projection)),true)}" fill="${shade(material,n)}" stroke="${shade(material,n)}" stroke-width=".16" stroke-linejoin="round"/>`});
  };
  const detail=(points,color,width=0.55)=>faces.push({depth:k.depthOf(center(points),projection)+.06,markup:`<path d="${k.pathOf(points.map(p=>k.iso(p,projection)))}" fill="none" stroke="${palette[color]||color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`});
  const ellipsoid=(c,r,material,rows=10,cols=20,lat0=-Math.PI/2,lat1=Math.PI/2,lon0=0,lon1=2*Math.PI)=>{
    const point=(a,b)=>add(c,[r[0]*Math.cos(a)*Math.cos(b),r[1]*Math.cos(a)*Math.sin(b),r[2]*Math.sin(a)]);
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
      const a=lat0+(lat1-lat0)*i/rows,b=lat0+(lat1-lat0)*(i+1)/rows;
      const u=lon0+(lon1-lon0)*j/cols,v=lon0+(lon1-lon0)*(j+1)/cols;
      const points=[point(a,u),point(a,v),point(b,v),point(b,u)];
      polygon(points,material,sub(center(points),c).map((v,i)=>v/(r[i]*r[i])));
    }
  };
  const tube=(a,b,r0,r1,material,steps=14)=>{
    const axis=unit(sub(b,a));
    const u=unit(cross(axis,Math.abs(axis[2])>.9?[0,1,0]:[0,0,1]));
    const v=cross(axis,u);
    const ring=(c,r)=>Array.from({length:steps},(_,i)=>add(c,add(mul(u,Math.cos(i*2*Math.PI/steps)*r),mul(v,Math.sin(i*2*Math.PI/steps)*r))));
    const back=ring(a,r0),front=ring(b,r1);
    polygon(back,material,mul(axis,-1));polygon(front,material,axis);
    for(let i=0;i<steps;i++){
      const j=(i+1)%steps;
      polygon([back[i],back[j],front[j],front[i]],material,sub(mul(add(back[i],back[j]),.5),a));
    }
  };
  const roundedBox=(x,y,z,w,d,h,r,material)=>{
    const ring=k.roundedPlan({x,y,w,d,r},5);
    polygon(ring.map(([x,y])=>[x,y,z+h]),material,[0,0,1]);
    for(let i=0;i<ring.length;i++){
      const a=ring[i],b=ring[(i+1)%ring.length];
      polygon([[...a,z],[...b,z],[...b,z+h],[...a,z+h]],material,[b[1]-a[1],a[0]-b[0],0]);
    }
  };
  const disc=(x,y,z,r,material)=>tube([x,y-.35,z],[x,y+.35,z],r,r,material,28);
  const mudguard=(wx)=>{
    for(let i=0;i<18;i++){
      const a=.18+i*(Math.PI-.36)/18,b=.18+(i+1)*(Math.PI-.36)/18;
      const p=(t,y,r)=>[wx+Math.cos(t)*r,y,8.5+Math.sin(t)*r];
      polygon([p(a,-3,9.8),p(b,-3,9.8),p(b,3,9.8),p(a,3,9.8)],'red',[Math.cos(a),0,Math.sin(a)]);
      polygon([p(a,3,9.4),p(b,3,9.4),p(b,3,9.8),p(a,3,9.8)],'darkRed',[0,1,0]);
    }
  };
  // Tires have a rounded tread profile, separate sidewalls, rims and brake hubs.
  for(const wx of [-14,14]){
    const torus=(a,b)=>[wx+(6.65+1.85*Math.cos(b))*Math.cos(a),2.4*Math.sin(b),8.5+(6.65+1.85*Math.cos(b))*Math.sin(a)];
    for(let i=0;i<32;i++)for(let j=0;j<10;j++){
      const a=i*2*Math.PI/32,b=(i+1)*2*Math.PI/32,u=j*Math.PI/5,v=(j+1)*Math.PI/5;
      polygon([torus(a,u),torus(b,u),torus(b,v),torus(a,v)],'rubber',[Math.cos((a+b)/2)*Math.cos((u+v)/2),Math.sin((u+v)/2),Math.sin((a+b)/2)*Math.cos((u+v)/2)]);
    }
    disc(wx,1.5,8.5,6.1,'engine');disc(wx,2,8.5,5.55,'metal');disc(wx,2.5,8.5,4.85,'rubber');
    faces.push({depth:k.depthOf([wx,3,8.5],projection),markup:`<path data-wheel-spokes="${wx}" data-wheel-y="3" class="dj-spokes"/>`});
    disc(wx,3.3,8.5,2.4,'metal');disc(wx,3.75,8.5,1.2,'chrome');
    for(let n=0;n<8;n++){
      const a=n*Math.PI/4;
      disc(wx+Math.cos(a)*1.8,3.7,8.5+Math.sin(a)*1.8,.22,'engine');
    }
    for(let n=0;n<14;n++){
      const a=n*Math.PI/7;
      detail([[wx+Math.cos(a)*8.35,-.8,8.5+Math.sin(a)*8.35],[wx+Math.cos(a+.045)*8.35,.8,8.5+Math.sin(a+.045)*8.35]],'#465055',.35);
    }
    mudguard(wx);
  }
  // Chassis, drive assembly, engine cooling fins and exhaust heat shield.
  for(const y of [-2.6,2.6]){
    tube([-14,y,8.5],[-5,y,21],.8,.8,'engine');
    tube([-14,y,8.5],[3,y,10],.85,.85,'metal');
    tube([-5,y,21],[3,y,10],.9,.9,'engine');
    tube([-5,y,21],[10,y,23],1,1,'engine');
    tube([10,y,23],[14,y,8.5],.7,.7,'chrome');
    tube([11.8,y,17],[14,y,8.5],1.1,1.1,'metal');
    tube([-12,y,10],[-10,y,20],.8,.8,'chrome');
    for(let n=0;n<6;n++)disc(-12+n*.32,y+.3,11+n*1.45,1.1,'engine');
  }
  roundedBox(-5,-3.5,8,11,7,7,1.5,'engine');
  for(let z=9;z<=15;z+=1.4)roundedBox(-5.5,-4,z,12,8,.55,.6,'metal');
  disc(2,4.4,10,3.2,'engine');disc(2,4.9,10,1.1,'chrome');
  tube([5,4,7],[-14,4,5.5],1.1,1.6,'engine');
  tube([-11,4,6],[-2,4,6.5],1.8,1.8,'metal');
  roundedBox(-14,-4.6,20.6,15,9.2,3.5,2,'boot');
  ellipsoid([4,0,21],[7,4.7,4.3],'red',8,18);
  tube([13,-6,27],[13,6,27],.7,.7,'chrome');
  for(const y of [-5.8,5.8]){
    tube([12,y,27],[16,y,27],.85,.85,'rubber');
    tube([13,y,27],[15,y*1.35,33],.35,.35,'chrome');
    ellipsoid([15,y*1.35,33.5],[2.4,1,1.8],'engine',6,12);
    ellipsoid([15.3,y*1.35+.6,33.5],[1.8,.3,1.2],'visor',5,10);
  }
  ellipsoid([15,0,24],[2.5,3.1,2.8],'engine',8,14);
  ellipsoid([17.1,0,24],[.7,2.5,2.2],'light',8,14);
  for(const y of [-4,4])ellipsoid([15,y,22],[1.3,.8,.75],'#dc9a42',5,10);
  roundedBox(-21,-5,18,9,10,1.4,1,'metal');
  roundedBox(-25,-7,20,13,14,15,1.8,'red');
  roundedBox(-26,-8,34,15,16,2,1.8,'darkRed');
  roundedBox(-24,-6,36,11,12,.6,1,'red');
  for(const x of [-23,-14]){
    roundedBox(x,7.05,21,1,0.45,12,.15,'boot');
    detail([[x,-6,36.7],[x,6,36.7]],'#e79c7e',.5);
  }
  roundedBox(-20,7.1,29,3,1,3,.4,'chrome');
  detail([[-22,7.6,23],[-22,7.6,27],[-19,7.6,23],[-19,7.6,27]],'#f3dfbd',.75);
  detail([[-17.8,7.6,23],[-17.8,7.6,27],[-15.7,7.6,26],[-15.7,7.6,24],[-17.8,7.6,23]],'#f3dfbd',.75);
  for(const face of faces.slice(-2))face.depth=k.depthOf([-18.5,7.6,28],projection)+.2;
  // Seated body, articulated limbs and riding posture, all with real volume.
  ellipsoid([-6,0,25],[5.3,4.6,3.2],'fabric',8,16);
  for(const side of [-1,1]){
    const y=side*4.4;
    tube([-6,y,25],[3,y*1.2,18],2.7,2.4,'fabric');
    ellipsoid([3,y*1.2,18],[2.8,2.5,2.7],'fabric',6,12);
    tube([3,y*1.2,18],[-1,y*1.35,11],2.2,1.5,'fabric');
    ellipsoid([1,y*1.35,9.8],[4,2,1.8],'boot',6,14);
    tube([-1,y*1.35,11],[-1,y*1.35,13],1.8,1.6,'boot');
    tube([-1,y*1.3,8.6],[2,y*1.3,8.6],.6,.6,'chrome');
  }
  ellipsoid([-4,0,32],[5.4,5.1,8.5],'jacket',10,18);
  ellipsoid([-.5,0,36],[4.8,5.8,4],'jacket',8,18);
  tube([-3,0,39],[2,0,42],2.2,2.1,'boot');
  for(const side of [-1,1]){
    const shoulder=[0,side*4.5,36],elbow=[6.5,side*5.6,30.5],hand=[13.5,side*5.8,27];
    ellipsoid(shoulder,[2.8,2.6,3],'jacketShade',6,12);
    tube(shoulder,elbow,2.5,2.1,'jacket');
    ellipsoid(elbow,[2.15,2.15,2.15],'jacket',6,12);
    tube(elbow,hand,2,1.3,'jacket');
    ellipsoid(hand,[2,1.5,1.5],'boot',6,12);
  }
  // Reflective piping and jacket seams follow the near surface.
  detail([[-7,3.3,37],[-6,4.65,34],[-5,5.1,31],[-4.5,4.8,28]],'#d9a28a',.45);
  detail([[-7.8,3.8,31],[-6,4.8,31],[-3.8,5.2,31],[-1.5,4.5,31]],'#e1bc89',.85);
  detail([[2.5,5.9,34],[4.3,6.3,32.5]],'#e1bc89',.85);
  // Full-face helmet with a curved visor, chin guard, gasket and side pivot.
  // The visor occupies an opening in the shell, avoiding overlapping surfaces.
  ellipsoid([3,0,45],[6.3,5.7,6.8],'helmet',6,18,-Math.PI/2,-.23);
  ellipsoid([3,0,45],[6.3,5.7,6.8],'helmet',7,18,.43,Math.PI/2);
  ellipsoid([3,0,45],[6.3,5.7,6.8],'helmet',5,12,-.23,.43,1.8,Math.PI*2-1.8);
  ellipsoid([3,0,45],[6.4,5.83,6.9],'boot',1,24,-.23,-.16,-1.8,1.8);
  ellipsoid([3,0,45],[6.4,5.83,6.9],'boot',1,24,.35,.43,-1.8,1.8);
  ellipsoid([3,0,45],[6.4,5.83,6.9],'boot',5,1,-.16,.35,-1.8,-1.7);
  ellipsoid([3,0,45],[6.4,5.83,6.9],'boot',5,1,-.16,.35,1.7,1.8);
  ellipsoid([3,0,45],[6.5,5.95,6.93],'visor',5,18,-.16,.35,-1.7,1.7);
  ellipsoid([3,0,45],[6.54,5.99,6.96],'#aab8a8',2,6,.21,.30,.45,1.15);
  ellipsoid([6,0,41.5],[3.2,4.1,1.9],'helmet',6,16);
  disc(3,5.85,44.5,.75,'metal');disc(3,6.25,44.5,.25,'engine');
  detail([[7.8,2.3,41],[7.3,3.1,40.8],[6.5,3.8,40.7]],'#62584d',.6);
  detail([[0,3.6,50],[2,4,50.1],[4,3.8,50.2]],'#b95245',.85);
  return `<g class="dj-courier-model">${faces.sort((a,b)=>a.depth-b.depth).map(face=>face.markup).join('')}</g>`;
}
