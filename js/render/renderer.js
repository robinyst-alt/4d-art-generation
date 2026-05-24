/**
 * Render Renderer
 *
 * Three.js WebGL renderer configuration and management with real Three.js
 */

import * as THREE from 'three';

let rendererInstance = null;

/**
 * Create a WebGL renderer with default settings
 * @param {HTMLCanvasElement} [canvas] - Optional canvas element
 * @returns {THREE.WebGLRenderer} Three.js renderer instance
 */
export function createRenderer(canvas = null) {
  const pixelRatio = typeof window !== 'undefined'
    ? Math.min(window.devicePixelRatio || 1, 2)
    : 1;

  const options = {
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  };

  const renderer = new THREE.WebGLRenderer(canvas ? { canvas, ...options } : options);
  renderer.setPixelRatio(pixelRatio);

  // If a specific canvas is provided, use fixed size for mini renderers
  // Otherwise, use the main container size
  if (canvas) {
    renderer.setSize(120, 120);
    renderer.setClearColor(0x000000, 0);
  } else {
    const container = document.getElementById('canvas-container');
    const width = container?.clientWidth || window.innerWidth || 800;
    const height = container?.clientHeight || window.innerHeight || 600;
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0a0f, 1);

    // Only store the main renderer instance (not mini renderers)
    rendererInstance = renderer;
  }

  // If no canvas provided, append the auto-created canvas to the container
  if (!canvas && renderer.domElement) {
    const container = document.getElementById('canvas-container');

    // Ensure canvas has proper styling
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '0';

    if (container) {
      // Insert canvas at the beginning so axis indicator overlays it
      container.insertBefore(renderer.domElement, container.firstChild);
    }
  }

  // Auto-clear is already true by default, ensuring proper isolation between renderers

  return renderer;
}

/**
 * Render scene with camera
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {THREE.Scene} scene - Scene object
 * @param {THREE.Camera} camera - Camera object
 */
export function render(renderer, scene, camera) {
  if (!renderer || !scene || !camera) {
    return false;
  }
  renderer.render(scene, camera);
  return true;
}

/**
 * Capture screenshot from renderer
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {string} format - Image format ('image/png', 'image/jpeg')
 * @returns {string} Data URL of screenshot
 */
export function captureScreenshot(renderer, format = 'image/png') {
  if (!renderer) {
    return null;
  }
  return renderer.domElement.toDataURL(format);
}

/**
 * Set renderer animation loop
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {Function} callback - Animation callback function
 */
export function setAnimationLoop(renderer, callback) {
  if (renderer) {
    renderer.setAnimationLoop(callback);
  }
}

/**
 * Start rendering animation loop
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 */
export function startAnimationLoop(renderer) {
  // Animation loop is managed via setAnimationLoop
}

/**
 * Stop rendering animation loop
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 */
export function stopAnimationLoop(renderer) {
  if (renderer) {
    renderer.setAnimationLoop(null);
  }
}

/**
 * Resize renderer to fit container
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {HTMLElement} container - Container element
 */
export function resizeToFit(renderer, container) {
  if (renderer && container) {
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
  }
}

/**
 * Get the renderer instance
 * @returns {THREE.WebGLRenderer|null}
 */
export function getRenderer() {
  return rendererInstance;
}

/**
 * Clear the renderer's buffers
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {boolean} [clearColor=true] - Whether to clear color buffer
 * @param {boolean} [clearDepth=true] - Whether to clear depth buffer
 */
export function clearRenderer(renderer, clearColor = true, clearDepth = true) {
  if (renderer) {
    renderer.clear(clearColor, clearDepth);
  }
}