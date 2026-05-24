/**
 * Main - Application Entry Point
 *
 * Initializes the 4D Art application on DOM content loaded.
 * Handles Three.js loading and app bootstrapping.
 */

import { createApp } from './app.js';
import {
  createQuadrantControls,
  getAxisState,
  updateAxisDisplay,
  onAxisChange
} from './quadrant/controls.js';
import {
  createQuadrantState,
  setSliceValue,
  setAxisMode,
  setAxisLock,
  extractMultiAxisSlice,
  getCameraAxes,
  getCameraRotationDimensions
} from './quadrant/stateManager.js';
import { updateControlsForRotationDimensions } from './render/camera.js';

/**
 * Global application instance
 */
let appInstance = null;

/**
 * Canvas container element
 */
let canvasContainer = null;

/**
 * Flag indicating if app is initialized
 */
let initialized = false;

/**
 * Quadrant state (four-axis slice control)
 */
let quadrantState = null;
let quadrantControls = null;
let matrix = null;
let focusedAxis = 'w'; // Currently focused axis for keyboard control

/**
 * Initialize the application
 * @returns {Function} Cleanup function to tear down the application
 */
export async function initApp() {
  if (initialized && appInstance) {
    return cleanupApp;
  }

  // Get or create canvas container
  canvasContainer = document.getElementById('canvas-container');

  if (!canvasContainer) {
    canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvas-container';
    canvasContainer.className = 'canvas-container';
    document.body.appendChild(canvasContainer);
  }

  // Apply theme from storage or default
  const savedTheme = localStorage.getItem('4d-art-theme') || 'neon';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Apply language from storage or default (must be before initApp to ensure DOM is ready)
  const savedLang = localStorage.getItem('4d-art-lang') || 'zh';
  currentLang = savedLang;

  // Create app instance
  appInstance = createApp();

  // Initialize rendering
  appInstance.init(canvasContainer);

  // Generate initial shape
  matrix = await appInstance.generate();

  // Update hash display from app state
  const hashElement = document.getElementById('info-hash');
  if (hashElement) {
    const state = appInstance.getState();
    if (state.contentHash) {
      hashElement.textContent = state.contentHash;
    }
  }

  initialized = true;

  // Start animation loop
  appInstance.start();

  // Hide the loader
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('app-loader--hidden');
    setTimeout(() => loader.remove(), 300);
  }

  return cleanupApp;
}

/**
 * Clean up application resources
 */
export function cleanupApp() {
  if (appInstance) {
    appInstance.destroy();
    appInstance = null;
  }

  if (canvasContainer && canvasContainer.parentNode) {
    canvasContainer.parentNode.removeChild(canvasContainer);
    canvasContainer = null;
  }

  initialized = false;
}

/**
 * Check if app is initialized
 * @returns {boolean} True if initialized
 */
export function isAppInitialized() {
  return initialized;
}

/**
 * Get canvas container element
 * @returns {HTMLElement|null} Canvas container or null
 */
export function getCanvasContainer() {
  return canvasContainer;
}

/**
 * Handle DOM content loaded
 */
async function onDOMContentLoaded() {
  // Initialize app after DOM is ready
  await initApp();

  // Set up language toggle (must be after initApp to ensure DOM is ready)
  setupLanguageToggle();

  // Set up UI control event listeners
  setupControls();

  // Set up keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Set up axis indicator toggle (collapsible widget)
  setupAxisIndicatorToggle();

  // Set up axis indicator resize handle
  setupAxisIndicatorResize();

  // Set up axis indicator zoom on wheel
  setupAxisIndicatorZoom();
}

/**
 * Set up axis indicator collapsible toggle
 */
function setupAxisIndicatorToggle() {
  const axisIndicator = document.getElementById('axis-indicator');
  const toggleBtn = axisIndicator?.querySelector('.axis-indicator__toggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', (!isExpanded).toString());
      axisIndicator.classList.toggle('axis-indicator--collapsed', isExpanded);
      toggleBtn.textContent = isExpanded ? '+' : '−';
    });
  }
}

/**
 * Set up axis indicator resize functionality
 */
function setupAxisIndicatorResize() {
  const axisIndicator = document.getElementById('axis-indicator');
  const resizeHandle = axisIndicator?.querySelector('.axis-indicator__resize-handle');
  const canvas = axisIndicator?.querySelector('.axis-indicator__canvas');

  if (!resizeHandle || !canvas) return;

  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  const onMouseMove = (e) => {
    if (!isResizing) return;
    e.preventDefault();

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Calculate new size (keep square, use larger dimension)
    const newSize = Math.max(80, Math.max(startWidth + dx, startHeight + dy));
    const newSizeStr = newSize + 'px';

    canvas.style.width = newSizeStr;
    canvas.style.height = newSizeStr;

    // Update axis indicator renderer size
    if (appInstance && appInstance.resizeAxisCanvas) {
      appInstance.resizeAxisCanvas(newSize);
    }
  };

  const onMouseUp = () => {
    isResizing = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = canvas.offsetWidth;
    startHeight = canvas.offsetHeight;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

/**
 * Set up mouse wheel zoom for axis indicator
 */
function setupAxisIndicatorZoom() {
  const axisIndicator = document.getElementById('axis-indicator');

  if (!axisIndicator) return;

  axisIndicator.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Get current scale and calculate new scale
    const currentScale = appInstance?.getAxisScale() || 1.5;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    if (appInstance && appInstance.zoomAxisIndicator) {
      appInstance.zoomAxisIndicator(delta);
    }
  }, { passive: false });
}

/**
 * Internationalization translations
 */
const TRANSLATIONS = {
  en: {
    quadrant_title: 'Four-Axis Control',
    title: '4D Art',
    subtitle: '4D Pixel Matrix Generator',
    shape: 'Shape',
    shape_tesseract: 'Tesseract (Hypercube)',
    shape_sphere: '4D Sphere',
    shape_octahedron: '4D Octahedron',
    shape_dodecahedron: '4D Dodecahedron',
    shape_icosahedron: '4D Icosahedron',
    shape_torus: '4D Torus',
    shape_description: 'Select a 4D geometric shape to generate',
    w_axis: 'W Axis',
    w_description: 'Explore different 4D slices',
    current_shape: 'Current Shape',
    info_resolution: 'Resolution',
    info_points: 'Points',
    info_hash: 'Hash',
    shortcuts: 'Shortcuts',
    shortcut_nav: 'Navigate W axis',
    shortcut_shape: 'Select shape',
    screenshot: 'Save Image',
    loading: 'Generating...',
    point_spacing: 'Point Spacing'
  },
  zh: {
    quadrant_title: '四轴控制',
    title: '4D 艺术',
    subtitle: '4D 像素矩阵生成器',
    shape: '形状',
    shape_tesseract: '超立方体',
    shape_sphere: '4D 球体',
    shape_octahedron: '4D 八面体',
    shape_dodecahedron: '4D 十二面体',
    shape_icosahedron: '4D 二十面体',
    shape_torus: '4D 环面',
    shape_description: '选择一个 4D 几何形状来生成',
    w_axis: 'W 轴',
    w_description: '探索不同的 4D 切片',
    current_shape: '当前形状',
    info_resolution: '分辨率',
    info_points: '点数',
    info_hash: '哈希',
    shortcuts: '快捷键',
    shortcut_nav: '控制聚焦象限滑条',
    shortcut_shape: '选择形状',
    screenshot: '保存图片',
    loading: '生成中...',
    point_spacing: '点间距'
  }
};

/**
 * Current language
 */
let currentLang = 'en';

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} Translated text or key if not found
 */
function t(key) {
  return TRANSLATIONS[currentLang][key] || key;
}

/**
 * Update all translatable elements on the page
 */
function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT') {
      // For inputs, only update aria-label, placeholder etc
      el.setAttribute('aria-label', t(key));
    } else {
      el.textContent = t(key);
    }
  });
}

/**
 * Set up language toggle
 */
function setupLanguageToggle() {
  const langToggle = document.getElementById('lang-toggle');
  const langLabel = langToggle?.querySelector('.lang-toggle__label');

  // currentLang is already set from localStorage in initApp
  applyLanguage(currentLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'zh' : 'en';
      localStorage.setItem('4d-art-lang', currentLang);
      applyLanguage(currentLang);
    });
  }
}

/**
 * Apply language to the page
 * @param {string} lang - Language code ('en' or 'zh')
 */
function applyLanguage(lang) {
  const langToggle = document.getElementById('lang-toggle');
  const langLabel = langToggle?.querySelector('.lang-toggle__label');

  if (langLabel) {
    langLabel.textContent = lang === 'en' ? '中' : 'EN';
  }

  langToggle?.setAttribute('data-lang', lang);

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Update translations
  updateTranslations();
}

/**
 * Set up quadrant controls (four-axis slice/free control)
 */
function setupQuadrantControls() {
  const container = document.querySelector('.quadrant-controls');
  if (!container) return;

  // Initialize quadrant state
  quadrantState = createQuadrantState();

  // Create quadrant controls manager
  quadrantControls = createQuadrantControls(container);

  // Initialize UI with default state (including W as locked)
  ['x', 'y', 'z', 'w'].forEach(axis => {
    const isLocked = quadrantState.lockedAxes.includes(axis);
    const mode = quadrantState.axes[axis].mode;
    updateAxisDisplay(quadrantControls, axis, { mode, locked: isLocked });
  });

  // Listen for axis changes and update state
  ['x', 'y', 'z', 'w'].forEach(axis => {
    // Mode toggle
    onAxisChange(quadrantControls, axis, 'mode', (newMode) => {
      // Update focused axis to the one being changed
      focusedAxis = axis;

      const prevState = quadrantState;
      quadrantState = setAxisMode(quadrantState, axis, newMode);

      // Sync UI with validated state (handles constraint blocking)
      const actualMode = quadrantState.axes[axis].mode;
      const actualLocked = quadrantState.lockedAxes.includes(axis);
      updateAxisDisplay(quadrantControls, axis, { mode: actualMode, locked: actualLocked });

      updateSliceFromQuadrantState();
    });

    // Value change
    onAxisChange(quadrantControls, axis, 'value', (newValue) => {
      // Update focused axis to the one being changed
      focusedAxis = axis;

      quadrantState = setSliceValue(quadrantState, axis, newValue);
      updateSliceFromQuadrantState();
    });

    // Lock toggle
    onAxisChange(quadrantControls, axis, 'lock', (newLocked) => {
      const prevState = quadrantState;
      quadrantState = setAxisLock(quadrantState, axis, newLocked);

      // Sync UI with validated state
      const actualLocked = quadrantState.lockedAxes.includes(axis);
      updateAxisDisplay(quadrantControls, axis, { locked: actualLocked });

      // Sync mode display (locked = slice)
      const actualMode = quadrantState.axes[axis].mode;
      updateAxisDisplay(quadrantControls, axis, { mode: actualMode });

      updateSliceFromQuadrantState();
    });
  });
}

/**
 * Update slice from quadrant state
 * Extracts multi-axis slice and updates the 3D scene
 */
function updateSliceFromQuadrantState() {
  if (!appInstance || !quadrantState) return;

  const state = appInstance.getState();
  const currentMatrix = state.matrix;
  if (!currentMatrix) return;

  const extracted = extractMultiAxisSlice(currentMatrix, quadrantState);

  // Get camera axes (non-locked) for updating both DOM and 3D axis indicator
  const cameraAxes = getCameraAxes(quadrantState);

  // Update DOM axis indicator text
  updateAxisIndicatorDOM();

  // Update 3D axis indicator (which axes are visible based on locked state)
  appInstance.updateAxisIndicator(cameraAxes);

  // Update camera rotation constraints based on lock count
  const rotationDims = getCameraRotationDimensions(quadrantState);
  updateControlsForRotationDimensions(rotationDims);

  // Update the app's wValue to reflect the primary slice axis
  const sliceAxes = Object.entries(quadrantState.axes)
    .filter(([_, a]) => a.mode === 'slice')
    .map(([axis, _]) => axis);

  if (sliceAxes.length > 0) {
    // Use the first slice axis as primary for the rendering
    const primarySliceAxis = sliceAxes[0];
    const sliceValue = quadrantState.axes[primarySliceAxis].sliceValue;

    // Update the app state with the new slice
    appInstance.updateSlice(currentMatrix, state.resolution, sliceValue, quadrantState);
  }
}

/**
 * Update the axis indicator DOM display
 * Shows which axes are currently free (displayed in view) as text labels
 * Per PRD F-108: shows camera axes (non-locked), with locked axes noted in brackets
 */
function updateAxisIndicatorDOM() {
  const indicator = document.getElementById('axis-indicator');
  if (!indicator) return;

  // Get camera axes (non-locked, displayed axes) and locked axes
  const cameraAxesList = getCameraAxes(quadrantState);
  const lockedAxes = quadrantState.lockedAxes || [];

  // Create indicator text - show camera axes as the main view per F-108
  const label = cameraAxesList.map(a => a.toUpperCase()).join('') || '—';
  if (lockedAxes.length > 0) {
    indicator.querySelector('.axis-indicator__label').textContent = label + ' [' + lockedAxes.map(a => a.toUpperCase()).join(',') + ']';
  } else {
    indicator.querySelector('.axis-indicator__label').textContent = label;
  }
}

/**
 * Set up event listeners for UI controls
 */
function setupControls() {
  // Quadrant controls (four-axis slice/free control)
  setupQuadrantControls();

  // Shape selector
  const shapeSelector = document.getElementById('shape-selector');
  if (shapeSelector) {
    shapeSelector.addEventListener('change', (e) => {
      const newShape = e.target.value;
      appInstance.update({ currentShape: newShape });

      // Reset quadrant controls to default state
      if (quadrantControls) {
        ['x', 'y', 'z', 'w'].forEach(axis => {
          const defaultMode = axis === 'w' ? 'slice' : 'free';
          const defaultValue = axis === 'w' ? 12 : 12;
          updateAxisDisplay(quadrantControls, axis, { mode: defaultMode, sliceValue: defaultValue });
        });
      }
    });
  }

  // Screenshot button
  const screenshotBtn = document.getElementById('screenshot-btn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', () => {
      if (appInstance) {
        appInstance.takeScreenshot();
      }
    });
  }

  // Point spacing control
  const pointSpacingContainer = document.querySelector('.point-spacing-controls');
  if (pointSpacingContainer) {
    const slider = pointSpacingContainer.querySelector('.slice-slider');
    const valueDisplay = pointSpacingContainer.querySelector('.value-display');

    // Make point spacing value display editable
    if (valueDisplay) {
      makePointSpacingEditable(valueDisplay, slider);
    }

    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        if (valueDisplay) {
          valueDisplay.textContent = value;
        }
        if (appInstance) {
          appInstance.update({ pointSpacing: value });
        }
      });
    }
  }
}

/**
 * Make point spacing value display editable via click
 * @param {HTMLElement} displayElement - The .value-display element
 * @param {HTMLElement} slider - The slider element
 */
function makePointSpacingEditable(displayElement, slider) {
  displayElement.style.cursor = 'pointer';
  displayElement.title = 'Click to edit spacing (1-6)';

  displayElement.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Don't trigger if already editing
    if (displayElement.querySelector('.value-input')) {
      return;
    }

    const currentValue = parseInt(displayElement.textContent, 10) || 1;

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'value-input';
    input.value = currentValue;
    input.min = 1;
    input.max = 6;
    input.step = 1;

    let handled = false;

    const commitValue = (newValue) => {
      if (handled) return;
      handled = true;

      const clampedValue = Math.max(1, Math.min(6, newValue));
      displayElement.textContent = clampedValue;
      displayElement.style.display = '';

      if (slider) {
        slider.value = clampedValue;
      }

      if (appInstance) {
        appInstance.update({ pointSpacing: clampedValue });
      }

      // Remove input synchronously
      if (input.parentElement) {
        input.parentElement.removeChild(input);
      }
    };

    const cancelEdit = () => {
      if (handled) return;
      handled = true;

      displayElement.textContent = currentValue;
      displayElement.style.display = '';

      // Remove input synchronously
      if (input.parentElement) {
        input.parentElement.removeChild(input);
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        commitValue(parseInt(input.value, 10));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelEdit();
      }
    });

    // Blur commits immediately without setTimeout, using handled flag to prevent double-commit
    input.addEventListener('blur', () => {
      // Only commit if not already handled and input still has a valid parent
      if (!handled && input.parentElement) {
        commitValue(parseInt(input.value, 10));
      }
    });

    input.addEventListener('focus', () => {
      input.select();
    });

    // Hide display and show input
    displayElement.style.display = 'none';
    displayElement.parentElement.insertBefore(input, displayElement);
    input.focus();
  });
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event
 */
function handleKeyboardShortcuts(event) {
  if (!appInstance) return;

  // Prevent default for arrow keys to avoid page scrolling
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
  }

  // Get current value of the focused axis
  const currentValue = quadrantState?.axes[focusedAxis]?.sliceValue ?? 12;

  switch (event.key) {
    case 'ArrowLeft':
      // Decrease focused axis slice value
      if (currentValue > 0) {
        const newValue = currentValue - 1;
        if (quadrantControls) {
          updateAxisDisplay(quadrantControls, focusedAxis, { sliceValue: newValue });
        }
        if (quadrantState) {
          quadrantState = setSliceValue(quadrantState, focusedAxis, newValue);
          updateSliceFromQuadrantState();
        }
      }
      break;

    case 'ArrowRight':
      // Increase focused axis slice value
      if (currentValue < 23) {
        const newValue = currentValue + 1;
        if (quadrantControls) {
          updateAxisDisplay(quadrantControls, focusedAxis, { sliceValue: newValue });
        }
        if (quadrantState) {
          quadrantState = setSliceValue(quadrantState, focusedAxis, newValue);
          updateSliceFromQuadrantState();
        }
      }
      break;

    case 'x':
    case 'X':
      focusedAxis = 'x';
      break;

    case 'y':
    case 'Y':
      focusedAxis = 'y';
      break;

    case 'z':
    case 'Z':
      focusedAxis = 'z';
      break;

    case 'w':
    case 'W':
      focusedAxis = 'w';
      break;

    case '1':
      appInstance.update({ currentShape: 'tesseract' });
      break;

    case '2':
      appInstance.update({ currentShape: 'sphere' });
      break;

    case '3':
      appInstance.update({ currentShape: 'octahedron' });
      break;

    case '4':
      appInstance.update({ currentShape: 'dodecahedron' });
      break;

    case '5':
      appInstance.update({ currentShape: 'icosahedron' });
      break;

    case '6':
      appInstance.update({ currentShape: 'torus' });
      break;
  }
}

/**
 * Update the displayed slice based on current state
 */
function updateSliceFromState() {
  if (!appInstance) return;

  const state = appInstance.getState();
  const matrix = state.matrix;

  if (matrix) {
    appInstance.updateSlice(matrix, state.resolution, state.wValue);
  }
}

/**
 * Handle visibility change (pause when tab hidden)
 */
function onVisibilityChange() {
  if (document.hidden) {
    if (appInstance) {
      appInstance.stop();
    }
  } else {
    if (appInstance && initialized) {
      appInstance.start();
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
} else {
  // DOM already loaded, initialize immediately
  onDOMContentLoaded();
}

// Handle visibility change for performance
document.addEventListener('visibilitychange', onVisibilityChange);

// Export for testing
export { appInstance, canvasContainer };