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

    test('should have solid white fill characteristic', () => {
      const resolution = 24;
      const result = generateTesseract(resolution);

      // Count voxels with value 1 (white solid fill)
      let whiteCount = 0;
      for (let i = 0; i < result.length; i += 4) {
        if (result[i] === 1 && result[i+1] === 1 && result[i+2] === 1) {
          whiteCount++;
        }
      }

      // A tesseract at this resolution should have some solid fill
      expect(whiteCount).toBeGreaterThan(0);
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

    test('should generate a centered sphere with white fill', () => {
      const resolution = 24;
      const radius = 0.75;
      const result = generate4DSphere(resolution, radius);

      // Center point (w=12, z=12, y=12, x=12) should be inside sphere
      // With radius 0.75 and center at 0, this point should have value > 0
      const hasContent = Array.from(result).some(v => v > 0);
      expect(hasContent).toBe(true);
    });

    test('should have more white fill with larger radius', () => {
      const resolution = 24;
      const smallRadius = 0.3;
      const largeRadius = 0.8;

      const smallResult = generate4DSphere(resolution, smallRadius);
      const largeResult = generate4DSphere(resolution, largeRadius);

      const smallWhiteCount = Array.from(smallResult).filter(v => v === 1).length;
      const largeWhiteCount = Array.from(largeResult).filter(v => v === 1).length;

      // Larger radius should contain more white points
      expect(largeWhiteCount).toBeGreaterThan(smallWhiteCount);
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
      const params = { resolution: 8 };
      const result = generate('tesseract', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to sphere generator', () => {
      const params = { resolution: 8, radius: 0.5 };
      const result = generate('sphere', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to torus generator', () => {
      const params = { resolution: 8, majorR: 0.4, minorR: 0.2 };
      const result = generate('torus', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to octahedron generator', () => {
      const params = { resolution: 8 };
      const result = generate('octahedron', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to dodecahedron generator', () => {
      const params = { resolution: 8 };
      const result = generate('dodecahedron', params);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(Math.pow(8, 4) * 4);
    });

    test('should dispatch to icosahedron generator', () => {
      const params = { resolution: 8 };
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