import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HapticsService } from '../../src/services/HapticsService.ts';

describe('HapticsService', () => {
  beforeEach(() => {
    HapticsService.setEnabled(true);
  });

  it('is enabled by default', () => {
    expect(HapticsService.isEnabled()).toBe(true);
  });

  it('can be disabled', () => {
    HapticsService.setEnabled(false);
    expect(HapticsService.isEnabled()).toBe(false);
  });

  it('all methods run without error when enabled', () => {
    expect(() => HapticsService.jump()).not.toThrow();
    expect(() => HapticsService.land()).not.toThrow();
    expect(() => HapticsService.coinCollect()).not.toThrow();
    expect(() => HapticsService.stomp()).not.toThrow();
    expect(() => HapticsService.death()).not.toThrow();
    expect(() => HapticsService.levelComplete()).not.toThrow();
    expect(() => HapticsService.spike()).not.toThrow();
    expect(() => HapticsService.gameOver()).not.toThrow();
  });

  it('all methods run without error when disabled', () => {
    HapticsService.setEnabled(false);
    expect(() => HapticsService.jump()).not.toThrow();
    expect(() => HapticsService.death()).not.toThrow();
    expect(() => HapticsService.levelComplete()).not.toThrow();
  });

  it('calls navigator.vibrate when available and enabled', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      configurable: true,
      writable: true,
    });

    HapticsService.jump();
    expect(mockVibrate).toHaveBeenCalledWith(15);

    HapticsService.death();
    expect(mockVibrate).toHaveBeenCalledWith([50, 30, 80]);
  });

  it('does not call navigator.vibrate when disabled', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      configurable: true,
      writable: true,
    });

    HapticsService.setEnabled(false);
    HapticsService.jump();
    expect(mockVibrate).not.toHaveBeenCalled();
  });
});
