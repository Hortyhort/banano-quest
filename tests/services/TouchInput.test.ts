import { describe, it, expect, beforeEach } from 'vitest';
import { TouchInput, isTouchDevice } from '../../src/services/TouchInput.ts';

describe('TouchInput', () => {
  beforeEach(() => {
    TouchInput.left = false;
    TouchInput.right = false;
    TouchInput.jump = false;
  });

  it('defaults to all false', () => {
    expect(TouchInput.left).toBe(false);
    expect(TouchInput.right).toBe(false);
    expect(TouchInput.jump).toBe(false);
  });

  it('can set left', () => {
    TouchInput.left = true;
    expect(TouchInput.left).toBe(true);
  });

  it('can set right', () => {
    TouchInput.right = true;
    expect(TouchInput.right).toBe(true);
  });

  it('can set jump', () => {
    TouchInput.jump = true;
    expect(TouchInput.jump).toBe(true);
  });

  it('isTouchDevice returns a boolean', () => {
    const result = isTouchDevice();
    expect(typeof result).toBe('boolean');
  });
});
