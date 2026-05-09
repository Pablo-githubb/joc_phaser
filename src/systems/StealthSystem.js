/**
 * StealthSystem.js - Sistema de sigil
 * 
 * Determina si el jugador és visible o amagat segons la seva posició
 * respecte a les zones d'ombra del nivell. Les zones d'ombra es defineixen
 * com a rectangles al mapa del nivell.
 */
import { STEALTH_CONFIG } from '../config/gameConfig.js';

export default class StealthSystem {
  constructor(scene) {
    this.scene = scene;
    // Llista de zones d'ombra (rectangles foscos)
    this.shadowZones = [];
    // Gràfic per dibuixar les ombres
    this.shadowGraphics = scene.add.graphics();
    this.shadowGraphics.setDepth(10);
  }

  /**
   * Afegeix una zona d'ombra al nivell
   * @param {number} x - Posició X
   * @param {number} y - Posició Y
   * @param {number} width - Amplada de la zona
   * @param {number} height - Alçada de la zona
   */
  addShadowZone(x, y, width, height) {
    this.shadowZones.push({ x, y, width, height });
    this.drawShadows();
  }

  /**
   * Carrega les zones d'ombra des de les dades del nivell
   * @param {Array} zones - Array d'objectes {x, y, width, height}
   */
  loadShadowZones(zones) {
    this.shadowZones = zones || [];
    this.drawShadows();
  }

  /** Dibuixa totes les zones d'ombra */
  drawShadows() {
    this.shadowGraphics.clear();
    this.shadowZones.forEach(zone => {
      // Ombra principal (fosca)
      this.shadowGraphics.fillStyle(0x000011, 0.45);
      this.shadowGraphics.fillRect(zone.x, zone.y, zone.width, zone.height);
      // Contorn subtil
      this.shadowGraphics.lineStyle(1, 0x111133, 0.2);
      this.shadowGraphics.strokeRect(zone.x, zone.y, zone.width, zone.height);
    });
  }

  /**
   * Comprova si el jugador està dins d'una zona d'ombra
   * @param {Player} player - Referència al jugador
   * @returns {boolean} True si el jugador és a les ombres
   */
  isPlayerInShadow(player) {
    const px = player.x;
    const py = player.y;
    
    for (const zone of this.shadowZones) {
      if (px >= zone.x && px <= zone.x + zone.width &&
          py >= zone.y && py <= zone.y + zone.height) {
        return true;
      }
    }
    return false;
  }

  /** Actualització cada frame */
  update(player) {
    if (!player) return;
    // Actualitzar l'estat de sigil del jugador
    player.isInShadow = this.isPlayerInShadow(player);
  }

  /** Neteja totes les zones d'ombra */
  reset() {
    this.shadowZones = [];
    this.shadowGraphics.clear();
  }

  destroy() {
    this.shadowGraphics.destroy();
  }
}
