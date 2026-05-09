/**
 * LevelSelectScene.js - Pantalla de selecció de nivells
 * 
 * Mostra els nivells disponibles amb estrelles de puntuació.
 * Els nivells bloquejats es mostren amb un cadenat.
 */
import { SCENES } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS } from '../config/gameConfig.js';
import Button from '../ui/Button.js';
import LevelManager from '../levels/LevelManager.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEVEL_SELECT });
  }

  create() {
    const { WIDTH, HEIGHT } = SCREEN_CONFIG;
    this.levelManager = new LevelManager();

    this.cameras.main.setBackgroundColor('#0a0a18');
    this.cameras.main.fadeIn(400, 10, 10, 18);

    // Títol
    this.add.text(WIDTH / 2, 50, 'SELECCIONA NIVELL', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '18px', color: '#64b5f6',
    }).setOrigin(0.5);

    // Crear targetes de nivells
    const totalLevels = this.levelManager.getTotalLevels();
    const cols = 3;
    const cardW = 180, cardH = 140, gap = 30;
    const startX = WIDTH / 2 - ((Math.min(cols, totalLevels) * (cardW + gap)) - gap) / 2 + cardW / 2;
    const startY = 160;

    for (let i = 1; i <= totalLevels; i++) {
      const col = (i - 1) % cols;
      const row = Math.floor((i - 1) / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);

      this.createLevelCard(x, y, i, cardW, cardH);
    }

    // Botó de tornar al menú
    new Button(this, WIDTH / 2, HEIGHT - 50, '← TORNAR', () => {
      this.cameras.main.fadeOut(300, 10, 10, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MENU);
      });
    }, { width: 180, height: 40, fontSize: '10px' });
  }

  /** Crea una targeta visual per a un nivell */
  createLevelCard(x, y, levelId, w, h) {
    const unlocked = this.levelManager.isLevelUnlocked(levelId);
    const score = this.levelManager.getScore(levelId);
    const levelData = this.levelManager.getLevelData(levelId);

    const g = this.add.graphics();

    // Fons de la targeta
    const bgColor = unlocked ? 0x16213e : 0x111122;
    g.fillStyle(bgColor, 0.9);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    // Vora
    const borderColor = unlocked ? 0x64b5f6 : 0x333344;
    g.lineStyle(2, borderColor, 0.6);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

    // Número del nivell
    this.add.text(x, y - 35, `NIVELL ${levelId}`, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '12px', color: unlocked ? '#64b5f6' : '#444455',
    }).setOrigin(0.5);

    // Nom del nivell
    if (levelData) {
      this.add.text(x, y - 10, levelData.name, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px', color: unlocked ? '#aabbcc' : '#333344',
      }).setOrigin(0.5);
    }

    if (unlocked) {
      // Estrelles de puntuació
      const starY = y + 15;
      for (let s = 0; s < 3; s++) {
        const filled = score && score.stars > s;
        this.add.text(x - 20 + s * 20, starY, '★', {
          fontFamily: 'sans-serif',
          fontSize: '16px', color: filled ? '#ffd700' : '#333355',
        }).setOrigin(0.5);
      }

      // Zona clicable per iniciar el nivell
      const hitArea = this.add.rectangle(x, y, w, h)
        .setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0.001);

      hitArea.on('pointerover', () => {
        g.clear();
        g.fillStyle(0x1a2744, 0.95);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        g.lineStyle(2, 0x90caf9, 0.9);
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      });

      hitArea.on('pointerout', () => {
        g.clear();
        g.fillStyle(bgColor, 0.9);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        g.lineStyle(2, borderColor, 0.6);
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      });

      hitArea.on('pointerdown', () => {
        this.cameras.main.fadeOut(400, 10, 10, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME, { levelId });
        });
      });

      // Text "Jugar"
      this.add.text(x, y + 42, '▶ Jugar', {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '8px', color: '#64b5f6',
      }).setOrigin(0.5);

    } else {
      // Cadenat per als nivells bloquejats
      this.add.text(x, y + 15, '🔒', {
        fontSize: '24px',
      }).setOrigin(0.5);
    }
  }
}
