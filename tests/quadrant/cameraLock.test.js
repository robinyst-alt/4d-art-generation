/**
 * Camera Lock Tests (F-109)
 *
 * Test suite for camera lock functionality:
 * - Lock constraint: locked ⊆ slice (locked axes must be slice)
 * - Lock count limits: 1-3 locked axes
 * - Lock button interaction: locking auto-switches to slice mode
 * - Minimum 1 lock constraint
 * - Camera axis determination based on locked axes
 */

import {
  createQuadrantState,
  setAxisMode,
  setAxisLock,
  getSliceAxes,
  getFreeAxes,
  getLockedAxes,
  getCameraAxes,
  canSetAxisToFree
} from '../../js/quadrant/stateManager.js';

describe('Camera Lock Feature', () => {
  describe('setAxisLock - basic locking', () => {
    test('should lock an axis that is in slice mode', () => {
      const state = createQuadrantState();
      // w is slice by default
      const newState = setAxisLock(state, 'w', true);

      expect(newState.lockedAxes).toContain('w');
    });

    test('should unlock an axis when multiple axes are locked', () => {
      // Start with w and x locked
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);

      // Now unlock w - should work since x is still locked
      newState = setAxisLock(newState, 'w', false);

      expect(newState.lockedAxes).not.toContain('w');
      expect(newState.lockedAxes).toContain('x');
    });

    test('should prevent unlocking the last locked axis', () => {
      // The constraint is: at least 1 lock must remain
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);

      // Try to unlock the only locked axis - should be prevented
      const resultState = setAxisLock(newState, 'w', false);

      // w should remain locked
      expect(resultState.lockedAxes).toContain('w');
      expect(resultState.lockedAxes.length).toBe(1);
    });

    test('should maintain multiple locked axes', () => {
      const state = createQuadrantState();
      // Lock w first
      let newState = setAxisLock(state, 'w', true);
      // Switch x to slice and lock it
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);

      expect(newState.lockedAxes).toContain('w');
      expect(newState.lockedAxes).toContain('x');
      expect(newState.lockedAxes.length).toBe(2);
    });
  });

  describe('lock constraint: locked ⊆ slice', () => {
    test('should auto-convert free axis to slice when locking', () => {
      const state = createQuadrantState();
      // x is free by default
      expect(state.axes.x.mode).toBe('free');

      const newState = setAxisLock(state, 'x', true);

      // Should be auto-converted to slice
      expect(newState.axes.x.mode).toBe('slice');
      expect(newState.lockedAxes).toContain('x');
    });

    test('should keep slice axis as slice when locking', () => {
      const state = createQuadrantState();
      // w is slice by default
      expect(state.axes.w.mode).toBe('slice');

      const newState = setAxisLock(state, 'w', true);

      expect(newState.axes.w.mode).toBe('slice');
      expect(newState.lockedAxes).toContain('w');
    });

    test('locked axes must always be in slice mode', () => {
      const state = createQuadrantState();
      // Lock w (slice) and x (auto-convert to slice)
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisLock(newState, 'x', true);

      // Verify all locked axes are slice
      for (const axis of newState.lockedAxes) {
        expect(newState.axes[axis].mode).toBe('slice');
      }
    });

    test('cannot lock an axis that is free (enforced constraint)', () => {
      // This is tested above - locking always converts to slice
      // The constraint is enforced by the auto-conversion behavior
    });
  });

  describe('lock count limits: 1-3', () => {
    test('should allow locking 1 axis minimum', () => {
      const state = createQuadrantState();
      const newState = setAxisLock(state, 'w', true);

      expect(newState.lockedAxes.length).toBe(1);
    });

    test('should allow locking 2 axes', () => {
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);

      expect(newState.lockedAxes.length).toBe(2);
    });

    test('should allow locking 3 axes', () => {
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);
      newState = setAxisMode(newState, 'y', 'slice');
      newState = setAxisLock(newState, 'y', true);

      expect(newState.lockedAxes.length).toBe(3);
    });

    test('should prevent locking 4 axes (constraint)', () => {
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);
      newState = setAxisMode(newState, 'y', 'slice');
      newState = setAxisLock(newState, 'y', true);
      newState = setAxisMode(newState, 'z', 'slice');
      // Try to lock z - should fail because we can't have all 4 locked
      // Or alternatively, the constraint could be that we can't lock more than 3

      // The constraint is that we must keep at least 1 camera axis
      // If we lock 4, there's no camera axis left
      // This should be prevented at the lock level
      const resultState = setAxisLock(newState, 'z', true);

      // z should NOT be locked because it would leave no camera axes
      expect(resultState.lockedAxes.length).toBe(3);
      expect(resultState.lockedAxes).not.toContain('z');
    });

    test('cannot unlock last locked axis (minimum 1 lock)', () => {
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);

      // Try to unlock the only locked axis
      const resultState = setAxisLock(newState, 'w', false);

      // Should fail - must keep at least 1 locked axis
      expect(resultState.lockedAxes.length).toBe(1);
      expect(resultState.lockedAxes).toContain('w');
    });
  });

  describe('getCameraAxes - camera axis determination', () => {
    test('should return all 4 axes when no axes are locked', () => {
      const state = createQuadrantState();
      // Default: only w is slice, xyz are free, no locks
      const cameraAxes = getCameraAxes(state);

      // Camera axes = non-locked axes = all 4 when nothing locked
      expect(cameraAxes.length).toBe(4);
    });

    test('should return 3 axes when 1 is locked', () => {
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);

      const cameraAxes = getCameraAxes(newState);

      expect(cameraAxes.length).toBe(3);
      expect(cameraAxes).not.toContain('w');
    });

    test('should return 2 axes when 2 are locked', () => {
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);

      const cameraAxes = getCameraAxes(newState);

      expect(cameraAxes.length).toBe(2);
      expect(cameraAxes).not.toContain('w');
      expect(cameraAxes).not.toContain('x');
    });

    test('should return 1 axis when 3 are locked', () => {
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);
      newState = setAxisMode(newState, 'y', 'slice');
      newState = setAxisLock(newState, 'y', true);

      const cameraAxes = getCameraAxes(newState);

      expect(cameraAxes.length).toBe(1);
    });

    test('should return empty when 4 are locked (impossible)', () => {
      // 4 locked is prevented by constraint
      // This test documents the theoretical behavior
    });
  });

  describe('lock mode enforcement', () => {
    test('unlocking last locked axis is prevented - axis stays locked and slice', () => {
      // When unlocking the last locked axis, it is prevented
      // The axis stays locked AND stays in slice mode
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      expect(newState.axes.w.mode).toBe('slice');

      // Try to unlock the only locked axis - should be prevented
      newState = setAxisLock(newState, 'w', false);

      // w should still be locked and slice
      expect(newState.axes.w.mode).toBe('slice');
      expect(newState.lockedAxes).toContain('w');
    });

    test('unlocking non-last locked axis removes from locked list and keeps slice mode', () => {
      // When there are multiple locked axes, unlocking one removes it from locked
      // but the axis keeps its slice mode
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);
      expect(newState.axes.w.mode).toBe('slice');

      // Unlock w - should work since x is still locked
      newState = setAxisLock(newState, 'w', false);

      // w is no longer locked but stays in slice mode
      expect(newState.axes.w.mode).toBe('slice');
      expect(newState.lockedAxes).not.toContain('w');
      expect(newState.lockedAxes).toContain('x');
    });

    test('can change unlocked axis mode to free when slice constraint allows', () => {
      // When an axis is unlocked (not in locked list), it can be changed to free
      // This requires that there remains at least 1 slice axis
      const state = createQuadrantState();
      let newState = setAxisLock(state, 'w', true);
      newState = setAxisMode(newState, 'x', 'slice');
      newState = setAxisLock(newState, 'x', true);

      // Unlock w - should work since x is still locked
      newState = setAxisLock(newState, 'w', false);

      // Now w is not locked, but is still slice. Can we set it to free?
      // We need at least 1 slice axis remaining, which is x
      const finalState = setAxisMode(newState, 'w', 'free');

      expect(finalState.axes.w.mode).toBe('free');
    });
  });
});