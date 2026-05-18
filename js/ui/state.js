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
  SET_RESOLUTION: 'SET_RESOLUTION',
  SET_RENDERING: 'SET_RENDERING',
  SET_COLOR_THEME: 'SET_COLOR_THEME',
  SET_TRANSPARENCY: 'SET_TRANSPARENCY',
  SET_MATRIX: 'SET_MATRIX'
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

    case ACTIONS.SET_RESOLUTION:
      newState = { ...currentState, resolution: action.payload };
      break;

    case ACTIONS.SET_RENDERING:
      newState = { ...currentState, isRendering: action.payload };
      break;

    case ACTIONS.SET_COLOR_THEME:
      newState = { ...currentState, colorTheme: action.payload };
      break;

    case ACTIONS.SET_TRANSPARENCY:
      newState = { ...currentState, transparency: action.payload };
      break;

    case ACTIONS.SET_MATRIX:
      newState = { ...currentState, matrix: action.payload };
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

// Export color themes
export const COLOR_THEMES = {
  neon: {
    name: 'Neon',
    primary: '#6366f1',
    secondary: '#ec4899',
    background: '#0a0a0f'
  },
  sketch: {
    name: 'Sketch',
    primary: '#374151',
    secondary: '#9ca3af',
    background: '#f9fafb'
  },
  firefly: {
    name: 'Firefly',
    primary: '#fbbf24',
    secondary: '#f97316',
    background: '#0a0a0f'
  },
  aurora: {
    name: 'Aurora',
    primary: '#10b981',
    secondary: '#06b6d4',
    background: '#0a0a0f'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: '#00ffff',
    secondary: '#ff00ff',
    background: '#0a0a0f'
  }
};