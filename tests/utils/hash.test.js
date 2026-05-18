/**
 * Content Hash Tests
 *
 * Test suite for Content Hash generation using Web Crypto API
 * Note: These tests require browser APIs (TextEncoder, crypto.subtle)
 * that need to be polyfilled in Node.js. They will be skipped in Node.
 */

import { generateContentHash, generateFileHash } from '../../js/utils/hash.js';

describe('Content Hash', () => {
  // Check if Web Crypto APIs are available
  const hasWebCrypto = typeof TextEncoder !== 'undefined' && typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';

  const conditionalTest = hasWebCrypto ? test : test.skip;

  describe('generateContentHash', () => {
    conditionalTest('should generate a 12-character hash string', async () => {
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

    conditionalTest('should generate same hash for same input', async () => {
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

    conditionalTest('should generate different hash for different input', async () => {
      const data1 = {
        type: 'tesseract',
        params: { size: 24 },
        timestamp: 1715800000000,
        seed: 12345
      };

      const data2 = {
        type: 'sphere',
        params: { size: 24 },
        timestamp: 1715800000000,
        seed: 12345
      };

      const hash1 = await generateContentHash(data1);
      const hash2 = await generateContentHash(data2);

      expect(hash1).not.toBe(hash2);
    });

    conditionalTest('should handle empty params object', async () => {
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

    conditionalTest('should handle special characters in strings', async () => {
      const data = {
        type: 'tesseract',
        params: { description: 'Test with émojis 🎨 and special <chars>"' },
        timestamp: 1715800000000,
        seed: 1
      };

      const hash = await generateContentHash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });

    conditionalTest('should be different for different timestamps', async () => {
      const baseData = {
        type: 'tesseract',
        params: { size: 24 },
        seed: 12345
      };

      const data1 = { ...baseData, timestamp: 1715800000000 };
      const data2 = { ...baseData, timestamp: 1715800000001 };

      const hash1 = await generateContentHash(data1);
      const hash2 = await generateContentHash(data2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateFileHash', () => {
    conditionalTest('should generate hash for a Blob', async () => {
      const blob = new Blob(['test data'], { type: 'text/plain' });

      const hash = await generateFileHash(blob);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(12);
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    conditionalTest('should generate same hash for same Blob content', async () => {
      const blob1 = new Blob(['consistent data'], { type: 'text/plain' });
      const blob2 = new Blob(['consistent data'], { type: 'text/plain' });

      const hash1 = await generateFileHash(blob1);
      const hash2 = await generateFileHash(blob2);

      expect(hash1).toBe(hash2);
    });

    conditionalTest('should generate different hash for different content', async () => {
      const blob1 = new Blob(['content A'], { type: 'text/plain' });
      const blob2 = new Blob(['content B'], { type: 'text/plain' });

      const hash1 = await generateFileHash(blob1);
      const hash2 = await generateFileHash(blob2);

      expect(hash1).not.toBe(hash2);
    });

    conditionalTest('should handle empty Blob', async () => {
      const blob = new Blob([''], { type: 'text/plain' });

      const hash = await generateFileHash(blob);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(12);
    });
  });

  // Always run these basic tests that don't require Web Crypto
  describe('basic functionality', () => {
    test('should export generateContentHash function', () => {
      expect(typeof generateContentHash).toBe('function');
    });

    test('should export generateFileHash function', () => {
      expect(typeof generateFileHash).toBe('function');
    });

    test('should return a string from generateContentHash when Web Crypto is available', async () => {
      if (!hasWebCrypto) {
        // When Web Crypto is not available, function should still exist but may throw
        expect(typeof generateContentHash).toBe('function');
        return;
      }

      const data = { type: 'test', params: {} };
      const hash = await generateContentHash(data);
      expect(typeof hash).toBe('string');
    });
  });
});