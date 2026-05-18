/**
 * 4D Shape Generators
 *
 * Generates 4D pixel matrices for various mathematical shapes:
 * - Tesseract (hypercube)
 * - 4D Sphere
 * - 4D Octahedron
 * - 4D Dodecahedron
 * - 4D Icosahedron
 * - 4D Torus
 *
 * Output format: Float32Array [w][z][y][x][rgba]
 * Values normalized to [0, 1]
 */

/**
 * Resolution bounds to prevent memory exhaustion
 */
const MIN_RESOLUTION = 4;
const MAX_RESOLUTION = 64;

// Golden ratio constant
const PHI = (1 + Math.sqrt(5)) / 2;
const PHI_INV = 1 / PHI;

/**
 * Validate resolution parameter
 * @param {number} resolution - Resolution to validate
 * @throws {Error} If resolution is invalid
 */
function validateResolution(resolution) {
  if (!Number.isInteger(resolution)) {
    throw new Error(`Resolution must be an integer, got ${typeof resolution}`);
  }
  if (resolution < MIN_RESOLUTION || resolution > MAX_RESOLUTION) {
    throw new Error(`Resolution must be between ${MIN_RESOLUTION} and ${MAX_RESOLUTION}`);
  }
}

/**
 * SDF for a cube centered at origin
 */
function sdfCube(x, y, z, size) {
  const qx = Math.abs(x) - size;
  const qy = Math.abs(y) - size;
  const qz = Math.abs(z) - size;
  return Math.max(qx, qy, qz);
}

/**
 * SDF for an octahedron centered at origin
 */
function sdfOctahedron(x, y, z, size) {
  return (Math.abs(x) + Math.abs(y) + Math.abs(z) - size) / Math.sqrt(3);
}

/**
 * SDF for a dodecahedron centered at origin
 * Uses the standard dodecahedron SDF with golden ratio
 */
function sdfDodecahedron(x, y, z, size) {
  const m = size * 0.5;
  // Dodecahedron SDF - combination of planes
  const p1 = Math.abs(y) - m;
  const p2 = Math.abs(x) - m;
  const p3 = Math.abs(z) - m;

  // Pentagonal face planes using PHI and PHI_INV
  const pa = Math.abs(x * PHI + y * PHI_INV) - m;
  const pb = Math.abs(x * PHI_INV - y * PHI) - m;
  const pc = Math.abs(z * PHI + y * PHI_INV) - m;
  const pd = Math.abs(z * PHI_INV - y * PHI) - m;

  const planes = [p1, p2, p3, pa, pb, pc, pd];
  return Math.max(...planes);
}

/**
 * SDF for an icosahedron centered at origin
 */
function sdfIcosahedron(x, y, z, size) {
  const m = size * 0.4;
  // Icosahedron uses triangular face planes
  const p1 = Math.abs(y) - m;
  const p2 = Math.abs(x * PHI + z * PHI_INV) - m;
  const p3 = Math.abs(x * PHI - z * PHI_INV) - m;
  const p4 = Math.abs(z) - m;

  return Math.max(p1, p2, p3, p4);
}

/**
 * Generate a 4D Tesseract (hypercube)
 * @param {number} resolution - Grid resolution (4-64)
 * @param {number} size - Size of the tesseract (0-1, default 0.9)
 * @returns {Float32Array} 4D matrix data
 */
export function generateTesseract(resolution, size = 0.9) {
  validateResolution(resolution);
  const data = new Float32Array(resolution ** 4 * 4);
  const halfSize = size / 2;
  const halfRes = resolution / 2;

  for (let w = 0; w < resolution; w++) {
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          // Normalized coordinates [-1, 1]
          const nx = (x - halfRes) / halfRes;
          const ny = (y - halfRes) / halfRes;
          const nz = (z - halfRes) / halfRes;
          const nw = (w - halfRes) / halfRes;

          // Tesseract: all points where max(|x|, |y|, |z|, |w|) <= halfSize
          const maxComponent = Math.max(Math.abs(nx), Math.abs(ny), Math.abs(nz), Math.abs(nw));

          if (maxComponent <= halfSize) {
            const index = (w * resolution * resolution * resolution +
                         z * resolution * resolution +
                         y * resolution +
                         x) * 4;

            // Edge detection for visual interest - stronger at edges
            const edgeX = 1 - Math.abs(nx) / halfSize;
            const edgeY = 1 - Math.abs(ny) / halfSize;
            const edgeZ = 1 - Math.abs(nz) / halfSize;
            const edgeW = 1 - Math.abs(nw) / halfSize;

            const edgeMin = Math.min(edgeX, edgeY, edgeZ, edgeW);
            const edgeValue = edgeMin < 0.1 ? 1.0 : 0.3 + edgeMin * 0.5;

            data[index] = edgeValue;     // R
            data[index + 1] = edgeValue; // G
            data[index + 2] = edgeValue; // B
            data[index + 3] = 1;         // A
          }
        }
      }
    }
  }

  return data;
}

/**
 * Generate a 4D Sphere
 * @param {number} resolution - Grid resolution (4-64)
 * @param {number} radius - Radius (0-1, default 0.5)
 * @returns {Float32Array} 4D matrix data
 */
export function generate4DSphere(resolution, radius = 0.5) {
  validateResolution(resolution);
  const data = new Float32Array(resolution ** 4 * 4);
  const halfRes = resolution / 2;
  const radiusSq = radius * radius;

  for (let w = 0; w < resolution; w++) {
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const nx = (x - halfRes) / halfRes;
          const ny = (y - halfRes) / halfRes;
          const nz = (z - halfRes) / halfRes;
          const nw = (w - halfRes) / halfRes;

          const distSq = nx * nx + ny * ny + nz * nz + nw * nw;

          if (distSq <= radiusSq) {
            const index = (w * resolution * resolution * resolution +
                         z * resolution * resolution +
                         y * resolution +
                         x) * 4;

            // Gradient from center
            const dist = Math.sqrt(distSq);
            const normalizedDist = dist / radius;
            const value = 1 - normalizedDist;

            data[index] = value;         // R
            data[index + 1] = value * 0.8; // G
            data[index + 2] = value * 0.6; // B
            data[index + 3] = 1;         // A
          }
        }
      }
    }
  }

  return data;
}

/**
 * Generate a 4D Octahedron
 * @param {number} resolution - Grid resolution (4-64)
 * @returns {Float32Array} 4D matrix data
 */
export function generate4DOctahedron(resolution) {
  validateResolution(resolution);
  const data = new Float32Array(resolution ** 4 * 4);
  const halfRes = resolution / 2;

  for (let w = 0; w < resolution; w++) {
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const nx = (x - halfRes) / halfRes;
          const ny = (y - halfRes) / halfRes;
          const nz = (z - halfRes) / halfRes;
          const nw = (w - halfRes) / halfRes;

          // 4D octahedron: |x| + |y| + |z| + |w| <= 1
          const manhattanDist = Math.abs(nx) + Math.abs(ny) + Math.abs(nz) + Math.abs(nw);

          if (manhattanDist <= 0.9) {
            const index = (w * resolution * resolution * resolution +
                         z * resolution * resolution +
                         y * resolution +
                         x) * 4;

            const value = 1 - manhattanDist / 0.9;

            data[index] = value * 0.5;   // R
            data[index + 1] = value;     // G
            data[index + 2] = value * 0.7; // B
            data[index + 3] = 1;         // A
          }
        }
      }
    }
  }

  return data;
}

/**
 * Generate a 4D Dodecahedron
 * Uses proper dodecahedron vertex SDF
 * @param {number} resolution - Grid resolution (4-64)
 * @returns {Float32Array} 4D matrix data
 */
export function generate4DDodecahedron(resolution) {
  validateResolution(resolution);
  const data = new Float32Array(resolution ** 4 * 4);
  const halfRes = resolution / 2;

  // Dodecahedron vertices - 20 vertices of a regular dodecahedron
  // These are all permutations of [±1, ±1, ±1] and [0, ±1/φ, ±φ]
  const phi = PHI;
  const phiInv = PHI_INV;

  // The 20 dodecahedron vertices (scaled to fit in [-1,1])
  const vertices = [
    // Cube vertices (8)
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
    // Extra vertices from golden rectangle faces (12)
    [0, phiInv, phi], [0, phiInv, -phi], [0, -phiInv, phi], [0, -phiInv, -phi],
    [phi, 0, phiInv], [phi, 0, -phiInv], [-phi, 0, phiInv], [-phi, 0, -phiInv],
    [phiInv, phi, 0], [phiInv, -phi, 0], [-phiInv, phi, 0], [-phiInv, -phi, 0]
  ];

  // Scale vertices to fit nicely
  const vScale = 0.7;

  for (let w = 0; w < resolution; w++) {
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const nx = (x - halfRes) / halfRes;
          const ny = (y - halfRes) / halfRes;
          const nz = (z - halfRes) / halfRes;
          const nw = (w - halfRes) / halfRes;

          // Find minimum distance to dodecahedron vertices
          let minDist = Infinity;
          for (const v of vertices) {
            const dx = nx - v[0] * vScale;
            const dy = ny - v[1] * vScale;
            const dz = nz - v[2] * vScale;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            minDist = Math.min(minDist, dist);
          }

          // Also consider W - for 4D we extend the shape along W
          const wDist = Math.abs(nw);
          const totalDist = minDist + wDist * 0.2;

          if (totalDist < 0.35) {
            const index = (w * resolution * resolution * resolution +
                         z * resolution * resolution +
                         y * resolution +
                         x) * 4;

            const value = Math.max(0, 1 - totalDist / 0.35);

            // Gold/amber color
            data[index] = value;
            data[index + 1] = value * 0.75;
            data[index + 2] = value * 0.35;
            data[index + 3] = 1;
          }
        }
      }
    }
  }

  return data;
}

/**
 * Generate a 4D Icosahedron
 * Uses proper icosahedron vertex SDF
 * @param {number} resolution - Grid resolution (4-64)
 * @returns {Float32Array} 4D matrix data
 */
export function generate4DIcosahedron(resolution) {
  validateResolution(resolution);
  const data = new Float32Array(resolution ** 4 * 4);
  const halfRes = resolution / 2;

  const phi = PHI;

  // Icosahedron vertices - 12 vertices
  // [±1, ±φ, 0], [0, ±1, ±φ], [±φ, 0, ±1]
  const vertices = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];

  const vScale = 0.55;

  for (let w = 0; w < resolution; w++) {
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const nx = (x - halfRes) / halfRes;
          const ny = (y - halfRes) / halfRes;
          const nz = (z - halfRes) / halfRes;
          const nw = (w - halfRes) / halfRes;

          let minDist = Infinity;
          for (const v of vertices) {
            const dx = nx - v[0] * vScale;
            const dy = ny - v[1] * vScale;
            const dz = nz - v[2] * vScale;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            minDist = Math.min(minDist, dist);
          }

          const wDist = Math.abs(nw);
          const totalDist = minDist + wDist * 0.2;

          if (totalDist < 0.3) {
            const index = (w * resolution * resolution * resolution +
                         z * resolution * resolution +
                         y * resolution +
                         x) * 4;

            const value = Math.max(0, 1 - totalDist / 0.3);

            // Cyan/teal color
            data[index] = value * 0.35;
            data[index + 1] = value * 0.85;
            data[index + 2] = value;
            data[index + 3] = 1;
          }
        }
      }
    }
  }

  return data;
}

/**
 * Generate a 4D Torus
 * @param {number} resolution - Grid resolution (4-64)
 * @param {number} majorRadius - Major radius (default 0.4)
 * @param {number} minorRadius - Minor radius (default 0.2)
 * @returns {Float32Array} 4D matrix data
 */
export function generate4DTorus(resolution, majorRadius = 0.4, minorRadius = 0.2) {
  validateResolution(resolution);
  const data = new Float32Array(resolution ** 4 * 4);
  const halfRes = resolution / 2;

  for (let w = 0; w < resolution; w++) {
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const nx = (x - halfRes) / halfRes;
          const ny = (y - halfRes) / halfRes;
          const nz = (z - halfRes) / halfRes;
          const nw = (w - halfRes) / halfRes;

          // Distance from center in XY plane
          const dxy = Math.sqrt(nx * nx + ny * ny);
          // Distance from torus center circle
          const distFromCircle = Math.abs(dxy - majorRadius);
          // Distance from torus tube
          const distInTube = Math.sqrt(distFromCircle * distFromCircle + nz * nz + nw * nw);

          if (distInTube <= minorRadius) {
            const index = (w * resolution * resolution * resolution +
                         z * resolution * resolution +
                         y * resolution +
                         x) * 4;

            const normalizedDist = distInTube / minorRadius;
            const value = 1 - normalizedDist;

            // Color based on angle for rainbow effect
            const angle = Math.atan2(ny, nx);
            data[index] = 0.5 + 0.5 * Math.cos(angle);     // R
            data[index + 1] = 0.5 + 0.5 * Math.cos(angle + 2); // G
            data[index + 2] = 0.5 + 0.5 * Math.cos(angle + 4); // B
            data[index + 3] = 1;                             // A
          }
        }
      }
    }
  }

  return data;
}

/**
 * Generate shape by type
 * @param {string} type - Shape type ('tesseract', 'sphere', 'octahedron', 'dodecahedron', 'icosahedron', 'torus')
 * @param {Object} params - Shape parameters
 * @returns {Float32Array} 4D matrix data
 */
export function generate(type, params = {}) {
  const resolution = params.resolution || 24;
  const size = params.size !== undefined ? params.size : 0.9;

  switch (type) {
    case 'tesseract':
      return generateTesseract(resolution, size);
    case 'sphere':
      return generate4DSphere(resolution, params.radius || 0.5);
    case 'octahedron':
      return generate4DOctahedron(resolution);
    case 'dodecahedron':
      return generate4DDodecahedron(resolution);
    case 'icosahedron':
      return generate4DIcosahedron(resolution);
    case 'torus':
      return generate4DTorus(resolution, params.majorR || 0.4, params.minorR || 0.2);
    default:
      throw new Error(`Unknown shape type: ${type}`);
  }
}