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
 * Create an editable input element for direct value input
 * @param {number} currentValue - Current value to display
 * @param {string} axis - Axis name
 * @param {Function} onCommit - Callback when value is committed
 * @param {Function} onCancel - Callback when editing is cancelled
 * @returns {HTMLInputElement} Input element
 */
function createEditableInput(currentValue, axis, onCommit, onCancel) {
  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'value-input';
  input.value = currentValue;
  input.min = 0;
  input.max = 23;
  input.step = 1;

  // Track if input has already been handled (committed or cancelled)
  let handled = false;

  // Handle Enter key - commit value
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (handled) return;
      handled = true;
      const newValue = parseInt(input.value, 10);
      if (!isNaN(newValue) && newValue >= 0 && newValue <= 23) {
        onCommit(newValue);
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (handled) return;
      handled = true;
      onCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (handled) return;
      handled = true;
      const newValue = parseInt(input.value, 10);
      if (!isNaN(newValue) && newValue >= 0 && newValue <= 23) {
        onCommit(newValue);
      }
      // Move to next axis
      const nextAxis = AXES[(AXES.indexOf(axis) + (e.shiftKey ? -1 : 1) + AXES.length) % AXES.length];
      const nextDisplay = document.querySelector(`.axis-control[data-axis="${nextAxis}"] .value-display`);
      if (nextDisplay) {
        nextDisplay.click();
      }
    }
  });

  // Handle blur - commit value immediately if not already handled
  input.addEventListener('blur', () => {
    // Only commit if not already handled and input still has a valid parent
    if (!handled && input.parentElement) {
      handled = true;
      const newValue = parseInt(input.value, 10);
      if (!isNaN(newValue) && newValue >= 0 && newValue <= 23) {
        onCommit(newValue);
      } else {
        onCancel();
      }
    }
  });

  // Select all text on focus
  input.addEventListener('focus', () => {
    input.select();
  });

  return input;
}

/**
 * Make a value display editable via click
 * @param {HTMLElement} displayElement - The .value-display element
 * @param {string} axis - Axis name
 * @param {Object} controls - Controls manager object
 * @param {Function} notifyListeners - Function to notify listeners
 */
function makeDisplayEditable(displayElement, axis, controls, notifyListeners) {
  displayElement.style.cursor = 'pointer';
  displayElement.title = 'Click to edit value (0-23)';

  displayElement.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Don't trigger if already editing
    if (displayElement.querySelector('.value-input')) {
      return;
    }

    const currentValue = controls.axes[axis].sliceValue;

    // Create input and replace display content
    const input = createEditableInput(
      currentValue,
      axis,
      (newValue) => {
        // Commit the new value
        controls.axes[axis].sliceValue = newValue;
        displayElement.textContent = newValue;
        displayElement.style.display = '';

        // Remove the input element
        if (input.parentElement) {
          input.parentElement.removeChild(input);
        }

        // Update slider
        const slider = displayElement.parentElement.querySelector('.slice-slider');
        if (slider) {
          slider.value = newValue;
        }

        notifyListeners(controls, axis, 'value', newValue);
      },
      () => {
        // Cancel - restore display
        displayElement.textContent = currentValue;
        displayElement.style.display = '';

        // Remove the input element
        if (input.parentElement) {
          input.parentElement.removeChild(input);
        }
      }
    );

    // Hide display and show input
    displayElement.style.display = 'none';
    displayElement.parentElement.insertBefore(input, displayElement);
    input.focus();
  });
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
    const valueDisplay = axisElement.querySelector('.value-display');

    // Skip if required elements are missing
    if (!modeButton || !slider || !valueDisplay) return;

    // Make value display editable
    makeDisplayEditable(valueDisplay, axis, controls, notifyListeners);

    // Mode toggle click
    modeButton.addEventListener('click', () => {
      const newMode = controls.axes[axis].mode === 'slice' ? 'free' : 'slice';
      notifyListeners(controls, axis, 'mode', newMode);
    });

    // Lock toggle click
    const lockButton = axisElement.querySelector('.lock-toggle');
    if (lockButton) {
      lockButton.addEventListener('click', () => {
        const currentLocked = lockButton.dataset.locked === 'true';
        const newLocked = !currentLocked;
        notifyListeners(controls, axis, 'lock', newLocked);
      });
    }

    // Slider input
    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      controls.axes[axis].sliceValue = value;

      // Update value display
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

  if (updates.locked !== undefined) {
    const lockButton = axisElement.querySelector('.lock-toggle');
    if (lockButton) {
      lockButton.dataset.locked = updates.locked.toString();
      lockButton.textContent = updates.locked ? '🔒' : '○';
    }
  }
}

/**
 * Register callback for axis changes
 * @param {Object} controls - Controls manager object
 * @param {string} axis - Axis name
 * @param {string} property - Property name ('mode', 'value', or 'lock')
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