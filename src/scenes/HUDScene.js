/**
 * HUDScene.js - Interfície durant el joc
 * 
 * Mostra la vida del jugador, el botí recollit, el temps,
 * i l'indicador d'objectiu principal. Es renderitza com una
 * escena superposada sobre la GameScene.
 */
import { SCENES, EVENTS } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS, PLAYER_CONFIG } from '../config/gameConfig.js';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.HUD });
  }

  /** Rebre dades inicials del nivell */
  init(data) {
    this.maxHealth = data.health || PLAYER_CONFIG.MAX_HEALTH;
    this.levelName = data.levelName || '';
    this.totalLoot = data.totalLoot || 0;
  }

  create() {
    const { WIDTH } = SCREEN_CONFIG;

    // === FONS DEL HUD (barra superior semitransparent) ===
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x0a0a12, 0.7);
    hudBg.fillRect(0, 0, WIDTH, 36);
    hudBg.lineStyle(1, 0x64b5f6, 0.2);
    hudBg.lineBetween(0, 36, WIDTH, 36);

    // === CORS DE VIDA ===
    this.heartIcons = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.text(15 + i * 28, 10, '♥', {
        fontSize: '18px',
        color: '#ff4444',
      }).setDepth(10);
      this.heartIcons.push(heart);
    }

    // === BOTÍ RECOLLIT ===
    this.lootText = this.add.text(WIDTH / 2, 12, '💰 0', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '10px',
      color: '#ffd700',
    }).setOrigin(0.5, 0).setDepth(10);

    // === TEMPS ===
    this.timeText = this.add.text(WIDTH - 15, 12, '⏱ 0:00', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '9px',
      color: '#aabbcc',
    }).setOrigin(1, 0).setDepth(10);

    // === NOM DEL NIVELL ===
    this.add.text(WIDTH / 2, 25, this.levelName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '8px',
      color: '#556677',
    }).setOrigin(0.5, 0).setDepth(10);

    // === INDICADOR D'OBJECTIU ===
    this.objectiveText = this.add.text(WIDTH / 2, 50, '⬆ Troba l\'objectiu principal', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '7px',
      color: '#778899',
      backgroundColor: '#0a0a1280',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0).setDepth(10);

    // === PAUSA (indicador) ===
    this.add.text(WIDTH - 15, 26, 'ESC: Pausa', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '7px',
      color: '#334455',
    }).setOrigin(1, 0).setDepth(10);

    // === ESCOLTAR EVENTS D'ACTUALITZACIÓ ===
    const gameScene = this.scene.get(SCENES.GAME);
    gameScene.events.on(EVENTS.UPDATE_HUD, this.updateHUD, this);
  }

  /**
   * Actualitza els elements del HUD amb les noves dades
   * @param {object} data - {health, loot, time, mainLoot}
   */
  updateHUD(data) {
    // Actualitzar cors de vida
    if (data.health !== undefined) {
      this.heartIcons.forEach((heart, i) => {
        heart.setText(i < data.health ? '♥' : '♡');
        heart.setColor(i < data.health ? '#ff4444' : '#333344');
      });
    }

    // Actualitzar botí
    if (data.loot !== undefined) {
      this.lootText.setText(`💰 ${data.loot}`);
    }

    // Actualitzar temps
    if (data.time !== undefined) {
      const totalSeconds = Math.floor(data.time / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      this.timeText.setText(`⏱ ${mins}:${secs.toString().padStart(2, '0')}`);
    }

    // Actualitzar objectiu
    if (data.mainLoot) {
      this.objectiveText.setText('★ Objectiu aconseguit! Ves a la sortida →');
      this.objectiveText.setColor('#4caf50');
    }
  }

  /** Neteja els events en tancar */
  shutdown() {
    const gameScene = this.scene.get(SCENES.GAME);
    if (gameScene) {
      gameScene.events.off(EVENTS.UPDATE_HUD, this.updateHUD, this);
    }
  }
}
