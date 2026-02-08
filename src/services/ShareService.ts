export interface ShareData {
  title: string;
  text: string;
}

class ShareServiceClass {
  canNativeShare(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  private buildScoreText(score: number, worldName: string, stars: number): string {
    const starStr = '\u2B50'.repeat(stars);
    return `I scored ${score} points on ${worldName} in Banano Quest! ${starStr}\n#BananoQuest #Banano`;
  }

  private buildAchievementText(achievementName: string): string {
    return `I just unlocked "${achievementName}" in Banano Quest!\n#BananoQuest #Banano`;
  }

  async shareScore(score: number, worldName: string, stars: number): Promise<boolean> {
    const text = this.buildScoreText(score, worldName, stars);
    return this.share({ title: 'Banano Quest', text });
  }

  async shareAchievement(achievementName: string): Promise<boolean> {
    const text = this.buildAchievementText(achievementName);
    return this.share({ title: 'Banano Quest', text });
  }

  async shareCustom(text: string): Promise<boolean> {
    return this.share({ title: 'Banano Quest', text });
  }

  private async share(data: ShareData): Promise<boolean> {
    if (this.canNativeShare()) {
      try {
        await navigator.share({ title: data.title, text: data.text });
        return true;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    return this.copyToClipboard(data.text);
  }

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Clipboard API failed
    }

    // Fallback: textarea trick
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }

  getScoreText(score: number, worldName: string, stars: number): string {
    return this.buildScoreText(score, worldName, stars);
  }
}

export const ShareService = new ShareServiceClass();
