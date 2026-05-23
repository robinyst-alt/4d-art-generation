/**
 * Render Camera
 *
 * Three.js camera control with OrbitControls
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let cameraInstance = null;
let controlsInstance = null;

/**
 * Create a perspective camera with default settings
 * @returns {THREE.PerspectiveCamera} Three.js camera
 */
export function createCamera() {
  cameraInstance = new THREE.PerspectiveCamera(
    50,
    800 / 600,
    0.1,
    1000
  );
  cameraInstance.position.set(0, 0, 5);
  return cameraInstance;
}

/**
 * Set camera projection type
 * @param {THREE.Camera} camera - Three.js camera
 * @param {string} type - 'perspective' or 'orthographic'
 */
export function setProjection(camera, type) {
  if (type === 'perspective' && !(camera instanceof THREE.PerspectiveCamera)) {
    const fov = camera.fov || 50;
    const aspect = camera.aspect || 800 / 600;
    const near = camera.near || 0.1;
    const far = camera.far || 1000;
    const position = camera.position.clone();

    const newCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    newCamera.position.copy(position);
    return newCamera;
  }

  if (type === 'orthographic' && !(camera instanceof THREE.OrthographicCamera)) {
    const aspect = camera.aspect || 800 / 600;
    const halfHeight = 5;
    const halfWidth = halfHeight * aspect;
    const near = camera.near || 0.1;
    const far = camera.far || 1000;
    const position = camera.position.clone();

    const newCamera = new THREE.OrthographicCamera(
      -halfWidth, halfWidth, halfHeight, -halfHeight, near, far
    );
    newCamera.position.copy(position);
    return newCamera;
  }

  return camera;
}

/**
 * Enable camera controls (OrbitControls)
 * @param {THREE.Camera} camera - Three.js camera
 * @param {HTMLElement} domElement - DOM element to attach controls to
 * @returns {OrbitControls} OrbitControls instance
 */
export function enableControls(camera, domElement) {
  if (!domElement) return null;

  controlsInstance = new OrbitControls(camera, domElement);
  controlsInstance.enableDamping = true;
  controlsInstance.dampingFactor = 0.05;
  controlsInstance.enableZoom = true;
  controlsInstance.enableRotate = true;
  controlsInstance.enablePan = false;
  controlsInstance.target.set(0, 0, 0);

  return controlsInstance;
}

/**
 * Set camera field of view
 * @param {THREE.PerspectiveCamera} camera - Three.js camera
 * @param {number} fov - Field of view in degrees
 */
export function setFOV(camera, fov) {
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

/**
 * Set camera position
 * @param {THREE.Camera} camera - Three.js camera
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 */
export function setPosition(camera, x, y, z) {
  camera.position.set(x, y, z);
}

/**
 * Look at a specific point
 * @param {THREE.Camera} camera - Three.js camera
 * @param {number} x - Target X
 * @param {number} y - Target Y
 * @param {number} z - Target Z
 */
export function lookAt(camera, x, y, z) {
  camera.lookAt(x, y, z);
  if (controlsInstance) {
    controlsInstance.target.set(x, y, z);
  }
}

/**
 * Update controls (call in animation loop)
 * @returns {boolean} True if controls were updated
 */
export function updateControls() {
  if (controlsInstance) {
    controlsInstance.update();
    return true;
  }
  return false;
}

/**
 * Get the camera instance
 * @returns {THREE.PerspectiveCamera|null}
 */
export function getCamera() {
  return cameraInstance;
}

/**
 * Get the controls instance
 * @returns {OrbitControls|null}
 */
export function getControls() {
  return controlsInstance;
}

/**
 * Get the current camera quaternion for sync purposes
 * @returns {THREE.Quaternion|null} Current camera quaternion
 */
export function getQuaternion() {
  if (cameraInstance) {
    return cameraInstance.quaternion.clone();
  }
  return null;
}