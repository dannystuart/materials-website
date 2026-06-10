"use client";

// The desktop hero pins for +=3000px of scroll, and that pin only attaches
// once the hero video's metadata arrives. Until the pin-spacer is in the
// document, every absolute Y measured below the hero — the floating CTA's
// reveal threshold anchors to §02 — is read off a layout that is about to
// grow by the full pin distance, so an early scroll trips thresholds that
// belong to the final layout. The hero timeline resolves this signal as soon
// as the pinned trigger exists (or never will — reduced motion); consumers
// that anchor to post-hero geometry wait on it instead of guessing from
// document-height heuristics.

let settled = false;
const waiters: Array<() => void> = [];

export function markHeroPinSettled() {
  if (settled) return;
  settled = true;
  for (const waiter of waiters.splice(0)) waiter();
}

// Runs `waiter` once the hero pin is settled (immediately if it already is).
// Returns an unsubscribe for unmount-before-settle.
export function whenHeroPinSettled(waiter: () => void): () => void {
  if (settled) {
    waiter();
    return () => {};
  }
  waiters.push(waiter);
  return () => {
    const index = waiters.indexOf(waiter);
    if (index !== -1) waiters.splice(index, 1);
  };
}

// Test-only: module state outlives vitest cases. Do not call from app code.
export function __resetHeroPinSignalForTests() {
  settled = false;
  waiters.length = 0;
}
