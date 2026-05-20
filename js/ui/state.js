/**
 * Application State Management
 *
 * Simplified Flux pattern for 4D Art application state
 * - createState: Creates a new state container
 * - dispatch: Updates state based on action
 * - subscribe: Notifies listeners on state changes
 */

// Action types
export const ACTIONS = {
  SET_SHAPE: 'SET_SHAPE',
  SET_W_VALUE: 'SET_W_VALUE',
  SET_RENDERING: 'SET_RENDERING',
  SET_MATRIX: 'SET_MATRIX',
  SET_POINT_SPACING: 'SET_POINT_SPACING',
  SET_CONTENT_HASH: 'SET_CONTENT_HASH',
  SET_RESOLUTION: 'SET_RESOLUTION',
  SET_COLOR_THEME: 'SET_COLOR_THEME'
};

// State subscribers
const subscribers = new Set();

/**
 * Create a new state container
 * @param {Object} initial - Initial state values
 * @returns {Object} State container with getState method
 */
export function createState(initial) {
  let state = { ...initial };

  return {
    getState: () => ({ ...state }),

    // Internal method to update state
    _setState: (newState) => {
      state = { ...newState };
    }
  };
}

/**
 * Dispatch an action to update state
 * @param {Object} stateContainer - State container from createState
 * @param {Object} action - Action with type and payload
 * @returns {Object} New state
 */
export function dispatch(stateContainer, action) {
  const currentState = stateContainer.getState();
  let newState;

  switch (action.type) {
    case ACTIONS.SET_SHAPE:
      newState = { ...currentState, currentShape: action.payload };
      break;

    case ACTIONS.SET_W_VALUE:
      newState = { ...currentState, wValue: action.payload };
      break;

    case ACTIONS.SET_RENDERING:
      newState = { ...currentState, isRendering: action.payload };
      break;

    case ACTIONS.SET_MATRIX:
      newState = { ...currentState, matrix: action.payload };
      break;

    case ACTIONS.SET_POINT_SPACING:
      newState = { ...currentState, pointSpacing: action.payload };
      break;

    case ACTIONS.SET_CONTENT_HASH:
      newState = { ...currentState, contentHash: action.payload };
      break;

    case ACTIONS.SET_RESOLUTION:
      newState = { ...currentState, resolution: action.payload };
      break;

    case ACTIONS.SET_COLOR_THEME:
      newState = { ...currentState, colorTheme: action.payload };
      break;

    default:
      // Return unchanged state for unknown actions
      return currentState;
  }

  // Update internal state
  stateContainer._setState(newState);

  // Notify all subscribers
  subscribers.forEach(callback => callback(newState));

  return newState;
}

/**
 * Subscribe to state changes
 * @param {Object} stateContainer - State container from createState
 * @param {Function} callback - Function called on state change
 * @returns {Function} Unsubscribe function
 */
export function subscribe(stateContainer, callback) {
  subscribers.add(callback);

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}