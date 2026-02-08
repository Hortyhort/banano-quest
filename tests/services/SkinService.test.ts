import { describe, it, expect, beforeEach } from 'vitest';
import { SkinService, SKINS } from '../../src/services/SkinService.ts';

beforeEach(() => {
  localStorage.clear();
  SkinService.resetAll();
});

describe('SkinService', () => {
  it('has at least 5 skins defined', () => {
    expect(SKINS.length).toBeGreaterThanOrEqual(5);
  });

  it('default skin requires 0 stars', () => {
    const def = SKINS.find((s) => s.id === 'default');
    expect(def).toBeDefined();
    expect(def!.starsRequired).toBe(0);
  });

  it('skins are sorted by stars required', () => {
    for (let i = 1; i < SKINS.length; i++) {
      expect(SKINS[i].starsRequired).toBeGreaterThanOrEqual(SKINS[i - 1].starsRequired);
    }
  });

  it('getAll returns skins with unlock status', () => {
    const all = SkinService.getAll(0);
    expect(all.length).toBe(SKINS.length);
    expect(all[0].unlocked).toBe(true); // default always unlocked
    const locked = all.filter((s) => !s.unlocked);
    expect(locked.length).toBeGreaterThan(0);
  });

  it('more skins unlock with more stars', () => {
    const withZero = SkinService.getAll(0).filter((s) => s.unlocked).length;
    const withMax = SkinService.getAll(18).filter((s) => s.unlocked).length;
    expect(withMax).toBeGreaterThan(withZero);
  });

  it('getSelected returns default initially', () => {
    const selected = SkinService.getSelected();
    expect(selected.id).toBe('default');
  });

  it('select changes the active skin', () => {
    const success = SkinService.select('golden', 10);
    expect(success).toBe(true);
    expect(SkinService.getSelected().id).toBe('golden');
  });

  it('select fails for locked skin', () => {
    const success = SkinService.select('diamond', 5);
    expect(success).toBe(false);
    expect(SkinService.getSelected().id).toBe('default');
  });

  it('getSelectedTint returns correct tint', () => {
    expect(SkinService.getSelectedTint()).toBe(0xffffff);
    SkinService.select('golden', 10);
    expect(SkinService.getSelectedTint()).toBe(0xffd700);
  });

  it('resetAll returns to default', () => {
    SkinService.select('golden', 10);
    SkinService.resetAll();
    expect(SkinService.getSelected().id).toBe('default');
  });
});
