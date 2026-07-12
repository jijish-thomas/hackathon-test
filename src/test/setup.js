import '@testing-library/jest-dom'

// Carbon uses ResizeObserver internally — polyfill for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
