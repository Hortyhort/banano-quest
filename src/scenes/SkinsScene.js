import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig.js';
import { StorageService } from '../services/StorageService.js';
import { AudioManager } from '../services/AudioManager.js';

const SKINS = [
  {
    id: 'default',
    name: 'Classic',
    tint: null,
    description: 'The original monkey',
    unlockHint: 'Always available'
  },
  {
    id: 'golden',
    name: 'Golden',
    tint: 0xFFD700,
    description: 'Shines like a banana',
    unlockHint: 'Collect 200 total coins'
  },
  {
    id: 'ice',
    name: 'Ice',
    tint: 0x81D4FA,
    description: 'Cool as the Frozen Peaks',
    unlockHint: 'Complete Level 4'
  },
  {
    id: 'lava',
    name: 'Lava',
    tint: 0xFF6E40,
    description: 'Forged in the Magma Core',
    unlockHint: 'Complete Level 5'
  },
  {
    id: 'shadow',
    name: 'Shadow',
    tint: 0x9C27B0,
    description: 'Mysterious and powerful',
    unlockHint: 'Unlock 8+ achievements'
  }
];

export class SkinsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkinsScene' });
  }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A0033, 0x2D004D, 0x0D001A, 0x1A0033, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(GAME_WIDTH / 2, 45, 'MONKEY SKINS', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: '#E040FB',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    const unlockedSkins = StorageService.getUnlockedSkins();
    const selectedSkin = StorageService.getSelectedSkin();

    const cardW = 200;
    const cardH = 300;
    const gap = 25;
    const totalW = SKINS.length * cardW + (SKINS.length - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2;

    SKINS.forEach((skin, i) => {
      const x = startX + i * (cardW + gap);
      const y = 110;
      const isUnlocked = unlockedSkins.includes(skin.id);
      const isSelected = selectedSkin === skin.id;

      this.createSkinCard(x, y, cardW, cardH, skin, isUnlocked, isSelected);
    });

    // Back button
    const backBtn = this.add.text(70, 45, '\u25C0 BACK', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#FFEB3B'));
    backBtn.on('pointerout', () => backBtn.setColor('#FFFFFF'));
    backBtn.on('pointerdown', () => {
      AudioManager.playSound('menu_click');
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(400);
  }

  createSkinCard(x, y, w, h, skin, isUnlocked, isSelected) {
    const g = this.add.graphics();
    const cx = x + w / 2;

    // Card background
    if (isSelected) {
      g.fillStyle(0x4A148C, 0.7);
      g.fillRoundedRect(x, y, w, h, 12);
      g.lineStyle(3, 0xE040FB, 0.9);
      g.strokeRoundedRect(x, y, w, h, 12);
    } else if (isUnlocked) {
      g.fillStyle(0x1A1A2E, 0.6);
      g.fillRoundedRect(x, y, w, h, 12);
      g.lineStyle(2, 0x7C4DFF, 0.5);
      g.strokeRoundedRect(x, y, w, h, 12);
    } else {
      g.fillStyle(0x121212, 0.5);
      g.fillRoundedRect(x, y, w, h, 12);
      g.lineStyle(1, 0x424242, 0.3);
      g.strokeRoundedRect(x, y, w, h, 12);
    }

    // Monkey preview
    if (isUnlocked) {
      const monkey = this.add.image(cx, y + 90, 'monkey').setScale(1.8);
      if (skin.tint) monkey.setTint(skin.tint);

      // Bounce animation
      this.tweens.add({
        targets: monkey,
        y: y + 85,
        duration: 800,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    } else {
      // Lock icon
      this.add.text(cx, y + 90, '\u{1F512}', {
        fontSize: '48px'
      }).setOrigin(0.5);
    }

    // Skin name
    const nameColor = isUnlocked ? '#FFFFFF' : '#757575';
    this.add.text(cx, y + 160, skin.name, {
      fontFamily: 'Arial Black, Arial', fontSize: '20px',
      color: nameColor, stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // Description
    const descColor = isUnlocked ? '#B39DDB' : '#616161';
    const descText = isUnlocked ? skin.description : skin.unlockHint;
    this.add.text(cx, y + 190, descText, {
      fontFamily: 'Arial', fontSize: '12px',
      color: descColor, align: 'center',
      wordWrap: { width: w - 20 }
    }).setOrigin(0.5);

    // Select/Equipped button
    if (isUnlocked) {
      if (isSelected) {
        this.add.text(cx, y + 240, 'EQUIPPED', {
          fontFamily: 'Arial Black, Arial', fontSize: '14px',
          color: '#E040FB'
        }).setOrigin(0.5);
      } else {
        const btn = this.add.text(cx, y + 240, 'EQUIP', {
          fontFamily: 'Arial Black, Arial', fontSize: '14px',
          color: '#FFFFFF',
          backgroundColor: '#7C4DFF',
          padding: { x: 16, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#FFEB3B'));
        btn.on('pointerout', () => btn.setColor('#FFFFFF'));
        btn.on('pointerdown', () => {
          AudioManager.playSound('menu_click');
          StorageService.setSelectedSkin(skin.id);
          this.scene.restart();
        });
      }
    }
  }
}
