import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @/lib/gsap before importing scrollTrigger so the mock is in place.
const mockRevert = vi.fn();
const mockContext = vi.fn((setup: () => void) => {
  setup();
  return { revert: mockRevert };
});

vi.mock("@/lib/gsap", () => ({
  gsap: {
    context: (setup: () => void) => mockContext(setup),
  },
}));

import {
  __resetDeferGsapQueueForTests,
  deferGsap,
  whenDeferredGsapDrained,
} from "./scrollTrigger";

describe("deferGsap serial queue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockContext.mockClear();
    mockRevert.mockClear();
    document.documentElement.classList.remove("scroll-restoring");
    __resetDeferGsapQueueForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("processes one setup per animation frame, in registration order", () => {
    const calls: string[] = [];
    deferGsap(() => calls.push("A"));
    deferGsap(() => calls.push("B"));
    deferGsap(() => calls.push("C"));

    expect(calls).toEqual([]);

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["A"]);

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["A", "B"]);

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["A", "B", "C"]);
  });

  it("skips a setup whose cleanup ran before its turn", () => {
    const calls: string[] = [];
    const cleanupA = deferGsap(() => calls.push("A"));
    deferGsap(() => calls.push("B"));

    cleanupA();

    vi.advanceTimersToNextFrame();
    vi.advanceTimersToNextFrame();
    expect(calls).toEqual(["B"]);
  });

  it("reverts the gsap.context when cleanup runs after setup fired", () => {
    deferGsap(() => {});
    vi.advanceTimersToNextFrame();
    expect(mockContext).toHaveBeenCalledTimes(1);

    // Capture the cleanup of a second registration and run it post-fire.
    const cleanup = deferGsap(() => {});
    vi.advanceTimersToNextFrame();
    expect(mockContext).toHaveBeenCalledTimes(2);

    cleanup();
    expect(mockRevert).toHaveBeenCalledTimes(1);
  });

  it("waits for html.scroll-restoring to clear before scheduling", () => {
    document.documentElement.classList.add("scroll-restoring");
    const calls: string[] = [];
    deferGsap(() => calls.push("A"));

    vi.advanceTimersToNextFrame();
    expect(calls).toEqual([]);

    document.documentElement.classList.remove("scroll-restoring");
    // MutationObserver fires as a microtask; flush it then advance a frame.
    return Promise.resolve().then(() => {
      vi.advanceTimersToNextFrame();
      expect(calls).toEqual(["A"]);
    });
  });
});

describe("whenDeferredGsapDrained", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockContext.mockClear();
    mockRevert.mockClear();
    document.documentElement.classList.remove("scroll-restoring");
    __resetDeferGsapQueueForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves immediately when nothing is queued", async () => {
    const promise = whenDeferredGsapDrained();
    vi.advanceTimersToNextFrame();
    await expect(promise).resolves.toBeUndefined();
  });

  it("waits for every pending setup to fire before resolving", async () => {
    const fired: string[] = [];
    deferGsap(() => fired.push("A"));
    deferGsap(() => fired.push("B"));

    let drained = false;
    const promise = whenDeferredGsapDrained().then(() => {
      drained = true;
    });

    vi.advanceTimersToNextFrame();
    expect(fired).toEqual(["A"]);
    expect(drained).toBe(false);

    vi.advanceTimersToNextFrame();
    expect(fired).toEqual(["A", "B"]);

    // One more frame for the drain check to observe the empty queue.
    vi.advanceTimersToNextFrame();
    await promise;
    expect(drained).toBe(true);
  });
});
