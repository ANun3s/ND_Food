import * as THREE from 'three';
import { createPizzaKitchenModel } from './PizzaKitchenModel.js';

/** Orthographic, real-depth rendering; the SVG remains available without WebGL. */
export function createPizzaKitchenScene(stage, initialFrame) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch { return null; }
  const canvas = renderer.domElement;
  canvas.className = 'pk-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Maquete 3D de uma pizzaria: massa, montagem, forno a lenha e saída, em quatro estações separadas.');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  let model;
  try {model=createPizzaKitchenModel(THREE);} catch {renderer.dispose();return null;}
  scene.add(model.group);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(-350, 850, 500);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, .4);
  fill.position.set(500, 300, -500);
  scene.add(fill);
  const camera = new THREE.OrthographicCamera(-500, 500, 500, -500, 1, 5000);
  let frame = initialFrame, disposed = false, lost = false;
  model.update(frame);
  const bounds = new THREE.Box3().setFromObject(model.group);
  const center = bounds.getCenter(new THREE.Vector3());
  camera.position.copy(center).add(new THREE.Vector3(1000, 950, 1000));
  camera.lookAt(center);
  camera.updateMatrixWorld(true);
  // Fit actual vertices: merged material batches can span several distant stations.
  // Their box corners would add large areas of empty space to the camera frame.
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  const vertex=new THREE.Vector3(), matrix=new THREE.Matrix4();
  model.group.updateMatrixWorld(true);
  model.group.traverse(object => {
    const positions=object.geometry?.attributes.position;
    if(!positions)return;
    matrix.multiplyMatrices(camera.matrixWorldInverse,object.matrixWorld);
    for(let i=0;i<positions.count;i++){
      vertex.fromBufferAttribute(positions,i).applyMatrix4(matrix);
      minX=Math.min(minX,vertex.x);maxX=Math.max(maxX,vertex.x);
      minY=Math.min(minY,vertex.y);maxY=Math.max(maxY,vertex.y);
    }
  });
  function render() { if (!disposed && !lost && stage.isConnected) renderer.render(scene, camera); }
  function resize() {
    const width=stage.clientWidth, height=stage.clientHeight;
    if (!width || !height) return;
    const aspect=width/height;
    let w=maxX-minX+45, h=maxY-minY+45;
    if(w/h<aspect)w=h*aspect;else h=w/aspect;
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    camera.left=cx-w/2;camera.right=cx+w/2;camera.top=cy+h/2;camera.bottom=cy-h/2;
    camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
    render();
  }
  function theme() { model.setTheme(document.documentElement.dataset.theme === 'dark'); render(); }
  stage.append(canvas);
  const observer=new ResizeObserver(resize);observer.observe(stage);
  const themes=new MutationObserver(theme);themes.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  function onLost(event) { event.preventDefault();lost=true;stage.classList.remove('has-3d'); }
  function onRestored() {lost=false;resize();stage.classList.add('has-3d');}
  canvas.addEventListener('webglcontextlost',onLost);
  canvas.addEventListener('webglcontextrestored',onRestored);
  theme();resize();stage.classList.add('has-3d');
  return {
    update(next) {frame=next;model.update(frame);render();},
    dispose() {
      disposed=true;observer.disconnect();themes.disconnect();
      canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);
      model.dispose();renderer.dispose();canvas.remove();stage.classList.remove('has-3d');
    }
  };
}
