/**
 * UI Controls Tests
 *
 * Test suite for user interface controls (w-axis slider, parameter panel)
 * Uses mock DOM implementation for Node.js environment
 */

import { initControls, onParamChange, setValue, getValues, resetControls } from '../../js/ui/controls.js';

// Mock DOM environment for Node.js
global.window = { devicePixelRatio: 2 };

// Global element registry
const elementRegistry = {};

function clearRegistry() {
  Object.keys(elementRegistry).forEach(key => delete elementRegistry[key]);
}

function registerElement(dataControl, element) {
  elementRegistry[dataControl] = element;
}

function getRegisteredElement(dataControl) {
  return elementRegistry[dataControl] || null;
}

// Create mock element factory
function createMockElement(tagName, dataControl = null) {
  const element = {
    tagName: tagName.toUpperCase(),
    children: [],
    innerHTML: '',
    value: '',
    textContent: '',
    style: {},
    disabled: false,
    type: tagName === 'input' ? 'range' : 'select-one',
    options: [],
    selectedIndex: 0,
    _listeners: {},
    _dataControl: dataControl,
    _innerHTML: '',

    get innerHTML() {
      return this._innerHTML;
    },

    set innerHTML(html) {
      this._innerHTML = html;
    },

    querySelector: function(selector) {
      const attrMatch = selector.match(/\[data-control="([^"]+)"\]/);
      if (attrMatch) {
        return getRegisteredElement(attrMatch[1]);
      }
      return null;
    },

    querySelectorAll: function() {
      return [];
    },

    addEventListener: function(event, handler) {
      this._listeners[event] = this._listeners[event] || [];
      this._listeners[event].push(handler);
    },

    removeEventListener: function(event, handler) {
      if (this._listeners[event]) {
        this._listeners[event] = this._listeners[event].filter(h => h !== handler);
      }
    },

    dispatchEvent: function(event) {
      const eventWithTarget = {
        ...event,
        target: this
      };
      const handlers = this._listeners[event.type] || [];
      handlers.forEach(h => h(eventWithTarget));
    },

    appendChild: function(child) {
      this.children.push(child);
      return child;
    },

    getAttribute: function(attr) {
      if (attr === 'data-control') return this._dataControl;
      return null;
    }
  };

  if (dataControl) {
    registerElement(dataControl, element);
  }

  return element;
}

// Create mock document
global.document = {
  createElement: function(tagName) {
    return createMockElement(tagName);
  }
};

// Create container with pre-registered child elements
function createMockContainer() {
  const container = createMockElement('div');

  // Register all control elements before initControls runs
  registerElement('w-slider', createMockElement('input', 'w-slider'));
  registerElement('w-value', createMockElement('span', 'w-value'));
  registerElement('shape-selector', createMockElement('select', 'shape-selector'));
  registerElement('resolution', createMockElement('input', 'resolution'));
  registerElement('resolution-value', createMockElement('span', 'resolution-value'));
  registerElement('color-theme', createMockElement('select', 'color-theme'));
  registerElement('transparency', createMockElement('input', 'transparency'));
  registerElement('transparency-value', createMockElement('span', 'transparency-value'));

  // Override querySelector to use registry
  container.querySelector = function(selector) {
    const attrMatch = selector.match(/\[data-control="([^"]+)"\]/);
    if (attrMatch) {
      return getRegisteredElement(attrMatch[1]);
    }
    return null;
  };

  return container;
}

describe('UI Controls', () => {
  beforeEach(() => {
    clearRegistry();
  });

  describe('initControls', () => {
    test('should initialize controls and return controls object', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      expect(controls).toBeDefined();
      expect(controls.container).toBe(container);
      expect(controls.values).toBeDefined();
    });

    test('should create w-axis slider', () => {
      const container = createMockContainer();
      initControls(container);

      const slider = container.querySelector('[data-control="w-slider"]');
      expect(slider).toBeDefined();
      expect(slider.type).toBe('range');
    });

    test('should create shape selector', () => {
      const container = createMockContainer();
      initControls(container);

      const selector = container.querySelector('[data-control="shape-selector"]');
      expect(selector).toBeDefined();
    });

    test('should create resolution control', () => {
      const container = createMockContainer();
      initControls(container);

      const resolution = container.querySelector('[data-control="resolution"]');
      expect(resolution).toBeDefined();
    });

    test('should set initial default values', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      expect(controls.values.w).toBe(0);
      expect(controls.values.resolution).toBe(24);
      expect(controls.values.colorTheme).toBe('neon');
      expect(controls.values.transparency).toBe(100);
      expect(controls.values.shape).toBe('tesseract');
    });
  });

  describe('onParamChange', () => {
    test('should register callback for parameter changes', () => {
      const container = createMockContainer();
      const controls = initControls(container);
      const callback = () => {};

      const unregister = onParamChange(controls, 'w', callback);

      expect(typeof unregister).toBe('function');
    });

    test('should call callback when w value changes', () => {
      const container = createMockContainer();
      const controls = initControls(container);
      let receivedValue = null;
      const callback = (value) => { receivedValue = value; };

      onParamChange(controls, 'w', callback);

      // Simulate slider change
      const slider = container.querySelector('[data-control="w-slider"]');
      slider.value = '12';
      slider.dispatchEvent({ type: 'input' });

      expect(receivedValue).toBe(12);
    });

    test('should allow unregistering callback', () => {
      const container = createMockContainer();
      const controls = initControls(container);
      let callCount = 0;
      const callback = () => { callCount++; };

      const unregister = onParamChange(controls, 'w', callback);
      unregister();

      const slider = container.querySelector('[data-control="w-slider"]');
      slider.value = '5';
      slider.dispatchEvent({ type: 'input' });

      expect(callCount).toBe(0);
    });
  });

  describe('setValue', () => {
    test('should set w value programmatically', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      setValue(controls, 'w', 15);

      expect(controls.values.w).toBe(15);
    });

    test('should set resolution value programmatically', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      setValue(controls, 'resolution', 16);

      expect(controls.values.resolution).toBe(16);
    });

    test('should set color theme programmatically', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      setValue(controls, 'colorTheme', 'cyberpunk');

      expect(controls.values.colorTheme).toBe('cyberpunk');
    });

    test('should set transparency programmatically', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      setValue(controls, 'transparency', 50);

      expect(controls.values.transparency).toBe(50);
    });

    test('should set shape programmatically', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      setValue(controls, 'shape', 'sphere');

      expect(controls.values.shape).toBe('sphere');
    });

    test('should throw error for unknown parameter', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      expect(() => setValue(controls, 'unknown', 10)).toThrow('Unknown parameter');
    });
  });

  describe('getValues', () => {
    test('should return current control values', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      const values = getValues(controls);

      expect(values).toEqual({
        w: 0,
        resolution: 24,
        colorTheme: 'neon',
        transparency: 100,
        shape: 'tesseract'
      });
    });

    test('should return a copy of values (immutable)', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      const values1 = getValues(controls);
      const values2 = getValues(controls);

      expect(values1).not.toBe(values2);
      expect(values1).toEqual(values2);
    });
  });

  describe('resetControls', () => {
    test('should reset all controls to default values', () => {
      const container = createMockContainer();
      const controls = initControls(container);

      // Change some values
      setValue(controls, 'w', 10);
      setValue(controls, 'resolution', 16);
      setValue(controls, 'colorTheme', 'cyberpunk');

      resetControls(controls);

      expect(controls.values.w).toBe(0);
      expect(controls.values.resolution).toBe(24);
      expect(controls.values.colorTheme).toBe('neon');
    });
  });
});