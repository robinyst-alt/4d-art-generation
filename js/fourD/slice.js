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
 * @param {string[]} freeAxes - Array of free axis names in order (e.g., ['x', 'y'] for 2D)
 *   The order determines how loop indices map to axes:
 *   - For 2D: i maps to freeAxes[0], j maps to freeAxes[1]
 *   - For 1D: i maps to freeAxes[0]
 * @param {Object} sliceValues - Object mapping slice axis names to their fixed values
 *   e.g., { y: 12, w: 8 } means y is fixed at 12, w is fixed at 8
 * @returns {Object} Object with positions and colors Float32Arrays
 */
export function toThreePoints(sliceData, resolution, dimensions = 3, freeAxes = null, sliceValues = null) {
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
    // 2D slice with explicit axis order from freeAxes
    // Data layout: outer loop index i → freeAxes[0], inner loop index j → freeAxes[1]
    // Example: freeAxes=['x', 'z'] means i→x, j→z, data layout is x×z
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const index = (i * resolution + j) * 4;
        // Map i and j to actual axes based on freeAxes order
        const axis0 = freeAxes && freeAxes[0] ? freeAxes[0] : 'x';
        const axis1 = freeAxes && freeAxes[1] ? freeAxes[1] : 'y';

        // Start with slice values if available, otherwise default to 0
        let x = sliceValues && sliceValues.x !== undefined ? sliceValues.x : 0;
        let y = sliceValues && sliceValues.y !== undefined ? sliceValues.y : 0;
        let z = sliceValues && sliceValues.z !== undefined ? sliceValues.z : 0;

        // Override with loop indices for free axes
        if (axis0 === 'x') { x = i; }
        else if (axis0 === 'y') { y = i; }
        else if (axis0 === 'z') { z = i; }

        if (axis1 === 'x') { x = j; }
        else if (axis1 === 'y') { y = j; }
        else if (axis1 === 'z') { z = j; }

        processPoint(sliceData, index, x, y, z, resolution, positions, colors);
      }
    }
  } else if (dimensions === 1) {
    // 1D slice: freeAxes[0] is the free axis
    for (let i = 0; i < resolution; i++) {
      const index = i * 4;
      const axis = freeAxes && freeAxes[0] ? freeAxes[0] : 'x';

      // Start with slice values if available, otherwise default to 0
      let x = sliceValues && sliceValues.x !== undefined ? sliceValues.x : 0;
      let y = sliceValues && sliceValues.y !== undefined ? sliceValues.y : 0;
      let z = sliceValues && sliceValues.z !== undefined ? sliceValues.z : 0;

      // Override with loop index for the free axis
      if (axis === 'x') { x = i; }
      else if (axis === 'y') { y = i; }
      else if (axis === 'z') { z = i; }

      processPoint(sliceData, index, x, y, z, resolution, positions, colors);
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