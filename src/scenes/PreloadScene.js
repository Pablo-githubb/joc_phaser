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
   * Genera el spritesheet del jugador (14 frames de 32x48px)
   * Frames: 0-1 idle, 2-7 sneak walk, 8-9 climb, 10-11 interact, 12-13 knockout
   */
  generatePlayerSprite() {
    const canvas = document.createElement('canvas');
    const fw = 32, fh = 48, frames = 14;
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
    const isSneaking = (frame >= 2 && frame <= 7);
    const isClimbing = (frame >= 8 && frame <= 9);
    const isInteracting = (frame >= 10 && frame <= 11);
    const isKnocking = (frame >= 12 && frame <= 13);
    
    // Postura encorvada (Bob)
    const hunch = isSneaking ? 4 : (isInteracting ? 2 : 0);
    const breath = (frame === 0 || frame === 1) ? (frame * 1) : 0; // Respiració idle

    // Cos (camisa verda a ratlles / fosca)
    ctx.fillStyle = '#1e3d2f'; // verd fosc
    ctx.fillRect(ox + 8, 16 + hunch + breath, 16, 16);
    // Ratlles de la camisa
    ctx.fillStyle = '#112211';
    ctx.fillRect(ox + 8, 18 + hunch + breath, 16, 2);
    ctx.fillRect(ox + 8, 22 + hunch + breath, 16, 2);
    ctx.fillRect(ox + 8, 26 + hunch + breath, 16, 2);

    // Cap (passamuntanyes negre amb antifaç verd)
    ctx.fillStyle = '#111';
    // Si camina d'amagat, avança una mica el cap
    const headX = isSneaking ? 2 : 0;
    ctx.fillRect(ox + 10 + headX, 4 + hunch + breath, 12, 12);
    
    // Antifaç i ulls
    ctx.fillStyle = '#225533';
    ctx.fillRect(ox + 10 + headX, 7 + hunch + breath, 12, 5);
    ctx.fillStyle = '#ffffff'; // Ulls blancs
    ctx.fillRect(ox + 13 + headX, 8 + hunch + breath, 2, 2);
    ctx.fillRect(ox + 17 + headX, 8 + hunch + breath, 2, 2);

    // Braços i mans
    ctx.fillStyle = '#1e3d2f';
    if (isSneaking) {
      // Braços balancejant sigilosament
      const armOff = Math.sin(frame * Math.PI) * 3;
      ctx.fillRect(ox + 6 + armOff, 18 + hunch, 4, 10);
      ctx.fillRect(ox + 22 - armOff, 18 + hunch, 4, 10);
      ctx.fillStyle = '#d4a574'; // mans
      ctx.fillRect(ox + 6 + armOff, 28 + hunch, 3, 3);
      ctx.fillRect(ox + 22 - armOff, 28 + hunch, 3, 3);
    } else if (isInteracting) {
      // Braços estesos manipulant (forçant pany)
      const pickOff = frame === 10 ? 0 : 2;
      ctx.fillRect(ox + 18, 18 + hunch, 8, 4);
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(ox + 26, 18 + hunch, 3, 3);
      ctx.fillStyle = '#aaa'; // Eina
      ctx.fillRect(ox + 28, 19 + hunch - pickOff, 4, 1);
    } else if (isKnocking) {
      // Puñetazo dramàtic
      const punchEx = frame === 12 ? 4 : 8;
      ctx.fillRect(ox + 18, 18, 8 + punchEx, 4);
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(ox + 26 + punchEx, 17, 5, 5); // Puny gran
    } else if (isClimbing) {
      // Braços amunt
      const climbArm = frame === 8 ? -2 : 2;
      ctx.fillRect(ox + 6, 8 + climbArm, 4, 10);
      ctx.fillRect(ox + 22, 8 - climbArm, 4, 10);
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(ox + 6, 5 + climbArm, 4, 3);
      ctx.fillRect(ox + 22, 5 - climbArm, 4, 3);
    } else {
      // Idle
      ctx.fillRect(ox + 6, 18 + breath, 4, 12);
      ctx.fillRect(ox + 22, 18 + breath, 4, 12);
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(ox + 6, 30 + breath, 3, 3);
      ctx.fillRect(ox + 22, 30 + breath, 3, 3);
    }

    // Cinturó
    ctx.fillStyle = '#332211';
    ctx.fillRect(ox + 8, 30 + hunch + breath, 16, 3);
    // Bossa de botí darrere (característica de lladre)
    ctx.fillStyle = '#554422';
    ctx.beginPath();
    ctx.arc(ox + 6, 26 + hunch + breath, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cames (Pantalons marrons foscos)
    ctx.fillStyle = '#221100';
    if (isSneaking) {
      // Animació de caminar de puntetes (6 frames: 2 a 7)
      // frame 2,3,4,5,6,7 -> cycle 0 to 5
      const step = (frame - 2);
      // Moviment suau de cames
      const leg1Y = step === 1 || step === 2 ? -2 : 0;
      const leg2Y = step === 4 || step === 5 ? -2 : 0;
      const leg1X = Math.sin(step * Math.PI / 3) * 4;
      const leg2X = -Math.sin(step * Math.PI / 3) * 4;
      
      ctx.fillRect(ox + 12 + leg1X, 33 + leg1Y, 4, 12 - leg1Y);
      ctx.fillRect(ox + 16 + leg2X, 33 + leg2Y, 4, 12 - leg2Y);
      
      // Sabates negres de puntetes
      ctx.fillStyle = '#111';
      ctx.fillRect(ox + 12 + leg1X, 43 + leg1Y, 6, 3);
      ctx.fillRect(ox + 16 + leg2X, 43 + leg2Y, 6, 3);
    } else if (isClimbing) {
      const climbLeg = frame === 8 ? -3 : 3;
      ctx.fillRect(ox + 10, 33 + climbLeg, 4, 12 - climbLeg);
      ctx.fillRect(ox + 18, 33 - climbLeg, 4, 12 + climbLeg);
      ctx.fillStyle = '#111';
      ctx.fillRect(ox + 9, 43, 6, 3);
      ctx.fillRect(ox + 17, 43, 6, 3);
    } else {
      // Idle / Interacting / Knocking
      ctx.fillRect(ox + 10, 33 + breath, 5, 12);
      ctx.fillRect(ox + 17, 33 + breath, 5, 12);
      ctx.fillStyle = '#111';
      ctx.fillRect(ox + 9, 44, 6, 3);
      ctx.fillRect(ox + 17, 44, 6, 3);
    }
  }

  /**
   * Genera el spritesheet del guarda (14 frames de 32x48px)
   * Frames: 0-1 idle, 2-7 walk, 8-9 alert, 10-13 knockout
   */
  generateGuardSprite() {
    const canvas = document.createElement('canvas');
    const fw = 32, fh = 48, frames = 14;
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
    const isIdle = (frame === 0 || frame === 1);
    const isWalking = (frame >= 2 && frame <= 7);
    const isAlert = (frame >= 8 && frame <= 9);
    const isKO = (frame >= 10 && frame <= 13);

    if (isKO) {
      // Animació dramàtica de caiguda (10 a 13)
      const fallStep = frame - 10; // 0, 1, 2, 3
      const angle = (fallStep * 30) * Math.PI / 180; // Cau cap enrere
      
      ctx.save();
      // Pivot a la base dels peus
      ctx.translate(ox + 16, 48);
      ctx.rotate(-angle);
      ctx.translate(-(ox + 16), -48);
      
      // Cos rotat
      ctx.fillStyle = '#2c3e6b';
      ctx.fillRect(ox + 8, 17, 16, 17); // cos
      ctx.fillRect(ox + 10, 33, 5, 12); // cames
      ctx.fillRect(ox + 17, 33, 5, 12);
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(ox + 10, 7, 12, 10); // cap
      ctx.fillStyle = '#334455';
      ctx.fillRect(ox + 8, 2, 16, 5); // gorra
      
      // Estrelles de KO girant si ja està completament al terra (frame 13)
      if (frame === 13) {
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(ox + 0, 0, 2, 2);
        ctx.fillRect(ox + 6, -4, 2, 2);
        ctx.fillRect(ox + 12, 0, 2, 2);
      }
      ctx.restore();
      return;
    }

    // Moviment de cap "mirant" en Idle
    let headLook = 0;
    if (isIdle && frame === 1) headLook = 2; // Gira una mica el cap

    // Gorra del guarda
    ctx.fillStyle = '#334455';
    ctx.fillRect(ox + 8 + headLook, 2, 16, 5);
    ctx.fillRect(ox + 6 + headLook, 5, 20, 3);

    // Cap
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(ox + 10 + headLook, 7, 12, 10);
    // Ulls
    ctx.fillStyle = '#222222';
    ctx.fillRect(ox + 12 + headLook, 11, 2, 2);
    ctx.fillRect(ox + 18 + headLook, 11, 2, 2);

    // Cos (uniforme blau fosc)
    ctx.fillStyle = '#2c3e6b';
    ctx.fillRect(ox + 8, 17, 16, 17);
    // Insígnia
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(ox + 16 + headLook, 20, 4, 4);

    // Braços
    ctx.fillStyle = '#2c3e6b';
    if (isWalking) {
      const armM = Math.sin((frame - 2) * Math.PI / 3) * 3;
      ctx.fillRect(ox + 4 + armM, 18, 4, 12);
      ctx.fillRect(ox + 24 - armM, 18, 4, 12);
    } else if (isAlert) {
      ctx.fillRect(ox + 4, 18, 4, 6); // braços enlaire / alerta
      ctx.fillRect(ox + 24, 18, 4, 6);
    } else {
      ctx.fillRect(ox + 4, 18, 4, 12);
      ctx.fillRect(ox + 24, 18, 4, 12);
    }

    // Cinturó
    ctx.fillStyle = '#222233';
    ctx.fillRect(ox + 8, 30, 16, 3);

    // Cames (pas més fluid 6 frames)
    ctx.fillStyle = '#1a2744';
    if (isWalking) {
      const step = frame - 2;
      const leg1X = Math.sin(step * Math.PI / 3) * 4;
      const leg2X = -Math.sin(step * Math.PI / 3) * 4;
      const leg1Y = (step === 1 || step === 2) ? -2 : 0;
      const leg2Y = (step === 4 || step === 5) ? -2 : 0;
      
      ctx.fillRect(ox + 10 + leg1X, 33 + leg1Y, 5, 12 - leg1Y);
      ctx.fillRect(ox + 17 + leg2X, 33 + leg2Y, 5, 12 - leg2Y);
      // Sabates
      ctx.fillStyle = '#111122';
      ctx.fillRect(ox + 9 + leg1X, 44 + leg1Y, 6, 3);
      ctx.fillRect(ox + 17 + leg2X, 44 + leg2Y, 6, 3);
    } else {
      ctx.fillRect(ox + 10, 33, 5, 12);
      ctx.fillRect(ox + 17, 33, 5, 12);
      ctx.fillStyle = '#111122';
      ctx.fillRect(ox + 9, 44, 6, 3);
      ctx.fillRect(ox + 17, 44, 6, 3);
    }

    // Signe d'exclamació si és alerta
    if (isAlert) {
      const alertPulse = frame === 8 ? 0 : 2;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(ox + 14, -6 - alertPulse, 4, 8);
      ctx.fillRect(ox + 14, 4 - alertPulse, 4, 3);
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
