/**
 * QualityManager — Adaptive quality based on device capabilities.
 * Detects low-end devices and provides quality multipliers
 * that scenes/sprites can use to throttle particles, effects, etc.
 */

interface QualitySettings {
  /** True if device appears low-end (<=4 cores or low memory) */
  isLowEnd: boolean;
  /** Multiplier for particle counts (0.3 low-end, 1.0 high-end) */
  particleMultiplier: number;
  /** Whether to show parallax background hills */
  enableParallax: boolean;
  /** Whether to show cloud animations */
  enableClouds: boolean;
  /** Max number of simultaneous tweens for effects */
  maxEffectTweens: number;
}

let settings: QualitySettings = {
  isLowEnd: false,
  particleMultiplier: 1,
  enableParallax: true,
  enableClouds: true,
  maxEffectTweens: 20,
};

let initialized = false;

export const QualityManager = {
  init(): void {
    if (initialized) return;
    initialized = true;

    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const memory =
      typeof navigator !== 'undefined' && 'deviceMemory' in navigator
        ? (navigator as { deviceMemory?: number }).deviceMemory || 4
        : 4;

    const isLowEnd = cores <= 4 || memory <= 2;

    if (isLowEnd) {
      settings = {
        isLowEnd: true,
        particleMultiplier: 0.3,
        enableParallax: false,
        enableClouds: false,
        maxEffectTweens: 8,
      };
    } else {
      settings = {
        isLowEnd: false,
        particleMultiplier: 1,
        enableParallax: true,
        enableClouds: true,
        maxEffectTweens: 20,
      };
    }
  },

  getSettings(): QualitySettings {
    return settings;
  },

  /** Scale a particle count by quality level */
  scaleParticles(count: number): number {
    return Math.max(1, Math.round(count * settings.particleMultiplier));
  },

  /** Should parallax hills be rendered? */
  shouldRenderParallax(): boolean {
    return settings.enableParallax;
  },

  /** Should cloud animations run? */
  shouldRenderClouds(): boolean {
    return settings.enableClouds;
  },
};
