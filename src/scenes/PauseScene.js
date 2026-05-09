/**
 * PauseScene.js - Menú de pausa
 * 
 * Es mostra com una superposició quan el jugador prem ESC.
 * Permet reprendre, reiniciar o tornar al menú principal.
 */
import { SCENES } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS } from '../config/gameConfig.js';
import Button from '../ui/Button.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PAUSE });
  }

  create() {
    const { WIDTH, HEIGHT } = SCREEN_CONFIG;

    // === FONS SEMITRANSPARENT ===
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, WIDTH, HEIGHT);

    // === PANELL DE PAUSA ===
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(WIDTH / 2 - 160, HEIGHT / 2 - 120, 320, 240, 12);
    panel.lineStyle(2, 0x64b5f6, 0.5);
    panel.strokeRoundedRect(WIDTH / 2 - 160, HEIGHT / 2 - 120, 320, 240, 12);

    // Títol
    this.add.text(WIDTH / 2, HEIGHT / 2 - 90, '⏸ PAUSA', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '18px',
      color: '#64b5f6',
    }).setOrigin(0.5);

    // === BOTONS ===
    // Reprendre
    new Button(this, WIDTH / 2, HEIGHT / 2 - 20, '▶ REPRENDRE', () => {
      this.resumeGame();
    }, { width: 220, height: 42, fontSize: '10px' });

    // Reiniciar nivell
    new Button(this, WIDTH / 2, HEIGHT / 2 + 35, '↺ REINICIAR', () => {
      this.scene.stop(SCENES.HUD);
      const gameScene = this.scene.get(SCENES.GAME);
      const levelId = gameScene.levelId;
      this.scene.stop(SCENES.GAME);
      this.scene.start(SCENES.GAME, { levelId });
      this.scene.stop();
    }, { width: 220, height: 42, fontSize: '10px' });

    // Tornar al menú
    new Button(this, WIDTH / 2, HEIGHT / 2 + 90, '🏠 MENÚ', () => {
      this.scene.stop(SCENES.HUD);
      this.scene.stop(SCENES.GAME);
      this.scene.start(SCENES.MENU);
      this.scene.stop();
    }, { width: 220, height: 42, fontSize: '10px' });

    // Control per reprendre amb ESC
    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
  }

  /** Reprèn el joc i tanca la pausa */
  resumeGame() {
    const gameScene = this.scene.get(SCENES.GAME);
    gameScene.isPaused = false;
    gameScene.physics.resume();
    this.scene.resume(SCENES.GAME);
    this.scene.stop();
  }
}
