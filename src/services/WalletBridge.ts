const STORAGE_KEY = 'bananoquest_wallet';

export interface WalletData {
  address: string;
  balance: number;
  totalEarned: number;
  claimHistory: ClaimRecord[];
}

export interface ClaimRecord {
  timestamp: number;
  amount: number;
  source: string; // e.g. "level_0_1", "daily_challenge"
}

const BAN_CONVERSION_RATE = 0.001; // BAN per score point

function generateDemoAddress(): string {
  const chars = '13456789abcdefghijkmnopqrstuwxyz';
  let addr = 'ban_';
  for (let i = 0; i < 60; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

class WalletBridgeClass {
  private connected = false;
  private data: WalletData | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = JSON.parse(raw) as WalletData;
        this.connected = true;
      }
    } catch {
      this.data = null;
      this.connected = false;
    }
  }

  private saveToStorage(): void {
    if (!this.data) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or unavailable
    }
  }

  connect(): boolean {
    if (this.connected && this.data) return true;

    this.data = {
      address: generateDemoAddress(),
      balance: 0,
      totalEarned: 0,
      claimHistory: [],
    };
    this.connected = true;
    this.saveToStorage();
    return true;
  }

  disconnect(): void {
    this.connected = false;
    this.data = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  isConnected(): boolean {
    return this.connected;
  }

  getAddress(): string | null {
    return this.data?.address ?? null;
  }

  getShortAddress(): string | null {
    const addr = this.getAddress();
    if (!addr) return null;
    return `${addr.slice(0, 11)}...${addr.slice(-6)}`;
  }

  getBalance(): number {
    return this.data?.balance ?? 0;
  }

  getTotalEarned(): number {
    return this.data?.totalEarned ?? 0;
  }

  getClaimHistory(): ClaimRecord[] {
    return this.data?.claimHistory ?? [];
  }

  calculateReward(score: number): number {
    return Math.round(score * BAN_CONVERSION_RATE * 1000) / 1000;
  }

  claimReward(score: number, source: string): number {
    if (!this.connected || !this.data) return 0;

    const reward = this.calculateReward(score);
    if (reward <= 0) return 0;

    this.data.balance = Math.round((this.data.balance + reward) * 1000) / 1000;
    this.data.totalEarned = Math.round((this.data.totalEarned + reward) * 1000) / 1000;
    this.data.claimHistory.push({
      timestamp: Date.now(),
      amount: reward,
      source,
    });

    // Keep history bounded
    if (this.data.claimHistory.length > 50) {
      this.data.claimHistory = this.data.claimHistory.slice(-50);
    }

    this.saveToStorage();
    return reward;
  }

  getData(): WalletData | null {
    return this.data ? { ...this.data } : null;
  }

  resetAll(): void {
    this.disconnect();
  }
}

export const WalletBridge = new WalletBridgeClass();
