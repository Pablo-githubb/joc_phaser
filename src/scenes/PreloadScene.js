/**
 * PreloadScene.js - Escena de càrrega d'assets
 * 
 * Genera tots els assets programàticament (sprites, sons)
 * i mostra una barra de progrés de càrrega animada.
 * Tots els sprites són pixel art generat amb Canvas.
 */
import { SCENES } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS } from '../config/gameConfig.js';
import soundtrackUrl from '../music/ost.mp3';
import menuUrl from '../music/menu.mp3';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  preload() {
    const { WIDTH, HEIGHT } = SCREEN_CONFIG;

    // === BARRA DE PROGRÉS DE CÀRREGA ===
    this.cameras.main.setBackgroundColor('#0a0a12');

    const loadText = this.add.text(WIDTH / 2, HEIGHT / 2 - 50, 'Carregant...', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '12px', color: '#64b5f6',
    }).setOrigin(0.5);

    // Fons de la barra
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a1a2e, 1);
    barBg.fillRoundedRect(WIDTH / 2 - 150, HEIGHT / 2 - 10, 300, 20, 4);
    barBg.lineStyle(1, 0x64b5f6, 0.4);
    barBg.strokeRoundedRect(WIDTH / 2 - 150, HEIGHT / 2 - 10, 300, 20, 4);

    // Barra de progrés que s'omple
    const barFill = this.add.graphics();

    // === CÀRREGA D'ÀUDIO (MÚSICA) ===
    this.load.audio('music-stealth', soundtrackUrl);
    this.load.audio('music-menu', menuUrl);

    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x64b5f6, 1);
      barFill.fillRoundedRect(WIDTH / 2 - 148, HEIGHT / 2 - 8, 296 * value, 16, 3);
    });

    this.load.on('complete', () => {
      loadText.setText('Preparat!');
    });
  }

  /** Crear tots els assets generats programàticament */
  create() {
    this.generatePlayerSprite();
    this.generateGuardSprite();
    this.generateLootSprite();
    this.generateTileset();

    // Transició al menú principal
    this.cameras.main.fadeOut(400, 10, 10, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.MENU);
    });
  }

  /**
   * Genera el spritesheet del jugador (10 frames de 32x48px)
   * Frames: 0-1 idle, 2-5 walk, 6-7 climb, 8-9 knockout
   */
  generatePlayerSprite() {
    const canvas = document.createElement('canvas');
    const fw = 32, fh = 48, frames = 10;
    canvas.width = fw * frames;
    canvas.height = fh;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < frames; i++) {
      const ox = i * fw;
      this.drawPlayerFrame(ctx, ox, i);
    }

    this.textures.addSpriteSheet('player-sprite', canvas, { frameWidth: fw, frameHeight: fh });
  }

  /** Dibuixa un frame del jugador */
  drawPlayerFrame(ctx, ox, frame) {
    // Cos del jugador (vestit negre de lladre)
    ctx.fillStyle = '#1a1a2e';

    // Cap amb passamuntanyes
    ctx.fillStyle = '#222244';
    ctx.fillRect(ox + 10, 4, 12, 12);
    // Ulls (brillants)
    ctx.fillStyle = '#64b5f6';
    ctx.fillRect(ox + 12, 8, 3, 3);
    ctx.fillRect(ox + 18, 8, 3, 3);

    // Cos
    ctx.fillStyle = '#1a1a2e';
    const bodyOffset = (frame >= 2 && frame <= 5) ? Math.sin(frame * 0.8) * 1 : 0;
    ctx.fillRect(ox + 8, 16 + bodyOffset, 16, 18);

    // Cinturó d'eines
    ctx.fillStyle = '#555577';
    ctx.fillRect(ox + 8, 28, 16, 3);

    // Cames (animació de caminar)
    ctx.fillStyle = '#16213e';
    if (frame >= 2 && frame <= 5) {
      // Animació de cames caminant
      const legOff = Math.sin(frame * 1.5) * 4;
      ctx.fillRect(ox + 10, 34, 5, 12);
      ctx.fillRect(ox + 17 + legOff, 34, 5, 12);
    } else if (frame >= 6 && frame <= 7) {
      // Pujant escales
      const climbOff = frame === 6 ? -2 : 2;
      ctx.fillRect(ox + 10, 34 + climbOff, 5, 10);
      ctx.fillRect(ox + 17, 34 - climbOff, 5, 10);
    } else if (frame >= 8) {
      // Noquejant (braç estès)
      ctx.fillRect(ox + 10, 34, 5, 12);
      ctx.fillRect(ox + 17, 34, 5, 12);
      ctx.fillStyle = '#64b5f6';
      ctx.fillRect(ox + 24, 18, 6, 4); // Puny
    } else {
      // Idle
      ctx.fillRect(ox + 10, 34, 5, 12);
      ctx.fillRect(ox + 17, 34, 5, 12);
    }

    // Sabates
    ctx.fillStyle = '#333355';
    ctx.fillRect(ox + 9, 44, 6, 3);
    ctx.fillRect(ox + 17, 44, 6, 3);
  }

  /**
   * Genera el spritesheet del guarda (10 frames de 32x48px)
   */
  generateGuardSprite() {
    const canvas = document.createElement('canvas');
    const fw = 32, fh = 48, frames = 10;
    canvas.width = fw * frames;
    canvas.height = fh;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < frames; i++) {
      const ox = i * fw;
      this.drawGuardFrame(ctx, ox, i);
    }

    this.textures.addSpriteSheet('guard-sprite', canvas, { frameWidth: fw, frameHeight: fh });
  }

  /** Dibuixa un frame del guarda */
  drawGuardFrame(ctx, ox, frame) {
    // Gorra del guarda
    ctx.fillStyle = '#334455';
    ctx.fillRect(ox + 8, 2, 16, 5);
    ctx.fillRect(ox + 6, 5, 20, 3);

    // Cap
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(ox + 10, 7, 12, 10);
    // Ulls
    ctx.fillStyle = '#222222';
    ctx.fillRect(ox + 12, 11, 2, 2);
    ctx.fillRect(ox + 18, 11, 2, 2);

    // Cos (uniforme blau fosc)
    ctx.fillStyle = '#2c3e6b';
    ctx.fillRect(ox + 8, 17, 16, 17);
    // Insígnia
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(ox + 18, 20, 4, 4);

    // Cinturó
    ctx.fillStyle = '#222233';
    ctx.fillRect(ox + 8, 30, 16, 3);

    // Cames
    ctx.fillStyle = '#1a2744';
    if (frame >= 2 && frame <= 5) {
      const legOff = Math.sin(frame * 1.5) * 3;
      ctx.fillRect(ox + 10, 33, 5, 12);
      ctx.fillRect(ox + 17 + legOff, 33, 5, 12);
    } else if (frame >= 8) {
      // Noquejat (estirat al terra)
      ctx.fillStyle = '#2c3e6b';
      ctx.fillRect(ox + 4, 30, 24, 8);
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(ox + 4, 26, 10, 6);
      // Estrelles de KO
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(ox + 10, 22, 2, 2);
      ctx.fillRect(ox + 18, 20, 2, 2);
      ctx.fillRect(ox + 22, 24, 2, 2);
      return;
    } else {
      ctx.fillRect(ox + 10, 33, 5, 12);
      ctx.fillRect(ox + 17, 33, 5, 12);
    }

    // Sabates
    ctx.fillStyle = '#111122';
    ctx.fillRect(ox + 9, 44, 6, 3);
    ctx.fillRect(ox + 17, 44, 6, 3);

    // Signe d'exclamació si és alerta (frames 6-7)
    if (frame >= 6 && frame <= 7) {
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(ox + 14, -2, 4, 6);
      ctx.fillRect(ox + 14, 5, 4, 2);
    }
  }

  /** Genera l'sprite del botí */
  generateLootSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    // Moneda daurada
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', 8, 11);

    this.textures.addSpriteSheet('loot-sprite', canvas, { frameWidth: 16, frameHeight: 16 });
  }

  /** Genera el tileset per a l'entorn */
  generateTileset() {
    // Textura de paret d'edifici
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 32;
    wallCanvas.height = 32;
    const wctx = wallCanvas.getContext('2d');
    wctx.fillStyle = '#2d2d44';
    wctx.fillRect(0, 0, 32, 32);
    wctx.fillStyle = '#252540';
    wctx.fillRect(1, 1, 14, 14);
    wctx.fillRect(17, 1, 14, 14);
    wctx.fillRect(1, 17, 14, 14);
    wctx.fillRect(17, 17, 14, 14);
    wctx.strokeStyle = '#1a1a30';
    wctx.lineWidth = 1;
    wctx.strokeRect(0, 0, 32, 32);
    this.textures.addImage('wall-tile', wallCanvas);

    // Textura de terra
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 32;
    floorCanvas.height = 32;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#3d3d55';
    fctx.fillRect(0, 0, 32, 32);
    fctx.fillStyle = '#353550';
    fctx.fillRect(0, 0, 32, 4);
    fctx.strokeStyle = '#2d2d44';
    fctx.strokeRect(0, 0, 32, 32);
    this.textures.addImage('floor-tile', floorCanvas);
  }

}
