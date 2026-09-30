// Shared geometry keeps the WebGL planets and accessible HTML labels in the same space.
const normals = [[0.14, 0.88, 0.46], [-0.64, 0.63, 0.32]];
const phases = [2.85, 5.85, 5.55, 4.1, 0.25];
const speeds = [0.045, 0.035, 0.05, 0.03, 0.04];

export function orbitPosition(index, seconds) {
  const normal = normals[index % 2];
  const length = Math.hypot(...normal);
  const [nx, ny, nz] = normal.map(value => value / length);
  const axisLength = Math.hypot(nx, ny);
  const axis = [ny / axisLength, -nx / axisLength, 0];
  const across = [-nz * axis[1], nz * axis[0], nx * axis[1] - ny * axis[0]];
  const radius = index % 2 === 0 ? 1.63 : 1.91;
  const angle = phases[index] + seconds * speeds[index];
  return axis.map((value, i) => radius * (value * Math.cos(angle) + across[i] * Math.sin(angle)));
}

function cameraPoint(point, rotation) {
  // Invert the shader's Y * X camera rotation before applying its perspective projection.
  const [x, y, z] = point;
  const [rx, ry] = rotation;
  const cameraX = Math.cos(ry) * x - Math.sin(ry) * z;
  const rotatedZ = Math.sin(ry) * x + Math.cos(ry) * z;
  const cameraY = Math.cos(rx) * y + Math.sin(rx) * rotatedZ;
  const cameraZ = -Math.sin(rx) * y + Math.cos(rx) * rotatedZ;
  return [cameraX, cameraY, cameraZ];
}

export function projectPosition(point, rotation, width, height, distance) {
  const [cameraX, cameraY, cameraZ] = cameraPoint(point, rotation);
  const scale = distance / (distance - cameraZ);
  return {
    x: width / 2 + cameraX * height * 1.5 / (distance - cameraZ),
    y: height / 2 - cameraY * height * 1.5 / (distance - cameraZ),
    scale,
    // The ray to a far-side planet intersects the unit core when this distance is below one.
    occluded: cameraZ < 0 && distance * Math.hypot(cameraX, cameraY) / Math.hypot(cameraX, cameraY, distance - cameraZ) < 1,
  };
}

export function pickPlanet(x, y, positions, rotation, width, height, distance) {
  const ray = [(x - width / 2) * 2 / height, (height / 2 - y) * 2 / height, -3];
  const length = Math.hypot(...ray);
  const direction = ray.map(value => value / length);
  function hitDepth(center, radius) {
    const origin = [-center[0], -center[1], distance - center[2]];
    const b = origin.reduce((sum, value, i) => sum + value * direction[i], 0);
    const h = b * b - origin.reduce((sum, value) => sum + value * value, 0) + radius * radius;
    return h > 0 ? -b - Math.sqrt(h) : Infinity;
  }
  // Match the shader's core and satellite radii; only the nearest visible surface can be picked.
  let nearest = hitDepth([0, 0, 0], 1);
  let picked = -1;
  positions.forEach((position, index) => {
    const depth = hitDepth(cameraPoint(position, rotation), 0.135 + index * 0.008);
    if (depth > 0 && depth < nearest) { nearest = depth; picked = index; }
  });
  return picked;
}

export function workflowAt(seconds) {
  const cycle = seconds % 30;
  return { step: Math.floor(cycle / 5), progress: (cycle % 5) / 5 };
}
