import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, COLORS } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { AchievementsScene } from './scenes/AchievementsScene.js';
import { StatsScene } from './scenes/StatsScene.js';
import { SkinsScene } from './scenes/SkinsScene.js';
import { AnalyticsService } from './services/AnalyticsService.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: COLORS.SKY_BLUE,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  },
  scene: [BootScene, MenuScene, LevelSelectScene, GameScene, UIScene, PauseScene, GameOverScene, SettingsScene, AchievementsScene, StatsScene, SkinsScene]
};

const game = new Phaser.Game(config);

// --- App Lifecycle ---

// Pause game when tab/app loses focus
document.addEventListener('visibilitychange', () => {
  if (!game.scene) return;

  if (document.hidden) {
    // Pause the game scene if it's active
    const gameScene = game.scene.getScene('GameScene');
    if (gameScene && gameScene.scene.isActive()) {
      gameScene.scene.pause();
      // Launch pause overlay if not already showing
      const pauseScene = game.scene.getScene('PauseScene');
      if (pauseScene && !pauseScene.scene.isActive()) {
        gameScene.scene.launch('PauseScene');
      }
    }
    // Suspend audio
    if (game.sound && game.sound.context && game.sound.context.state === 'running') {
      game.sound.context.suspend();
    }
  } else {
    // Resume audio context
    if (game.sound && game.sound.context && game.sound.context.state === 'suspended') {
      game.sound.context.resume();
    }
  }
});

// Android back button → pause or go back to menu
document.addEventListener('backbutton', () => {
  if (!game.scene) return;

  const gameScene = game.scene.getScene('GameScene');
  if (gameScene && gameScene.scene.isActive()) {
    // In-game: toggle pause
    const pauseScene = game.scene.getScene('PauseScene');
    if (pauseScene && pauseScene.scene.isActive()) {
      pauseScene.scene.stop();
      gameScene.scene.resume();
    } else {
      gameScene.scene.pause();
      gameScene.scene.launch('PauseScene');
    }
    return;
  }

  // On sub-screens: go back to menu
  const subScenes = ['LevelSelectScene', 'SettingsScene', 'AchievementsScene', 'StatsScene', 'SkinsScene'];
  for (const key of subScenes) {
    const s = game.scene.getScene(key);
    if (s && s.scene.isActive()) {
      s.scene.start('MenuScene');
      return;
    }
  }
});

// End analytics session on page unload
window.addEventListener('beforeunload', () => {
  AnalyticsService.endSession();
});

export default game;
