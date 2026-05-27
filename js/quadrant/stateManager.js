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

// Default state: w=12 slice, xyz free
const DEFAULT_STATE = {
  axes: {
    x: { mode: 'free', sliceValue: 12, resolution: 24 },
    y: { mode: 'free', sliceValue: 12, resolution: 24 },
    z: { mode: 'free', sliceValue: 12, resolution: 24 },
    w: { mode: 'slice', sliceValue: 12, resolution: 24 }
  },
  lockedAxes: []
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
      w: { mode: 'slice', sliceValue: 12, resolution: 24 }
    },
    lockedAxes: ['w']  // W is default locked axis per PRD
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
    return { axes: { ...state.axes }, lockedAxes: [...(state.lockedAxes || [])] };
  }

  // When setting to free, check if it would violate the constraint
  if (mode === 'free' && currentMode === 'slice') {
    if (!canSetAxisToFree(state, axis)) {
      // Constraint violated - return same state
      return { axes: { ...state.axes }, lockedAxes: [...(state.lockedAxes || [])] };
    }
  }

  // When changing mode, handle locked axis scenario
  // If axis is locked and mode is changing, auto-unlock first
  const isAxisLocked = state.lockedAxes && state.lockedAxes.includes(axis);
  let newLockedAxes = [...(state.lockedAxes || [])];

  if (isAxisLocked && currentMode !== mode) {
    // Auto-unlock when mode changes for a locked axis
    newLockedAxes = newLockedAxes.filter(a => a !== axis);
  }

  // Create new state with immutable update
  return {
    axes: {
      ...state.axes,
      [axis]: {
        ...state.axes[axis],
        mode: mode
      }
    },
    lockedAxes: newLockedAxes
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
    return { axes: { ...state.axes }, lockedAxes: [...(state.lockedAxes || [])] };
  }

  return {
    axes: {
      ...state.axes,
      [axis]: {
        ...state.axes[axis],
        sliceValue: clampedValue
      }
    },
    lockedAxes: [...(state.lockedAxes || [])]
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
 * Set lock status for an axis
 * When locking an axis that is in 'free' mode, it automatically converts to 'slice'
 * Locked axes cannot be all unlocked - at least 1 must remain locked
 * @param {Object} state - Quadrant state
 * @param {string} axis - Axis name (x, y, z, w)
 * @param {boolean} isLocked - True to lock, false to unlock
 * @returns {Object} New state (immutable update)
 */
export function setAxisLock(state, axis, isLocked) {
  validateAxis(axis);

  const currentLocked = state.lockedAxes.includes(axis);

  // If no change, return same state
  if (currentLocked === isLocked) {
    return { axes: { ...state.axes }, lockedAxes: [...state.lockedAxes] };
  }

  // When unlocking the last locked axis, prevent it to maintain minimum 1 lock constraint
  // The axis keeps its slice mode, just remains locked
  if (!isLocked && state.lockedAxes.length === 1 && state.lockedAxes.includes(axis)) {
    // Cannot unlock the last locked axis - constraint: at least 1 lock must remain
    return { axes: { ...state.axes }, lockedAxes: [...state.lockedAxes] };
  }

  // When locking, prevent if it would result in 0 camera axes (all 4 locked)
  if (isLocked && state.lockedAxes.length === 3 && !state.lockedAxes.includes(axis)) {
    // Cannot lock the 4th axis - would leave no camera axes for rotation
    return { axes: { ...state.axes }, lockedAxes: [...state.lockedAxes] };
  }

  let newState = {
    axes: { ...state.axes },
    lockedAxes: [...state.lockedAxes]
  };

  if (isLocked) {
    // When locking, if axis is in 'free' mode, auto-convert to 'slice'
    if (newState.axes[axis].mode === 'free') {
      newState.axes[axis] = { ...newState.axes[axis], mode: 'slice' };
    }
    // Add to locked list if not already there
    if (!newState.lockedAxes.includes(axis)) {
      newState.lockedAxes.push(axis);
    }
  } else {
    // When unlocking, remove from locked list
    newState.lockedAxes = newState.lockedAxes.filter(a => a !== axis);
  }

  return newState;
}

/**
 * Get list of axes that are locked
 * @param {Object} state - Quadrant state
 * @returns {string[]} Array of locked axis names
 */
export function getLockedAxes(state) {
  return [...(state.lockedAxes || [])];
}

/**
 * Get list of camera axes (non-locked axes)
 * Camera axes = all 4 axes minus locked axes
 * These are the axes that participate in camera rotation
 * @param {Object} state - Quadrant state
 * @returns {string[]} Array of camera axis names
 */
export function getCameraAxes(state) {
  const locked = state.lockedAxes || [];
  return AXES.filter(axis => !locked.includes(axis));
}

/**
 * Get the number of dimensions available for camera rotation
 * Based on how many axes are not locked
 * @param {Object} state - Quadrant state
 * @returns {number} Camera rotation dimensions (1-4)
 */
export function getCameraRotationDimensions(state) {
  return getCameraAxes(state).length;
}

/**
 * Extract multi-axis slice from 4D matrix based on current quadrant state
 *
 * @param {Float32Array} matrix - 4D matrix [w][z][y][x][rgba]
 * @param {Object} state - Quadrant state
 * @param {number[]} [rotationMatrix] - Optional 3x3 rotation matrix (column-major) for 3D rotation mode
 * @returns {Object} Object with:
 *   - data: Float32Array of extracted slice
 *   - dimensions: 3, 2, or 1 (resulting dimensional reduction)
 *   - sliceAxes: array of axes that were sliced
 *   - freeAxes: array of axes that remain free
 */
export function extractMultiAxisSlice(matrix, state, rotationMatrix = null) {
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
    return extract3DSlice(matrix, resolution, sliceAxes[0], sliceValues[sliceAxes[0]], dimensions, rotationMatrix);
  } else if (sliceAxes.length === 2) {
    // Two slices: extract 2D slice (plane)
    return extract2DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions, rotationMatrix);
  } else if (sliceAxes.length === 3) {
    // Three slices: extract 1D slice (line)
    return extract1DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions, rotationMatrix);
  }

  throw new Error('Cannot slice all 4 axes');
}

/**
 * Extract 3D slice at a specific index for any axis
 * @param {Float32Array} matrix - 4D matrix [w][z][y][x][rgba]
 * @param {number} resolution - Resolution
 * @param {string} sliceAxis - The axis being sliced (x, y, z, or w)
 * @param {number} sliceValue - The slice value along the slice axis
 * @param {number} dimensions - Resulting dimensions (3)
 * @param {number[]} [rotationMatrix] - Optional 3x3 rotation matrix (column-major)
 */
function extract3DSlice(matrix, resolution, sliceAxis, sliceValue, dimensions, rotationMatrix = null) {
  // If no rotation, use fast path
  if (!rotationMatrix) {
    return extract3DSliceFast(matrix, resolution, sliceAxis, sliceValue, dimensions);
  }

  // With rotation: compute offset and use trilinear interpolation
  const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

  // Get base vector for slice axis (e.g., (1,0,0) for X, (0,1,0) for Y, etc.)
  const baseVector = getAxisBaseVector(sliceAxis);

  // Compute the offset: sliceValue * R * baseVector
  const offset = applyRotationToVector(sliceValue, baseVector, rotationMatrix);

  // Get the three free axes
  const axes = ['x', 'y', 'z', 'w'];
  const freeAxes = axes.filter(axis => axis !== sliceAxis);

  // Iterate over the three free dimensions and sample with trilinear interpolation
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      for (let k = 0; k < resolution; k++) {
        // Map indices to axes
        const axisIndices = {};
        freeAxes.forEach((axis, idx) => {
          if (idx === 0) axisIndices[axis] = i;
          else if (idx === 1) axisIndices[axis] = j;
          else axisIndices[axis] = k;
        });

        // Original point in original matrix space
        const origX = axisIndices.x;
        const origY = axisIndices.y;
        const origZ = axisIndices.z;
        const origW = axisIndices.w;

        // Apply rotation offset to get sampling position
        const sampleX = origX + offset.x;
        const sampleY = origY + offset.y;
        const sampleZ = origZ + offset.z;
        const sampleW = origW; // W is not affected by 3D rotation

        // Trilinear interpolation
        const value = trilinearInterpolate(matrix, resolution, sampleX, sampleY, sampleZ, sampleW);

        const dstIndex = (i * resolution * resolution + j * resolution + k) * 4;
        sliceData[dstIndex] = value.r;
        sliceData[dstIndex + 1] = value.g;
        sliceData[dstIndex + 2] = value.b;
        sliceData[dstIndex + 3] = value.a;
      }
    }
  }

  return { data: sliceData, dimensions, sliceAxes: [sliceAxis], freeAxes, sliceValues: { [sliceAxis]: sliceValue } };
}

/**
 * Fast path for 3D slice without rotation
 */
function extract3DSliceFast(matrix, resolution, sliceAxis, sliceValue, dimensions) {
  const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

  const axes = ['x', 'y', 'z', 'w'];
  const freeAxes = axes.filter(axis => axis !== sliceAxis);

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      for (let k = 0; k < resolution; k++) {
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

  return { data: sliceData, dimensions, sliceAxes: [sliceAxis], freeAxes, sliceValues: { [sliceAxis]: sliceValue } };
}

/**
 * Get base vector for an axis
 */
function getAxisBaseVector(axis) {
  switch (axis) {
    case 'x': return [1, 0, 0];
    case 'y': return [0, 1, 0];
    case 'z': return [0, 0, 1];
    case 'w': return [0, 0, 0]; // W is not affected by 3D rotation
    default: return [0, 0, 0];
  }
}

/**
 * Apply rotation matrix to a scaled vector
 * @param {number} scale - Scale factor
 * @param {number[]} vector - 3D vector [x, y, z]
 * @param {number[]} R - 3x3 rotation matrix (column-major)
 * @returns {Object} { x, y, z } offset
 */
function applyRotationToVector(scale, vector, R) {
  // R is column-major: R[col*3 + row]
  const vx = vector[0];
  const vy = vector[1];
  const vz = vector[2];

  return {
    x: scale * (R[0] * vx + R[3] * vy + R[6] * vz),
    y: scale * (R[1] * vx + R[4] * vy + R[7] * vz),
    z: scale * (R[2] * vx + R[5] * vy + R[8] * vz)
  };
}

/**
 * Trilinear interpolation in 4D matrix
 */
function trilinearInterpolate(matrix, resolution, x, y, z, w) {
  // Clamp to valid range
  const maxVal = resolution - 1;
  const x0 = Math.max(0, Math.min(maxVal, Math.floor(x)));
  const y0 = Math.max(0, Math.min(maxVal, Math.floor(y)));
  const z0 = Math.max(0, Math.min(maxVal, Math.floor(z)));
  const w0 = Math.max(0, Math.min(maxVal, Math.floor(w)));

  const x1 = Math.min(maxVal, x0 + 1);
  const y1 = Math.min(maxVal, y0 + 1);
  const z1 = Math.min(maxVal, z0 + 1);
  const w1 = Math.min(maxVal, w0 + 1);

  const tx = x - x0;
  const ty = y - y0;
  const tz = z - z0;
  const tw = w - w0;

  // Helper to get matrix value at integer coordinates (w, z, y, x order matches matrix layout)
  const get = (wIdx, zIdx, yIdx, xIdx) => {
    const idx = (wIdx * resolution * resolution * resolution +
                 zIdx * resolution * resolution +
                 yIdx * resolution +
                 xIdx) * 4;
    return { r: matrix[idx], g: matrix[idx + 1], b: matrix[idx + 2], a: matrix[idx + 3] };
  };

  // Interpolate in x direction
  const c000 = get(w0, z0, y0, x0);
  const c001 = get(w0, z0, y0, x1);
  const c010 = get(w0, z0, y1, x0);
  const c011 = get(w0, z0, y1, x1);
  const c100 = get(w0, z1, y0, x0);
  const c101 = get(w0, z1, y0, x1);
  const c110 = get(w0, z1, y1, x0);
  const c111 = get(w0, z1, y1, x1);

  const c00 = {
    r: c000.r + (c001.r - c000.r) * tx,
    g: c000.g + (c001.g - c000.g) * tx,
    b: c000.b + (c001.b - c000.b) * tx,
    a: c000.a + (c001.a - c000.a) * tx
  };
  const c01 = {
    r: c010.r + (c011.r - c010.r) * tx,
    g: c010.g + (c011.g - c010.g) * tx,
    b: c010.b + (c011.b - c010.b) * tx,
    a: c010.a + (c011.a - c010.a) * tx
  };
  const c10 = {
    r: c100.r + (c101.r - c100.r) * tx,
    g: c100.g + (c101.g - c100.g) * tx,
    b: c100.b + (c101.b - c100.b) * tx,
    a: c100.a + (c101.a - c100.a) * tx
  };
  const c11 = {
    r: c110.r + (c111.r - c110.r) * tx,
    g: c110.g + (c111.g - c110.g) * tx,
    b: c110.b + (c111.b - c110.b) * tx,
    a: c110.a + (c111.a - c110.a) * tx
  };

  // Interpolate in y direction
  const c0 = {
    r: c00.r + (c01.r - c00.r) * ty,
    g: c00.g + (c01.g - c00.g) * ty,
    b: c00.b + (c01.b - c00.b) * ty,
    a: c00.a + (c01.a - c00.a) * ty
  };
  const c1 = {
    r: c10.r + (c11.r - c10.r) * ty,
    g: c10.g + (c11.g - c10.g) * ty,
    b: c10.b + (c11.b - c10.b) * ty,
    a: c10.a + (c11.a - c10.a) * ty
  };

  // Interpolate in z direction
  const c = {
    r: c0.r + (c1.r - c0.r) * tz,
    g: c0.g + (c1.g - c0.g) * tz,
    b: c0.b + (c1.b - c0.b) * tz,
    a: c0.a + (c1.a - c0.a) * tz
  };

  // Interpolate in w direction
  return {
    r: c.r + (c1.r - c0.r) * tw,
    g: c.g + (c1.g - c0.g) * tw,
    b: c.b + (c1.b - c0.b) * tw,
    a: c.a + (c1.a - c0.a) * tw
  };
}

/**
 * Extract 2D slice (plane) at specific indices for any two axes
 * @param {Float32Array} matrix - 4D matrix
 * @param {number} resolution - Resolution
 * @param {string[]} sliceAxes - Array of two slice axes
 * @param {Object} sliceValues - Map of slice axis to slice value
 * @param {number} dimensions - Resulting dimensions (2)
 * @param {number[]} [rotationMatrix] - Optional 3x3 rotation matrix (column-major)
 */
function extract2DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions, rotationMatrix = null) {
  // If no rotation, use fast path
  if (!rotationMatrix) {
    return extract2DSliceFast(matrix, resolution, sliceAxes, sliceValues, dimensions);
  }

  // With rotation: this is more complex for 2D slices
  // For now, fall back to fast path (rotation typically used with single-axis slices)
  return extract2DSliceFast(matrix, resolution, sliceAxes, sliceValues, dimensions);
}

/**
 * Fast path for 2D slice without rotation
 */
function extract2DSliceFast(matrix, resolution, sliceAxes, sliceValues, dimensions) {
  const sliceData = new Float32Array(Math.pow(resolution, 2) * 4);

  // Get the two free axes
  const axes = ['x', 'y', 'z', 'w'];
  const freeAxes = axes.filter(axis => !sliceAxes.includes(axis));

  // Create a map from slice axes to their fixed values
  const sliceValuesMap = {};
  sliceAxes.forEach(axis => {
    sliceValuesMap[axis] = sliceValues[axis];
  });

  // Iterate over the two free dimensions
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      // Map indices to axes
      const axisIndices = { ...sliceValuesMap };
      axisIndices[freeAxes[0]] = i;
      axisIndices[freeAxes[1]] = j;

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

  return { data: sliceData, dimensions, sliceAxes, freeAxes, sliceValues: sliceValuesMap };
}

/**
 * Extract 1D slice (line) at specific indices for any three axes
 * @param {Float32Array} matrix - 4D matrix
 * @param {number} resolution - Resolution
 * @param {string[]} sliceAxes - Array of three slice axes
 * @param {Object} sliceValues - Map of slice axis to slice value
 * @param {number} dimensions - Resulting dimensions (1)
 * @param {number[]} [rotationMatrix] - Optional 3x3 rotation matrix (column-major)
 */
function extract1DSlice(matrix, resolution, sliceAxes, sliceValues, dimensions, rotationMatrix = null) {
  // 1D slices with rotation are complex, fall back to fast path
  return extract1DSliceFast(matrix, resolution, sliceAxes, sliceValues, dimensions);
}

/**
 * Fast path for 1D slice without rotation
 */
function extract1DSliceFast(matrix, resolution, sliceAxes, sliceValues, dimensions) {
  const sliceData = new Float32Array(resolution * 4);

  // Get the single free axis
  const axes = ['x', 'y', 'z', 'w'];
  const freeAxes = axes.filter(axis => !sliceAxes.includes(axis));

  // Create a map from slice axes to their fixed values
  const sliceValuesMap1D = {};
  sliceAxes.forEach(axis => {
    sliceValuesMap1D[axis] = sliceValues[axis];
  });

  // Iterate over the single free dimension
  for (let i = 0; i < resolution; i++) {
    const axisIndices = { ...sliceValuesMap1D };
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

  return { data: sliceData, dimensions, sliceAxes, freeAxes, sliceValues: sliceValuesMap1D };
}