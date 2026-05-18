/**
 * Content Hash Generation
 *
 * Generates unique content-based hashes using Web Crypto API
 * Used for artwork identification (similar to Git commit hashes)
 */

/**
 * Generate a 12-character content hash from data object
 * @param {Object} data - Object containing type, params, timestamp, seed
 * @returns {Promise<string>} SHA-256 hash (first 12 hex characters)
 */
export async function generateContentHash(data) {
  const str = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 6).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a content hash from a File Blob
 * @param {Blob} blob - File blob to hash
 * @returns {Promise<string>} SHA-256 hash (first 12 hex characters)
 */
export async function generateFileHash(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 6).map(b => b.toString(16).padStart(2, '0')).join('');
}