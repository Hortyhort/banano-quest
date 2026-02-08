import { describe, it, expect, beforeEach } from 'vitest';
import { WalletBridge } from '../../src/services/WalletBridge.ts';

describe('WalletBridge', () => {
  let wallet: WalletBridge;

  beforeEach(() => {
    wallet = new WalletBridge();
  });

  describe('initial state', () => {
    it('is not connected', () => {
      expect(wallet.isConnected()).toBe(false);
    });

    it('has no address', () => {
      expect(wallet.getAddress()).toBeNull();
    });
  });

  describe('connect', () => {
    it('returns false (stub)', async () => {
      const result = await wallet.connect();
      expect(result).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('resets state', () => {
      wallet.disconnect();
      expect(wallet.isConnected()).toBe(false);
      expect(wallet.getAddress()).toBeNull();
    });
  });

  describe('getBalance', () => {
    it('returns 0 (stub)', async () => {
      const balance = await wallet.getBalance();
      expect(balance).toBe(0);
    });
  });

  describe('sendTransaction', () => {
    it('returns null (stub)', async () => {
      const txHash = await wallet.sendTransaction('ban_address', 1.0);
      expect(txHash).toBeNull();
    });
  });

  describe('calculateReward', () => {
    it('converts score to BAN at 0.00001 rate', () => {
      expect(wallet.calculateReward(100000)).toBeCloseTo(1.0);
      expect(wallet.calculateReward(0)).toBe(0);
      expect(wallet.calculateReward(10)).toBeCloseTo(0.0001);
    });
  });

  describe('claimRewards', () => {
    it('returns false when not connected', async () => {
      const result = await wallet.claimRewards(1000);
      expect(result).toBe(false);
    });
  });
});
