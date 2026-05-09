/**
 * MenuScene.js - Menú principal del joc
 * 
 * Mostra el títol del joc amb un fons animat de ciutat nocturna
 * amb efecte parallax. Inclou botons per jugar i opcions.
 */
import { SCENES } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS } from '../config/gameConfig.js';
import Button from '../ui/Button.js';
import { saveToStorage, loadFromStorage } from '../utils/helpers.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    const { WIDTH, HEIGHT } = SCREEN_CONFIG;

    // === FONS ANIMAT AMB PARALLAX (Ciutat nocturna) ===
    this.cameras.main.setBackgroundColor('#0a0a18');

    // Capa 1: Cel nocturn amb estrelles
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, WIDTH),
        Phaser.Math.Between(0, HEIGHT * 0.6),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8)
      );
      this.stars.push(star);
      // Animació de parpelleig de les estrelles
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.3),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // Lluna
    this.add.circle(WIDTH - 100, 60, 25, 0xeeeedd, 0.9);
    this.add.circle(WIDTH - 90, 55, 22, 0x0a0a18, 0.95); // Cràter

    // Capa 2: Edificis de fons (siluetes)
    this.drawSkyline(HEIGHT);

    // Capa 3: Carrer amb llums
    this.drawStreet(WIDTH, HEIGHT);

    // === TÍTOL DEL JOC ===
    const titleShadow = this.add.text(WIDTH / 2 + 2, 102, 'SHADOW HEIST', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '32px', color: '#000000',
    }).setOrigin(0.5).setAlpha(0.3);

    const title = this.add.text(WIDTH / 2, 100, 'SHADOW HEIST', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '32px', color: '#64b5f6',
    }).setOrigin(0.5);

    // Efecte de brillantor pulsant al títol
    this.tweens.add({
      targets: title, alpha: 0.8, duration: 2000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Subtítol
    this.add.text(WIDTH / 2, 145, 'Joc de Sigil i Robatori', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px', color: '#8899aa',
    }).setOrigin(0.5);

    // === PERSONATGE ANIMAT AL MENÚ ===
    this.drawMenuCharacter(WIDTH / 2, HEIGHT - 100);

    // === BOTONS DEL MENÚ ===
    const playBtn = new Button(this, WIDTH / 2, HEIGHT / 2 + 40, '▶  JUGAR', () => {
      this.cameras.main.fadeOut(400, 10, 10, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.LEVEL_SELECT);
      });
    }, { width: 240, height: 55, fontSize: '14px' });
    playBtn.animateIn(200);

    // === MENÚ D'OPCIONS (OVERLAY) ===
    this.createOptionsMenu(WIDTH, HEIGHT);

    const optionsBtn = new Button(this, WIDTH / 2, HEIGHT / 2 + 110, '⚙  OPCIONS', () => {
      this.optionsContainer.setVisible(true);
    }, { width: 200, height: 45, fontSize: '11px' });
    optionsBtn.animateIn(400);

    // === VERSIÓ I CRÈDITS ===
    this.add.text(WIDTH - 10, HEIGHT - 10, 'v1.0 — Phaser 3', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px', color: '#334455',
    }).setOrigin(1);

    // Controls info
    this.add.text(10, HEIGHT - 10, '← → Moure | E Interactuar | ESPAI Noquear', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '9px', color: '#334455',
    }).setOrigin(0, 1);

    // Fade in
    this.cameras.main.fadeIn(500, 10, 10, 18);

    // Música del menú (si està disponible)
    try {
      if (this.cache.audio.exists('music-menu')) {
        this.menuMusic = this.sound.add('music-menu', { loop: true, volume: 0.3 });
        this.menuMusic.play();
      }
    } catch (e) { /* Ignorar errors d'àudio */ }

    // Registrem l'esdeveniment shutdown per aturar la música quan canviem d'escena
    this.events.on('shutdown', this.shutdown, this);
  }

  /** Dibuixa el skyline de la ciutat */
  drawSkyline(height) {
    const g = this.add.graphics();
    const buildings = [
      { x: 20, w: 60, h: 180 },
      { x: 90, w: 45, h: 140 },
      { x: 150, w: 70, h: 220 },
      { x: 240, w: 50, h: 160 },
      { x: 300, w: 80, h: 250 },
      { x: 400, w: 55, h: 190 },
      { x: 470, w: 90, h: 280 },
      { x: 580, w: 60, h: 170 },
      { x: 650, w: 75, h: 230 },
      { x: 740, w: 50, h: 150 },
      { x: 800, w: 85, h: 260 },
      { x: 900, w: 60, h: 200 },
    ];

    buildings.forEach(b => {
      // Silueta de l'edifici
      const shade = Phaser.Math.Between(12, 22);
      g.fillStyle(Phaser.Display.Color.GetColor(shade, shade, shade + 15), 1);
      g.fillRect(b.x, height - b.h, b.w, b.h);

      // Finestres il·luminades aleatòriament
      for (let wy = height - b.h + 15; wy < height - 20; wy += 20) {
        for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 14) {
          if (Math.random() > 0.4) {
            const wColor = Math.random() > 0.7 ? 0xffdd88 : 0x334466;
            g.fillStyle(wColor, Math.random() > 0.5 ? 0.6 : 0.3);
            g.fillRect(wx, wy, 6, 8);
          }
        }
      }
    });
  }

  /** Dibuixa el carrer amb llums */
  drawStreet(width, height) {
    const g = this.add.graphics();
    // Vorera
    g.fillStyle(0x222233, 1);
    g.fillRect(0, height - 30, width, 30);
    g.fillStyle(0x1a1a28, 1);
    g.fillRect(0, height - 5, width, 5);

    // Fanals amb llum
    [150, 480, 810].forEach(x => {
      g.fillStyle(0x444455, 1);
      g.fillRect(x - 2, height - 80, 4, 55);
      // Llum del fanal
      g.fillStyle(0xffdd88, 0.15);
      g.fillCircle(x, height - 80, 30);
      g.fillStyle(0xffee99, 0.6);
      g.fillCircle(x, height - 80, 4);
    });
  }

  /** Dibuixa el personatge animat del menú */
  drawMenuCharacter(x, y) {
    const char = this.add.graphics();
    // Silueta del lladre
    char.fillStyle(0x1a1a2e, 1);
    char.fillRect(x - 10, y - 20, 20, 30);
    // Ulls brillants
    char.fillStyle(0x64b5f6, 1);
    char.fillRect(x - 6, y - 14, 4, 4);
    char.fillRect(x + 2, y - 14, 4, 4);
    // Sac de botí
    char.fillStyle(0x555544, 1);
    char.fillCircle(x + 18, y - 5, 8);
    char.fillStyle(0x444433, 1);
    char.fillRect(x + 12, y - 12, 4, 8);

    // Animació de respiració
    this.tweens.add({
      targets: char, y: y - 3, duration: 1500,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  /** Crea el menú d'opcions (overlay) */
  createOptionsMenu(width, height) {
    this.optionsContainer = this.add.container(0, 0).setDepth(200).setVisible(false);

    // Fons enfosquit interactiu per bloquejar clics inferiors
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, width, height);
    const bgZone = this.add.zone(width / 2, height / 2, width, height).setInteractive();
    this.optionsContainer.add([bg, bgZone]);

    // Panell central
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.lineStyle(2, 0x64b5f6, 1);
    panel.fillRoundedRect(width / 2 - 160, height / 2 - 100, 320, 200, 10);
    panel.strokeRoundedRect(width / 2 - 160, height / 2 - 100, 320, 200, 10);
    this.optionsContainer.add(panel);

    // Títol
    const title = this.add.text(width / 2, height / 2 - 60, 'OPCIONS', {
      fontFamily: '"Press Start 2P", cursive', fontSize: '16px', color: '#64b5f6'
    }).setOrigin(0.5);
    this.optionsContainer.add(title);

    // Carregar estat del so
    const isMuted = loadFromStorage('shadow-heist-muted', false);
    this.sound.mute = isMuted;

    // Botó So
    this.muteBtn = new Button(this, width / 2, height / 2, isMuted ? 'SO: DESACTIVAT' : 'SO: ACTIVAT', () => {
      this.sound.mute = !this.sound.mute;
      saveToStorage('shadow-heist-muted', this.sound.mute);
      this.muteBtn.text.setText(this.sound.mute ? 'SO: DESACTIVAT' : 'SO: ACTIVAT');
    }, { width: 220, height: 45, fontSize: '12px' });
    this.optionsContainer.add(this.muteBtn.container);

    // Botó Tancar
    this.closeBtn = new Button(this, width / 2, height / 2 + 60, 'TANCAR', () => {
      this.optionsContainer.setVisible(false);
    }, { width: 150, height: 45, fontSize: '12px', bgColor: 0xaa3333, borderColor: 0xff6666 });
    this.optionsContainer.add(this.closeBtn.container);
  }

  /** Aturar la música en sortir de l'escena */
  shutdown() {
    if (this.menuMusic) {
      this.menuMusic.stop();
      this.menuMusic.destroy();
      this.menuMusic = null;
    }
  }
}
