import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom doesn't implement matchMedia. Polyfill it for any module (e.g. GSAP's
// ScrollTrigger) that touches it at import/registration time. Per-test mocks
// can still override `window.matchMedia` directly.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// jsdom doesn't implement ResizeObserver. Stub it so effects that observe
// element size (e.g. useScrollReveal) don't throw on mount.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

// jsdom doesn't implement IntersectionObserver. Stub it so effects that warm
// media on viewport entry (e.g. MacbookDemo's video pre-warm) don't throw on
// mount. The callback never fires in jsdom, which is fine for layout assertions.
class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver ??=
  IntersectionObserverStub as unknown as typeof IntersectionObserver;
