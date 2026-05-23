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
  extractMultiAxisSlice
} from './quadrant/stateManager.js';

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
      updateAxisDisplay(quadrantControls, axis, { mode: actualMode });

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

  // Get free axes for updating both DOM and 3D axis indicator
  const freeAxes = Object.entries(quadrantState.axes)
    .filter(([_, a]) => a.mode === 'free')
    .map(([axis, _]) => axis);

  // Update DOM axis indicator text
  updateAxisIndicatorDOM();

  // Update 3D axis indicator (which axes are visible based on quadrant state)
  appInstance.updateAxisIndicator(freeAxes);

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
 */
function updateAxisIndicatorDOM() {
  const indicator = document.getElementById('axis-indicator');
  if (!indicator) return;

  // Get free axes (displayed axes) and slice axes
  const freeAxesList = Object.entries(quadrantState.axes)
    .filter(([_, a]) => a.mode === 'free')
    .map(([axis, _]) => axis);

  const sliceAxes = Object.entries(quadrantState.axes)
    .filter(([_, a]) => a.mode === 'slice')
    .map(([axis, _]) => axis.toUpperCase());

  // Create indicator text
  const label = freeAxesList.map(a => a.toUpperCase()).join('') || '—';
  if (sliceAxes.length > 0) {
    indicator.querySelector('.axis-indicator__label').textContent = label + ' [' + sliceAxes.join(',') + ']';
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