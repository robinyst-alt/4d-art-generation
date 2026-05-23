/**
 * 4D Slice Extraction
 *
 * Extracts 3D slices from 4D matrices and converts to Three.js point formats
 */

/**
 * Extract a 3D slice from a 4D matrix at a given w index
 * @param {Float32Array} matrix - 4D matrix data [w][z][y][x][rgba]
 * @param {number} resolution - Resolution of the matrix
 * @param {number} wIndex - W dimension index to extract
 * @returns {Float32Array} 3D slice data [z][y][x][rgba]
 */
export function extractSlice(matrix, resolution, wIndex) {
  if (wIndex < 0 || wIndex >= resolution) {
    throw new Error(`W index ${wIndex} out of range [0, ${resolution - 1}]`);
  }

  const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

  for (let z = 0; z < resolution; z++) {
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        // Source index in 4D matrix
        const srcIndex = (wIndex * resolution * resolution * resolution +
                         z * resolution * resolution +
                         y * resolution +
                         x) * 4;

        // Destination index in 3D slice
        const dstIndex = (z * resolution * resolution + y * resolution + x) * 4;

        sliceData[dstIndex] = matrix[srcIndex];
        sliceData[dstIndex + 1] = matrix[srcIndex + 1];
        sliceData[dstIndex + 2] = matrix[srcIndex + 2];
        sliceData[dstIndex + 3] = matrix[srcIndex + 3];
      }
    }
  }

  return sliceData;
}

/**
 * Extract multiple slices across a w range
 * @param {Float32Array} matrix - 4D matrix data
 * @param {number} resolution - Resolution of the matrix
 * @param {Array} wRange - [start, end] w indices (inclusive)
 * @returns {Array<Float32Array>} Array of 3D slice data
 */
export function extractMultipleSlices(matrix, resolution, wRange) {
  if (!Array.isArray(wRange) || wRange.length < 2) {
    throw new Error('wRange must be an array with at least 2 elements [start, end]');
  }

  const [start, end] = wRange;

  if (start > end) {
    return [];
  }

  const slices = [];
  for (let w = start; w <= end; w++) {
    slices.push(extractSlice(matrix, resolution, w));
  }

  return slices;
}

/**
 * Convert slice data to Three.js points format
 * Handles 1D (line), 2D (plane), and 3D (volume) slice data
 * @param {Float32Array} sliceData - Slice data of any dimension
 * @param {number} resolution - Resolution of the original matrix
 * @param {number} dimensions - Number of dimensions in slice data (1, 2, or 3)
 * @returns {Object} Object with positions and colors Float32Arrays
 */
export function toThreePoints(sliceData, resolution, dimensions = 3) {
  const positions = [];
  const colors = [];

  if (dimensions === 3) {
    // 3D slice: [z][y][x][rgba]
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const index = (z * resolution * resolution + y * resolution + x) * 4;
          processPoint(sliceData, index, x, y, z, resolution, positions, colors);
        }
      }
    }
  } else if (dimensions === 2) {
    // 2D slice: [y][x][rgba] (flattened)
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const index = (y * resolution + x) * 4;
        processPoint(sliceData, index, x, y, 0, resolution, positions, colors);
      }
    }
  } else if (dimensions === 1) {
    // 1D slice: [x][rgba] (flattened)
    for (let x = 0; x < resolution; x++) {
      const index = x * 4;
      processPoint(sliceData, index, x, 0, 0, resolution, positions, colors);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors) // RGB, not RGBA
  };
}

/**
 * Process a single point and add to positions/colors arrays
 */
function processPoint(sliceData, index, x, y, z, resolution, positions, colors) {
  // Skip transparent points
  if (sliceData[index + 3] <= 0) {
    return;
  }

  // Normalize position to [-1, 1] range for Three.js
  const nx = (x / resolution) * 2 - 1;
  const ny = (y / resolution) * 2 - 1;
  const nz = (z / resolution) * 2 - 1;

  positions.push(nx, ny, nz);
  colors.push(
    sliceData[index],
    sliceData[index + 1],
    sliceData[index + 2]
  );
}