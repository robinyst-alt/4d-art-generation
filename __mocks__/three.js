/**
 * Mock for three.js module
 */

// Create a simple mock function
const createMockFn = () => {
  const fn = function(...args) {
    fn.mock.calls.push(args);
    return fn._implementation ? fn._implementation(...args) : undefined;
  };
  fn.mock = { calls: [] };
  fn.mockImplementation = (impl) => {
    fn._implementation = impl;
    return fn;
  };
  return fn;
};

// Create mock instances
const mockDomElement = {
  toDataURL: function(format) {
    return format === 'image/jpeg'
      ? 'data:image/jpeg;base64,mock'
      : 'data:image/png;base64,mock';
  },
  style: {
    width: '',
    height: ''
  }
};

const mockRendererInstance = {
  type: 'WebGLRenderer',
  domElement: mockDomElement,
  setPixelRatio: function() {},
  setSize: function() {},
  setClearColor: function() {},
  render: function() {},
  setAnimationLoop: function() {}
};

export const WebGLRenderer = createMockFn().mockImplementation(() => mockRendererInstance);