import { describe, it, expect, beforeEach } from 'vitest';
import { WalletBridge } from '../../src/services/WalletBridge.ts';

beforeEach(() => {
  localStorage.clear();
  WalletBridge.resetAll();
});

describe('WalletBridge', () => {
  describe('initial state', () => {
    it('is not connected', () => {
      expect(WalletBridge.isConnected()).toBe(false);
    });

    it('has no address', () => {
      expect(WalletBridge.getAddress()).toBeNull();
    });

    it('has zero balance', () => {
      expect(WalletBridge.getBalance()).toBe(0);
    });
  });

  describe('connect', () => {
    it('returns true and generates ban_ address', () => {
      const result = WalletBridge.connect();
      expect(result).toBe(true);
      expect(WalletBridge.isConnected()).toBe(true);
      expect(WalletBridge.getAddress()).toMatch(/^ban_/);
    });

    it('returns true on repeated connect (idempotent)', () => {
      WalletBridge.connect();
      const addr = WalletBridge.getAddress();
      const result = WalletBridge.connect();
      expect(result).toBe(true);
      expect(WalletBridge.getAddress()).toBe(addr);
    });
  });

  describe('disconnect', () => {
    it('resets state', () => {
      WalletBridge.connect();
      WalletBridge.disconnect();
      expect(WalletBridge.isConnected()).toBe(false);
      expect(WalletBridge.getAddress()).toBeNull();
      expect(WalletBridge.getBalance()).toBe(0);
    });
  });

  describe('getShortAddress', () => {
    it('returns null when not connected', () => {
      expect(WalletBridge.getShortAddress()).toBeNull();
    });

    it('returns truncated address when connected', () => {
      WalletBridge.connect();
      const short = WalletBridge.getShortAddress();
      expect(short).not.toBeNull();
      expect(short!).toContain('...');
      expect(short!.startsWith('ban_')).toBe(true);
    });
  });

  describe('calculateReward', () => {
    it('converts score to BAN at 0.001 rate', () => {
      expect(WalletBridge.calculateReward(1000)).toBe(1);
      expect(WalletBridge.calculateReward(0)).toBe(0);
      expect(WalletBridge.calculateReward(500)).toBe(0.5);
    });
  });

  describe('claimReward', () => {
    it('returns 0 when not connected', () => {
      const result = WalletBridge.claimReward(1000, 'level_0_0');
      expect(result).toBe(0);
    });

    it('adds reward to balance when connected', () => {
      WalletBridge.connect();
      const reward = WalletBridge.claimReward(1000, 'level_0_0');
      expect(reward).toBe(1);
      expect(WalletBridge.getBalance()).toBe(1);
    });

    it('accumulates multiple claims', () => {
      WalletBridge.connect();
      WalletBridge.claimReward(1000, 'level_0_0');
      WalletBridge.claimReward(500, 'level_0_1');
      expect(WalletBridge.getBalance()).toBe(1.5);
      expect(WalletBridge.getTotalEarned()).toBe(1.5);
    });

    it('records claim in history', () => {
      WalletBridge.connect();
      WalletBridge.claimReward(1000, 'level_0_0');
      const history = WalletBridge.getClaimHistory();
      expect(history.length).toBe(1);
      expect(history[0].source).toBe('level_0_0');
      expect(history[0].amount).toBe(1);
    });
  });

  describe('getData', () => {
    it('returns null when not connected', () => {
      expect(WalletBridge.getData()).toBeNull();
    });

    it('returns wallet data when connected', () => {
      WalletBridge.connect();
      const data = WalletBridge.getData();
      expect(data).not.toBeNull();
      expect(data!.address).toMatch(/^ban_/);
      expect(data!.balance).toBe(0);
    });
  });
});
