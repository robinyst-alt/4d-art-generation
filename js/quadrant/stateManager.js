/**
 * Quadrant State Manager
 *
 * Manages four-axis (xyzw) slice/free control state
 * - Each axis can be in 'slice' or 'free' mode
 * - Slice mode: slider position determines slice plane, moving slider changes shape
 * - Free mode: slider can be dragged but doesn't affect graphics, only view angle
 * - Constraint: at least 1 slice axis must remain
 */

// Axis type definition
const AXES = ['x', 'y', 'z', 'w'];

// Default state: w=0 slice, xyz free
const DEFAULT_STATE = {
  x: { mode: 'free', sliceValue: 12, resolution: 24 },
  y: { mode: 'free', sliceValue: 12, resolution: 24 },
  z: { mode: 'free', sliceValue: 12, resolution: 24 },
  w: { mode: 'slice', sliceValue: 0, resolution: 24 }
};

/**
 * Create a new quadrant state with default values
 * @returns {Object} Quadrant state object
 */
export function createQuadrantState() {
  return {
    axes: {
      x: { mode: 'free', sliceValue: 12, resolution: 24 },
      y: { mode: 'free', sliceValue: 12, resolution: 24 },
      z: { mode: 'free', sliceValue: 12, resolution: 24 },
      w: { mode: 'slice', sliceValue: 0, resolution: 24 }
    }
  };
}

/**
 * Validate axis name
 * @param {string} axis - Axis name
 * @throws {Error} If axis is invalid
 */
function validateAxis(axis) {
  if (!AXES.includes(axis)) {
    throw new Error(`Invalid axis: ${axis}. Must be one of ${AXES.join(', ')}`);
  }
}

/**
 * Validate mode value
 * @param {string} mode - Mode value
 * @throws {Error} If mode is invalid
 */
function validateMode(mode) {
  if (mode !== 'slice' && mode !== 'free') {
    throw new Error(`Invalid mode: ${mode}. Must be 'slice' or 'free'`);
  }
}

/**
 * Get the count of axes currently in slice mode
 * @param {Object} state - Quadrant state
 * @returns {number} Number of slice axes
 */
function getSliceCount(state) {
  return AXES.filter(axis => state.axes[axis].mode === 'slice').length;
}

/**
 * Set an axis mode to slice or free
 * @param {Object} state - Quadrant state
 * @param {string} axis - Axis name (x, y, z, w)
 * @param {string} mode - Mode ('slice' or 'free')
 * @returns {Object} New state (immutable update)
 * @throws {Error} If constraint would be violated (no slice axes remain)
 */
export function setAxisMode(state, axis, mode) {
  validateAxis(axis);
  validateMode(mode);

  const currentMode = state.axes[axis].mode;

  // If mode is unchanged, return same state
  if (currentMode === mode) {
    return { axes: { ...state.axes } };
  }

  // When setting to free, check if it would violate the constraint
  if (mode === 'free' && currentMode === 'slice') {
    if (!canSetAxisToFree(state, axis)) {
      // Constraint violated - return same state
      return { axes: { ...state.axes } };
    }
  }

  // Create new state with immutable update
  return {
    axes: {
      ...state.axes,
      [axis]: {
        ...state.axes[axis],
        mode: mode
      }
    }
  };
}

/**
 * Set slice value for an axis
 * @param {Object} state - Quadrant state
 * @param {string} axis - Axis name
 * @param {number} value - Slice value [0-23]
 * @returns {Object} New state (immutable update)
 */
export function setSliceValue(state, axis, value) {
  validateAxis(axis);

  // Clamp and floor the value to [0, 23]
  const clampedValue = Math.max(0, Math.min(23, Math.floor(value)));

  // If value unchanged, return same state
  if (state.axes[axis].sliceValue === clampedValue) {
    return { axes: { ...state.axes } };
  }

  return {
    axes: {
      ...state.axes,
      [axis]: {
        ...state.axes[axis],
        sliceValue: clampedValue
      }
    }
  };
}

/**
 * Get list of axes currently in slice mode
 * @param {Object} state - Quadrant state
 * @returns {string[]} Array of slice axis names
 */
export function getSliceAxes(state) {
  return AXES.filter(axis => state.axes[axis].mode === 'slice');
}

/**
 * Get list of axes currently in free mode
 * @param {Object} state - Quadrant state
 * @returns {string[]} Array of free axis names
 */
export function getFreeAxes(state) {
  return AXES.filter(axis => state.axes[axis].mode === 'free');
}

/**
 * Check if an axis can be set to free mode
 * (i.e., removing it as slice would not violate the constraint)
 * @param {Object} state - Quadrant state
 * @param {string} axis - Axis to check
 * @returns {boolean} True if the axis can be set to free
 */
export function canSetAxisToFree(state, axis) {
  // If axis is not currently slice, it can always become free
  if (state.axes[axis].mode !== 'slice') {
    return true;
  }

  // If axis is slice, check if there would be at least 1 slice remaining
  const sliceCount = getSliceCount(state);
  return sliceCount > 1;
}

/**
 * Extract multi-axis slice from 4D matrix based on current quadrant state
 *
 * @param {Float32Array} matrix - 4D matrix [w][z][y][x][rgba]
 * @param {Object} state - Quadrant state
 * @returns {Object} Object with:
 *   - data: Float32Array of extracted slice
 *   - dimensions: 3, 2, or 1 (resulting dimensional reduction)
 *   - sliceAxes: array of axes that were sliced
 *   - freeAxes: array of axes that remain free
 */
export function extractMultiAxisSlice(matrix, state) {
  const sliceAxes = getSliceAxes(state);

  // Validation: at least 1 slice axis required
  if (sliceAxes.length === 0) {
    throw new Error('At least 1 slice axis is required');
  }

  const resolution = state.axes.x.resolution;
  const sliceValues = {};
  sliceAxes.forEach(axis => {
    sliceValues[axis] = state.axes[axis].sliceValue;
  });

  // Determine resulting dimensions based on number of slice axes
  const dimensions = 4 - sliceAxes.length;

  // Build the extraction based on which axes are sliced
  if (sliceAxes.length === 1) {
    // Single slice: extract 3D slice (w is default slice axis)
    return extract3DSlice(matrix, resolution, sliceAxes[0], sliceValues[sliceAxes[0]], dimensions);
  } else if (sliceAxes.length === 2) {
    // Two slices: extract 2D slice (plane)
    return extract2DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions);
  } else if (sliceAxes.length === 3) {
    // Three slices: extract 1D slice (line)
    return extract1DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions);
  }

  throw new Error('Cannot slice all 4 axes');
}

/**
 * Extract 3D slice at a specific index for any axis
 */
function extract3DSlice(matrix, resolution, sliceAxis, sliceValue, dimensions) {
  const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

  // Get the indices for the three free axes (all axes except the slice axis)
  const axes = ['x', 'y', 'z', 'w'];
  const freeAxes = axes.filter(axis => axis !== sliceAxis);

  // Iterate over the three free dimensions
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      for (let k = 0; k < resolution; k++) {
        // Map indices to axes based on which axis is the slice axis
        const axisIndices = {};
        freeAxes.forEach((axis, idx) => {
          if (idx === 0) axisIndices[axis] = i;
          else if (idx === 1) axisIndices[axis] = j;
          else axisIndices[axis] = k;
        });
        axisIndices[sliceAxis] = sliceValue;

        const srcIndex = (axisIndices.w * resolution * resolution * resolution +
                         axisIndices.z * resolution * resolution +
                         axisIndices.y * resolution +
                         axisIndices.x) * 4;
        const dstIndex = (i * resolution * resolution + j * resolution + k) * 4;

        sliceData[dstIndex] = matrix[srcIndex];
        sliceData[dstIndex + 1] = matrix[srcIndex + 1];
        sliceData[dstIndex + 2] = matrix[srcIndex + 2];
        sliceData[dstIndex + 3] = matrix[srcIndex + 3];
      }
    }
  }

  return { data: sliceData, dimensions, sliceAxes: [sliceAxis], freeAxes };
}

/**
 * Extract 2D slice (plane) at specific indices for any two axes
 */
function extract2DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions) {
  const sliceData = new Float32Array(Math.pow(resolution, 2) * 4);

  // Get the two free axes
  const axes = ['x', 'y', 'z', 'w'];
  const freeAxes = axes.filter(axis => !sliceAxes.includes(axis));

  // Create a map from slice axes to their fixed values
  const fixedValues = {};
  sliceAxes.forEach(axis => {
    fixedValues[axis] = sliceValues[axis];
  });

  // Iterate over the two free dimensions
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      // Map indices to axes
      const axisIndices = { ...fixedValues };
      if (freeAxes[0] === 'x' || freeAxes[0] === 'y' || freeAxes[0] === 'z' || freeAxes[0] === 'w') {
        axisIndices[freeAxes[0]] = i;
        axisIndices[freeAxes[1]] = j;
      }

      const srcIndex = (axisIndices.w * resolution * resolution * resolution +
                       axisIndices.z * resolution * resolution +
                       axisIndices.y * resolution +
                       axisIndices.x) * 4;
      const dstIndex = (i * resolution + j) * 4;

      sliceData[dstIndex] = matrix[srcIndex];
      sliceData[dstIndex + 1] = matrix[srcIndex + 1];
      sliceData[dstIndex + 2] = matrix[srcIndex + 2];
      sliceData[dstIndex + 3] = matrix[srcIndex + 3];
    }
  }

  return { data: sliceData, dimensions, sliceAxes, freeAxes };
}

/**
 * Extract 1D slice (line) at specific indices for any three axes
 */
function extract1DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions) {
  const sliceData = new Float32Array(resolution * 4);

  // Get the single free axis
  const axes = ['x', 'y', 'z', 'w'];
  const freeAxes = axes.filter(axis => !sliceAxes.includes(axis));

  // Create a map from slice axes to their fixed values
  const fixedValues = {};
  sliceAxes.forEach(axis => {
    fixedValues[axis] = sliceValues[axis];
  });

  // Iterate over the single free dimension
  for (let i = 0; i < resolution; i++) {
    const axisIndices = { ...fixedValues };
    axisIndices[freeAxes[0]] = i;

    const srcIndex = (axisIndices.w * resolution * resolution * resolution +
                     axisIndices.z * resolution * resolution +
                     axisIndices.y * resolution +
                     axisIndices.x) * 4;
    const dstIndex = i * 4;

    sliceData[dstIndex] = matrix[srcIndex];
    sliceData[dstIndex + 1] = matrix[srcIndex + 1];
    sliceData[dstIndex + 2] = matrix[srcIndex + 2];
    sliceData[dstIndex + 3] = matrix[srcIndex + 3];
  }

  return { data: sliceData, dimensions, sliceAxes, freeAxes };
}