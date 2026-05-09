/**
 * SecurityCamera.js - Càmera de seguretat
 * 
 * Rota entre dos angles i detecta el jugador dins del seu con de visió.
 * Pot ser desactivada des d'un ordinador o caixa de fusibles.
 */
import { CAMERA_CONFIG } from '../config/gameConfig.js';
import { EVENTS } from '../utils/constants.js';
import { isInVisionCone, degToRad } from '../utils/helpers.js';

export default class SecurityCamera {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isActive = true;
    this.currentAngle = config.startAngle || CAMERA_CONFIG.MIN_ANGLE;
    this.rotationDir = 1; // 1 = horari, -1 = antihorari
    this.minAngle = config.minAngle || CAMERA_CONFIG.MIN_ANGLE;
    this.maxAngle = config.maxAngle || CAMERA_CONFIG.MAX_ANGLE;
    this.detectionRange = config.range || CAMERA_CONFIG.DETECTION_RANGE;

    // Gràfic del cos de la càmera
    this.body = scene.add.graphics();
    // Gràfic del con de visió
    this.cone = scene.add.graphics();
    this.cone.setDepth(5);
    this.body.setDepth(45);

    // Indicador LED (vermell = activa, verd = desactivada)
    this.led = scene.add.graphics();
    this.led.setDepth(46);

    this.draw();
  }

  /** Actualització cada frame */
  update(delta, player) {
    if (!this.isActive) return;

    // Rotar la càmera entre els angles mínim i màxim
    this.currentAngle += this.rotationDir * CAMERA_CONFIG.ROTATION_SPEED * (delta / 1000);
    if (this.currentAngle >= this.maxAngle) { this.currentAngle = this.maxAngle; this.rotationDir = -1; }
    if (this.currentAngle <= this.minAngle) { this.currentAngle = this.minAngle; this.rotationDir = 1; }

    this.draw();

    // Comprovar detecció del jugador
    if (player && !player.isHidden && !player.isInShadow) {
      const facingRad = degToRad(this.currentAngle);
      if (isInVisionCone(this.x, this.y, player.x, player.y, facingRad, CAMERA_CONFIG.CONE_ANGLE, this.detectionRange)) {
        this.scene.events.emit(EVENTS.PLAYER_DETECTED, 'camera');
      }
    }
  }

  /** Dibuixa la càmera i el seu con de visió */
  draw() {
    this.body.clear();
    this.cone.clear();
    this.led.clear();

    // Cos de la càmera (rectangle petit)
    this.body.fillStyle(0x444466, 1);
    this.body.fillRect(this.x - 8, this.y - 5, 16, 10);
    this.body.fillStyle(0x333355, 1);
    this.body.fillRect(this.x - 3, this.y - 10, 6, 6);

    // LED indicador
    const ledColor = this.isActive ? 0xff0000 : 0x00ff00;
    this.led.fillStyle(ledColor, 1);
    this.led.fillCircle(this.x, this.y - 8, 2);

    if (!this.isActive) return;

    // Con de visió
    const range = this.detectionRange;
    const halfAngle = degToRad(CAMERA_CONFIG.CONE_ANGLE / 2);
    const baseAngle = degToRad(this.currentAngle);

    this.cone.fillStyle(0xff4444, 0.08);
    this.cone.beginPath();
    this.cone.moveTo(this.x, this.y);
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const angle = baseAngle - halfAngle + (2 * halfAngle * i / steps);
      this.cone.lineTo(this.x + Math.cos(angle) * range, this.y + Math.sin(angle) * range);
    }
    this.cone.closePath();
    this.cone.fillPath();

    // Línia central del con
    this.cone.lineStyle(1, 0xff4444, 0.15);
    this.cone.lineBetween(this.x, this.y, this.x + Math.cos(baseAngle) * range, this.y + Math.sin(baseAngle) * range);
  }

  /** Desactiva la càmera */
  disable() {
    this.isActive = false;
    this.cone.clear();
    this.draw();
    this.scene.events.emit(EVENTS.CAMERA_DISABLED);
  }

  destroy() {
    this.body.destroy();
    this.cone.destroy();
    this.led.destroy();
  }
}
