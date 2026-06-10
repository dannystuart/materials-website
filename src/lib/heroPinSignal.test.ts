import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  markHeroPinSettled,
  whenHeroPinSettled,
  __resetHeroPinSignalForTests,
} from "./heroPinSignal";

describe("heroPinSignal", () => {
  beforeEach(() => {
    __resetHeroPinSignalForTests();
  });

  it("holds waiters until the pin settles, then runs them", () => {
    const waiter = vi.fn();
    whenHeroPinSettled(waiter);
    expect(waiter).not.toHaveBeenCalled();

    markHeroPinSettled();
    expect(waiter).toHaveBeenCalledTimes(1);
  });

  it("runs a waiter immediately when already settled", () => {
    markHeroPinSettled();

    const waiter = vi.fn();
    whenHeroPinSettled(waiter);
    expect(waiter).toHaveBeenCalledTimes(1);
  });

  it("marking twice runs each waiter once", () => {
    const waiter = vi.fn();
    whenHeroPinSettled(waiter);

    markHeroPinSettled();
    markHeroPinSettled();
    expect(waiter).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe removes a pending waiter", () => {
    const kept = vi.fn();
    const removed = vi.fn();
    whenHeroPinSettled(kept);
    const unsubscribe = whenHeroPinSettled(removed);

    unsubscribe();
    markHeroPinSettled();

    expect(kept).toHaveBeenCalledTimes(1);
    expect(removed).not.toHaveBeenCalled();
  });
});
