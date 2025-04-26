import "@testing-library/jest-dom";
// Mock ResizeObserver for recharts (and other libs)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserver;

// 👇 Mock DOM measurements used by Recharts
Object.defineProperties(HTMLElement.prototype, {
  offsetWidth: {
    get() {
      return 600; // or any reasonable width
    },
  },
  offsetHeight: {
    get() {
      return 300; // or any reasonable height
    },
  },
});
