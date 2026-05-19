/**
 * State Management Tests
 *
 * Test suite for application state management (simplified Flux pattern)
 */

import { createState, dispatch, subscribe } from '../../js/ui/state.js';

describe('State Management', () => {
  let state;

  beforeEach(() => {
    // Create fresh state before each test
    const initialState = {
      currentShape: 'tesseract',
      wValue: 0,
      resolution: 24,
      isRendering: false
    };
    state = createState(initialState);
  });

  describe('createState', () => {
    test('should create state with initial values', () => {
      expect(state.getState().currentShape).toBe('tesseract');
      expect(state.getState().wValue).toBe(0);
      expect(state.getState().resolution).toBe(24);
      expect(state.getState().isRendering).toBe(false);
    });

    test('should return current state snapshot', () => {
      const snapshot = state.getState();
      expect(snapshot).toEqual({
        currentShape: 'tesseract',
        wValue: 0,
        resolution: 24,
        isRendering: false
      });
    });
  });

  describe('dispatch', () => {
    test('should update currentShape via dispatch', () => {
      const result = dispatch(state, { type: 'SET_SHAPE', payload: 'sphere' });

      expect(result.currentShape).toBe('sphere');
    });

    test('should update wValue via dispatch', () => {
      const result = dispatch(state, { type: 'SET_W_VALUE', payload: 12 });

      expect(result.wValue).toBe(12);
    });

    test('should update isRendering via dispatch', () => {
      const result = dispatch(state, { type: 'SET_RENDERING', payload: true });

      expect(result.isRendering).toBe(true);
    });

    test('should handle unknown action type gracefully', () => {
      const result = dispatch(state, { type: 'UNKNOWN_ACTION', payload: 'value' });

      // Should return unchanged state
      expect(result).toEqual(state.getState());
    });

    test('should return new state object (immutability)', () => {
      const oldState = state.getState();
      const newState = dispatch(state, { type: 'SET_SHAPE', payload: 'torus' });

      expect(newState).not.toBe(oldState);
    });
  });

  describe('subscribe', () => {
    test('should notify subscriber on state change', () => {
      let callCount = 0;
      let lastState = null;

      const unsubscribe = subscribe(state, (newState) => {
        callCount++;
        lastState = newState;
      });

      dispatch(state, { type: 'SET_SHAPE', payload: 'sphere' });

      expect(callCount).toBe(1);
      expect(lastState.currentShape).toBe('sphere');

      unsubscribe();
    });

    test('should not notify after unsubscribe', () => {
      let callCount = 0;

      const unsubscribe = subscribe(state, () => {
        callCount++;
      });

      dispatch(state, { type: 'SET_SHAPE', payload: 'sphere' });
      expect(callCount).toBe(1);

      unsubscribe();

      dispatch(state, { type: 'SET_SHAPE', payload: 'torus' });
      expect(callCount).toBe(1);
    });

    test('should notify all subscribers', () => {
      let count1 = 0;
      let count2 = 0;

      subscribe(state, () => count1++);
      subscribe(state, () => count2++);

      dispatch(state, { type: 'SET_SHAPE', payload: 'sphere' });

      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });

    test('should handle SET_MATRIX action', () => {
      const mockMatrix = new Float32Array(100);
      const result = dispatch(state, { type: 'SET_MATRIX', payload: mockMatrix });

      expect(result.matrix).toBe(mockMatrix);
    });
  });
});