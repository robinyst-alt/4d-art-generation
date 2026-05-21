/**
 * Quadrant UI Controls
 *
 * Manages the UI components for four-axis slice/free control
 * - Axis label (X/Y/Z/W)
 * - Mode toggle button (slice/free)
 * - Slice slider
 * - Value display [0-23]
 */

const AXES = ['x', 'y', 'z', 'w'];

/**
 * Create quadrant controls manager
 * @param {HTMLElement} container - Container element with quadrant controls HTML
 * @returns {Object} Controls manager object
 */
export function createQuadrantControls(container) {
  const controls = {
    container,
    axes: {
      x: { mode: 'free', sliceValue: 12 },
      y: { mode: 'free', sliceValue: 12 },
      z: { mode: 'free', sliceValue: 12 },
      w: { mode: 'slice', sliceValue: 12 }
    },
    listeners: {}
  };

  // Bind event listeners
  bindAxisEvents(container, controls);

  return controls;
}

/**
 * Bind event listeners for all axis controls
 * @param {HTMLElement} container - Container element
 * @param {Object} controls - Controls manager object
 */
function bindAxisEvents(container, controls) {
  AXES.forEach(axis => {
    const axisElement = container.querySelector(`[data-axis="${axis}"]`);
    if (!axisElement) return;

    const modeButton = axisElement.querySelector('.mode-toggle');
    const slider = axisElement.querySelector('.slice-slider');

    // Skip if required elements are missing
    if (!modeButton || !slider) return;

    // Mode toggle click
    modeButton.addEventListener('click', () => {
      const newMode = controls.axes[axis].mode === 'slice' ? 'free' : 'slice';
      notifyListeners(controls, axis, 'mode', newMode);
    });

    // Slider input
    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      controls.axes[axis].sliceValue = value;

      // Update value display
      const valueDisplay = axisElement.querySelector('.value-display');
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }

      notifyListeners(controls, axis, 'value', value);
    });
  });
}

/**
 * Get state for a specific axis
 * @param {Object} controls - Controls manager object
 * @param {string} axis - Axis name (x, y, z, w)
 * @returns {Object} Axis state { mode, sliceValue }
 * @throws {Error} If axis is invalid
 */
export function getAxisState(controls, axis) {
  if (!AXES.includes(axis)) {
    throw new Error(`Invalid axis: ${axis}. Must be one of ${AXES.join(', ')}`);
  }

  return {
    mode: controls.axes[axis].mode,
    sliceValue: controls.axes[axis].sliceValue
  };
}

/**
 * Update axis display elements
 * @param {Object} controls - Controls manager object
 * @param {string} axis - Axis name
 * @param {Object} updates - Object with mode and/or sliceValue
 */
export function updateAxisDisplay(controls, axis, updates) {
  if (!AXES.includes(axis)) {
    throw new Error(`Invalid axis: ${axis}`);
  }

  const axisElement = controls.container.querySelector(`[data-axis="${axis}"]`);
  if (!axisElement) return;

  if (updates.mode !== undefined) {
    controls.axes[axis].mode = updates.mode;

    const modeButton = axisElement.querySelector('.mode-toggle');
    modeButton.textContent = updates.mode === 'slice' ? '切片' : '自由';
    modeButton.dataset.mode = updates.mode;
  }

  if (updates.sliceValue !== undefined) {
    // Clamp value to [0, 23]
    const clampedValue = Math.max(0, Math.min(23, updates.sliceValue));
    controls.axes[axis].sliceValue = clampedValue;

    const slider = axisElement.querySelector('.slice-slider');
    const valueDisplay = axisElement.querySelector('.value-display');

    slider.value = clampedValue;
    valueDisplay.textContent = clampedValue;
  }
}

/**
 * Register callback for axis changes
 * @param {Object} controls - Controls manager object
 * @param {string} axis - Axis name
 * @param {string} property - Property name ('mode' or 'value')
 * @param {Function} callback - Callback function(newValue)
 * @returns {Function} Unregister function
 */
export function onAxisChange(controls, axis, property, callback) {
  const key = `${axis}-${property}`;
  if (!controls.listeners[key]) {
    controls.listeners[key] = [];
  }

  controls.listeners[key].push(callback);

  return () => {
    const index = controls.listeners[key].indexOf(callback);
    if (index > -1) {
      controls.listeners[key].splice(index, 1);
    }
  };
}

/**
 * Notify listeners of axis change
 * @param {Object} controls - Controls manager object
 * @param {string} axis - Axis name
 * @param {string} property - Property name
 * @param {*} value - New value
 */
function notifyListeners(controls, axis, property, value) {
  const key = `${axis}-${property}`;
  if (controls.listeners[key]) {
    controls.listeners[key].forEach(callback => callback(value));
  }
}

/**
 * Get all axis states
 * @param {Object} controls - Controls manager object
 * @returns {Object} All axis states
 */
export function getAllAxisStates(controls) {
  return {
    x: getAxisState(controls, 'x'),
    y: getAxisState(controls, 'y'),
    z: getAxisState(controls, 'z'),
    w: getAxisState(controls, 'w')
  };
}