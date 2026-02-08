import { describe, it, expect } from 'vitest';
import { QualityManager } from '../../src/services/QualityManager.ts';

describe('QualityManager', () => {
  it('can be initialized without error', () => {
    expect(() => QualityManager.init()).not.toThrow();
  });

  it('returns quality settings', () => {
    QualityManager.init();
    const settings = QualityManager.getSettings();
    expect(settings).toBeDefined();
    expect(typeof settings.isLowEnd).toBe('boolean');
    expect(typeof settings.particleMultiplier).toBe('number');
    expect(typeof settings.enableParallax).toBe('boolean');
    expect(typeof settings.enableClouds).toBe('boolean');
    expect(typeof settings.maxEffectTweens).toBe('number');
  });

  it('scaleParticles returns at least 1', () => {
    QualityManager.init();
    expect(QualityManager.scaleParticles(0)).toBe(1);
    expect(QualityManager.scaleParticles(1)).toBeGreaterThanOrEqual(1);
    expect(QualityManager.scaleParticles(10)).toBeGreaterThanOrEqual(1);
  });

  it('scaleParticles scales with multiplier', () => {
    QualityManager.init();
    const scaled = QualityManager.scaleParticles(10);
    const settings = QualityManager.getSettings();
    expect(scaled).toBe(Math.max(1, Math.round(10 * settings.particleMultiplier)));
  });

  it('shouldRenderParallax returns boolean', () => {
    QualityManager.init();
    expect(typeof QualityManager.shouldRenderParallax()).toBe('boolean');
  });

  it('shouldRenderClouds returns boolean', () => {
    QualityManager.init();
    expect(typeof QualityManager.shouldRenderClouds()).toBe('boolean');
  });
});
