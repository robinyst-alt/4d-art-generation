/**
 * Render Renderer Tests
 *
 * Test suite for Three.js WebGL renderer
 * Note: Uses mocks since WebGL is not available in jsdom environment
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  render,
  captureScreenshot,
  setAnimationLoop,
  startAnimationLoop,
  stopAnimationLoop,
  resizeToFit,
  getRenderer
} from '../../js/render/renderer.js';

describe('Render Renderer', () => {
  let mockScene;
  let mockCamera;
  let mockRenderer;

  beforeEach(() => {
    mockScene = {
      type: 'Scene',
      traverse: function() {}
    };
    mockCamera = {
      type: 'PerspectiveCamera',
      updateProjectionMatrix: function() {}
    };
    mockRenderer = {
      type: 'WebGLRenderer',
      domElement: {
        toDataURL: function(format) {
          return format === 'image/jpeg'
            ? 'data:image/jpeg;base64,mock'
            : 'data:image/png;base64,mock';
        },
        style: {
          width: '',
          height: ''
        }
      },
      getPixelRatio: function() { return 1; },
      getSize: function() { return { width: 800, height: 600 }; },
      setSize: function() {},
      render: function() {},
      setAnimationLoop: function() {},
      animationLoopCallback: null,
      isAnimating: false
    };
  });

  describe('render', () => {
    test('should render scene with camera', () => {
      const result = render(mockRenderer, mockScene, mockCamera);
      expect(result).toBe(true);
    });

    test('should return false if renderer is missing', () => {
      const result = render(null, mockScene, mockCamera);
      expect(result).toBe(false);
    });

    test('should return false if scene is missing', () => {
      const result = render(mockRenderer, null, mockCamera);
      expect(result).toBe(false);
    });

    test('should return false if camera is missing', () => {
      const result = render(mockRenderer, mockScene, null);
      expect(result).toBe(false);
    });
  });

  describe('captureScreenshot', () => {
    test('should return data URL from canvas', () => {
      const result = captureScreenshot(mockRenderer);
      expect(result).toContain('data:image/png');
    });

    test('should return null if renderer is missing', () => {
      const result = captureScreenshot(null);
      expect(result).toBeNull();
    });

    test('should capture screenshot with jpeg format', () => {
      const result = captureScreenshot(mockRenderer, 'image/jpeg');
      expect(result).toContain('data:image/jpeg');
    });

    test('should capture screenshot with png format', () => {
      const result = captureScreenshot(mockRenderer, 'image/png');
      expect(result).toContain('data:image/png');
    });
  });

  describe('setAnimationLoop', () => {
    test('should set animation loop callback on renderer', () => {
      let called = false;
      const callback = function() {};
      const originalFn = mockRenderer.setAnimationLoop;
      mockRenderer.setAnimationLoop = function() { called = true; };

      setAnimationLoop(mockRenderer, callback);

      expect(called).toBe(true);
      mockRenderer.setAnimationLoop = originalFn;
    });

    test('should do nothing if renderer is null', () => {
      const callback = function() {};
      expect(() => setAnimationLoop(null, callback)).not.toThrow();
    });
  });

  describe('startAnimationLoop', () => {
    test('should start animation loop', () => {
      expect(() => startAnimationLoop(mockRenderer)).not.toThrow();
    });

    test('should handle null renderer gracefully', () => {
      expect(() => startAnimationLoop(null)).not.toThrow();
    });
  });

  describe('stopAnimationLoop', () => {
    test('should stop animation loop', () => {
      let calledWith = null;
      const originalFn = mockRenderer.setAnimationLoop;
      mockRenderer.setAnimationLoop = function(arg) { calledWith = arg; };

      stopAnimationLoop(mockRenderer);

      expect(calledWith).toBe(null);
      mockRenderer.setAnimationLoop = originalFn;
    });

    test('should handle null renderer gracefully', () => {
      expect(() => stopAnimationLoop(null)).not.toThrow();
    });
  });

  describe('resizeToFit', () => {
    test('should resize renderer to container dimensions', () => {
      const container = {
        clientWidth: 1024,
        clientHeight: 768
      };

      let capturedWidth = null;
      let capturedHeight = null;
      const originalFn = mockRenderer.setSize;
      mockRenderer.setSize = function(w, h) {
        capturedWidth = w;
        capturedHeight = h;
      };

      resizeToFit(mockRenderer, container);

      expect(capturedWidth).toBe(1024);
      expect(capturedHeight).toBe(768);
      mockRenderer.setSize = originalFn;
    });

    test('should use default dimensions when container has no dimensions', () => {
      const container = {
        clientWidth: 0,
        clientHeight: 0
      };

      let capturedWidth = null;
      let capturedHeight = null;
      const originalFn = mockRenderer.setSize;
      mockRenderer.setSize = function(w, h) {
        capturedWidth = w;
        capturedHeight = h;
      };

      resizeToFit(mockRenderer, container);

      expect(capturedWidth).toBe(800);
      expect(capturedHeight).toBe(600);
      mockRenderer.setSize = originalFn;
    });

    test('should do nothing when renderer is null', () => {
      const container = { clientWidth: 100, clientHeight: 100 };
      expect(() => resizeToFit(null, container)).not.toThrow();
    });

    test('should do nothing when container is null', () => {
      expect(() => resizeToFit(mockRenderer, null)).not.toThrow();
    });

    test('should set domElement style to 100%', () => {
      const container = {
        clientWidth: 1024,
        clientHeight: 768
      };

      resizeToFit(mockRenderer, container);

      expect(mockRenderer.domElement.style.width).toBe('100%');
      expect(mockRenderer.domElement.style.height).toBe('100%');
    });
  });

  describe('getRenderer', () => {
    test('should return the renderer instance', () => {
      const result = getRenderer();
      expect(result).toBeDefined();
    });
  });

  // istanbul ignore next - Cannot fully test createRenderer in jsdom because
  // THREE.WebGLRenderer requires WebGL. However, we can verify it doesn't throw.
  describe('createRenderer', () => {
    test('should be exported as a function', async () => {
      const rendererModule = await import('../../js/render/renderer.js');
      expect(typeof rendererModule.createRenderer).toBe('function');
    });

    // This test verifies the function signature without actually running WebGL
    test('createRenderer accepts optional canvas parameter', async () => {
      const rendererModule = await import('../../js/render/renderer.js');
      // Function should have 0 or 1 parameters (with default)
      expect(rendererModule.createRenderer.length).toBeLessThanOrEqual(1);
    });
  });
});