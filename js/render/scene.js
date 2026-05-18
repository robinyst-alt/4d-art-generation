/**
 * Render Scene
 *
 * Three.js scene management for 4D Art rendering
 */

import * as THREE from 'three';

let sceneInstance = null;
let ambientLight = null;
let directionalLight = null;

/**
 * Create a new Three.js scene with default lighting
 * @returns {THREE.Scene} Three.js scene instance
 */
export function createScene() {
  sceneInstance = new THREE.Scene();
  sceneInstance.background = new THREE.Color(0x0a0a0f);

  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  sceneInstance.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  sceneInstance.add(directionalLight);

  return sceneInstance;
}

/**
 * Add a points mesh to the scene
 * @param {THREE.Scene} scene - Three.js scene
 * @param {THREE.Points} points - Points object to add
 * @returns {THREE.Points} Added points object
 */
export function addMesh(scene, points) {
  if (scene && points) {
    scene.add(points);
  }
  return points;
}

/**
 * Update points geometry with new data
 * @param {THREE.Points} points - Points object
 * @param {Object} data - Object containing positions and colors Float32Arrays
 * @returns {boolean} Success status
 */
export function updateGeometry(points, data) {
  if (!points || !points.geometry) {
    return false;
  }

  if (!data) {
    return false;
  }

  if (data.positions) {
    points.geometry.setAttribute('position',
      new THREE.BufferAttribute(data.positions, 3));
  }

  if (data.colors) {
    points.geometry.setAttribute('color',
      new THREE.BufferAttribute(data.colors, 4));
  }

  points.geometry.attributes.position.needsUpdate = true;
  return true;
}

/**
 * Remove all points from scene, keeping lights
 * @param {THREE.Scene} scene - Three.js scene
 */
export function clearScene(scene) {
  if (!scene) return;

  const toRemove = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Points) {
      toRemove.push(child);
    }
  });

  toRemove.forEach((child) => {
    scene.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  });
}

/**
 * Update scene lighting based on color theme
 * @param {THREE.Scene} scene - Three.js scene
 * @param {string} theme - Color theme name
 */
export function setSceneLighting(scene, theme) {
  const themes = {
    neon: { ambient: 0.4, directional: 0.8, color: 0x6366f1 },
    sketch: { ambient: 0.6, directional: 0.5, color: 0x374151 },
    firefly: { ambient: 0.3, directional: 0.9, color: 0xfbbf24 },
    aurora: { ambient: 0.35, directional: 0.85, color: 0x10b981 },
    cyberpunk: { ambient: 0.25, directional: 0.95, color: 0x00ffff }
  };

  const settings = themes[theme] || themes.neon;

  if (ambientLight) {
    ambientLight.intensity = settings.ambient;
  }
  if (directionalLight) {
    directionalLight.intensity = settings.directional;
    directionalLight.color.setHex(settings.color);
  }
}

/**
 * Get the scene instance
 * @returns {THREE.Scene|null}
 */
export function getScene() {
  return sceneInstance;
}