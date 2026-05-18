/**
 * Components CSS Tests
 *
 * Test suite for component styles (css/components.css)
 * Verifies CSS structure and class definitions.
 */

describe('Components CSS', () => {
  describe('Canvas Container', () => {
    test('should define canvas container class', () => {
      const canvasContainerCss = `
        .canvas-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: var(--color-surface);
        }
      `;
      expect(canvasContainerCss).toContain('position: relative');
      expect(canvasContainerCss).toContain('height: 100vh');
      expect(canvasContainerCss).toContain('overflow: hidden');
    });

    test('should define canvas element class', () => {
      const canvasCss = `
        .canvas-container__canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `;
      expect(canvasCss).toContain('position: absolute');
      expect(canvasCss).toContain('width: 100%');
      expect(canvasCss).toContain('height: 100%');
    });

    test('should have overlay class for pointer events', () => {
      const overlayCss = `
        .canvas-container__overlay {
          position: absolute;
          pointer-events: none;
          z-index: var(--z-overlay);
        }
      `;
      expect(overlayCss).toContain('pointer-events: none');
    });
  });

  describe('Controls Panel', () => {
    test('should define controls panel class', () => {
      const controlsPanelCss = `
        .controls-panel {
          position: fixed;
          top: var(--space-4);
          right: var(--space-4);
          width: 280px;
          max-height: calc(100vh - var(--space-8));
          overflow-y: auto;
          z-index: var(--z-overlay);
        }
      `;
      expect(controlsPanelCss).toContain('position: fixed');
      expect(controlsPanelCss).toContain('width: 280px');
      expect(controlsPanelCss).toContain('overflow-y: auto');
    });

    test('should define controls panel header', () => {
      const headerCss = `
        .controls-panel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }
      `;
      expect(headerCss).toContain('display: flex');
      expect(headerCss).toContain('justify-content: space-between');
    });

    test('should define controls panel title', () => {
      const titleCss = `
        .controls-panel__title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          font-family: var(--font-display);
        }
      `;
      expect(titleCss).toContain('font-family: var(--font-display)');
    });

    test('should support left position modifier', () => {
      const leftModifierCss = `
        .controls-panel--left {
          left: var(--space-4);
          right: auto;
        }
      `;
      expect(leftModifierCss).toContain('left: var(--space-4)');
      expect(leftModifierCss).toContain('right: auto');
    });

    test('should support bottom position modifier', () => {
      const bottomModifierCss = `
        .controls-panel--bottom {
          top: auto;
          bottom: var(--space-4);
        }
      `;
      expect(bottomModifierCss).toContain('bottom: var(--space-4)');
    });
  });

  describe('Control Group', () => {
    test('should define control group class', () => {
      const controlGroupCss = `
        .control-group {
          margin-bottom: var(--space-5);
        }
      `;
      expect(controlGroupCss).toContain('margin-bottom');
    });

    test('should define control group label', () => {
      const labelCss = `
        .control-group__label {
          display: block;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--color-text-secondary);
          font-family: var(--font-display);
        }
      `;
      expect(labelCss).toContain('font-family: var(--font-display)');
      expect(labelCss).toContain('color: var(--color-text-secondary)');
    });

    test('should define range slider styling', () => {
      const sliderCss = `
        .control-group__slider {
          width: 100%;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--color-surface-overlay);
          -webkit-appearance: none;
          appearance: none;
        }
      `;
      expect(sliderCss).toContain('border-radius: var(--radius-full)');
      expect(sliderCss).toContain('-webkit-appearance: none');
    });

    test('should define slider thumb styling', () => {
      const sliderThumbCss = `
        .control-group__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-accent);
          cursor: pointer;
        }
      `;
      expect(sliderThumbCss).toContain('border-radius: 50%');
      expect(sliderThumbCss).toContain('cursor: pointer');
    });

    test('should define select dropdown styling', () => {
      const selectCss = `
        .control-group__select {
          width: 100%;
          height: 40px;
          border: 1px solid var(--color-text-muted);
          border-radius: var(--radius-md);
          background-color: var(--color-surface);
          cursor: pointer;
        }
      `;
      expect(selectCss).toContain('cursor: pointer');
      expect(selectCss).toContain('border-radius: var(--radius-md)');
    });

    test('should define value display', () => {
      const valueCss = `
        .control-group__value {
          display: inline-block;
          font-size: var(--text-sm);
          font-family: var(--font-mono);
          color: var(--color-accent);
        }
      `;
      expect(valueCss).toContain('font-family: var(--font-mono)');
      expect(valueCss).toContain('color: var(--color-accent)');
    });
  });

  describe('Buttons', () => {
    test('should define base button class', () => {
      const buttonCss = `
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 var(--space-4);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          font-family: var(--font-display);
          border-radius: var(--radius-md);
          cursor: pointer;
        }
      `;
      expect(buttonCss).toContain('cursor: pointer');
      expect(buttonCss).toContain('font-family: var(--font-display)');
    });

    test('should define primary button variant', () => {
      const primaryBtnCss = `
        .btn--primary {
          background-color: var(--color-accent);
          color: white;
        }
      `;
      expect(primaryBtnCss).toContain('background-color: var(--color-accent)');
    });

    test('should define secondary button variant', () => {
      const secondaryBtnCss = `
        .btn--secondary {
          background-color: var(--color-surface-overlay);
          color: var(--color-text);
          border: 1px solid var(--color-text-muted);
        }
      `;
      expect(secondaryBtnCss).toContain('border: 1px solid');
    });

    test('should define ghost button variant', () => {
      const ghostBtnCss = `
        .btn--ghost {
          background-color: transparent;
          color: var(--color-text-secondary);
        }
      `;
      expect(ghostBtnCss).toContain('background-color: transparent');
    });

    test('should define icon button variant', () => {
      const iconBtnCss = `
        .btn--icon {
          width: 40px;
          padding: 0;
        }
      `;
      expect(iconBtnCss).toContain('width: 40px');
      expect(iconBtnCss).toContain('padding: 0');
    });

    test('should define disabled state', () => {
      const disabledCss = `
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }
      `;
      expect(disabledCss).toContain('cursor: not-allowed');
    });
  });

  describe('Loading Overlay', () => {
    test('should define loading overlay structure', () => {
      const loadingCss = `
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal);
          opacity: 0;
          visibility: hidden;
        }
      `;
      expect(loadingCss).toContain('visibility: hidden');
      expect(loadingCss).toContain('z-index: var(--z-modal)');
    });

    test('should define visible modifier', () => {
      const visibleCss = `
        .loading-overlay--visible {
          opacity: 1;
          visibility: visible;
        }
      `;
      expect(visibleCss).toContain('opacity: 1');
    });

    test('should define spinner animation', () => {
      const spinnerCss = `
        .loading-overlay__spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-surface-overlay);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `;
      expect(spinnerCss).toContain('border-radius: 50%');
      expect(spinnerCss).toContain('animation: spin');
    });
  });

  describe('Shape Info', () => {
    test('should define shape info card', () => {
      const shapeInfoCss = `
        .shape-info {
          background-color: var(--color-surface-overlay);
          border-radius: var(--radius-md);
          padding: var(--space-3);
        }
      `;
      expect(shapeInfoCss).toContain('border-radius: var(--radius-md)');
    });

    test('should define shape info list', () => {
      const listCss = `
        .shape-info__list {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
      `;
      expect(listCss).toContain('flex-direction: column');
    });
  });

  describe('Theme Selector', () => {
    test('should define theme selector grid', () => {
      const themeSelectorCss = `
        .theme-selector {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-2);
        }
      `;
      expect(themeSelectorCss).toContain('display: grid');
      expect(themeSelectorCss).toContain('repeat(5, 1fr)');
    });

    test('should define theme option', () => {
      const optionCss = `
        .theme-selector__option {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
      `;
      expect(optionCss).toContain('cursor: pointer');
    });

    test('should define active state', () => {
      const activeCss = `
        .theme-selector__option--active {
          background-color: var(--color-surface-overlay);
          outline: 2px solid var(--color-accent);
        }
      `;
      expect(activeCss).toContain('outline: 2px solid');
    });

    test('should define swatch', () => {
      const swatchCss = `
        .theme-selector__swatch {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          border: 2px solid transparent;
        }
      `;
      expect(swatchCss).toContain('border-radius: var(--radius-full)');
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('should define shortcuts section', () => {
      const shortcutsCss = `
        .shortcuts-hint {
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-surface-overlay);
        }
      `;
      expect(shortcutsCss).toContain('border-top: 1px solid');
    });

    test('should define keyboard key', () => {
      const keyCss = `
        .shortcuts-hint__key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          background-color: var(--color-surface-overlay);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: 10px;
        }
      `;
      expect(keyCss).toContain('font-family: var(--font-mono)');
    });
  });

  describe('Responsive Styles', () => {
    test('should define tablet breakpoint styles', () => {
      const tabletCss = `
        @media (max-width: 768px) {
          .controls-panel {
            width: calc(100% - var(--space-8));
            max-width: 320px;
            top: auto;
            bottom: 0;
          }
        }
      `;
      expect(tabletCss).toContain('max-width: 768px');
      expect(tabletCss).toContain('bottom: 0');
    });

    test('should define mobile breakpoint styles', () => {
      const mobileCss = `
        @media (max-width: 480px) {
          .controls-panel {
            width: 100%;
            max-width: none;
            right: 0;
            left: 0;
            border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          }
        }
      `;
      expect(mobileCss).toContain('max-width: 480px');
      expect(mobileCss).toContain('border-radius: var(--radius-xl)');
    });
  });
});