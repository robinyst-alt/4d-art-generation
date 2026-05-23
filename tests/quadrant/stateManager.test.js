/**
 * Quadrant State Management Tests
 *
 * Test suite for four-axis slice/free control
 * - Default state: w=0 slice, xyz free
 * - Mode switching (slice/free)
 * - Constraint: at least 1 slice axis
 * - Slice value range [0-23]
 */

import {
  createQuadrantState,
  setAxisMode,
  setSliceValue,
  getSliceAxes,
  getFreeAxes,
  canSetAxisToFree,
  extractMultiAxisSlice
} from '../../js/quadrant/stateManager.js';

// Mock 4D matrix for slice extraction tests
function createMock4DMatrix(resolution = 24) {
  const matrix = new Float32Array(Math.pow(resolution, 4) * 4);
  // Fill with gradient pattern for verification
  for (let w = 0; w < resolution; w++) {
    for (let z = 0; z < resolution; z++) {
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const index = (w * resolution * resolution * resolution +
                       z * resolution * resolution +
                       y * resolution +
                       x) * 4;
          matrix[index] = w / resolution;     // R = w value
          matrix[index + 1] = z / resolution; // G = z value
          matrix[index + 2] = y / resolution; // B = y value
          matrix[index + 3] = 1;              // A = 1
        }
      }
    }
  }
  return matrix;
}

describe('Quadrant State Management', () => {
  describe('createQuadrantState', () => {
    test('should create state with default values', () => {
      const state = createQuadrantState();

      expect(state.axes.x.mode).toBe('free');
      expect(state.axes.y.mode).toBe('free');
      expect(state.axes.z.mode).toBe('free');
      expect(state.axes.w.mode).toBe('slice');

      expect(state.axes.x.sliceValue).toBe(12);
      expect(state.axes.y.sliceValue).toBe(12);
      expect(state.axes.z.sliceValue).toBe(12);
      expect(state.axes.w.sliceValue).toBe(12);

      expect(state.axes.x.resolution).toBe(24);
      expect(state.axes.y.resolution).toBe(24);
      expect(state.axes.z.resolution).toBe(24);
      expect(state.axes.w.resolution).toBe(24);
    });

    test('should create independent copies for each axis', () => {
      const state1 = createQuadrantState();
      const state2 = createQuadrantState();

      // Modifying state1 should not affect state2
      state1.axes.w.sliceValue = 10;
      expect(state2.axes.w.sliceValue).toBe(12); // Default slice value is 12
    });
  });

  describe('setAxisMode', () => {
    test('should set axis to slice mode', () => {
      const state = createQuadrantState();
      const newState = setAxisMode(state, 'x', 'slice');

      expect(newState.axes.x.mode).toBe('slice');
      expect(newState.axes.x.sliceValue).toBe(12); // Default slice value
    });

    test('should set axis to free mode when other slices exist', () => {
      // First set x to slice so w can become free
      const state = createQuadrantState();
      let newState = setAxisMode(state, 'x', 'slice');
      expect(newState.axes.x.mode).toBe('slice');

      // Now w can become free since x is also slice
      newState = setAxisMode(newState, 'w', 'free');
      expect(newState.axes.w.mode).toBe('free');
    });

    test('should prevent setting last slice axis to free', () => {
      const state = createQuadrantState();
      // Only w is slice, cannot set it to free
      const newState = setAxisMode(state, 'w', 'free');

      // Should return same state (constraint violated)
      expect(newState.axes.w.mode).toBe('slice');
    });

    test('should allow setting free axis to slice', () => {
      const state = createQuadrantState();
      const newState = setAxisMode(state, 'x', 'slice');

      expect(newState.axes.x.mode).toBe('slice');
    });

    test('should allow setting slice axis to free when other slices exist', () => {
      const state = createQuadrantState();
      // First add another slice axis
      let newState = setAxisMode(state, 'x', 'slice');
      expect(newState.axes.x.mode).toBe('slice');

      // Now w should be able to become free since x is also slice
      newState = setAxisMode(newState, 'w', 'free');
      expect(newState.axes.w.mode).toBe('free');
    });
  });

  describe('setSliceValue', () => {
    test('should set slice value within valid range', () => {
      const state = createQuadrantState();
      const newState = setSliceValue(state, 'w', 15);

      expect(newState.axes.w.sliceValue).toBe(15);
    });

    test('should clamp value to maximum', () => {
      const state = createQuadrantState();
      const newState = setSliceValue(state, 'w', 30);

      expect(newState.axes.w.sliceValue).toBe(23);
    });

    test('should clamp value to minimum', () => {
      const state = createQuadrantState();
      const newState = setSliceValue(state, 'w', -5);

      expect(newState.axes.w.sliceValue).toBe(0);
    });

    test('should floor decimal values', () => {
      const state = createQuadrantState();
      const newState = setSliceValue(state, 'w', 7.8);

      expect(newState.axes.w.sliceValue).toBe(7);
    });

    test('should work for free axis values (visual only)', () => {
      const state = createQuadrantState();
      const newState = setSliceValue(state, 'x', 5);

      // Free axis value can also be set
      expect(newState.axes.x.sliceValue).toBe(5);
    });
  });

  describe('getSliceAxes', () => {
    test('should return only w in default state', () => {
      const state = createQuadrantState();
      const sliceAxes = getSliceAxes(state);

      expect(sliceAxes).toContain('w');
      expect(sliceAxes).toHaveLength(1);
      expect(sliceAxes).not.toContain('x');
      expect(sliceAxes).not.toContain('y');
      expect(sliceAxes).not.toContain('z');
    });

    test('should return multiple slice axes', () => {
      let state = createQuadrantState();
      state = setAxisMode(state, 'x', 'slice');
      state = setAxisMode(state, 'y', 'slice');

      const sliceAxes = getSliceAxes(state);

      expect(sliceAxes).toHaveLength(3);
      expect(sliceAxes).toContain('w');
      expect(sliceAxes).toContain('x');
      expect(sliceAxes).toContain('y');
    });
  });

  describe('getFreeAxes', () => {
    test('should return xyz in default state', () => {
      const state = createQuadrantState();
      const freeAxes = getFreeAxes(state);

      expect(freeAxes).toHaveLength(3);
      expect(freeAxes).toContain('x');
      expect(freeAxes).toContain('y');
      expect(freeAxes).toContain('z');
      expect(freeAxes).not.toContain('w');
    });

    test('should return single axis when 3 are slice', () => {
      // Set x, y, z to slice, w stays as slice by default
      // So all 4 are slice, meaning no free axes
      // The "free" axis in this case is for view rotation, not slice
      // Let's test with just x, y as slice (w is also slice by default)
      let state = createQuadrantState();
      state = setAxisMode(state, 'x', 'slice');
      state = setAxisMode(state, 'y', 'slice');
      // Now slice axes: w, x, y = 3 slices
      // Free axis: z

      const freeAxes = getFreeAxes(state);

      expect(freeAxes).toHaveLength(1);
      expect(freeAxes).toContain('z');
    });
  });

  describe('canSetAxisToFree', () => {
    test('should return false for last slice axis', () => {
      const state = createQuadrantState();
      // Only w is slice
      expect(canSetAxisToFree(state, 'w')).toBe(false);
    });

    test('should return true for non-last slice axis', () => {
      let state = createQuadrantState();
      state = setAxisMode(state, 'x', 'slice');

      // Now w and x are both slice, so either could be freed
      expect(canSetAxisToFree(state, 'w')).toBe(true);
      expect(canSetAxisToFree(state, 'x')).toBe(true);
    });
  });

  describe('extractMultiAxisSlice', () => {
    // Helper to create state with specific resolution
    function createStateWithResolution(res) {
      const state = createQuadrantState();
      return {
        axes: {
          x: { mode: state.axes.x.mode, sliceValue: state.axes.x.sliceValue, resolution: res },
          y: { mode: state.axes.y.mode, sliceValue: state.axes.y.sliceValue, resolution: res },
          z: { mode: state.axes.z.mode, sliceValue: state.axes.z.sliceValue, resolution: res },
          w: { mode: state.axes.w.mode, sliceValue: state.axes.w.sliceValue, resolution: res }
        }
      };
    }

    test('should extract 3D slice when only w is slice', () => {
      const resolution = 4;
      const state = createStateWithResolution(resolution);
      const matrix = createMock4DMatrix(resolution);

      const result = extractMultiAxisSlice(matrix, state);

      expect(result).toBeDefined();
      expect(result.dimensions).toBe(3);
      // Should be 4x4x4 slice (4^3 points * 4 components = 256)
      expect(result.data.length).toBe(Math.pow(resolution, 3) * 4);
    });

    test('should extract 2D slice when w and y are slice', () => {
      const resolution = 4;
      let state = createStateWithResolution(resolution);
      state = setAxisMode(state, 'y', 'slice');
      state = setSliceValue(state, 'y', 2);
      const matrix = createMock4DMatrix(resolution);

      const result = extractMultiAxisSlice(matrix, state);

      expect(result).toBeDefined();
      expect(result.dimensions).toBe(2);
      // Should be 4x4 slice (4^2 points * 4 components = 64)
      expect(result.data.length).toBe(Math.pow(resolution, 2) * 4);
    });

    test('should extract 1D slice when w, y, z are slice', () => {
      const resolution = 4;
      let state = createStateWithResolution(resolution);
      state = setAxisMode(state, 'y', 'slice');
      state = setAxisMode(state, 'z', 'slice');
      state = setSliceValue(state, 'y', 2);
      state = setSliceValue(state, 'z', 1);
      const matrix = createMock4DMatrix(resolution);

      const result = extractMultiAxisSlice(matrix, state);

      expect(result).toBeDefined();
      expect(result.dimensions).toBe(1);
      // Should be 4x1 line (4 points * 4 components = 16)
      expect(result.data.length).toBe(resolution * 4);
    });

    test('should throw error when no axes are slice', () => {
      // Create a state with all axes free (impossible via normal API)
      const state = {
        axes: {
          x: { mode: 'free', sliceValue: 12, resolution: 24 },
          y: { mode: 'free', sliceValue: 12, resolution: 24 },
          z: { mode: 'free', sliceValue: 12, resolution: 24 },
          w: { mode: 'free', sliceValue: 12, resolution: 24 }
        }
      };
      const matrix = createMock4DMatrix(4);

      expect(() => extractMultiAxisSlice(matrix, state)).toThrow();
    });
  });
});

describe('Quadrant State Immutability', () => {
  test('setAxisMode should not mutate original state', () => {
    const state = createQuadrantState();
    const originalWMode = state.axes.w.mode;

    setAxisMode(state, 'x', 'slice');

    expect(state.axes.w.mode).toBe(originalWMode);
  });

  test('setSliceValue should not mutate original state', () => {
    const state = createQuadrantState();
    const originalWValue = state.axes.w.sliceValue;

    setSliceValue(state, 'w', 20);

    expect(state.axes.w.sliceValue).toBe(originalWValue);
  });
});

describe('Edge Cases', () => {
  test('should handle axis parameter validation', () => {
    const state = createQuadrantState();

    expect(() => setAxisMode(state, 'invalid', 'slice')).toThrow();
    expect(() => setSliceValue(state, 'invalid', 5)).toThrow();
  });

  test('should handle mode parameter validation', () => {
    const state = createQuadrantState();

    expect(() => setAxisMode(state, 'x', 'invalid')).toThrow();
  });

  test('should return correct dimensions for all slice combinations', () => {
      // Create state with resolution=4 to match matrix
      const createTestState = (sliceAxesConfig) => ({
        axes: {
          x: { mode: sliceAxesConfig.x || 'free', sliceValue: 12, resolution: 4 },
          y: { mode: sliceAxesConfig.y || 'free', sliceValue: 12, resolution: 4 },
          z: { mode: sliceAxesConfig.z || 'free', sliceValue: 12, resolution: 4 },
          w: { mode: sliceAxesConfig.w || 'slice', sliceValue: 0, resolution: 4 }
        }
      });

      // 1 slice: 3D (only w is slice)
      let state = createTestState({ w: 'slice' });
      let result = extractMultiAxisSlice(createMock4DMatrix(4), state);
      expect(result.dimensions).toBe(3);

      // 2 slices: 2D (w and y are slice)
      state = createTestState({ w: 'slice', y: 'slice' });
      result = extractMultiAxisSlice(createMock4DMatrix(4), state);
      expect(result.dimensions).toBe(2);

      // 3 slices: 1D (w, y, z are slice)
      state = createTestState({ w: 'slice', y: 'slice', z: 'slice' });
      result = extractMultiAxisSlice(createMock4DMatrix(4), state);
      expect(result.dimensions).toBe(1);
    });

    test('should support x axis as single slice', () => {
      const createTestState = () => ({
        axes: {
          x: { mode: 'slice', sliceValue: 2, resolution: 4 },
          y: { mode: 'free', sliceValue: 12, resolution: 4 },
          z: { mode: 'free', sliceValue: 12, resolution: 4 },
          w: { mode: 'free', sliceValue: 12, resolution: 4 }
        }
      });

      const state = createTestState();
      const result = extractMultiAxisSlice(createMock4DMatrix(4), state);

      expect(result.dimensions).toBe(3);
      expect(result.sliceAxes).toContain('x');
      expect(result.freeAxes).toContain('y');
      expect(result.freeAxes).toContain('z');
      expect(result.freeAxes).toContain('w');
    });

    test('should support y axis as single slice', () => {
      const createTestState = () => ({
        axes: {
          x: { mode: 'free', sliceValue: 12, resolution: 4 },
          y: { mode: 'slice', sliceValue: 2, resolution: 4 },
          z: { mode: 'free', sliceValue: 12, resolution: 4 },
          w: { mode: 'free', sliceValue: 12, resolution: 4 }
        }
      });

      const state = createTestState();
      const result = extractMultiAxisSlice(createMock4DMatrix(4), state);

      expect(result.dimensions).toBe(3);
      expect(result.sliceAxes).toContain('y');
    });

    test('should support z axis as single slice', () => {
      const createTestState = () => ({
        axes: {
          x: { mode: 'free', sliceValue: 12, resolution: 4 },
          y: { mode: 'free', sliceValue: 12, resolution: 4 },
          z: { mode: 'slice', sliceValue: 2, resolution: 4 },
          w: { mode: 'free', sliceValue: 12, resolution: 4 }
        }
      });

      const state = createTestState();
      const result = extractMultiAxisSlice(createMock4DMatrix(4), state);

      expect(result.dimensions).toBe(3);
      expect(result.sliceAxes).toContain('z');
    });

    test('should support x and z as 2D slice combination', () => {
      const createTestState = () => ({
        axes: {
          x: { mode: 'slice', sliceValue: 2, resolution: 4 },
          y: { mode: 'free', sliceValue: 12, resolution: 4 },
          z: { mode: 'slice', sliceValue: 1, resolution: 4 },
          w: { mode: 'free', sliceValue: 12, resolution: 4 }
        }
      });

      const state = createTestState();
      const result = extractMultiAxisSlice(createMock4DMatrix(4), state);

      expect(result.dimensions).toBe(2);
      expect(result.sliceAxes).toContain('x');
      expect(result.sliceAxes).toContain('z');
      expect(result.freeAxes).toContain('y');
      expect(result.freeAxes).toContain('w');
    });
});