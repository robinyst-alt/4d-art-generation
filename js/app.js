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
import { createState, dispatch, subscribe, ACTIONS } from './ui/state.js';
import { createScene, addMesh, updateGeometry, clearScene, setSceneLighting, createAxisIndicator, addAxisIndicator } from './render/scene.js';
import { createCamera, enableControls, setPosition, setFOV, lookAt, updateControls, getQuaternion } from './render/camera.js';
import { createRenderer, render, setAnimationLoop, startAnimationLoop, stopAnimationLoop, resizeToFit, captureScreenshot, clearRenderer } from './render/renderer.js';
import { toThreePoints } from './fourD/slice.js';
import { generate } from './fourD/generators.js';
import { extractMultiAxisSlice } from './quadrant/stateManager.js';
import { generateContentHash } from './utils/hash.js';

/**
 * Valid theme names
 */
const VALID_THEMES = ['neon', 'sketch', 'firefly', 'aurora', 'cyberpunk'];

/**
 * Default application state
 */
const DEFAULT_STATE = {
  currentShape: 'tesseract',
  wValue: 12,
  resolution: 24,
  colorTheme: 'neon',
  isRendering: false,
  matrix: null,
  pointSpacing: 1,
  contentHash: null,
  quadrantState: null
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

  // Axis indicator components (separate mini scene)
  let axisScene = null;
  let axisCamera = null;
  let axisRenderer = null;
  let axisControls = null;
  let axisIndicatorGroup = null;
  let axisScale = 1.5; // Initial scale for axis indicator

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
    setFOV(camera, 60);
    lookAt(camera, 0, 0, 0);

    // Enable camera controls
    controls = enableControls(camera, container);

    // Apply initial theme
    const currentState = stateContainer.getState();
    setSceneLighting(scene, currentState.colorTheme);

    // Set up axis indicator mini scene with transparent background
    axisScene = createScene(null); // null = no background (transparent)
    axisCamera = createCamera();
    setPosition(axisCamera, 0, 0, 5);
    setFOV(axisCamera, 50);
    lookAt(axisCamera, 0, 0, 0);
    // Set aspect ratio to match the square canvas
    axisCamera.aspect = 1;
    axisCamera.updateProjectionMatrix();
    // Reset quaternion so axis camera always looks at origin head-on
    axisCamera.quaternion.set(0, 0, 0, 1);

    // Get the canvas element for axis indicator and create renderer for it
    const axisCanvas = document.querySelector('.axis-indicator__canvas');
    if (axisCanvas) {
      axisRenderer = createRenderer(axisCanvas);
    }

    // Create axis indicator group (larger size for visibility)
    axisIndicatorGroup = createAxisIndicator(1.5);
    addAxisIndicator(axisScene, axisIndicatorGroup);

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
    // Update main camera controls
    updateControls();

    // Sync axis indicator group rotation with main camera
    // The axis indicator should appear to rotate the same way as the camera
    // is observing it - use the camera's quaternion directly
    if (axisIndicatorGroup) {
      const q = getQuaternion();
      if (q) {
        // Apply camera's rotation to axis group (conjugate = inverse for unit quaternion)
        // This makes the axes show the correct orientation as camera view changes
        axisIndicatorGroup.quaternion.copy(q).invert();
      }
    }

    // Render main scene
    if (scene && camera) {
      render(renderer, scene, camera);
    }

    // Render axis indicator scene
    if (axisScene && axisCamera && axisRenderer) {
      // Clear the mini renderer before each frame to ensure clean compositing
      clearRenderer(axisRenderer);
      axisRenderer.render(axisScene, axisCamera);
    }
  }

  /**
   * Generate a new shape and update the scene
   * @returns {Promise<Float32Array>} Generated 4D matrix data
   */
  async function generateShape() {
    const state = stateContainer.getState();
    const matrix = generate(state.currentShape, { resolution: state.resolution });

    dispatch(stateContainer, { type: ACTIONS.SET_MATRIX, payload: matrix });

    // Generate content hash
    const hash = await generateContentHash({
      type: state.currentShape,
      params: { resolution: state.resolution },
      timestamp: Date.now()
    });
    dispatch(stateContainer, { type: ACTIONS.SET_CONTENT_HASH, payload: hash });

    // Update the visible slice
    updateSlice(matrix, state.resolution, state.wValue);

    return matrix;
  }

  /**
   * Update the displayed slice with new matrix data
   * @param {Float32Array} matrix - 4D matrix data
   * @param {number} resolution - Resolution of the matrix
   * @param {number} wIndex - W-axis index (deprecated, unused)
   * @param {Object} quadrantState - Quadrant state for multi-axis slicing
   * @returns {boolean} Success status
   */
  function updateSlice(matrix, resolution, wIndex, quadrantState) {
    if (!matrix) {
      return false;
    }

    // Handle updateSlice calls without quadrantState (F107 point spacing updates)
    if (!quadrantState) {
      const state = stateContainer.getState();
      quadrantState = state.quadrantState;
    }

    if (!quadrantState) {
      return false;
    }

    const extracted = extractMultiAxisSlice(matrix, quadrantState);
    const pointsData = toThreePoints(extracted.data, resolution, extracted.dimensions);

    // Apply point spacing multiplier (Level 1=1x, Level 2=2x, etc.)
    const spacingMultiplier = stateContainer.getState().pointSpacing || 1;
    for (let i = 0; i < pointsData.positions.length; i++) {
      pointsData.positions[i] *= spacingMultiplier;
    }

    // Remove old points if exists
    if (currentPoints) {
      clearScene(scene);
      currentPoints = null;
    }

    // Create new points geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pointsData.positions, 3));

    if (pointsData.colors && pointsData.colors.length > 0) {
      geometry.setAttribute('color', new THREE.BufferAttribute(pointsData.colors, 3));
    }

    const state = stateContainer.getState();
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    });

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
      // Regenerate shape (async) and update hash display when done
      generateShape().then(() => updateHashDisplay()).catch(() => {});
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
      // Regenerate shape (async) and update hash display when done
      generateShape().then(() => updateHashDisplay()).catch(() => {});
    }

    // Handle color theme change
    if (update.colorTheme && update.colorTheme !== currentState.colorTheme) {
      setTheme(update.colorTheme);
      updated = true;
    }

    // Handle point spacing change
    if (typeof update.pointSpacing === 'number' && update.pointSpacing !== currentState.pointSpacing) {
      dispatch(stateContainer, { type: ACTIONS.SET_POINT_SPACING, payload: update.pointSpacing });
      updated = true;
      // Re-render with new spacing
      const state = stateContainer.getState();
      if (state.matrix) {
        updateSlice(state.matrix, state.resolution, state.wValue);
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

  /**
   * Take a screenshot and trigger download
   * @param {string} [filename] - Optional filename for download
   */
  function takeScreenshot(filename = null) {
    if (!renderer) return false;

    const timestamp = Date.now();
    const name = filename || `4d-art-${timestamp}`;
    const dataUrl = captureScreenshot(renderer, 'image/png');

    if (!dataUrl) return false;

    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }

  /**
   * Update the axis indicator based on current free axes
   * Recreates the axis indicator group with only the free axes (camera axes)
   * @param {string[]} freeAxes - Array of axis names that are free (camera axes)
   */
  function updateAxisIndicator(freeAxes) {
    if (!axisScene || !axisIndicatorGroup) return;

    // Remove existing axis indicator
    axisScene.remove(axisIndicatorGroup);

    // Dispose of old resources
    axisIndicatorGroup.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    // Create new axis indicator with updated free axes (same scale)
    axisIndicatorGroup = createAxisIndicator(axisScale, freeAxes);
    addAxisIndicator(axisScene, axisIndicatorGroup);
  }

  /**
   * Resize the axis indicator canvas
   * @param {number} size - New size in pixels
   */
  function resizeAxisCanvas(size) {
    if (axisRenderer) {
      axisRenderer.setSize(size, size);
    }
  }

  /**
   * Zoom the axis indicator (scale the axis group)
   * @param {number} delta - Zoom delta (positive = zoom in, negative = zoom out)
   */
  function zoomAxisIndicator(delta) {
    // Update scale factor
    axisScale = Math.max(0.3, Math.min(5, axisScale + delta));
    axisScale = Math.round(axisScale * 10) / 10; // Round to 1 decimal

    // Apply scale to the axis indicator group
    if (axisIndicatorGroup) {
      axisIndicatorGroup.scale.set(axisScale, axisScale, axisScale);
    }
  }

  /**
   * Get current axis scale
   * @returns {number} Current axis scale
   */
  function getAxisScale() {
    return axisScale;
  }

  /**
   * Update content hash display in DOM
   */
  function updateHashDisplay() {
    const state = stateContainer.getState();
    if (state.contentHash) {
      const hashElement = document.getElementById('info-hash');
      if (hashElement) {
        hashElement.textContent = state.contentHash;
      }
    }
  }

  /**
   * Store quadrant state for use in updateSlice (F107 point spacing)
   * @param {Object} qs - Quadrant state from main.js
   */
  function setQuadrantState(qs) {
    dispatch(stateContainer, { type: ACTIONS.SET_QUADRANT_STATE, payload: qs });
  }

  // Return public API
  return {
    init,
    update,
    generate: generateShape,
    updateSlice,
    updateAxisIndicator,
    setQuadrantState,
    setQuadrantState,
    resizeAxisCanvas,
    zoomAxisIndicator,
    getAxisScale,
    setTheme,
    getState,
    start,
    stop,
    destroy,
    takeScreenshot
  };
}