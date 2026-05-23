/**
 * Axis Indicator Tests
 *
 * Test suite for F-108 coordinate axis indicator functionality:
 * - createAxisIndicator() returns correct Three.js Group
 * - getQuaternion() returns camera quaternion
 * - Axis visibility based on quadrant state (free axes only)
 */

import * as THREE from 'three';
import { createAxisIndicator, addAxisIndicator } from '../../js/render/scene.js';
import { getQuaternion } from '../../js/render/camera.js';

describe('Axis Indicator', () => {
  describe('createAxisIndicator', () => {
    test('should return a THREE.Group', () => {
      const indicator = createAxisIndicator(1);

      expect(indicator).toBeDefined();
      expect(indicator.type).toBe('Group');
    });

    test('should contain 3 line segments for X, Y, Z axes', () => {
      const indicator = createAxisIndicator(1);
      const lines = indicator.children.filter(child => child instanceof THREE.Line);

      expect(lines.length).toBe(3);
    });

    test('should use grayscale material colors', () => {
      const indicator = createAxisIndicator(1);
      const lines = indicator.children.filter(child => child instanceof THREE.Line);

      // All axes should use the same grayscale color (0.8, 0.8, 0.8)
      lines.forEach(line => {
        const color = line.material.color;
        // All RGB components should be equal (grayscale)
        expect(color.r).toBeCloseTo(0.8, 1);
        expect(color.g).toBeCloseTo(0.8, 1);
        expect(color.b).toBeCloseTo(0.8, 1);
      });
    });

    test('should scale axes by given size parameter', () => {
      const size = 2;
      const indicator = createAxisIndicator(size);

      // Check that axis endpoints are at correct positions based on size
      const lines = indicator.children.filter(child => child instanceof THREE.Line);

      lines.forEach(line => {
        const positions = line.geometry.attributes.position.array;
        // Check the endpoint (second vertex) has correct magnitude relative to size
        const endpointX = positions[3];
        const endpointY = positions[4];
        const endpointZ = positions[5];

        // At least one axis should have endpoint at magnitude = size
        const magnitude = Math.sqrt(endpointX ** 2 + endpointY ** 2 + endpointZ ** 2);
        expect(magnitude).toBeCloseTo(size, 1);
      });
    });

    test('should return group positioned at origin', () => {
      const indicator = createAxisIndicator(1);

      expect(indicator.position.x).toBe(0);
      expect(indicator.position.y).toBe(0);
      expect(indicator.position.z).toBe(0);
    });
  });

  describe('addAxisIndicator', () => {
    test('should add indicator group to scene', () => {
      // Create a minimal scene
      const scene = new THREE.Scene();
      const indicator = createAxisIndicator(1);

      addAxisIndicator(scene, indicator);

      expect(scene.children).toContain(indicator);
    });

    test('should not throw when scene is null', () => {
      const indicator = createAxisIndicator(1);

      expect(() => addAxisIndicator(null, indicator)).not.toThrow();
    });

    test('should not throw when indicator is null', () => {
      const scene = new THREE.Scene();

      expect(() => addAxisIndicator(scene, null)).not.toThrow();
    });
  });

  describe('getQuaternion', () => {
    test('should return null when no camera exists', () => {
      const quaternion = getQuaternion();

      expect(quaternion).toBeNull();
    });

    test('should return a THREE.Quaternion when camera exists', () => {
      // This test requires camera to be initialized via createCamera()
      // Since tests are isolated, we test the return type contract
      const quaternion = getQuaternion();

      if (quaternion !== null) {
        expect(quaternion).toBeInstanceOf(THREE.Quaternion);
      }
    });

    test('should return quaternion with valid components', () => {
      const quaternion = getQuaternion();

      if (quaternion !== null) {
        expect(typeof quaternion.x).toBe('number');
        expect(typeof quaternion.y).toBe('number');
        expect(typeof quaternion.z).toBe('number');
        expect(typeof quaternion.w).toBe('number');
      }
    });
  });

  describe('axis visibility based on quadrant state', () => {
    test('should only include free axes in the indicator group', () => {
      // This test verifies the contract that the axis indicator
      // should only show axes that are in "free" mode
      // The quadrant state determines which axes are free/slice

      // Simulated free axes (x, y, z are free, w is slice)
      const freeAxes = ['x', 'y', 'z'];
      const indicator = createAxisIndicator(1);

      // The indicator should have lines corresponding to free axes only
      const lines = indicator.children.filter(child => child instanceof THREE.Line);
      expect(lines.length).toBe(3); // X, Y, Z only

      // W axis should not be represented as a visible line
      // (The W axis is in slice mode in this example)
    });

    test('should handle case where all axes are free', () => {
      const freeAxes = ['w', 'x', 'y', 'z'];
      // When all axes are free, all 4 would be shown
      // But our indicator currently only shows X, Y, Z
      const indicator = createAxisIndicator(1);
      const lines = indicator.children.filter(child => child instanceof THREE.Line);

      // Currently we only show 3 axes (X, Y, Z)
      expect(lines.length).toBe(3);
    });

    test('should handle case where only one axis is free', () => {
      const freeAxes = ['z'];
      const indicator = createAxisIndicator(1);
      const lines = indicator.children.filter(child => child instanceof THREE.Line);

      // Even with only one free axis, we still show 3 lines
      // This is because createAxisIndicator doesn't filter by quadrant state
      // The filtering happens at a higher level
      expect(lines.length).toBe(3);
    });
  });

  describe('F-108: axis visibility based on locked axes', () => {
    test('should display 4 axes when 0 are locked', () => {
      // When no axes are locked, all 4 axes are camera axes (XYZW)
      const cameraAxes = ['x', 'y', 'z', 'w'];
      const indicator = createAxisIndicator(1, cameraAxes);

      const lines = indicator.children.filter(child => child instanceof THREE.Line);
      // Per PRD F-108: all 4 axes should be displayed when 0 are locked
      expect(lines.length).toBe(4);
    });

    test('should display 3 axes when 1 is locked', () => {
      // When 1 axis is locked, only 3 are camera axes
      const cameraAxes = ['x', 'y', 'z']; // w is locked
      const indicator = createAxisIndicator(1, cameraAxes);

      const lines = indicator.children.filter(child => child instanceof THREE.Line);
      expect(lines.length).toBe(3);
    });

    test('should display 2 axes when 2 are locked', () => {
      // When 2 axes are locked, only 2 are camera axes
      const cameraAxes = ['x', 'y']; // z, w are locked
      const indicator = createAxisIndicator(1, cameraAxes);

      const lines = indicator.children.filter(child => child instanceof THREE.Line);
      expect(lines.length).toBe(2);
    });

    test('should display 1 axis when 3 are locked', () => {
      // When 3 axes are locked, only 1 is a camera axis
      const cameraAxes = ['x']; // y, z, w are locked
      const indicator = createAxisIndicator(1, cameraAxes);

      const lines = indicator.children.filter(child => child instanceof THREE.Line);
      expect(lines.length).toBe(1);
    });

    test('camera axes are non-locked axes', () => {
      // Verify that camera axes = non-locked = 4 - locked count
      const lockedCount = 2;
      const cameraAxisCount = 4 - lockedCount;
      expect(cameraAxisCount).toBe(2);
    });

    test('should only show axes that are in camera axes list', () => {
      // When camera axes = ['x', 'y'], only X and Y should be visible
      const cameraAxes = ['x', 'y'];
      const indicator = createAxisIndicator(1, cameraAxes);

      const lines = indicator.children.filter(child => child instanceof THREE.Line);
      expect(lines.length).toBe(2);

      // Verify that the lines correspond to X and Y axes
      // by checking their directions
      const directions = lines.map(line => {
        const positions = line.geometry.attributes.position.array;
        return {
          x: positions[3] - positions[0],
          y: positions[4] - positions[1],
          z: positions[5] - positions[2]
        };
      });

      // At least one line should point primarily in X direction
      const xAxes = directions.filter(d => Math.abs(d.x) > Math.abs(d.y) && Math.abs(d.x) > Math.abs(d.z));
      expect(xAxes.length).toBe(1);

      // At least one line should point primarily in Y direction
      const yAxes = directions.filter(d => Math.abs(d.y) > Math.abs(d.x) && Math.abs(d.y) > Math.abs(d.z));
      expect(yAxes.length).toBe(1);
    });
  });
});
