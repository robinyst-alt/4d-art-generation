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

  rendererInstance = new THREE.WebGLRenderer(canvas ? { canvas, ...options } : options);
  rendererInstance.setPixelRatio(pixelRatio);
  rendererInstance.setSize(800, 600);
  rendererInstance.setClearColor(0x0a0a0f, 0);

  // If no canvas provided, append the auto-created canvas to the container
  if (!canvas && rendererInstance.domElement) {
    const container = document.getElementById('canvas-container');
    if (container) {
      container.appendChild(rendererInstance.domElement);
    }
  }

  return rendererInstance;
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