/**
 * Laser.js - Barrera làser de seguretat
 * 
 * Raig làser que s'activa i desactiva amb temporització.
 * Detecta col·lisió amb el jugador quan està actiu.
 */
import { LASER_CONFIG } from '../config/gameConfig.js';
import { EVENTS } from '../utils/constants.js';

export default class Laser {
  constructor(scene, x1, y1, x2, y2, config = {}) {
    this.scene = scene;
    // Punts d'inici i final del raig
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.isActive = true;
    this.isOn = true; // Estat actual del cicle on/off
    this.onTime = config.onTime || LASER_CONFIG.ON_TIME;
    this.offTime = config.offTime || LASER_CONFIG.OFF_TIME;
    this.timer = 0;
    this.canDisable = config.canDisable || false;

    // Gràfic del raig làser
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(30);

    // Emissors visuals als extrems del làser
    this.emitterGraphics = scene.add.graphics();
    this.emitterGraphics.setDepth(31);

    this.draw();
  }

  /** Actualització cada frame */
  update(delta, player) {
    if (!this.isActive) return;

    // Cicle on/off temporitzat
    this.timer += delta;
    const cycleTime = this.isOn ? this.onTime : this.offTime;
    if (this.timer >= cycleTime) {
      this.isOn = !this.isOn;
      this.timer = 0;
    }

    this.draw();

    // Comprovar col·lisió amb el jugador quan el làser és actiu
    if (this.isOn && player && !player.isHidden) {
      if (this.checkCollision(player)) {
        this.scene.events.emit(EVENTS.PLAYER_DETECTED, 'laser');
        player.takeDamage();
      }
    }
  }

  /** Comprova si el jugador travessa el raig */
  checkCollision(player) {
    // Simplificació: comprovar si el jugador és dins d'un rectangle al voltant del làser
    const px = player.x;
    const py = player.y;
    const minX = Math.min(this.x1, this.x2) - 5;
    const maxX = Math.max(this.x1, this.x2) + 5;
    const minY = Math.min(this.y1, this.y2) - 5;
    const maxY = Math.max(this.y1, this.y2) + 5;
    return px >= minX && px <= maxX && py >= minY && py <= maxY;
  }

  /** Dibuixa el raig làser i els emissors */
  draw() {
    this.graphics.clear();
    this.emitterGraphics.clear();

    // Emissors als extrems (sempre visibles)
    this.emitterGraphics.fillStyle(0x444466, 1);
    this.emitterGraphics.fillCircle(this.x1, this.y1, 4);
    this.emitterGraphics.fillCircle(this.x2, this.y2, 4);

    if (!this.isActive) {
      // Mostrar emissors apagats (verds)
      this.emitterGraphics.fillStyle(0x00ff00, 0.8);
      this.emitterGraphics.fillCircle(this.x1, this.y1, 2);
      this.emitterGraphics.fillCircle(this.x2, this.y2, 2);
      return;
    }

    if (this.isOn) {
      // Raig làser visible (vermell brillant)
      this.graphics.lineStyle(LASER_CONFIG.WIDTH, LASER_CONFIG.COLOR, 0.8);
      this.graphics.lineBetween(this.x1, this.y1, this.x2, this.y2);
      // Glow del raig
      this.graphics.lineStyle(LASER_CONFIG.WIDTH + 4, LASER_CONFIG.COLOR, 0.15);
      this.graphics.lineBetween(this.x1, this.y1, this.x2, this.y2);
      // LED vermell als emissors
      this.emitterGraphics.fillStyle(0xff0000, 1);
      this.emitterGraphics.fillCircle(this.x1, this.y1, 2);
      this.emitterGraphics.fillCircle(this.x2, this.y2, 2);
    } else {
      // Làser apagat (LED verd)
      this.emitterGraphics.fillStyle(0x00ff00, 0.5);
      this.emitterGraphics.fillCircle(this.x1, this.y1, 2);
      this.emitterGraphics.fillCircle(this.x2, this.y2, 2);
    }
  }

  /** Desactiva permanentment el làser */
  disable() {
    this.isActive = false;
    this.isOn = false;
    this.draw();
  }

  destroy() {
    this.graphics.destroy();
    this.emitterGraphics.destroy();
  }
}
