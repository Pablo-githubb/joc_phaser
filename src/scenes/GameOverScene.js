/**
 * GameOverScene.js - Pantalla de fi de partida
 * 
 * Mostra el resultat del nivell (victòria o derrota) amb
 * estrelles, estadístiques i opcions per continuar.
 */
import { SCENES } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS } from '../config/gameConfig.js';
import Button from '../ui/Button.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
  }

  /** Rebre les dades del resultat */
  init(data) {
    this.won = data.won || false;
    this.stars = data.stars || 0;
    this.levelId = data.levelId || 1;
    this.loot = data.loot || 0;
    this.totalLoot = data.totalLoot || 0;
    this.time = data.time || 0;
    this.detected = data.detected || false;
  }

  create() {
    const { WIDTH, HEIGHT } = SCREEN_CONFIG;

    this.cameras.main.setBackgroundColor('#0a0a18');
    this.cameras.main.fadeIn(500, 10, 10, 18);

    // === PANELL CENTRAL ===
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.95);
    g.fillRoundedRect(WIDTH / 2 - 200, 50, 400, 380, 16);
    const borderColor = this.won ? 0x4caf50 : 0xff4444;
    g.lineStyle(2, borderColor, 0.6);
    g.strokeRoundedRect(WIDTH / 2 - 200, 50, 400, 380, 16);

    // === TÍTOL ===
    const titleText = this.won ? '🎉 MISSIÓ COMPLETADA!' : '💀 MISSIÓ FRACASSADA';
    const titleColor = this.won ? '#4caf50' : '#ff4444';
    this.add.text(WIDTH / 2, 90, titleText, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '14px', color: titleColor,
    }).setOrigin(0.5);

    // === ESTRELLES (només si ha guanyat) ===
    if (this.won) {
      const starY = 130;
      for (let i = 0; i < 3; i++) {
        const star = this.add.text(WIDTH / 2 - 40 + i * 40, starY, '★', {
          fontSize: '30px',
          color: i < this.stars ? '#ffd700' : '#333355',
        }).setOrigin(0.5).setAlpha(0);

        // Animació d'aparició de les estrelles
        this.tweens.add({
          targets: star,
          alpha: 1,
          scaleX: 1.3, scaleY: 1.3,
          duration: 300,
          delay: 400 + i * 300,
          yoyo: false,
          onComplete: () => {
            this.tweens.add({
              targets: star,
              scaleX: 1, scaleY: 1,
              duration: 200,
            });
          }
        });
      }
    }

    // === ESTADÍSTIQUES ===
    const statsY = this.won ? 175 : 140;
    const statsStyle = {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '9px', color: '#aabbcc', lineSpacing: 12,
    };

    // Temps
    const totalSeconds = Math.floor(this.time / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    this.add.text(WIDTH / 2 - 150, statsY, `Temps:`, statsStyle);
    this.add.text(WIDTH / 2 + 150, statsY, `${mins}:${secs.toString().padStart(2, '0')}`, {
      ...statsStyle, color: '#64b5f6',
    }).setOrigin(1, 0);

    // Botí
    this.add.text(WIDTH / 2 - 150, statsY + 30, `Botí:`, statsStyle);
    this.add.text(WIDTH / 2 + 150, statsY + 30, `${this.loot} / ${this.totalLoot}`, {
      ...statsStyle, color: '#ffd700',
    }).setOrigin(1, 0);

    // Detectat
    this.add.text(WIDTH / 2 - 150, statsY + 60, `Detectat:`, statsStyle);
    this.add.text(WIDTH / 2 + 150, statsY + 60, this.detected ? 'Sí' : 'No', {
      ...statsStyle, color: this.detected ? '#ff4444' : '#4caf50',
    }).setOrigin(1, 0);

    // Línia separadora
    const lineG = this.add.graphics();
    lineG.lineStyle(1, 0x64b5f6, 0.2);
    lineG.lineBetween(WIDTH / 2 - 160, statsY + 90, WIDTH / 2 + 160, statsY + 90);

    // === CRITERIS D'ESTRELLES ===
    if (this.won) {
      const criteriaY = statsY + 105;
      const crStyle = { fontFamily: 'Outfit, sans-serif', fontSize: '10px', color: '#667788' };
      this.add.text(WIDTH / 2, criteriaY, '★ Completar el nivell', crStyle).setOrigin(0.5);
      this.add.text(WIDTH / 2, criteriaY + 18, '★★ No ser detectat', crStyle).setOrigin(0.5);
      this.add.text(WIDTH / 2, criteriaY + 36, '★★★ Recollir 80%+ del botí', crStyle).setOrigin(0.5);
    }

    // === BOTONS ===
    const btnY = this.won ? 380 : 320;

    if (this.won) {
      // Següent nivell
      new Button(this, WIDTH / 2, btnY - 15, '▶ SEGÜENT NIVELL', () => {
        this.cameras.main.fadeOut(400, 10, 10, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME, { levelId: this.levelId + 1 });
        });
      }, { width: 240, height: 45, fontSize: '10px', borderColor: 0x4caf50 });
    }

    // Reintentar
    new Button(this, WIDTH / 2 - 90, btnY + 40, '↺ REINTENTAR', () => {
      this.cameras.main.fadeOut(300, 10, 10, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.GAME, { levelId: this.levelId });
      });
    }, { width: 160, height: 40, fontSize: '8px' });

    // Menú
    new Button(this, WIDTH / 2 + 90, btnY + 40, '🏠 MENÚ', () => {
      this.cameras.main.fadeOut(300, 10, 10, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MENU);
      });
    }, { width: 160, height: 40, fontSize: '8px' });
  }
}
