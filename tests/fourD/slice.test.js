/**
 * 4D Slice Tests
 *
 * Test suite for extracting 3D slices from 4D matrices
 */

import {
  extractSlice,
  extractMultipleSlices,
  toThreePoints
} from '../../js/fourD/slice.js';

describe('4D Slice Extraction', () => {
  describe('extractSlice', () => {
    test('should extract a 3D slice at w=0', () => {
      // Create a simple 4D matrix (4x4x4x4) with some values
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
              matrix[index] = w * 0.25; // R = w value
              matrix[index + 1] = z * 0.25; // G = z value
              matrix[index + 2] = y * 0.25; // B = y value
              matrix[index + 3] = 1; // A = 1
            }
          }
        }
      }

      const slice = extractSlice(matrix, resolution, 0);

      // 3D slice should be resolution^3 * 4 (RGBA)
      const expectedLength = Math.pow(resolution, 3) * 4;
      expect(slice).toBeInstanceOf(Float32Array);
      expect(slice.length).toBe(expectedLength);
    });

    test('should extract a 3D slice at w=2', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      const slice = extractSlice(matrix, resolution, 2);

      const expectedLength = Math.pow(resolution, 3) * 4;
      expect(slice).toBeInstanceOf(Float32Array);
      expect(slice.length).toBe(expectedLength);
    });

    test('should extract slice with correct w dimension value', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      // Fill with w-specific values
      const targetW = 2;
      for (let w = 0; w < resolution; w++) {
        for (let z = 0; z < resolution; z++) {
          for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
              const index = (w * resolution * resolution * resolution +
                           z * resolution * resolution +
                           y * resolution +
                           x) * 4;
              matrix[index] = w === targetW ? 1.0 : 0.0;
              matrix[index + 1] = 0;
              matrix[index + 2] = 0;
              matrix[index + 3] = 1;
            }
          }
        }
      }

      const slice = extractSlice(matrix, resolution, targetW);

      // All values should be 1 (from w=2 layer)
      let nonZeroCount = 0;
      for (let i = 0; i < slice.length; i += 4) {
        if (slice[i] > 0) nonZeroCount++;
      }
      expect(nonZeroCount).toBe(Math.pow(resolution, 3));
    });

    test('should handle boundary w values', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);

      // w = 0
      const slice0 = extractSlice(matrix, resolution, 0);
      expect(slice0).toBeInstanceOf(Float32Array);

      // w = resolution - 1
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
    test('should extract multiple slices in range', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);
      const wRange = [0, 2]; // w=0, w=1, w=2

      const slices = extractMultipleSlices(matrix, resolution, wRange);

      expect(slices).toHaveLength(3); // w=0, w=1, w=2

      for (const slice of slices) {
        expect(slice).toBeInstanceOf(Float32Array);
        expect(slice.length).toBe(Math.pow(resolution, 3) * 4);
      }
    });

    test('should return empty array for empty range', () => {
      const resolution = 4;
      const matrix = new Float32Array(Math.pow(resolution, 4) * 4);
      const wRange = [1, 0]; // Invalid range

      const slices = extractMultipleSlices(matrix, resolution, wRange);
      expect(slices).toHaveLength(0);
    });
  });

  describe('toThreePoints', () => {
    test('should convert slice data to Three.js points format', () => {
      const resolution = 4;
      const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

      // Fill with some gradient data
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

    test('should have same number of positions and color values', () => {
      const resolution = 8;
      const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

      const points = toThreePoints(sliceData, resolution);

      // 3 position components (x, y, z) per point
      expect(points.positions.length / 3).toBe(points.colors.length / 4);
    });

    test('should filter out zero-alpha points', () => {
      const resolution = 4;
      const sliceData = new Float32Array(Math.pow(resolution, 3) * 4);

      // Set most values to alpha=0 (invisible)
      for (let i = 0; i < sliceData.length; i += 4) {
        sliceData[i] = 1;
        sliceData[i + 1] = 1;
        sliceData[i + 2] = 1;
        sliceData[i + 3] = 0; // Invisible
      }

      // Set only a few points to visible
      sliceData[3] = 1;
      sliceData[7] = 1;
      sliceData[11] = 1;

      const points = toThreePoints(sliceData, resolution);

      // Should only have 3 visible points
      expect(points.positions.length / 3).toBe(3);
    });
  });
});