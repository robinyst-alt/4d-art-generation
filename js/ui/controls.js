/**
 * UI Controls
 *
 * User interface controls for 4D Art application:
 * - W-axis slider for exploring 4D slices
 * - Shape selector dropdown
 * - Resolution slider
 * - Color theme selector
 * - Transparency slider
 */

/**
 * Control types
 */
export const CONTROL_TYPES = {
  W_SLIDER: 'w-slider',
  SHAPE_SELECTOR: 'shape-selector',
  RESOLUTION: 'resolution',
  COLOR_THEME: 'color-theme',
  TRANSPARENCY: 'transparency'
};

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
const escapeHtml = (str) => str.replace(/[&<>"']/g, (c) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

/**
 * Available 4D shapes
 */
export const SHAPES = [
  { id: 'tesseract', name: 'Tesseract (Hypercube)' },
  { id: 'sphere', name: '4D Sphere' },
  { id: 'octahedron', name: '4D Octahedron' },
  { id: 'dodecahedron', name: '4D Dodecahedron' },
  { id: 'icosahedron', name: '4D Icosahedron' },
  { id: 'torus', name: '4D Torus' }
];

/**
 * Initialize controls in container element
 * @param {HTMLElement} container - Container element to render controls into
 * @returns {Object} Controls object with methods
 */
export function initControls(container) {
  const controls = {
    container: container,
    values: {
      w: 0,
      resolution: 24,
      colorTheme: 'neon',
      transparency: 100,
      shape: 'tesseract'
    },
    listeners: {}
  };

  // Create HTML structure for controls
  container.innerHTML = `
    <div class="controls-panel">
      <div class="control-group">
        <label data-control="w-label">W Axis</label>
        <input type="range"
               data-control="w-slider"
               min="0"
               max="23"
               value="0"
               step="1" />
        <span data-control="w-value">0</span>
      </div>

      <div class="control-group">
        <label data-control="shape-label">Shape</label>
        <select data-control="shape-selector">
          ${SHAPES.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
        </select>
      </div>

      <div class="control-group">
        <label data-control="resolution-label">Resolution</label>
        <input type="range"
               data-control="resolution"
               min="8"
               max="32"
               value="24"
               step="1" />
        <span data-control="resolution-value">24</span>
      </div>

      <div class="control-group">
        <label data-control="theme-label">Color Theme</label>
        <select data-control="color-theme">
          <option value="neon">Neon</option>
          <option value="sketch">Sketch</option>
          <option value="firefly">Firefly</option>
          <option value="aurora">Aurora</option>
          <option value="cyberpunk">Cyberpunk</option>
        </select>
      </div>

      <div class="control-group">
        <label data-control="transparency-label">Transparency</label>
        <input type="range"
               data-control="transparency"
               min="0"
               max="100"
               value="100"
               step="1" />
        <span data-control="transparency-value">100%</span>
      </div>
    </div>
  `;

  // Add event listeners
  const wSlider = container.querySelector('[data-control="w-slider"]');
  const shapeSelector = container.querySelector('[data-control="shape-selector"]');
  const resolutionSlider = container.querySelector('[data-control="resolution"]');
  const colorTheme = container.querySelector('[data-control="color-theme"]');
  const transparencySlider = container.querySelector('[data-control="transparency"]');

  wSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    controls.values.w = value;
    container.querySelector('[data-control="w-value"]').textContent = value;
    notifyListeners(controls, 'w', value);
  });

  shapeSelector.addEventListener('change', (e) => {
    const value = e.target.value;
    controls.values.shape = value;
    notifyListeners(controls, 'shape', value);
  });

  resolutionSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    controls.values.resolution = value;
    container.querySelector('[data-control="resolution-value"]').textContent = value;
    notifyListeners(controls, 'resolution', value);
  });

  colorTheme.addEventListener('change', (e) => {
    const value = e.target.value;
    controls.values.colorTheme = value;
    notifyListeners(controls, 'colorTheme', value);
  });

  transparencySlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    controls.values.transparency = value;
    container.querySelector('[data-control="transparency-value"]').textContent = `${value}%`;
    notifyListeners(controls, 'transparency', value);
  });

  return controls;
}

/**
 * Register callback for parameter changes
 * @param {Object} controls - Controls object from initControls
 * @param {string} param - Parameter name ('w', 'resolution', etc.)
 * @param {Function} callback - Callback function(value)
 * @returns {Function} Unregister function
 */
export function onParamChange(controls, param, callback) {
  if (!controls.listeners[param]) {
    controls.listeners[param] = [];
  }

  controls.listeners[param].push(callback);

  return () => {
    const index = controls.listeners[param].indexOf(callback);
    if (index > -1) {
      controls.listeners[param].splice(index, 1);
    }
  };
}

/**
 * Set control value programmatically
 * @param {Object} controls - Controls object from initControls
 * @param {string} param - Parameter name
 * @param {*} value - New value
 * @throws {Error} If parameter is unknown
 */
export function setValue(controls, param, value) {
  const paramMap = {
    w: 'w-slider',
    resolution: 'resolution',
    colorTheme: 'color-theme',
    transparency: 'transparency',
    shape: 'shape-selector'
  };

  if (!paramMap[param]) {
    throw new Error(`Unknown parameter: ${param}`);
  }

  const element = controls.container.querySelector(`[data-control="${paramMap[param]}"]`);

  if (element) {
    element.value = value;

    // Trigger input event to notify listeners
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  }

  controls.values[param] = value;
}

/**
 * Notify all listeners of parameter change
 * @param {Object} controls - Controls object
 * @param {string} param - Parameter name
 * @param {*} value - New value
 */
function notifyListeners(controls, param, value) {
  if (controls.listeners[param]) {
    controls.listeners[param].forEach(callback => callback(value));
  }
}

/**
 * Reset all controls to default values
 * @param {Object} controls - Controls object
 */
export function resetControls(controls) {
  setValue(controls, 'w', 0);
  setValue(controls, 'resolution', 24);
  setValue(controls, 'colorTheme', 'neon');
  setValue(controls, 'transparency', 100);
  setValue(controls, 'shape', 'tesseract');
}

/**
 * Get current control values
 * @param {Object} controls - Controls object
 * @returns {Object} Current values
 */
export function getValues(controls) {
  return { ...controls.values };
}