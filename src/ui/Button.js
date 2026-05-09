/**
 * Button.js - Component de botó reutilitzable
 * 
 * Crea botons interactius amb efectes visuals de hover,
 * clic, i animacions suaus. Usat a totes les escenes de menú.
 */
import { COLORS } from '../config/gameConfig.js';

export default class Button {
  /**
   * @param {Phaser.Scene} scene - Escena on es crea el botó
   * @param {number} x - Posició X central
   * @param {number} y - Posició Y central
   * @param {string} text - Text del botó
   * @param {Function} callback - Funció a executar al fer clic
   * @param {object} options - Opcions addicionals (amplada, alçada, color)
   */
  constructor(scene, x, y, text, callback, options = {}) {
    this.scene = scene;
    
    // Opcions amb valors per defecte
    const width = options.width || 220;
    const height = options.height || 50;
    const fontSize = options.fontSize || '16px';
    const bgColor = options.bgColor || COLORS.MEDIUM_BLUE;
    const borderColor = options.borderColor || COLORS.ACCENT_BLUE;
    const textColor = options.textColor || '#ffffff';

    // Contenidor per agrupar tots els elements del botó
    this.container = scene.add.container(x, y);

    // Fons del botó amb bordes arrodonits
    this.bg = scene.add.graphics();
    this.bg.fillStyle(bgColor, 0.85);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.bg.lineStyle(2, borderColor, 0.8);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

    // Efecte de brillantor al hover (glow)
    this.glow = scene.add.graphics();
    this.glow.fillStyle(borderColor, 0.1);
    this.glow.fillRoundedRect(-width / 2 - 3, -height / 2 - 3, width + 6, height + 6, 12);
    this.glow.setAlpha(0);

    // Text del botó centrat
    this.text = scene.add.text(0, 0, text, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: fontSize,
      color: textColor,
      align: 'center',
    }).setOrigin(0.5);

    // Afegir elements al contenidor (ordre: glow -> bg -> text)
    this.container.add([this.glow, this.bg, this.text]);

    // Zona interactiva invisible per capturar els events del ratolí
    const hitArea = scene.add.rectangle(0, 0, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001); // Invisible però interactiu

    this.container.add(hitArea);

    // === EVENTS D'INTERACCIÓ ===

    // Hover: mostrar glow i escalar lleugerament
    hitArea.on('pointerover', () => {
      scene.tweens.add({
        targets: this.container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2',
      });
      scene.tweens.add({
        targets: this.glow,
        alpha: 1,
        duration: 200,
      });
    });

    // Sortir del hover: restaurar mida original
    hitArea.on('pointerout', () => {
      scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2',
      });
      scene.tweens.add({
        targets: this.glow,
        alpha: 0,
        duration: 200,
      });
    });

    // Clic: efecte de premsat i executar callback
    hitArea.on('pointerdown', () => {
      scene.tweens.add({
        targets: this.container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          if (callback) callback();
        }
      });
    });
  }

  /**
   * Destrueix el botó i tots els seus elements
   */
  destroy() {
    this.container.destroy();
  }

  /**
   * Mostra o amaga el botó amb animació
   */
  setVisible(visible) {
    this.container.setVisible(visible);
  }

  /**
   * Anima l'aparició del botó des de la dreta
   * @param {number} delay - Retard abans de l'animació (ms)
   */
  animateIn(delay = 0) {
    this.container.setAlpha(0);
    this.container.x += 50;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      x: this.container.x - 50,
      duration: 400,
      delay: delay,
      ease: 'Power2',
    });
  }
}
