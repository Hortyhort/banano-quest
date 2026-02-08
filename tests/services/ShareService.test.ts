import { describe, it, expect } from 'vitest';
import { ShareService } from '../../src/services/ShareService.ts';

describe('ShareService', () => {
  it('canNativeShare returns boolean', () => {
    const result = ShareService.canNativeShare();
    expect(typeof result).toBe('boolean');
  });

  it('getScoreText includes score and world name', () => {
    const text = ShareService.getScoreText(500, 'Jungle', 3);
    expect(text).toContain('500');
    expect(text).toContain('Jungle');
    expect(text).toContain('BananoQuest');
  });

  it('getScoreText includes star emojis', () => {
    const text = ShareService.getScoreText(100, 'Ice Caves', 2);
    expect(text).toContain('\u2B50\u2B50');
  });

  it('shareScore returns a boolean', async () => {
    const result = await ShareService.shareScore(100, 'Jungle', 2);
    expect(typeof result).toBe('boolean');
  });

  it('shareAchievement returns a boolean', async () => {
    const result = await ShareService.shareAchievement('Coin Collector');
    expect(typeof result).toBe('boolean');
  });

  it('shareCustom returns a boolean', async () => {
    const result = await ShareService.shareCustom('Test message');
    expect(typeof result).toBe('boolean');
  });

  it('copyToClipboard returns a boolean', async () => {
    const result = await ShareService.copyToClipboard('test');
    expect(typeof result).toBe('boolean');
  });
});
