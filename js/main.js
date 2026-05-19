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
 * Initialize the application
 * @returns {Function} Cleanup function to tear down the application
 */
export function initApp() {
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

  // Create app instance
  appInstance = createApp();

  // Initialize rendering
  appInstance.init(canvasContainer);

  // Generate initial shape
  matrix = appInstance.generate();

  // Set initial quadrant state to middle of range
  const initialSliceValue = Math.floor(24 / 2);
  if (quadrantControls) {
    ['x', 'y', 'z'].forEach(axis => {
      updateAxisDisplay(quadrantControls, axis, { sliceValue: initialSliceValue });
    });
    // W starts at 0 (slice mode)
    updateAxisDisplay(quadrantControls, 'w', { sliceValue: 0 });
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
function onDOMContentLoaded() {
  // Initialize app after DOM is ready
  initApp();

  // Set up language toggle (must be after initApp to ensure DOM is ready)
  setupLanguageToggle();

  // Set up UI control event listeners
  setupControls();

  // Set up keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Internationalization translations
 */
const TRANSLATIONS = {
  en: {
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
    resolution: 'Resolution',
    resolution_description: 'Grid resolution (higher = more detail)',
    color_theme: 'Color Theme',
    theme_neon: 'Neon',
    theme_sketch: 'Sketch',
    theme_firefly: 'Firefly',
    theme_aurora: 'Aurora',
    theme_cyber: 'Cyber',
    transparency: 'Transparency',
    transparency_description: 'Adjust point cloud opacity',
    current_shape: 'Current Shape',
    info_resolution: 'Resolution',
    info_points: 'Points',
    info_hash: 'Hash',
    shortcuts: 'Shortcuts',
    shortcut_nav: 'Navigate W axis',
    shortcut_shape: 'Select shape',
    shortcut_theme: 'Cycle theme',
    loading: 'Generating...'
  },
  zh: {
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
    resolution: '分辨率',
    resolution_description: '网格分辨率（越高 = 更多细节）',
    color_theme: '颜色主题',
    theme_neon: '霓虹',
    theme_sketch: '素描',
    theme_firefly: '萤火虫',
    theme_aurora: '极光',
    theme_cyber: '赛博',
    transparency: '透明度',
    transparency_description: '调整点云不透明度',
    current_shape: '当前形状',
    info_resolution: '分辨率',
    info_points: '点数',
    info_hash: '哈希',
    shortcuts: '快捷键',
    shortcut_nav: '导航 W 轴',
    shortcut_shape: '选择形状',
    shortcut_theme: '循环主题',
    loading: '生成中...'
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

  // Load saved language preference
  const savedLang = localStorage.getItem('4d-art-lang') || 'en';
  currentLang = savedLang;
  applyLanguage(savedLang);

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
 * Quadrant state (four-axis slice control)
 */
let quadrantState = null;
let quadrantControls = null;
let matrix = null;

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

  // Listen for axis changes and update state
  ['x', 'y', 'z', 'w'].forEach(axis => {
    // Mode toggle
    onAxisChange(quadrantControls, axis, 'mode', (newMode) => {
      quadrantState = setAxisMode(quadrantState, axis, newMode);
      updateSliceFromQuadrantState();
    });

    // Value change
    onAxisChange(quadrantControls, axis, 'value', (newValue) => {
      quadrantState = setSliceValue(quadrantState, axis, newValue);
      updateSliceFromQuadrantState();
    });
  });
}

/**
 * Update slice from quadrant state
 */
function updateSliceFromQuadrantState() {
  if (!appInstance || !quadrantState || !matrix) return;

  const state = appInstance.getState();
  const extracted = extractMultiAxisSlice(matrix, quadrantState);

  // The extracted data needs to be converted to display format
  // This would require updating the scene rendering to handle multi-axis slices
  // For now, we update the UI to reflect the state
  console.log('Quadrant state updated:', quadrantState.axes);
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
          const defaultValue = axis === 'w' ? 0 : 12;
          updateAxisDisplay(quadrantControls, axis, { mode: defaultMode, sliceValue: defaultValue });
        });
      }
    });
  }

  // Resolution slider
  const resolutionSlider = document.getElementById('resolution-slider');
  const resolutionValue = document.getElementById('resolution-value');
  if (resolutionSlider) {
    resolutionSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      if (resolutionValue) resolutionValue.textContent = value;
      appInstance.update({ resolution: value });
    });
  }

  // Transparency slider
  const transparencySlider = document.getElementById('transparency-slider');
  const transparencyValue = document.getElementById('transparency-value');
  if (transparencySlider) {
    transparencySlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      if (transparencyValue) transparencyValue.textContent = `${value}%`;
      appInstance.update({ transparency: value });
    });
  }

  // Theme selector buttons
  const themeButtons = document.querySelectorAll('[data-theme]');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const theme = e.currentTarget.dataset.theme;
      // Update active state
      themeButtons.forEach(b => {
        b.classList.remove('theme-selector__option--active');
        b.setAttribute('aria-checked', 'false');
      });
      e.currentTarget.classList.add('theme-selector__option--active');
      e.currentTarget.setAttribute('aria-checked', 'true');
      // Apply theme
      appInstance.setTheme(theme);
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('4d-art-theme', theme);
    });
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

  // Get slice axes from quadrant state
  const sliceAxes = quadrantState
    ? Object.entries(quadrantState.axes)
        .filter(([_, axis]) => axis.mode === 'slice')
        .map(([axis, _]) => axis)
    : ['w'];

  // Get the primary slice axis (first slice axis found, default to w)
  const primaryAxis = sliceAxes.length > 0 ? sliceAxes[0] : 'w';
  const currentValue = quadrantState?.axes[primaryAxis]?.sliceValue ?? 12;

  switch (event.key) {
    case 'ArrowLeft':
      // Decrease primary slice axis value
      if (currentValue > 0) {
        const newValue = currentValue - 1;
        if (quadrantControls) {
          updateAxisDisplay(quadrantControls, primaryAxis, { sliceValue: newValue });
        }
        if (quadrantState) {
          quadrantState = setSliceValue(quadrantState, primaryAxis, newValue);
          updateSliceFromQuadrantState();
        }
      }
      break;

    case 'ArrowRight':
      // Increase primary slice axis value
      if (currentValue < 23) {
        const newValue = currentValue + 1;
        if (quadrantControls) {
          updateAxisDisplay(quadrantControls, primaryAxis, { sliceValue: newValue });
        }
        if (quadrantState) {
          quadrantState = setSliceValue(quadrantState, primaryAxis, newValue);
          updateSliceFromQuadrantState();
        }
      }
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

    case 't':
    case 'T':
      // Cycle through themes
      const themes = ['neon', 'sketch', 'firefly', 'aurora', 'cyberpunk'];
      const state = appInstance.getState();
      const currentIndex = themes.indexOf(state.colorTheme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      appInstance.setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('4d-art-theme', nextTheme);
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