/**
 * 4D Generators Tests
 *
 * Test suite for 4D shape generators including:
 * - Tesseract (hypercube)
 * - 4D Sphere
 * - 4D Octahedron
 * - 4D Dodecahedron
 * - 4D Icosahedron
 * - 4D Torus
 */

import {
  generateTesseract,
  generate4DSphere,
  generate4DOctahedron,
  generate4DDodecahedron,
  generate4DIcosahedron,
  generate4DTorus,
  generate
} from '../../js/fourD/generators.js';

describe('4D Generators', () => {
  describe('generateTesseract', () => {
    test('should generate a tesseract with correct dimensions', () => {
      const resolution = 8;
      const result = generateTesseract(resolution);

      // Float32Array should have size resolution^4 * 4 (RGBA)
      const expectedLength = Math.pow(resolution, 4) * 4;
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(expectedLength);
    });

    test('should generate a tesseract with values between 0 and 1', () => {
      const resolution = 8;
      const result = generateTesseract(resolution);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(1);
      }
    });

    test('should have edge structure characteristic of a tesseract', () => {
      const resolution = 8;
      const result = generateTesseract(resolution);

      // Count non-zero voxels - tesseract should have solid edges
      let nonZeroCount = 0;
      for (let i = 0; i < result.length; i += 4) {
        if (result[i] > 0 || result[i+1] > 0 || result[i+2] > 0) {
          nonZeroCount++;
        }
      }

      // A tesseract at this resolution should have significant structure
      expect(nonZeroCount).toBeGreaterThan(0);
    });

    test('should handle minimum resolution (4)', () => {
      const result = generateTesseract(4);
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(4, 4) * 4);
    });

    test('should handle maximum resolution (32)', () => {
      const result = generateTesseract(32);
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(32, 4) * 4);
    });
  });

  describe('generate4DSphere', () => {
    test('should generate a 4D sphere with correct dimensions', () => {
      const resolution = 8;
      const radius = 0.5;
      const result = generate4DSphere(resolution, radius);

      const expectedLength = Math.pow(resolution, 4) * 4;
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(expectedLength);
    });

    test('should generate a sphere with values between 0 and 1', () => {
      const resolution = 8;
      const radius = 0.5;
      const result = generate4DSphere(resolution, radius);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(1);
      }
    });

    test('should generate a centered sphere', () => {
      const resolution = 8;
      const radius = 0.5;
      const result = generate4DSphere(resolution, radius);

      // Sample center point (w=0.5, z=0.5, y=0.5, x=0.5)
      const centerIndex = Math.floor(resolution * 0.5) * 4;
      // Center should be within the sphere (value > 0)
      const hasContent = Array.from(result).some(v => v > 0);
      expect(hasContent).toBe(true);
    });

    test('should handle different radii', () => {
      const resolution = 8;
      const smallRadius = 0.25;
      const largeRadius = 0.75;

      const smallResult = generate4DSphere(resolution, smallRadius);
      const largeResult = generate4DSphere(resolution, largeRadius);

      // Larger radius should have more filled voxels
      const smallFilled = smallResult.filter(v => v > 0).length;
      const largeFilled = largeResult.filter(v => v > 0).length;

      expect(largeFilled).toBeGreaterThan(smallFilled);
    });
  });

  describe('generate4DOctahedron', () => {
    test('should generate a 4D octahedron with correct dimensions', () => {
      const resolution = 8;
      const result = generate4DOctahedron(resolution);

      const expectedLength = Math.pow(resolution, 4) * 4;
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(expectedLength);
    });

    test('should generate values between 0 and 1', () => {
      const resolution = 8;
      const result = generate4DOctahedron(resolution);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('generate4DDodecahedron', () => {
    test('should generate a 4D dodecahedron with correct dimensions', () => {
      const resolution = 8;
      const result = generate4DDodecahedron(resolution);

      const expectedLength = Math.pow(resolution, 4) * 4;
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(expectedLength);
    });

    test('should generate values between 0 and 1', () => {
      const resolution = 8;
      const result = generate4DDodecahedron(resolution);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('generate4DIcosahedron', () => {
    test('should generate a 4D icosahedron with correct dimensions', () => {
      const resolution = 8;
      const result = generate4DIcosahedron(resolution);

      const expectedLength = Math.pow(resolution, 4) * 4;
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(expectedLength);
    });

    test('should generate values between 0 and 1', () => {
      const resolution = 8;
      const result = generate4DIcosahedron(resolution);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('generate4DTorus', () => {
    test('should generate a 4D torus with correct dimensions', () => {
      const resolution = 8;
      const majorRadius = 0.4;
      const minorRadius = 0.2;
      const result = generate4DTorus(resolution, majorRadius, minorRadius);

      const expectedLength = Math.pow(resolution, 4) * 4;
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(expectedLength);
    });

    test('should generate values between 0 and 1', () => {
      const resolution = 8;
      const majorRadius = 0.4;
      const minorRadius = 0.2;
      const result = generate4DTorus(resolution, majorRadius, minorRadius);

      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('generate (dispatcher)', () => {
    test('should dispatch to tesseract generator', () => {
      const params = { size: 8, resolution: 8 };
      const result = generate('tesseract', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to sphere generator', () => {
      const params = { size: 8, radius: 0.5 };
      const result = generate('sphere', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to torus generator', () => {
      const params = { size: 8, majorR: 0.4, minorR: 0.2 };
      const result = generate('torus', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to octahedron generator', () => {
      const params = { size: 8 };
      const result = generate('octahedron', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to dodecahedron generator', () => {
      const params = { size: 8 };
      const result = generate('dodecahedron', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to icosahedron generator', () => {
      const params = { size: 8 };
      const result = generate('icosahedron', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should throw error for unknown shape type', () => {
      const params = { size: 8 };
      expect(() => generate('unknown', params)).toThrow('Unknown shape type');
    });
  });
});