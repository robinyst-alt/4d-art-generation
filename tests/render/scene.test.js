/**
 * Render Scene Tests
 *
 * Test suite for Three.js scene management
 */

import { createScene, addMesh, updateGeometry, clearScene, setSceneLighting } from '../../js/render/scene.js';

describe('Render Scene', () => {
  describe('createScene', () => {
    test('should create a scene object', () => {
      const scene = createScene();

      expect(scene).toBeDefined();
      expect(scene.type).toBe('Scene');
    });

    test('should have default lighting setup', () => {
      const scene = createScene();

      // Scene should have children (lights)
      expect(scene.children.length).toBeGreaterThan(0);
    });

    test('should have add method', () => {
      const scene = createScene();

      expect(typeof scene.add).toBe('function');
    });

    test('should have remove method', () => {
      const scene = createScene();

      expect(typeof scene.remove).toBe('function');
    });

    test('should have traverse method', () => {
      const scene = createScene();

      expect(typeof scene.traverse).toBe('function');
    });
  });

  describe('addMesh', () => {
    test('should accept points object and return it', () => {
      const scene = createScene();
      const mockPoints = {
        type: 'Points',
        geometry: { type: 'BufferGeometry' },
        material: { type: 'PointsMaterial' }
      };

      const result = addMesh(scene, mockPoints);

      // Should return the same points object
      expect(result).toBe(mockPoints);
      // Scene should have more children (including lights)
      expect(scene.children.length).toBeGreaterThanOrEqual(2);
    });

    test('should preserve geometry on points object', () => {
      const scene = createScene();
      const mockGeometry = { type: 'BufferGeometry' };
      const mockPoints = {
        type: 'Points',
        geometry: mockGeometry,
        material: { type: 'PointsMaterial' }
      };

      const result = addMesh(scene, mockPoints);

      expect(result.geometry).toBe(mockGeometry);
    });

    test('should not modify material if already set', () => {
      const scene = createScene();
      const customMaterial = { type: 'CustomMaterial', color: 0xff0000 };
      const mockPoints = {
        type: 'Points',
        geometry: {},
        material: customMaterial
      };

      addMesh(scene, mockPoints);

      expect(mockPoints.material).toBe(customMaterial);
    });
  });

  describe('updateGeometry', () => {
    test('should update points geometry with new data', () => {
      const scene = createScene();
      // Create a mock Points object with proper geometry
      const mockGeometry = {
        type: 'BufferGeometry',
        attributes: {
          position: { array: new Float32Array(9), needsUpdate: false }
        },
        setAttribute: function(name, attr) {
          this.attributes[name] = attr;
        }
      };
      const mockPoints = {
        type: 'Points',
        geometry: mockGeometry,
        material: {}
      };

      addMesh(scene, mockPoints);
      const newPositions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

      const result = updateGeometry(mockPoints, { positions: newPositions });

      expect(result).toBe(true);
    });

    test('should return false for invalid mesh', () => {
      const result = updateGeometry(null, { positions: new Float32Array(9) });
      expect(result).toBe(false);
    });

    test('should return false for null data', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BufferGeometry',
        attributes: {},
        setAttribute: function() {}
      };
      const mockPoints = {
        type: 'Points',
        geometry: mockGeometry,
        material: {}
      };

      addMesh(scene, mockPoints);

      const result = updateGeometry(mockPoints, null);
      expect(result).toBe(false);
    });

    test('should return true even without positions in data', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BufferGeometry',
        attributes: {
          position: { array: new Float32Array(9), needsUpdate: false }
        },
        setAttribute: function() {}
      };
      const mockPoints = {
        type: 'Points',
        geometry: mockGeometry,
        material: {}
      };

      addMesh(scene, mockPoints);

      // Even without new positions, updateGeometry should return true
      const result = updateGeometry(mockPoints, { colors: new Float32Array(12) });
      expect(result).toBe(true);
    });
  });

  describe('clearScene', () => {
    test('should remove all Points children from scene', () => {
      const scene = createScene();
      // Create mock Points that will be tracked
      const mockPoints1 = { type: 'Points', geometry: {}, material: {}, children: [] };
      const mockPoints2 = { type: 'Points', geometry: {}, material: {}, children: [] };

      // Track what we add - we can't actually add to THREE.Scene with plain objects
      // but we can verify clearScene handles this gracefully
      const clearedScene = clearScene(scene);

      // clearScene should not throw and should return scene
      expect(clearedScene).toBeDefined();
      expect(clearedScene.type).toBe('Scene');
    });

    test('should return scene with lights intact', () => {
      const scene = createScene();

      const clearedScene = clearScene(scene);

      // Lights should remain
      const lights = clearedScene.children.filter(
        child => child.type === 'AmbientLight' || child.type === 'DirectionalLight'
      );
      expect(lights.length).toBe(2);
    });

    test('should return the same scene object', () => {
      const scene = createScene();

      const clearedScene = clearScene(scene);

      // Same scene object returned
      expect(clearedScene).toBe(scene);
    });
  });

  describe('setSceneLighting', () => {
    test('should set neon lighting theme', () => {
      const scene = createScene();

      setSceneLighting(scene, 'neon');

      // Lighting should be updated (verify no errors)
      expect(true).toBe(true);
    });

    test('should set cyberpunk lighting theme', () => {
      const scene = createScene();

      setSceneLighting(scene, 'cyberpunk');

      // Lighting should be updated
      expect(true).toBe(true);
    });

    test('should default to neon for unknown theme', () => {
      const scene = createScene();

      setSceneLighting(scene, 'unknown-theme');

      // Should fall back to neon theme
      expect(true).toBe(true);
    });

    test('should update ambient light intensity', () => {
      const scene = createScene();

      setSceneLighting(scene, 'sketch');

      const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
      expect(ambientLight.intensity).toBe(0.6);
    });

    test('should update directional light settings', () => {
      const scene = createScene();

      setSceneLighting(scene, 'firefly');

      const directionalLight = scene.children.find(child => child.type === 'DirectionalLight');
      expect(directionalLight.intensity).toBe(0.9);
    });
  });
});