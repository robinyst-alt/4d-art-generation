/**
 * Main - Application Entry Point
 *
 * Initializes the 4D Art application on DOM content loaded.
 * Handles Three.js loading and app bootstrapping.
 */

import { createApp } from './app.js';

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

  // Set initial w to middle of range (where most shapes are visible)
  const initialW = 12;

  // Initialize rendering
  appInstance.init(canvasContainer);

  // Generate initial shape
  const matrix = appInstance.generate();

  // Update slice at w=12 (middle of range)
  const state = appInstance.getState();
  appInstance.updateSlice(matrix, state.resolution, initialW);

  // Update w slider to match
  const wSlider = document.getElementById('w-slider');
  const wValue = document.getElementById('w-value');
  if (wSlider) {
    wSlider.value = initialW;
    wSlider.max = state.resolution - 1;
  }
  if (wValue) {
    wValue.textContent = initialW;
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
 * Set up event listeners for UI controls
 */
function setupControls() {
  // Shape selector
  const shapeSelector = document.getElementById('shape-selector');
  if (shapeSelector) {
    shapeSelector.addEventListener('change', (e) => {
      const newShape = e.target.value;
      // Reset W slider to middle value when shape changes
      const wSlider = document.getElementById('w-slider');
      const wValue = document.getElementById('w-value');
      const middleW = Math.floor(24 / 2); // Default resolution / 2
      if (wSlider) {
        wSlider.value = middleW;
        wSlider.max = 23;
      }
      if (wValue) wValue.textContent = middleW;
      // Update shape
      appInstance.update({ currentShape: newShape });
    });
  }

  // W slider
  const wSlider = document.getElementById('w-slider');
  const wValue = document.getElementById('w-value');
  if (wSlider) {
    wSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      if (wValue) wValue.textContent = value;
      appInstance.update({ wValue: value });
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

  const state = appInstance.getState();

  switch (event.key) {
    case 'ArrowLeft':
      // Decrease W value
      if (state.wValue > 0) {
        const newW = state.wValue - 1;
        appInstance.update({ wValue: newW });
        // Update slider UI
        const wSlider = document.getElementById('w-slider');
        const wValue = document.getElementById('w-value');
        if (wSlider) wSlider.value = newW;
        if (wValue) wValue.textContent = newW;
      }
      break;

    case 'ArrowRight':
      // Increase W value
      if (state.wValue < state.resolution - 1) {
        const newW = state.wValue + 1;
        appInstance.update({ wValue: newW });
        // Update slider UI
        const wSlider = document.getElementById('w-slider');
        const wValue = document.getElementById('w-value');
        if (wSlider) wSlider.value = newW;
        if (wValue) wValue.textContent = newW;
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