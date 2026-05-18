/**
 * Render Renderer Tests
 *
 * Test suite for Three.js WebGL renderer
 */

import { createRenderer, render, captureScreenshot, setAnimationLoop, startAnimationLoop, stopAnimationLoop, resizeToFit } from '../../js/render/renderer.js';

describe('Render Renderer', () => {
  let mockScene;
  let mockCamera;

  beforeEach(() => {
    mockScene = {
      type: 'Scene',
      traverse: function() {}
    };
    mockCamera = {
      type: 'PerspectiveCamera',
      updateProjectionMatrix: function() {}
    };
  });

  describe('createRenderer', () => {
    test('should create a renderer object', () => {
      const renderer = createRenderer();

      expect(renderer).toBeDefined();
      expect(renderer.type).toBe('WebGLRenderer');
    });

    test('should have domElement', () => {
      const renderer = createRenderer();

      expect(renderer.domElement).toBeDefined();
    });

    test('should have getContext method', () => {
      const renderer = createRenderer();

      expect(typeof renderer.getContext).toBe('function');
    });

    test('should have pixel ratio capped at 2', () => {
      const renderer = createRenderer();
      const ratio = renderer.getPixelRatio();

      expect(ratio).toBeLessThanOrEqual(2);
      expect(ratio).toBeGreaterThan(0);
    });
  });

  describe('render', () => {
    test('should render scene with camera', () => {
      const renderer = createRenderer();

      const result = render(renderer, mockScene, mockCamera);

      expect(result).toBe(true);
    });

    test('should return false if renderer is missing', () => {
      const result = render(null, mockScene, mockCamera);
      expect(result).toBe(false);
    });

    test('should return false if scene is missing', () => {
      const renderer = createRenderer();
      const result = render(renderer, null, mockCamera);
      expect(result).toBe(false);
    });

    test('should return false if camera is missing', () => {
      const renderer = createRenderer();
      const result = render(renderer, mockScene, null);
      expect(result).toBe(false);
    });

    test('should set size on renderer', () => {
      const renderer = createRenderer();
      const width = 800;
      const height = 600;

      renderer.setSize(width, height);

      expect(renderer.getSize().width).toBe(width);
      expect(renderer.getSize().height).toBe(height);
    });
  });

  describe('captureScreenshot', () => {
    test('should return data URL from canvas', () => {
      const renderer = createRenderer();

      const result = captureScreenshot(renderer);

      expect(result).toContain('data:image/png');
    });

    test('should support different image formats', () => {
      const renderer = createRenderer();

      const result = captureScreenshot(renderer, 'image/jpeg');

      expect(result).toContain('image/jpeg');
    });

    test('should return null if renderer is missing', () => {
      const result = captureScreenshot(null);
      expect(result).toBeNull();
    });
  });

  describe('setAnimationLoop', () => {
    test('should set animation loop callback on renderer', () => {
      const renderer = createRenderer();
      const callback = () => {};

      setAnimationLoop(renderer, callback);

      expect(renderer.animationLoopCallback).toBe(callback);
    });

    test('should do nothing if renderer is null', () => {
      const callback = () => {};

      // Should not throw
      setAnimationLoop(null, callback);
    });
  });

  describe('startAnimationLoop', () => {
    test('should start animation loop when callback exists', () => {
      const renderer = createRenderer();
      renderer.animationLoopCallback = () => {};

      startAnimationLoop(renderer);

      expect(renderer.isAnimating).toBe(true);
    });

    test('should not start animation loop when callback is missing', () => {
      const renderer = createRenderer();

      startAnimationLoop(renderer);

      expect(renderer.isAnimating).toBeUndefined();
    });
  });

  describe('stopAnimationLoop', () => {
    test('should stop animation loop', () => {
      const renderer = createRenderer();
      renderer.isAnimating = true;

      stopAnimationLoop(renderer);

      expect(renderer.isAnimating).toBe(false);
    });
  });

  describe('resizeToFit', () => {
    test('should resize renderer to container dimensions', () => {
      const renderer = createRenderer();
      const container = {
        clientWidth: 1024,
        clientHeight: 768
      };

      resizeToFit(renderer, container);

      expect(renderer.getSize().width).toBe(1024);
      expect(renderer.getSize().height).toBe(768);
    });

    test('should use default dimensions when container has no dimensions', () => {
      const renderer = createRenderer();
      const container = {
        clientWidth: 0,
        clientHeight: 0
      };

      resizeToFit(renderer, container);

      expect(renderer.getSize().width).toBe(800);
      expect(renderer.getSize().height).toBe(600);
    });

    test('should do nothing when renderer is null', () => {
      const container = { clientWidth: 100, clientHeight: 100 };

      // Should not throw
      resizeToFit(null, container);
    });
  });
});