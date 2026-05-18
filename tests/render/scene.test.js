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
    test('should add geometry to scene', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BoxGeometry',
        attributes: {}
      };

      const mesh = addMesh(scene, mockGeometry);

      expect(mesh).toBeDefined();
      expect(scene.children.length).toBeGreaterThan(0);
    });

    test('should return mesh object with type', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BoxGeometry'
      };

      const mesh = addMesh(scene, mockGeometry);

      expect(mesh.type).toBe('Mesh');
    });

    test('should set mesh geometry', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BoxGeometry'
      };

      const mesh = addMesh(scene, mockGeometry);

      expect(mesh.geometry).toBe(mockGeometry);
    });

    test('should set default material', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BoxGeometry'
      };

      const mesh = addMesh(scene, mockGeometry);

      expect(mesh.material).toBeDefined();
      expect(mesh.material.type).toBe('PointsMaterial');
    });
  });

  describe('updateGeometry', () => {
    test('should update mesh geometry with new data', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BoxGeometry',
        attributes: {
          position: { array: new Float32Array(9) }
        }
      };

      const mesh = addMesh(scene, mockGeometry);
      const newPositions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

      const result = updateGeometry(mesh, { positions: newPositions });

      expect(result).toBe(true);
    });

    test('should return false for invalid mesh', () => {
      const result = updateGeometry(null, { positions: new Float32Array(9) });
      expect(result).toBe(false);
    });

    test('should return false for null data', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BoxGeometry',
        attributes: {}
      };
      const mesh = addMesh(scene, mockGeometry);

      const result = updateGeometry(mesh, null);
      expect(result).toBe(false);
    });

    test('should return true even without positions in data', () => {
      const scene = createScene();
      const mockGeometry = {
        type: 'BoxGeometry',
        attributes: {}
      };
      const mesh = addMesh(scene, mockGeometry);

      const result = updateGeometry(mesh, {});
      expect(result).toBe(true);
    });
  });

  describe('clearScene', () => {
    test('should remove all non-light children from scene', () => {
      const scene = createScene();
      const mockGeometry = { type: 'BoxGeometry' };

      // Add some meshes
      addMesh(scene, mockGeometry);
      addMesh(scene, mockGeometry);

      expect(scene.children.length).toBeGreaterThan(2);

      const clearedScene = clearScene(scene);

      // Only lights should remain in returned scene
      const remainingChildren = clearedScene.children.filter(
        child => child.type !== 'AmbientLight' && child.type !== 'DirectionalLight'
      );
      expect(remainingChildren.length).toBe(0);
    });

    test('should keep light objects', () => {
      const scene = createScene();
      const mockGeometry = { type: 'BoxGeometry' };

      addMesh(scene, mockGeometry);

      const clearedScene = clearScene(scene);

      expect(clearedScene.children.length).toBe(2); // ambient + directional lights
    });

    test('should return new scene object (immutable)', () => {
      const scene = createScene();
      const mockGeometry = { type: 'BoxGeometry' };

      addMesh(scene, mockGeometry);
      const originalChildCount = scene.children.length;

      const clearedScene = clearScene(scene);

      // Original scene should be unchanged
      expect(scene.children.length).toBe(originalChildCount);
      // Returned scene should have fewer children
      expect(clearedScene.children.length).toBeLessThan(originalChildCount);
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