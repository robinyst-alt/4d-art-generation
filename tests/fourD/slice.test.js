/**
 * Multi-Axis Slice Extraction Tests
 *
 * Test suite for extracting slices based on quadrant state
 * - 1 slice axis: 3D result
 * - 2 slice axes: 2D result
 * - 3 slice axes: 1D result
 */

import {
  extractSlice,
  extractMultipleSlices,
  toThreePoints
} from '../../js/fourD/slice.js';
import {
  createQuadrantState,
  setAxisMode,
  setSliceValue,
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

describe('4D Slice Extraction', () => {
  describe('extractSlice', () => {
    test('should extract a 3D slice at w=0', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      // Fill with gradient pattern
      for (let w = 0; w < resolution; w++) {
        for (let z = 0; z < resolution; z++) {
          for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
              const index = (w * resolution * resolution * resolution +
                           z * resolution * resolution +
                           y * resolution +
                           x) * 4;
              matrix[index] = w * 0.25;
              matrix[index + 1] = z * 0.25;
              matrix[index + 2] = y * 0.25;
              matrix[index + 3] = 1;
            }
          }
        }
      }

      const slice = extractSlice(matrix, resolution, 0);

      expect(slice).toBeInstanceOf(Float32Array);
      expect(slice.length).toBe(Math.pow(resolution, 3) * 4);
    });

    test('should extract a 3D slice at w=2', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      const slice = extractSlice(matrix, resolution, 2);

      expect(slice).toBeInstanceOf(Float32Array);
      expect(slice.length).toBe(Math.pow(resolution, 3) * 4);
    });

    test('should handle boundary w values', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      const slice0 = extractSlice(matrix, resolution, 0);
      expect(slice0).toBeInstanceOf(Float32Array);

      const sliceLast = extractSlice(matrix, resolution, resolution - 1);
      expect(sliceLast).toBeInstanceOf(Float32Array);
    });

    test('should throw for out-of-range w index', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      expect(() => extractSlice(matrix, resolution, -1)).toThrow();
      expect(() => extractSlice(matrix, resolution, 4)).toThrow();
    });
  });

  describe('extractMultipleSlices', () => {
    test('should extract multiple slices across a w range', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      const slices = extractMultipleSlices(matrix, resolution, [0, 2]);

      expect(slices).toBeInstanceOf(Array);
      expect(slices.length).toBe(3); // 0, 1, 2 inclusive
      expect(slices[0]).toBeInstanceOf(Float32Array);
      expect(slices[0].length).toBe(Math.pow(resolution, 3) * 4);
    });

    test('should return empty array when start > end', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      const slices = extractMultipleSlices(matrix, resolution, [5, 2]);

      expect(slices).toBeInstanceOf(Array);
      expect(slices.length).toBe(0);
    });

    test('should throw for undefined wRange', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      expect(() => extractMultipleSlices(matrix, resolution, undefined)).toThrow();
    });

    test('should throw for invalid wRange format', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      expect(() => extractMultipleSlices(matrix, resolution, [1])).toThrow();
      expect(() => extractMultipleSlices(matrix, resolution, null)).toThrow();
      expect(() => extractMultipleSlices(matrix, resolution, 'not array')).toThrow();
    });
  });

  describe('extractMultiAxisSlice', () => {
    test('should extract 3D slice when only w is slice (default state)', () => {
      const resolution = 4;
      const state = createQuadrantState();
      const matrix = createMock4DMatrix(resolution);

      // Override state resolution to match matrix
      state.axes.x.resolution = resolution;
      state.axes.y.resolution = resolution;
      state.axes.z.resolution = resolution;
      state.axes.w.resolution = resolution;

      const result = extractMultiAxisSlice(matrix, state);

      expect(result).toBeDefined();
      expect(result.dimensions).toBe(3);
      expect(result.data.length).toBe(Math.pow(resolution, 3) * 4);
    });

    test('should extract 2D slice when w and y are slice', () => {
      const resolution = 4;
      let state = createQuadrantState();
      state.axes.x.resolution = resolution;
      state.axes.y.resolution = resolution;
      state.axes.z.resolution = resolution;
      state.axes.w.resolution = resolution;

      state = setAxisMode(state, 'y', 'slice');
      state = setSliceValue(state, 'y', 2);

      const matrix = createMock4DMatrix(resolution);
      const result = extractMultiAxisSlice(matrix, state);

      expect(result.dimensions).toBe(2);
      expect(result.data.length).toBe(Math.pow(resolution, 2) * 4);
    });

    test('should extract 1D slice when w, y, z are slice', () => {
      const resolution = 4;
      let state = createQuadrantState();
      state.axes.x.resolution = resolution;
      state.axes.y.resolution = resolution;
      state.axes.z.resolution = resolution;
      state.axes.w.resolution = resolution;

      state = setAxisMode(state, 'y', 'slice');
      state = setAxisMode(state, 'z', 'slice');
      state = setSliceValue(state, 'y', 2);
      state = setSliceValue(state, 'z', 1);

      const matrix = createMock4DMatrix(resolution);
      const result = extractMultiAxisSlice(matrix, state);

      expect(result.dimensions).toBe(1);
      expect(result.data.length).toBe(resolution * 4);
    });

    test('should include sliceAxes and freeAxes in result', () => {
      const resolution = 4;
      let state = createQuadrantState();
      state.axes.x.resolution = resolution;
      state.axes.y.resolution = resolution;
      state.axes.z.resolution = resolution;
      state.axes.w.resolution = resolution;

      state = setAxisMode(state, 'y', 'slice');

      const matrix = createMock4DMatrix(resolution);
      const result = extractMultiAxisSlice(matrix, state);

      expect(result.sliceAxes).toBeDefined();
      expect(result.freeAxes).toBeDefined();
      expect(result.sliceAxes).toContain('w');
      expect(result.sliceAxes).toContain('y');
      expect(result.freeAxes).toContain('x');
      expect(result.freeAxes).toContain('z');
    });

    test('should throw error when no axes are slice', () => {
      // Create a state with all axes free (impossible via normal API)
      const state = {
        axes: {
          x: { mode: 'free', sliceValue: 12, resolution: 4 },
          y: { mode: 'free', sliceValue: 12, resolution: 4 },
          z: { mode: 'free', sliceValue: 12, resolution: 4 },
          w: { mode: 'free', sliceValue: 12, resolution: 4 }
        }
      };
      const matrix = createMock4DMatrix(4);

      expect(() => extractMultiAxisSlice(matrix, state)).toThrow();
    });
  });

  describe('toThreePoints', () => {
    test('should convert 3D slice data to Three.js points format', () => {
      const resolution = 4;
      const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

      for (let z = 0; z < resolution; z++) {
        for (let y = 0; y < resolution; y++) {
          for (let x = 0; x < resolution; x++) {
            const index = (z * resolution * resolution + y * resolution + x) * 4;
            sliceData[index] = x / resolution;
            sliceData[index + 1] = y / resolution;
            sliceData[index + 2] = z / resolution;
            sliceData[index + 3] = 1;
          }
        }
      }

      const points = toThreePoints(sliceData, resolution);

      expect(points).toBeDefined();
      expect(points.positions).toBeInstanceOf(Float32Array);
      expect(points.colors).toBeInstanceOf(Float32Array);
    });

    test('should filter out zero-alpha points', () => {
      const resolution = 4;
      const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

      for (let i = 0; i < sliceData.length; i += 4) {
        sliceData[i] = 1;
        sliceData[i + 1] = 1;
        sliceData[i + 2] = 1;
        sliceData[i + 3] = 0;
      }
      sliceData[3] = 1;
      sliceData[7] = 1;
      sliceData[11] = 1;

      const points = toThreePoints(sliceData, resolution);

      expect(points.positions.length / 3).toBe(3);
    });
  });
});

describe('Slice Dimensionality', () => {
  test('should return 3D for 1 slice axis', () => {
    const resolution = 4;
    const state = createQuadrantState();
    state.axes.x.resolution = resolution;
    state.axes.y.resolution = resolution;
    state.axes.z.resolution = resolution;
    state.axes.w.resolution = resolution;

    const matrix = createMock4DMatrix(resolution);
    const result = extractMultiAxisSlice(matrix, state);

    expect(result.dimensions).toBe(3);
  });

  test('should return 2D for 2 slice axes', () => {
    const resolution = 4;
    let state = createQuadrantState();
    state.axes.x.resolution = resolution;
    state.axes.y.resolution = resolution;
    state.axes.z.resolution = resolution;
    state.axes.w.resolution = resolution;

    state = setAxisMode(state, 'y', 'slice');

    const matrix = createMock4DMatrix(resolution);
    const result = extractMultiAxisSlice(matrix, state);

    expect(result.dimensions).toBe(2);
  });

  test('should return 1D for 3 slice axes', () => {
    const resolution = 4;
    let state = createQuadrantState();
    state.axes.x.resolution = resolution;
    state.axes.y.resolution = resolution;
    state.axes.z.resolution = resolution;
    state.axes.w.resolution = resolution;

    state = setAxisMode(state, 'y', 'slice');
    state = setAxisMode(state, 'z', 'slice');

    const matrix = createMock4DMatrix(resolution);
    const result = extractMultiAxisSlice(matrix, state);

    expect(result.dimensions).toBe(1);
  });
});