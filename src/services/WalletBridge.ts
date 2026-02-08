export class WalletBridge {
  private connected = false;
  private address: string | null = null;
  private balance = 0;

  async connect(): Promise<boolean> {
    console.warn('WalletBridge: connect() - Not yet implemented');
    return false;
  }

  disconnect(): void {
    this.connected = false;
    this.address = null;
    this.balance = 0;
  }

  getAddress(): string | null {
    return this.address;
  }

  async getBalance(): Promise<number> {
    console.warn('WalletBridge: getBalance() - Not yet implemented');
    return this.balance;
  }

  async sendTransaction(_toAddress: string, _amount: number): Promise<string | null> {
    console.warn('WalletBridge: sendTransaction() - Not yet implemented');
    return null;
  }

  calculateReward(score: number): number {
    const conversionRate = 0.00001;
    return score * conversionRate;
  }

  async claimRewards(score: number): Promise<boolean> {
    if (!this.connected) {
      console.warn('WalletBridge: Cannot claim rewards - wallet not connected');
      return false;
    }
    const reward = this.calculateReward(score);
    console.warn(`WalletBridge: claimRewards(${score}) = ${reward} BAN - Not yet implemented`);
    return false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const walletBridge = new WalletBridge();
