/**
 * BootScene.js - Escena d'arrencada inicial
 * 
 * Primera escena que s'executa. Mostra un splash screen
 * amb el logo del joc i transiciona a la càrrega d'assets.
 */
import { SCENES } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS } from '../config/gameConfig.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  /** Precarregar recursos mínims per al splash */
  preload() {
    // No cal carregar res aquí, tot es genera programàticament
  }

  /** Crear el splash screen */
  create() {
    const { WIDTH, HEIGHT } = SCREEN_CONFIG;

    // Fons fosc
    this.cameras.main.setBackgroundColor('#0a0a12');

    // Logo del joc (text estilitzat)
    const title = this.add.text(WIDTH / 2, HEIGHT / 2 - 40, 'SHADOW\nHEIST', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '36px',
      color: '#64b5f6',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);

    // Subtítol
    const subtitle = this.add.text(WIDTH / 2, HEIGHT / 2 + 40, 'Un joc de sigil i robatori', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#778899',
    }).setOrigin(0.5).setAlpha(0);

    // Animació d'entrada del logo
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: HEIGHT / 2 - 50,
      duration: 800,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 600,
      delay: 400,
      ease: 'Power2',
    });

    // Efecte de brillantor al títol
    this.tweens.add({
      targets: title,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Transició automàtica a la pantalla de càrrega
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(500, 10, 10, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Amagar la pantalla de càrrega HTML
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.style.opacity = '0';

        this.scene.start(SCENES.PRELOAD);
      });
    });
  }
}
