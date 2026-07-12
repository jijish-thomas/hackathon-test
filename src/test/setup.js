import '@testing-library/jest-dom'

// Carbon uses ResizeObserver internally — polyfill for jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
