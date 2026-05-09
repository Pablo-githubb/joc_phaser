/**
 * ProgressBar.js - Barra de progrés reutilitzable
 * 
 * Usada als mini-jocs (forçar panys, hackejar) i a la
 * pantalla de càrrega. Mostra el progrés amb animació suau.
 */
import { COLORS } from '../config/gameConfig.js';

export default class ProgressBar {
  /**
   * @param {Phaser.Scene} scene - Escena on es crea la barra
   * @param {number} x - Posició X (centre)
   * @param {number} y - Posició Y (centre)
   * @param {object} options - Opcions (amplada, alçada, colors)
   */
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = options.width || 200;
    this.height = options.height || 20;
    this.fillColor = options.fillColor || COLORS.ACCENT_BLUE;
    this.bgColor = options.bgColor || COLORS.DARK_BLUE;
    this.borderColor = options.borderColor || COLORS.ACCENT_BLUE;

    // Valor actual de la barra (0 a 1)
    this.value = 0;

    // Gràfic de fons de la barra
    this.bgGraphics = scene.add.graphics();
    // Gràfic de la barra de progrés
    this.fillGraphics = scene.add.graphics();
    // Gràfic del contorn
    this.borderGraphics = scene.add.graphics();

    // Text de percentatge (opcional)
    this.percentText = null;
    if (options.showPercent) {
      this.percentText = scene.add.text(x, y, '0%', {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '10px',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(10);
    }

    // Dibuixar l'estat inicial
    this.draw();
  }

  /**
   * Actualitza el valor de la barra i redibuixa
   * @param {number} value - Nou valor (0 a 1)
   */
  setValue(value) {
    this.value = Phaser.Math.Clamp(value, 0, 1);
    this.draw();
  }

  /**
   * Dibuixa la barra amb el valor actual
   */
  draw() {
    const x = this.x - this.width / 2;
    const y = this.y - this.height / 2;

    // Netejar gràfics anteriors
    this.bgGraphics.clear();
    this.fillGraphics.clear();
    this.borderGraphics.clear();

    // Fons de la barra
    this.bgGraphics.fillStyle(this.bgColor, 0.8);
    this.bgGraphics.fillRoundedRect(x, y, this.width, this.height, 4);

    // Barra de progrés (omplerta segons el valor)
    if (this.value > 0) {
      const fillWidth = this.width * this.value;
      this.fillGraphics.fillStyle(this.fillColor, 1);
      this.fillGraphics.fillRoundedRect(x, y, fillWidth, this.height, 4);
    }

    // Contorn
    this.borderGraphics.lineStyle(1, this.borderColor, 0.6);
    this.borderGraphics.strokeRoundedRect(x, y, this.width, this.height, 4);

    // Actualitzar text de percentatge
    if (this.percentText) {
      this.percentText.setText(`${Math.floor(this.value * 100)}%`);
    }
  }

  /**
   * Destrueix la barra i tots els seus elements
   */
  destroy() {
    this.bgGraphics.destroy();
    this.fillGraphics.destroy();
    this.borderGraphics.destroy();
    if (this.percentText) this.percentText.destroy();
  }

  /**
   * Estableix la profunditat de renderitzat de tots els elements
   */
  setDepth(depth) {
    this.bgGraphics.setDepth(depth);
    this.fillGraphics.setDepth(depth + 1);
    this.borderGraphics.setDepth(depth + 2);
    if (this.percentText) this.percentText.setDepth(depth + 3);
    return this;
  }

  /**
   * Mostra o amaga la barra de progrés
   * @param {boolean} visible - true per mostrar, false per amagar
   */
  setVisible(visible) {
    this.bgGraphics.setVisible(visible);
    this.fillGraphics.setVisible(visible);
    this.borderGraphics.setVisible(visible);
    if (this.percentText) this.percentText.setVisible(visible);
    return this;
  }

  /**
   * Fixa la barra a la pantalla (no segueix la càmera)
   * @param {number} factor - 0 = fix a pantalla, 1 = segueix la càmera
   */
  setScrollFactor(factor) {
    this.bgGraphics.setScrollFactor(factor);
    this.fillGraphics.setScrollFactor(factor);
    this.borderGraphics.setScrollFactor(factor);
    if (this.percentText) this.percentText.setScrollFactor(factor);
    return this;
  }
}
