// Jest setup file to mock Web Crypto API for jsdom environment
// This runs before each test file

// Mock TextEncoder for jsdom environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const encoded = [];
      for (let i = 0; i < str.length; i++) {
        encoded.push(str.charCodeAt(i));
      }
      return new Uint8Array(encoded);
    }
  };
}

// Mock crypto.subtle.digest to return deterministic but different results per input
// Use the full input buffer as the cache key, not truncated
const digestCache = new Map();

Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm, data) => {
        // Use the FULL input data to generate the cache key (not truncated)
        const inputArray = new Uint8Array(data);
        // Create a unique key from the full array - convert to hex string
        const key = Array.from(inputArray).map(b => b.toString(16).padStart(2, '0')).join('');

        if (!digestCache.has(key)) {
          const output = new ArrayBuffer(32);
          const outputArray = new Uint8Array(output);

          // Create a deterministic but unique hash based on input bytes
          // Using a mixing function that produces different outputs for different inputs
          for (let i = 0; i < 32; i++) {
            const byteIndex = i % inputArray.length;
            // Mix the byte with position and input length to ensure different inputs
            // produce different hashes
            outputArray[i] = ((inputArray[byteIndex] * 31 + i) ^ (inputArray.length * 7 + i * 13)) % 256;
          }

          digestCache.set(key, output);
        }

        // Return a copy of the cached buffer
        const result = new ArrayBuffer(32);
        new Uint8Array(result).set(new Uint8Array(digestCache.get(key)));
        return result;
      }
    }
  },
  writable: true,
  configurable: true
});

// Ensure Blob has arrayBuffer method
function setupBlobMock() {
  if (typeof Blob === 'function') {
    class MockBlobClass {
      constructor(contents, options) {
        this._options = options || {};
        this._buffer = new ArrayBuffer(0);

        if (contents instanceof ArrayBuffer) {
          this._buffer = contents;
        } else if (Array.isArray(contents)) {
          let totalLength = 0;
          const arrays = [];
          for (const item of contents) {
            if (item instanceof Uint8Array) {
              arrays.push(item);
              totalLength += item.length;
            } else if (item instanceof ArrayBuffer) {
              arrays.push(new Uint8Array(item));
              totalLength += item.byteLength;
            } else if (typeof item === 'string') {
              const encoder = new TextEncoder();
              const encoded = encoder.encode(item);
              arrays.push(encoded);
              totalLength += encoded.length;
            }
          }
          const combined = new Uint8Array(totalLength);
          let offset = 0;
          for (const arr of arrays) {
            combined.set(arr, offset);
            offset += arr.length;
          }
          this._buffer = combined.buffer;
        } else if (typeof contents === 'string') {
          const encoder = new TextEncoder();
          this._buffer = encoder.encode(contents).buffer;
        }
      }

      get size() {
        return this._buffer.byteLength;
      }

      get type() {
        return this._options.type || '';
      }

      async arrayBuffer() {
        const result = new ArrayBuffer(this._buffer.byteLength);
        new Uint8Array(result).set(new Uint8Array(this._buffer));
        return result;
      }

      text() {
        const decoder = new TextDecoder();
        return Promise.resolve(decoder.decode(this._buffer));
      }

      slice() {
        return new MockBlobClass([], this._options);
      }
    }

    MockBlobClass.prototype[Symbol.toStringTag] = 'Blob';
    MockBlobClass.prototype.constructor = MockBlobClass;

    Object.defineProperty(global, 'Blob', {
      value: MockBlobClass,
      writable: true,
      configurable: true
    });
  }
}

setupBlobMock();