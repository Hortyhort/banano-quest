import { StorageService } from './StorageService.js';
import { AudioManager } from './AudioManager.js';
import { TOTAL_LEVELS } from '../config/levels.js';

const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete Level 1',
    icon: '\u{1F412}',
    check: (ctx) => ctx.levelCompleted === 1
  },
  {
    id: 'coin_collector',
    name: 'Coin Collector',
    description: 'Collect 100 lifetime coins',
    icon: '\u{1F4B0}',
    check: () => StorageService.getTotalCoins() >= 100
  },
  {
    id: 'coin_hoarder',
    name: 'Coin Hoarder',
    description: 'Collect 500 lifetime coins',
    icon: '\u{1F3C6}',
    check: () => StorageService.getTotalCoins() >= 500
  },
  {
    id: 'banana_mogul',
    name: 'Banana Mogul',
    description: 'Collect 1000 lifetime coins',
    icon: '\u{1F451}',
    check: () => StorageService.getTotalCoins() >= 1000
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '3-star any level',
    icon: '\u2B50',
    check: () => {
      const allStars = StorageService.getAllStars();
      return Object.values(allStars).some(s => s >= 3);
    }
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: '3-star all 5 levels',
    icon: '\u{1F31F}',
    check: () => {
      const allStars = StorageService.getAllStars();
      for (let i = 1; i <= TOTAL_LEVELS; i++) {
        if ((allStars[i] || 0) < 3) return false;
      }
      return true;
    }
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Unlock all 5 levels',
    icon: '\u{1F5FA}\uFE0F',
    check: () => StorageService.getUnlockedLevels() >= TOTAL_LEVELS
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Complete a level without dying',
    icon: '\u{1F6E1}\uFE0F',
    check: (ctx) => ctx.levelCompleted && ctx.deathsThisLevel === 0
  },
  {
    id: 'stomper',
    name: 'Stomper',
    description: 'Stomp 50 enemies (lifetime)',
    icon: '\u{1F45F}',
    check: () => StorageService.getStats().totalEnemiesStomped >= 50
  },
  {
    id: 'powered_up',
    name: 'Powered Up',
    description: 'Collect a power-up',
    icon: '\u26A1',
    check: (ctx) => ctx.powerUpCollected
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat the Level 5 boss',
    icon: '\u{1F409}',
    check: (ctx) => ctx.bossDefeated
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Complete any level in under 45 seconds',
    icon: '\u23F1\uFE0F',
    check: (ctx) => ctx.levelCompleted && ctx.levelTime < 45
  }
];

class AchievementManagerClass {
  getAll() {
    return ACHIEVEMENTS;
  }

  getUnlocked() {
    return StorageService.getAchievements();
  }

  isUnlocked(id) {
    return this.getUnlocked().includes(id);
  }

  /**
   * Check achievements against context and unlock any newly earned ones.
   * Returns array of newly unlocked achievement objects.
   */
  check(context = {}) {
    const unlocked = this.getUnlocked();
    const newlyUnlocked = [];

    for (const ach of ACHIEVEMENTS) {
      if (unlocked.includes(ach.id)) continue;
      try {
        if (ach.check(context)) {
          StorageService.unlockAchievement(ach.id);
          newlyUnlocked.push(ach);
        }
      } catch (e) {
        // Ignore check errors
      }
    }

    return newlyUnlocked;
  }

  /**
   * Show toast notifications for newly unlocked achievements.
   * @param {Phaser.Scene} scene - The active scene to display toasts on
   * @param {Array} achievements - Array of achievement objects to show
   */
  showToasts(scene, achievements) {
    if (!achievements.length) return;

    achievements.forEach((ach, i) => {
      const delay = i * 2500;

      scene.time.delayedCall(delay, () => {
        AudioManager.playSound('star_reveal');
        this._createToast(scene, ach);
      });
    });
  }

  _createToast(scene, ach) {
    const w = 320;
    const h = 60;
    const x = scene.cameras.main.width / 2;
    const startY = -40;
    const targetY = 45;

    const container = scene.add.container(x, startY).setDepth(9999).setScrollFactor(0);

    const bg = scene.add.graphics();
    bg.fillStyle(0x1A1A1A, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(2, 0xFFD700, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    container.add(bg);

    const icon = scene.add.text(-w / 2 + 30, 0, ach.icon, {
      fontSize: '28px'
    }).setOrigin(0.5);
    container.add(icon);

    const title = scene.add.text(-w / 2 + 60, -10, 'ACHIEVEMENT UNLOCKED', {
      fontFamily: 'Arial', fontSize: '11px',
      color: '#FFD700'
    }).setOrigin(0, 0.5);
    container.add(title);

    const name = scene.add.text(-w / 2 + 60, 10, ach.name, {
      fontFamily: 'Arial Black, Arial', fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);
    container.add(name);

    // Slide in
    scene.tweens.add({
      targets: container,
      y: targetY,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Slide out after 2s
    scene.tweens.add({
      targets: container,
      y: startY,
      duration: 300,
      delay: 2200,
      ease: 'Power2',
      onComplete: () => container.destroy()
    });
  }
}

export const AchievementManager = new AchievementManagerClass();
