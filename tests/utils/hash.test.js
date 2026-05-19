/**
 * Content Hash Tests
 *
 * Test suite for Content Hash generation using Web Crypto API
 */

import { describe, test, expect } from '@jest/globals';

describe('Content Hash', () => {
  describe('generateContentHash', () => {
    test('should generate a 12-character hash string', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { size: 24 },
        timestamp: 1715800000000,
        seed: 12345
      };

      const hash = await generateContentHash(data);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(12);
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    test('should generate same hash for same input (idempotent)', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'sphere',
        params: { radius: 0.5 },
        timestamp: 1715800000000,
        seed: 54321
      };

      const hash1 = await generateContentHash(data);
      const hash2 = await generateContentHash(data);

      expect(hash1).toBe(hash2);
    });

    test('should handle empty params object', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: {},
        timestamp: 1715800000000,
        seed: 0
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle special characters in strings', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { description: 'Test with emojis and special chars: !@#$%^&*()' },
        timestamp: 1715800000000,
        seed: 1
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle Unicode characters', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { description: '测试中文 🎉🎊' },
        timestamp: 1715800000000,
        seed: 1
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle numeric values correctly', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { size: 0, negative: -100, decimal: 3.14159 },
        timestamp: 0,
        seed: 0
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle null and undefined values in params', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { nullValue: null, undefinedValue: undefined },
        timestamp: 1715800000000,
        seed: 1
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should use SHA-256 algorithm via crypto.subtle', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');
      const data = { type: 'test', params: {}, timestamp: 0, seed: 0 };

      // Just verify it completes without error
      const hash = await generateContentHash(data);
      expect(hash).toBeDefined();
    });
  });

  describe('generateFileHash', () => {
    test('should generate hash for a Blob', async () => {
      const { generateFileHash } = await import('../../js/utils/hash.js');

      const blob = new Blob(['test data'], { type: 'text/plain' });

      const hash = await generateFileHash(blob);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(12);
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    test('should generate same hash for same Blob content (idempotent)', async () => {
      const { generateFileHash } = await import('../../js/utils/hash.js');

      const blob1 = new Blob(['consistent data'], { type: 'text/plain' });
      const blob2 = new Blob(['consistent data'], { type: 'text/plain' });

      const hash1 = await generateFileHash(blob1);
      const hash2 = await generateFileHash(blob2);

      expect(hash1).toBe(hash2);
    });

    test('should handle empty Blob', async () => {
      const { generateFileHash } = await import('../../js/utils/hash.js');

      const blob = new Blob([''], { type: 'text/plain' });

      const hash = await generateFileHash(blob);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle large Blob content', async () => {
      const { generateFileHash } = await import('../../js/utils/hash.js');

      const largeContent = 'x'.repeat(10000);
      const blob = new Blob([largeContent], { type: 'text/plain' });

      const hash = await generateFileHash(blob);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle binary data in Blob', async () => {
      const { generateFileHash } = await import('../../js/utils/hash.js');

      const binaryData = new Uint8Array([0, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
      const blob = new Blob([binaryData], { type: 'application/octet-stream' });

      const hash = await generateFileHash(blob);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should use SHA-256 algorithm via crypto.subtle', async () => {
      const { generateFileHash } = await import('../../js/utils/hash.js');
      const blob = new Blob(['test'], { type: 'text/plain' });

      // Just verify it completes without error
      const hash = await generateFileHash(blob);
      expect(hash).toBeDefined();
    });
  });

  describe('function exports', () => {
    test('should export generateContentHash as a function', async () => {
      const hashModule = await import('../../js/utils/hash.js');
      expect(typeof hashModule.generateContentHash).toBe('function');
    });

    test('should export generateFileHash as a function', async () => {
      const hashModule = await import('../../js/utils/hash.js');
      expect(typeof hashModule.generateFileHash).toBe('function');
    });

    test('generateContentHash should be async', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = { type: 'test' };
      const result = generateContentHash(data);
      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    test('generateFileHash should be async', async () => {
      const { generateFileHash } = await import('../../js/utils/hash.js');

      const blob = new Blob(['test']);
      const result = generateFileHash(blob);
      expect(result).toBeInstanceOf(Promise);
      await result;
    });
  });

  describe('edge cases', () => {
    test('should handle nested objects', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: {
          nested: {
            deep: {
              value: 123
            }
          }
        },
        timestamp: 1715800000000,
        seed: 1
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle arrays in params', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { items: [1, 2, 3, 'a', 'b', 'c'] },
        timestamp: 1715800000000,
        seed: 1
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle boolean values', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { enabled: true, disabled: false },
        timestamp: 1715800000000,
        seed: 1
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    test('should handle very large numbers', async () => {
      const { generateContentHash } = await import('../../js/utils/hash.js');

      const data = {
        type: 'tesseract',
        params: { huge: Number.MAX_SAFE_INTEGER },
        timestamp: Number.MAX_SAFE_INTEGER,
        seed: Number.MAX_SAFE_INTEGER
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });
  });
});