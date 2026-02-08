/**
 * TouchInput — Shared touch state for virtual controls.
 * Touch buttons in UIScene set these flags; Player reads them.
 */

export const TouchInput = {
  left: false,
  right: false,
  jump: false,
};

let _isTouchDevice: boolean | null = null;

export function isTouchDevice(): boolean {
  if (_isTouchDevice !== null) return _isTouchDevice;
  if (typeof window === 'undefined') return false;
  _isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return _isTouchDevice;
}
