/**
 * Quadrant UI Controls Tests
 *
 * Test suite for UI controls including:
 * - Mode toggle (slice/free)
 * - Slice slider
 * - Value display
 * - Axis label
 */

import {
  createQuadrantControls,
  getAxisState,
  updateAxisDisplay
} from '../../js/quadrant/controls.js';

describe('Quadrant UI Controls', () => {
  let container;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    container.innerHTML = `
      <div class="quadrant-controls">
        <div class="axis-control" data-axis="x">
          <span class="axis-label">X</span>
          <button class="mode-toggle" data-mode="free">自由</button>
          <input type="range" class="slice-slider" min="0" max="23" value="12" />
          <span class="value-display">12</span>
        </div>
        <div class="axis-control" data-axis="y">
          <span class="axis-label">Y</span>
          <button class="mode-toggle" data-mode="slice">切片</button>
          <input type="range" class="slice-slider" min="0" max="23" value="7" />
          <span class="value-display">7</span>
        </div>
        <div class="axis-control" data-axis="z">
          <span class="axis-label">Z</span>
          <button class="mode-toggle" data-mode="free">自由</button>
          <input type="range" class="slice-slider" min="0" max="23" value="12" />
          <span class="value-display">12</span>
        </div>
        <div class="axis-control" data-axis="w">
          <span class="axis-label">W</span>
          <button class="mode-toggle" data-mode="slice">切片</button>
          <input type="range" class="slice-slider" min="0" max="23" value="0" />
          <span class="value-display">0</span>
        </div>
      </div>
    `;
  });

  describe('createQuadrantControls', () => {
    test('should initialize with default state', () => {
      const controls = createQuadrantControls(container);

      expect(controls).toBeDefined();
      expect(controls.axes.x.mode).toBe('free');
      expect(controls.axes.y.mode).toBe('free');
      expect(controls.axes.z.mode).toBe('free');
      expect(controls.axes.w.mode).toBe('slice');
    });

    test('should create independent copies for each axis', () => {
      const controls1 = createQuadrantControls(container);
      const controls2 = createQuadrantControls(container);

      controls1.axes.w.sliceValue = 10;
      expect(controls2.axes.w.sliceValue).toBe(12);
    });
  });

  describe('getAxisState', () => {
    test('should return state for x axis', () => {
      const controls = createQuadrantControls(container);
      const state = getAxisState(controls, 'x');

      expect(state.mode).toBe('free');
      expect(state.sliceValue).toBe(12);
    });

    test('should return state for y axis', () => {
      const controls = createQuadrantControls(container);
      const state = getAxisState(controls, 'y');

      expect(state.mode).toBe('free');
      expect(state.sliceValue).toBe(12);
    });

    test('should throw for invalid axis', () => {
      const controls = createQuadrantControls(container);

      expect(() => getAxisState(controls, 'invalid')).toThrow();
    });
  });

  describe('updateAxisDisplay', () => {
    test('should update value display when slice value changes', () => {
      const controls = createQuadrantControls(container);
      const axisElement = container.querySelector('[data-axis="x"]');

      updateAxisDisplay(controls, 'x', { sliceValue: 15 });

      const valueDisplay = axisElement.querySelector('.value-display');
      expect(valueDisplay.textContent).toBe('15');
    });

    test('should update slider position when slice value changes', () => {
      const controls = createQuadrantControls(container);
      const axisElement = container.querySelector('[data-axis="x"]');

      updateAxisDisplay(controls, 'x', { sliceValue: 15 });

      const slider = axisElement.querySelector('.slice-slider');
      expect(slider.value).toBe('15');
    });

    test('should update mode button when mode changes', () => {
      const controls = createQuadrantControls(container);
      const axisElement = container.querySelector('[data-axis="x"]');

      updateAxisDisplay(controls, 'x', { mode: 'slice' });

      const modeButton = axisElement.querySelector('.mode-toggle');
      expect(modeButton.textContent).toBe('切片');
      expect(modeButton.dataset.mode).toBe('slice');
    });

    test('should update multiple properties at once', () => {
      const controls = createQuadrantControls(container);
      const axisElement = container.querySelector('[data-axis="x"]');

      updateAxisDisplay(controls, 'x', { mode: 'slice', sliceValue: 8 });

      const modeButton = axisElement.querySelector('.mode-toggle');
      const slider = axisElement.querySelector('.slice-slider');
      const valueDisplay = axisElement.querySelector('.value-display');

      expect(modeButton.textContent).toBe('切片');
      expect(slider.value).toBe('8');
      expect(valueDisplay.textContent).toBe('8');
    });
  });
});

describe('Mode Toggle Logic', () => {
  test('should reflect mode state in button text', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="quadrant-controls">
        <div class="axis-control" data-axis="w">
          <span class="axis-label">W</span>
          <button class="mode-toggle" data-mode="slice">切片</button>
        </div>
      </div>
    `;

    const controls = createQuadrantControls(container);
    expect(controls.axes.w.mode).toBe('slice');
  });
});

describe('Slider Value Constraints', () => {
  test('should clamp slider values to [0, 23]', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="quadrant-controls">
        <div class="axis-control" data-axis="x">
          <span class="axis-label">X</span>
          <button class="mode-toggle">自由</button>
          <input type="range" class="slice-slider" min="0" max="23" value="12" />
          <span class="value-display">12</span>
        </div>
      </div>
    `;

    const controls = createQuadrantControls(container);

    // Test that values are clamped
    updateAxisDisplay(controls, 'x', { sliceValue: 100 });
    expect(controls.axes.x.sliceValue).toBe(23);

    updateAxisDisplay(controls, 'x', { sliceValue: -10 });
    expect(controls.axes.x.sliceValue).toBe(0);
  });
});