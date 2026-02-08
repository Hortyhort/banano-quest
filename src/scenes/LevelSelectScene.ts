import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, WORLDS, COLORS } from '../config/gameConfig.ts';
import { StorageService } from '../services/StorageService.ts';
import { AudioManager } from '../services/AudioManager.ts';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, 50, 'SELECT LEVEL', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '48px',
        color: '#FFEB3B',
        stroke: '#FF9800',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const totalStars = StorageService.getTotalStars();
    const maxStars = WORLDS.reduce((sum, w) => sum + w.levels.length * 3, 0);
    this.add
      .text(GAME_WIDTH / 2, 100, `\u2605 ${totalStars} / ${maxStars}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
      })
      .setOrigin(0.5);

    const unlockedLevels = StorageService.getUnlockedLevels();
    let flatIndex = 0;
    const worldSpacing = 200;
    const startY = 160;

    WORLDS.forEach((world, worldIdx) => {
      const worldY = startY + worldIdx * worldSpacing;

      // World header with colored bar
      const headerBg = this.add.graphics();
      headerBg.fillStyle(world.theme.skyGradientTop, 0.3);
      headerBg.fillRoundedRect(80, worldY, GAME_WIDTH - 160, 170, 12);
      headerBg.lineStyle(2, world.theme.skyGradientTop, 0.5);
      headerBg.strokeRoundedRect(80, worldY, GAME_WIDTH - 160, 170, 12);

      const worldStars = StorageService.getWorldStars(worldIdx);
      const worldMaxStars = world.levels.length * 3;

      this.add
        .text(140, worldY + 15, `${world.theme.name}`, {
          fontFamily: 'Arial Black, Arial',
          fontSize: '28px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0, 0);

      this.add
        .text(GAME_WIDTH - 140, worldY + 20, `\u2605 ${worldStars}/${worldMaxStars}`, {
          fontFamily: 'Arial',
          fontSize: '22px',
          color: '#FFD700',
        })
        .setOrigin(1, 0);

      // Level buttons
      world.levels.forEach((level, levelIdx) => {
        flatIndex++;
        const isUnlocked = flatIndex <= unlockedLevels;
        const btnX = 200 + levelIdx * 180;
        const btnY = worldY + 90;

        const container = this.add.container(btnX, btnY);

        const btnBg = this.add.graphics();
        if (isUnlocked) {
          btnBg.fillStyle(world.theme.skyGradientTop, 0.8);
          btnBg.fillRoundedRect(-60, -40, 120, 80, 10);
          btnBg.lineStyle(2, 0xffffff, 0.3);
          btnBg.strokeRoundedRect(-60, -40, 120, 80, 10);
        } else {
          btnBg.fillStyle(0x333333, 0.6);
          btnBg.fillRoundedRect(-60, -40, 120, 80, 10);
        }

        const levelLabel = this.add
          .text(0, -15, isUnlocked ? `${levelIdx + 1}` : '\u{1F512}', {
            fontFamily: 'Arial Black, Arial',
            fontSize: isUnlocked ? '32px' : '24px',
            color: isUnlocked ? '#FFFFFF' : '#666666',
            stroke: '#000000',
            strokeThickness: isUnlocked ? 3 : 0,
          })
          .setOrigin(0.5);

        container.add([btnBg, levelLabel]);

        // Star display
        if (isUnlocked) {
          const stars = StorageService.getLevelStars(worldIdx, levelIdx);
          const starText = this.add
            .text(0, 20, '\u2605'.repeat(stars) + '\u2606'.repeat(3 - stars), {
              fontFamily: 'Arial',
              fontSize: '16px',
              color: '#FFD700',
            })
            .setOrigin(0.5);
          container.add(starText);

          container.setSize(120, 80);
          container.setInteractive({ useHandCursor: true });

          container.on('pointerover', () => {
            this.tweens.add({
              targets: container,
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 100,
            });
          });

          container.on('pointerout', () => {
            this.tweens.add({
              targets: container,
              scaleX: 1,
              scaleY: 1,
              duration: 100,
            });
          });

          container.on('pointerdown', () => {
            AudioManager.playSfx('menuSelect');
            AudioManager.stopBgm();
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
              this.scene.start('GameScene', {
                worldIndex: worldIdx,
                levelIndex: levelIdx,
              });
            });
          });
        }

        // Par time label for unlocked levels
        if (isUnlocked) {
          const parLabel = this.add
            .text(0, 60, `Par: ${level.parTime}s`, {
              fontFamily: 'Arial',
              fontSize: '12px',
              color: '#AAAAAA',
            })
            .setOrigin(0.5);
          container.add(parLabel);
        }
      });
    });

    // Back button
    const backBtn = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 40);
    const backBg = this.add.graphics();
    backBg.fillStyle(COLORS.MONKEY_BROWN, 0.8);
    backBg.fillRoundedRect(-80, -20, 160, 40, 8);
    const backText = this.add
      .text(0, 0, 'BACK TO MENU', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: '#FFFFFF',
      })
      .setOrigin(0.5);
    backBtn.add([backBg, backText]);
    backBtn.setSize(160, 40);
    backBtn.setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      AudioManager.playSfx('menuSelect');
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(300);
  }
}
