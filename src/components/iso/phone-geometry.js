import { iso, slabOf } from './iso-kit.mjs';

// Front orthographic view: the display axes stay horizontal and vertical.
export const projection = { origin: [220, 350], scale: 1.45, azimuth: 90, elevation: 90 };
export const rotation = 'rotate(0 220 350)';
export const project = (point) => iso(point, projection);
export const plane = (x, y, z, sx = 1, sy = 1) => {
  const p = project([x, y, z]);
  const u = project([x + sx, y, z]);
  const v = project([x, y + sy, z]);
  return [u[0] - p[0], u[1] - p[1], v[0] - p[0], v[1] - p[1], ...p];
};
const slab = (id, x, y, w, d, r, z, h, tone) => ({ id, tone, paths: slabOf({ x, y, w, d, r }, z, h, projection, 20, .55) });
export const body = [
  slab('back', -83, -175, 166, 350, 24, 0, 2, 'dark'),
  slab('bottom-seal', -83.3, -175.3, 166.6, 350.6, 24, 2, .7, 'black'),
  slab('chassis', -84, -176, 168, 352, 25, 2.7, 12, 'metal'),
  slab('polished-edge', -83.8, -175.8, 167.6, 351.6, 25, 14.7, 1, 'bright'),
  slab('display-seat', -81.8, -173.8, 163.6, 347.6, 24, 15.7, 1, 'dark'),
  slab('display-gasket', -79, -171, 158, 342, 23, 16.7, .5, 'black'),
];
export const controls = [
  ...[-108, -65, -20].map((y, i) => slab(`left-button-${i}`, -86, y, 2, i ? 30 : 18, .8, 5, 6, 'metal')),
  slab('power-button', 84, -87, 2, 43, .8, 5, 6, 'metal'),
  ...[-133, 128].flatMap((y, i) => [-84.2, 82.2].map((x, j) => slab(`antenna-${i}-${j}`, x, y, 2, 2, .2, 2.7, 12, 'dark'))),
];
export const glass = [
  slab('glass-edge', -81, -173, 162, 346, 24, 17.2, 1.3, 'bright'),
  slab('glass', -80.5, -172.5, 161, 345, 24, 18.5, .7, 'black'),
];
export const screenMatrix = plane(-76, -168, 19.3, 152 / 393, 336 / 852);
