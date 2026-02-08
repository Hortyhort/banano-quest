/**
 * HapticsService — Lightweight haptic feedback via Navigator.vibrate().
 * Falls back silently when vibration API is unavailable.
 * When Capacitor is available, can be extended to use @capacitor/haptics.
 */

function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not supported — fail silently
  }
}

let enabled = true;

export const HapticsService = {
  isEnabled(): boolean {
    return enabled;
  },

  setEnabled(val: boolean): void {
    enabled = val;
  },

  /** Short tap for jump */
  jump(): void {
    if (!enabled) return;
    vibrate(15);
  },

  /** Soft thud for landing */
  land(): void {
    if (!enabled) return;
    vibrate(10);
  },

  /** Quick tick for coin collection */
  coinCollect(): void {
    if (!enabled) return;
    vibrate(8);
  },

  /** Double pulse for enemy stomp */
  stomp(): void {
    if (!enabled) return;
    vibrate([10, 30, 15]);
  },

  /** Strong rumble for death */
  death(): void {
    if (!enabled) return;
    vibrate([50, 30, 80]);
  },

  /** Celebration pattern for level complete */
  levelComplete(): void {
    if (!enabled) return;
    vibrate([10, 20, 10, 20, 30]);
  },

  /** Heavy hit for spike death */
  spike(): void {
    if (!enabled) return;
    vibrate([30, 20, 60]);
  },

  /** Sad rumble for game over */
  gameOver(): void {
    if (!enabled) return;
    vibrate([40, 50, 60, 50, 80]);
  },
};
