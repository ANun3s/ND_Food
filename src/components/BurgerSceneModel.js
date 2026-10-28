import * as THREE from 'three';

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const smoothstep = (value) => value * value * (3 - 2 * value);
const TAU = Math.PI * 2;
const golden = 2.3999632297;
const grain = (x, y, z) => (
  Math.sin(x * 39 + Math.sin(z * 21)) * Math.sin(y * 47 + z * 27)
  + Math.sin(x * 83 + z * 61) * Math.cos(y * 71 - x * 29) * 0.35
) / 1.35;

function material(color, roughness = 0.76, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, ...extra });
}

function addMesh(parent, geometry, mat, options = {}) {
  const mesh = new THREE.Mesh(geometry, mat);
  if (options.position) mesh.position.set(...options.position);
  if (options.scale) mesh.scale.set(...options.scale);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  parent.add(mesh);
  return mesh;
}

// All detail is generated once, with repeatable samples and no image downloads.
function microRelief() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      const value = 108 + Math.floor((n - Math.floor(n)) * 70);
      const at = (y * size + x) * 4;
      data[at] = data[at + 1] = data[at + 2] = value;
      data[at + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function colorSurface(geometry, sample) {
  const p = geometry.attributes.position;
  const colors = [];
  for (let i = 0; i < p.count; i += 1) {
    const color = sample(p.getX(i), p.getY(i), p.getZ(i));
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function instances(parent, geometry, mat, count, place) {
  const mesh = new THREE.InstancedMesh(geometry, mat, count);
  const pose = new THREE.Object3D();
  for (let i = 0; i < count; i += 1) {
    pose.position.set(0, 0, 0);
    pose.rotation.set(0, 0, 0);
    pose.scale.set(1, 1, 1);
    const color = place(pose, i);
    pose.updateMatrix();
    mesh.setMatrixAt(i, pose.matrix);
    if (color) mesh.setColorAt(i, new THREE.Color(color));
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  parent.add(mesh);
  return mesh;
}

function bunHeight(x, z) {
  return 0.145 + 0.74 * Math.sqrt(Math.max(0, 1 - (x / 1.07) ** 2 - (z / 0.89) ** 2));
}

function addBunSeeds(parent, mat) {
  const up = new THREE.Vector3(0, 1, 0);
  const normal = new THREE.Vector3();
  instances(parent, new THREE.SphereGeometry(1, 12, 8), mat, 68, (pose, i) => {
    const angle = i * golden + Math.sin(i * 3.1) * 0.14;
    const radius = Math.sqrt((i + 0.6) / 70) * 0.94;
    const x = Math.cos(angle) * radius * 1.07;
    const z = Math.sin(angle) * radius * 0.89;
    const y = bunHeight(x, z);
    normal.set(x / 1.07 ** 2, (y - 0.145) / 0.74 ** 2, z / 0.89 ** 2).normalize();
    pose.position.set(x, y, z).addScaledVector(normal, 0.012);
    pose.quaternion.setFromUnitVectors(up, normal);
    pose.rotateY(angle + Math.sin(i * 8.3));
    const size = 0.85 + (i % 5) * 0.075;
    pose.scale.set(0.044 * size, 0.014 * size, 0.022 * size);
    return i % 6 === 0 ? '#d6ac64' : i % 3 === 0 ? '#f1d394' : '#ffe4af';
  });
}

function pattyGeometry() {
  // Concentric cap rings prevent large radial triangles from turning the
  // mottled sear into a star pattern when vertex colors are interpolated.
  const positions = [], indices = [];
  const around = 112, rings = 24, stride = around + 1;
  for (let face = 0; face < 2; face += 1) {
    const offset = positions.length / 3;
    for (let j = 0; j <= rings; j += 1) {
      const r = j / rings * (face ? 1.065 : 1.035);
      for (let i = 0; i <= around; i += 1) {
        const a = i / around * TAU;
        positions.push(Math.cos(a) * r, face ? -0.145 : 0.145, Math.sin(a) * r);
      }
    }
    for (let j = 0; j < rings; j += 1) {
      for (let i = 0; i < around; i += 1) {
        const a = offset + j * stride + i, b = a + stride;
        if (!face) indices.push(a, a + 1, b, b, a + 1, b + 1);
        else indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const sideOffset = positions.length / 3;
  for (let j = 0; j <= 12; j += 1) {
    const t = j / 12, r = 1.065 - t * 0.03;
    for (let i = 0; i <= around; i += 1) {
      const a = i / around * TAU;
      positions.push(Math.cos(a) * r, -0.145 + t * 0.29, Math.sin(a) * r);
    }
  }
  for (let j = 0; j < 12; j += 1) {
    for (let i = 0; i < around; i += 1) {
      const a = sideOffset + j * stride + i, b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  // Surface UVs keep the grain continuous around the side.
  const uv = positions.flatMap((_, i) => i % 3 === 0 ? [positions[i] * 0.5 + 0.5, positions[i + 2] * 0.5 + 0.5] : []);
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x);
    const r = Math.hypot(x, z);
    const crust = Math.sin(a * 17 + 0.4) * 0.017 + Math.sin(a * 31) * 0.009;
    const rough = grain(x, y, z) * 0.008;
    const spread = 1 + (crust + rough) * Math.min(1, r);
    p.setXYZ(i, x * spread, y + rough + Math.sin(a * 7) * 0.006 * r, z * spread);
  }
  const dark = new THREE.Color('#29130b'), brown = new THREE.Color('#71351b');
  colorSurface(geometry, (x, y, z) => {
    const n = grain(x, y, z);
    const stripe = Math.pow(Math.max(0, Math.cos((x * 0.85 + z * 0.53) * 19)), 12);
    const top = smoothstep(clamp((y - 0.08) / 0.06));
    return dark.clone().lerp(brown, clamp(0.52 + n * 0.32 - stripe * top * 0.4));
  });
  geometry.computeVertexNormals();
  return geometry;
}

function addPatty(parent, mat, crustMat, offset) {
  addMesh(parent, pattyGeometry(), mat, { scale: [1.02, 1, 0.88] });
  instances(parent, new THREE.SphereGeometry(1, 9, 7), crustMat, 28, (pose, i) => {
    const a = i * TAU / 28 + offset;
    const r = 1.05 + Math.sin(a * 17 + 0.4) * 0.017 + Math.sin(a * 31) * 0.009;
    pose.position.set(Math.cos(a) * r * 1.02, Math.sin(i * 4.6) * 0.063, Math.sin(a) * r * 0.88);
    pose.rotation.y = -a;
    pose.scale.set(0.026, 0.025 + (i % 3) * 0.009, 0.055);
    return i % 4 === 0 ? '#784126' : i % 3 === 0 ? '#32180d' : '#4c2414';
  });
}

// A closed, subdivided sheet: corners slump beyond the meat, with a rounded lip.
function cheeseGeometry() {
  const positions = [], indices = [];
  const steps = 28, side = steps + 1, faceSize = side * side;
  for (let face = 0; face < 2; face += 1) {
    for (let j = 0; j <= steps; j += 1) {
      for (let i = 0; i <= steps; i += 1) {
        const u = i / steps * 2 - 1, v = j / steps * 2 - 1;
        const x = u * 0.9, z = v * 0.83;
        const rotatedX = x * Math.cos(0.18) + z * Math.sin(0.18);
        const rotatedZ = z * Math.cos(0.18) - x * Math.sin(0.18);
        const radius = Math.hypot(rotatedX / 1.02, rotatedZ / 0.88);
        const droop = smoothstep(clamp((radius - 1.065) / 0.32)) * 0.2;
        const edge = Math.max(Math.abs(u), Math.abs(v));
        const fold = Math.sin(u * 5 + v * 3) * 0.012 * edge ** 3;
        positions.push(x, 0.035 - droop + fold - face * 0.033, z);
      }
    }
  }
  for (let face = 0; face < 2; face += 1) {
    for (let j = 0; j < steps; j += 1) {
      for (let i = 0; i < steps; i += 1) {
        const a = face * faceSize + j * side + i, b = a + side;
        if (!face) indices.push(a, b, a + 1, b, b + 1, a + 1);
        else indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  const rim = [];
  for (let i = 0; i < steps; i += 1) rim.push(i);
  for (let j = 0; j < steps; j += 1) rim.push(j * side + steps);
  for (let i = steps; i > 0; i -= 1) rim.push(steps * side + i);
  for (let j = steps; j > 0; j -= 1) rim.push(j * side);
  rim.forEach((a, i) => {
    const b = rim[(i + 1) % rim.length];
    indices.push(a, b, a + faceSize, b, b + faceSize, a + faceSize);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// The same surface function places both the leaf mesh and every vein on it.
function leafPoint(t, angle, lift = 0) {
  const radius = t * (1.13 + Math.sin(angle * 5 + 0.5) * 0.055 + Math.sin(angle * 13) * 0.035);
  const y = Math.sin(angle * 9 + t * 7) * 0.034 * t ** 2
    + Math.sin(angle * 19 - t * 3) * 0.021 * t ** 5
    + Math.cos(angle * 4 + t * 5) * 0.018 * t;
  return new THREE.Vector3(Math.cos(angle) * radius, y + lift, Math.sin(angle) * radius * 0.92);
}

function lettuceGeometry() {
  const positions = [], indices = [], colors = [];
  const radial = 22, around = 144;
  const dark = new THREE.Color('#28601b'), light = new THREE.Color('#83b83b');
  for (let j = 0; j <= radial; j += 1) {
    const t = j / radial;
    for (let i = 0; i <= around; i += 1) {
      const a = i / around * TAU, p = leafPoint(t, a);
      positions.push(p.x, p.y, p.z);
      const c = dark.clone().lerp(light, clamp(0.2 + t * 0.4 + p.y * 3));
      colors.push(c.r, c.g, c.b);
    }
  }
  for (let j = 0; j < radial; j += 1) {
    for (let i = 0; i < around; i += 1) {
      const a = j * (around + 1) + i, b = a + around + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addVein(parent, mat, from, to, angle, branch = 0) {
  const points = Array.from({ length: 16 }, (_, i) => {
    const f = i / 15;
    return leafPoint(from + (to - from) * f, angle + branch * f, 0.004);
  });
  addMesh(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, branch ? 0.0025 : 0.004, 5, false), mat);
}

export function createBurger(scene) {
  const groups = [];
  const layer = (name, y, explodeIndex) => {
    const group = new THREE.Group();
    group.name = name;
    group.userData.homeY = y;
    group.userData.explodeIndex = explodeIndex;
    scene.add(group);
    groups.push(group);
    return group;
  };
  const relief = microRelief();
  const bread = material('#ffffff', 0.62, { vertexColors: true, bumpMap: relief, bumpScale: 0.009 });
  const crumb = material('#d5a061', 0.9, { bumpMap: relief, bumpScale: 0.018 });
  const crust = material('#ffffff', 0.83, { bumpMap: relief, bumpScale: 0.014 });
  const beef = material('#ffffff', 0.84, { vertexColors: true, bumpMap: relief, bumpScale: 0.022 });
  const cheddar = material('#ee9c0b', 0.43, { side: THREE.DoubleSide });
  const tomatoSkin = material('#a82213', 0.34);
  const tomatoFlesh = material('#e54b2c', 0.48, { bumpMap: relief, bumpScale: 0.004 });
  const gel = material('#b72e14', 0.27);
  const leaf = material('#ffffff', 0.64, { vertexColors: true, side: THREE.DoubleSide, bumpMap: relief, bumpScale: 0.005 });
  const vein = material('#78a63b', 0.72);
  const cream = material('#fff0bf', 0.65);

  const bottom = layer('pão inferior', 0, 0);
  const profile = new THREE.SplineCurve([
    new THREE.Vector2(0, 0.025), new THREE.Vector2(0.77, 0.025),
    new THREE.Vector2(0.98, 0.07), new THREE.Vector2(1.055, 0.19),
    new THREE.Vector2(1.04, 0.31), new THREE.Vector2(0.98, 0.4),
  ]).getPoints(40);
  const lower = new THREE.LatheGeometry(profile, 96);
  const toast = new THREE.Color('#9d4214'), honey = new THREE.Color('#d79135');
  colorSurface(lower, (x, y, z) => toast.clone().lerp(honey, clamp(0.35 + y * 0.8 + grain(x, y, z) * 0.14)));
  addMesh(bottom, lower, bread, { scale: [1.02, 1, 0.88] });
  addMesh(bottom, new THREE.CylinderGeometry(0.98, 0.98, 0.026, 96), crumb, { position: [0, 0.39, 0], scale: [1.02, 1, 0.88] });

  const patty = layer('carne grelhada', 0.565, 1);
  addPatty(patty, beef, crust, 0);
  const upperPatty = layer('carne grelhada superior', 0.87, 2);
  addPatty(upperPatty, beef, crust, 0.13);

  const cheese = layer('queijo cheddar', 1.045, 3);
  addMesh(cheese, cheeseGeometry(), cheddar, { rotation: [0, 0.18, 0] });

  const tomato = layer('tomate', 1.14, 4);
  addMesh(tomato, new THREE.CylinderGeometry(0.91, 0.91, 0.12, 96), tomatoSkin, { scale: [1.02, 1, 0.87] });
  addMesh(tomato, new THREE.CylinderGeometry(0.855, 0.855, 0.012, 96), tomatoFlesh, { position: [0, 0.062, 0], scale: [1.02, 1, 0.87] });
  addMesh(tomato, new THREE.SphereGeometry(1, 24, 12), material('#f08e56', 0.6), { position: [0, 0.071, 0], scale: [0.2, 0.014, 0.16] });
  for (let i = 0; i < 5; i += 1) {
    const a = i * TAU / 5;
    addMesh(tomato, new THREE.SphereGeometry(1, 24, 12), gel, {
      position: [Math.cos(a) * 0.49, 0.073, Math.sin(a) * 0.49 * 0.87],
      rotation: [0, -a, 0], scale: [0.21, 0.012, 0.155],
    });
  }
  instances(tomato, new THREE.SphereGeometry(1, 10, 7), cream, 20, (pose, i) => {
    const a = Math.floor(i / 4) * TAU / 5;
    const local = (i % 4) * golden;
    pose.position.set(Math.cos(a) * 0.49 + Math.cos(local) * 0.11, 0.086, (Math.sin(a) * 0.49 + Math.sin(local) * 0.1) * 0.87);
    pose.rotation.y = -a + local;
    pose.scale.set(0.026, 0.007, 0.015);
  });

  const lettuce = layer('alface crespa', 1.255, 5);
  addMesh(lettuce, lettuceGeometry(), leaf);
  for (let i = 0; i < 12; i += 1) {
    const a = i * TAU / 12;
    addVein(lettuce, vein, 0.07, 0.97, a);
    addVein(lettuce, vein, 0.45, 0.82, a, 0.17);
    addVein(lettuce, vein, 0.6, 0.94, a, -0.15);
  }

  const top = layer('pão com gergelim', 1.33, 6);
  addMesh(top, new THREE.CylinderGeometry(1.045, 1.06, 0.15, 96), crumb, { position: [0, 0.07, 0], scale: [1.03, 1, 0.88] });
  const dome = new THREE.SphereGeometry(1, 112, 56, 0, TAU, 0, Math.PI / 2);
  dome.scale(1.07, 0.74, 0.89);
  dome.translate(0, 0.145, 0);
  colorSurface(dome, (x, y, z) => {
    const height = (y - 0.145) / 0.74;
    const toastedTop = smoothstep(clamp((height - 0.3) / 0.7));
    const paleEdge = Math.exp(-(((height - 0.07) / 0.11) ** 2)) * 0.25;
    return toast.clone().lerp(honey, clamp(0.88 - toastedTop * 0.33 + paleEdge + grain(x, y, z) * 0.09));
  });
  addMesh(top, dome, bread);
  addBunSeeds(top, cream);

  // A few concentric transparent discs soften the contact shadow without a texture.
  for (let i = 0; i < 12; i += 1) {
    const shadow = new THREE.MeshBasicMaterial({ color: '#4e2c17', transparent: true, opacity: 0.009, depthWrite: false });
    addMesh(scene, new THREE.CircleGeometry(1, 64), shadow, { position: [0, -0.014 - i * 0.001, 0], rotation: [-Math.PI / 2, 0, 0], scale: [1.05 + i * 0.025, 0.72 + i * 0.018, 1] });
  }
  return groups;
}
