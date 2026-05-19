/**
 * App - Application Main Module
 *
 * Coordinates all modules in the 4D Art application:
 * - State management
 * - Rendering pipeline
 * - 4D data processing
 * - Theme management
 */

import * as THREE from 'three';
import { createState, dispatch, subscribe, ACTIONS, COLOR_THEMES } from './ui/state.js';
import { createScene, addMesh, updateGeometry, clearScene, setSceneLighting } from './render/scene.js';
import { createCamera, enableControls, setPosition, setFOV, lookAt, updateControls } from './render/camera.js';
import { createRenderer, render, setAnimationLoop, startAnimationLoop, stopAnimationLoop, resizeToFit, captureScreenshot } from './render/renderer.js';
import { extractSlice, toThreePoints } from './fourD/slice.js';
import { generate } from './fourD/generators.js';
import { extractMultiAxisSlice } from './quadrant/stateManager.js';

/**
 * Valid theme names
 */
const VALID_THEMES = ['neon', 'sketch', 'firefly', 'aurora', 'cyberpunk'];

/**
 * Default application state
 */
const DEFAULT_STATE = {
  currentShape: 'tesseract',
  wValue: 0,
  resolution: 24,
  colorTheme: 'neon',
  isRendering: false,
  transparency: 100,
  matrix: null
};

/**
 * Create and initialize the application
 * @param {Object} initialState - Optional initial state overrides
 * @returns {Object} Application instance with public API
 */
export function createApp(initialState = {}) {
  // Merge default state with any provided overrides
  const mergedState = { ...DEFAULT_STATE, ...initialState };

  // Create state container
  const stateContainer = createState(mergedState);

  // Three.js components
  let scene = null;
  let camera = null;
  let renderer = null;
  let controls = null;

  // Current points mesh
  let currentPoints = null;

  /**
   * Initialize the rendering pipeline
   * @param {HTMLElement} container - Container element for the canvas
   * @returns {Object} Rendering components (scene, camera, renderer)
   */
  function init(container) {
    // Create Three.js components
    scene = createScene();
    camera = createCamera();
    renderer = createRenderer();

    // Resize renderer to fit container
    resizeToFit(renderer, container);

    // Set camera position
    setPosition(camera, 0, 0, 5);
    setFOV(camera, 50);
    lookAt(camera, 0, 0, 0);

    // Enable camera controls
    controls = enableControls(camera, container);

    // Apply initial theme
    const currentState = stateContainer.getState();
    setSceneLighting(scene, currentState.colorTheme);

    // Set up animation loop
    setAnimationLoop(renderer, animate);

    // Update state
    dispatch(stateContainer, { type: ACTIONS.SET_RENDERING, payload: true });

    return { scene, camera, renderer };
  }

  /**
   * Animation loop
   */
  function animate() {
    // Update controls
    updateControls();

    // Render scene
    if (scene && camera) {
      render(renderer, scene, camera);
    }
  }

  /**
   * Generate a new shape and update the scene
   * @returns {Float32Array} Generated 4D matrix data
   */
  function generateShape() {
    const state = stateContainer.getState();
    const matrix = generate(state.currentShape, { resolution: state.resolution });

    dispatch(stateContainer, { type: ACTIONS.SET_MATRIX, payload: matrix });

    // Update the visible slice
    updateSlice(matrix, state.resolution, state.wValue);

    return matrix;
  }

  /**
   * Update the displayed slice with new matrix data
   * @param {Float32Array} matrix - 4D matrix data
   * @param {number} resolution - Resolution of the matrix
   * @param {number} wIndex - W-axis index to display (legacy, kept for compatibility)
   * @param {Object} quadrantState - Optional quadrant state for multi-axis slicing
   * @returns {boolean} Success status
   */
  function updateSlice(matrix, resolution, wIndex, quadrantState = null) {
    if (!matrix) {
      return false;
    }

    // Use multi-axis slice extraction if quadrant state provided
    if (quadrantState) {
      const extracted = extractMultiAxisSlice(matrix, quadrantState);
      const pointsData = toThreePoints(extracted.data, resolution);

      // Remove old points if exists
      if (currentPoints) {
        clearScene(scene);
        currentPoints = null;
      }

      // Create new points geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(pointsData.positions, 3));

      if (pointsData.colors && pointsData.colors.length > 0) {
        geometry.setAttribute('color', new THREE.BufferAttribute(pointsData.colors, 4));
      }

      const state = stateContainer.getState();
      const opacity = state.transparency / 100;
      const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: Math.max(0.3, opacity),
        sizeAttenuation: true
      });

      currentPoints = new THREE.Points(geometry, material);
      addMesh(scene, currentPoints);

      return true;
    }

    // Legacy single-slice extraction
    const sliceData = extractSlice(matrix, resolution, wIndex);

    // Convert to Three.js points format
    const pointsData = toThreePoints(sliceData, resolution);

    // Remove old points if exists
    if (currentPoints) {
      clearScene(scene);
      currentPoints = null;
    }

    // Create new points geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pointsData.positions, 3));

    if (pointsData.colors && pointsData.colors.length > 0) {
      geometry.setAttribute('color', new THREE.BufferAttribute(pointsData.colors, 4));
    }

    // Create material
    const state = stateContainer.getState();
    const opacity = state.transparency / 100;
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: Math.max(0.3, opacity),
      sizeAttenuation: true
    });

    // Create points and add to scene
    currentPoints = new THREE.Points(geometry, material);
    addMesh(scene, currentPoints);

    return true;
  }

  /**
   * Set the active color theme
   * @param {string} theme - Theme name
   * @returns {boolean} Success status
   */
  function setTheme(theme) {
    if (!VALID_THEMES.includes(theme)) {
      return false;
    }

    dispatch(stateContainer, { type: ACTIONS.SET_COLOR_THEME, payload: theme });

    // Apply to scene if initialized
    if (scene) {
      setSceneLighting(scene, theme);
    }

    return true;
  }

  /**
   * Get current application state
   * @returns {Object} Immutable copy of current state
   */
  function getState() {
    return stateContainer.getState();
  }

  /**
   * Update application state
   * @param {Object} update - State properties to update
   * @returns {boolean} Success status
   */
  function update(update) {
    const currentState = stateContainer.getState();
    let updated = false;

    // Handle shape change
    if (update.currentShape && update.currentShape !== currentState.currentShape) {
      dispatch(stateContainer, { type: ACTIONS.SET_SHAPE, payload: update.currentShape });
      // Reset wValue to middle of range when shape changes
      const middleW = Math.floor(currentState.resolution / 2);
      dispatch(stateContainer, { type: ACTIONS.SET_W_VALUE, payload: middleW });
      updated = true;
      // Regenerate shape
      generateShape();
    }

    // Handle W value change
    if (typeof update.wValue === 'number' && update.wValue !== currentState.wValue) {
      dispatch(stateContainer, { type: ACTIONS.SET_W_VALUE, payload: update.wValue });
      updated = true;
      // Update visible slice
      const state = stateContainer.getState();
      if (state.matrix) {
        updateSlice(state.matrix, state.resolution, update.wValue);
      }
    }

    // Handle resolution change
    if (typeof update.resolution === 'number' && update.resolution !== currentState.resolution) {
      dispatch(stateContainer, { type: ACTIONS.SET_RESOLUTION, payload: update.resolution });
      updated = true;
      // Regenerate shape
      generateShape();
    }

    // Handle color theme change
    if (update.colorTheme && update.colorTheme !== currentState.colorTheme) {
      setTheme(update.colorTheme);
      updated = true;
    }

    // Handle transparency change
    if (typeof update.transparency === 'number' && update.transparency !== currentState.transparency) {
      dispatch(stateContainer, { type: ACTIONS.SET_TRANSPARENCY, payload: update.transparency });
      updated = true;
      // Update material
      if (currentPoints && currentPoints.material) {
        currentPoints.material.opacity = update.transparency / 100;
        currentPoints.material.transparent = update.transparency < 100;
      }
    }

    return updated;
  }

  /**
   * Start the animation loop
   */
  function start() {
    if (renderer) {
      startAnimationLoop(renderer);
    }
  }

  /**
   * Stop the animation loop
   */
  function stop() {
    if (renderer) {
      stopAnimationLoop(renderer);
    }
  }

  /**
   * Clean up application resources
   */
  function destroy() {
    stop();

    // Dispose Three.js resources
    if (currentPoints) {
      if (currentPoints.geometry) currentPoints.geometry.dispose();
      if (currentPoints.material) currentPoints.material.dispose();
      currentPoints = null;
    }

    if (renderer) {
      renderer.dispose();
    }

    dispatch(stateContainer, { type: ACTIONS.SET_RENDERING, payload: false });

    scene = null;
    camera = null;
    renderer = null;
    controls = null;
  }

  // Return public API
  return {
    init,
    update,
    generate: generateShape,
    updateSlice,
    setTheme,
    getState,
    start,
    stop,
    destroy
  };
}