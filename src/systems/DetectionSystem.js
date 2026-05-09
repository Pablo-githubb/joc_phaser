/**
 * DetectionSystem.js - Sistema de detecció
 * 
 * Gestiona la detecció del jugador per part dels guardes i càmeres.
 * Controla el nivell d'alerta global i les conseqüències de ser detectat.
 */
import { EVENTS } from '../utils/constants.js';
import { STEALTH_CONFIG } from '../config/gameConfig.js';

export default class DetectionSystem {
  constructor(scene) {
    this.scene = scene;
    // Nivell d'alerta global (0 = segur, 100 = alarma total)
    this.alertLevel = 0;
    // Estat de l'alarma
    this.alarmActive = false;
    // Temporitzador de detecció
    this.detectionTimer = 0;

    // Gràfic per a l'efecte visual d'alerta (vinyeta vermella)
    this.alertOverlay = scene.add.graphics();
    this.alertOverlay.setDepth(200);
    this.alertOverlay.setScrollFactor(0); // Fix a la pantalla

    // Escoltar events de detecció
    scene.events.on(EVENTS.PLAYER_DETECTED, this.onPlayerDetected, this);
    scene.events.on(EVENTS.ALARM_TRIGGERED, this.onAlarmTriggered, this);
  }

  /** Actualització cada frame */
  update(delta, player) {
    // Reduir el nivell d'alerta si el jugador està amagat
    if (player && (player.isHidden || player.isInShadow)) {
      this.alertLevel = Math.max(0, this.alertLevel - 20 * (delta / 1000));
      this.detectionTimer = 0;
    }

    // Reduir alerta gradualment si no hi ha detecció activa
    if (!this.alarmActive && this.alertLevel > 0) {
      this.alertLevel = Math.max(0, this.alertLevel - 5 * (delta / 1000));
    }

    // Actualitzar l'efecte visual d'alerta
    this.drawAlertOverlay();

    // Desactivar alarma si el nivell baixa prou
    if (this.alarmActive && this.alertLevel <= 10) {
      this.alarmActive = false;
    }
  }

  /** Quan el jugador és detectat per una càmera o guarda */
  onPlayerDetected(source) {
    const increment = source === 'camera' ? 30 : 50;
    this.alertLevel = Math.min(100, this.alertLevel + increment);

    if (this.alertLevel >= 80 && !this.alarmActive) {
      this.onAlarmTriggered();
    }
  }

  /** Activa l'alarma general */
  onAlarmTriggered() {
    this.alarmActive = true;
    this.alertLevel = 100;

    // Efecte visual de flash vermell
    this.scene.cameras.main.flash(300, 255, 0, 0, true);
  }

  /** Dibuixa la vinyeta d'alerta al voltant de la pantalla */
  drawAlertOverlay() {
    this.alertOverlay.clear();
    if (this.alertLevel <= 0) return;

    const alpha = (this.alertLevel / 100) * 0.3;
    const w = this.scene.cameras.main.width;
    const h = this.scene.cameras.main.height;

    // Vinyeta vermella als marges
    this.alertOverlay.fillStyle(0xff0000, alpha);
    // Marges superior i inferior
    this.alertOverlay.fillRect(0, 0, w, 20);
    this.alertOverlay.fillRect(0, h - 20, w, 20);
    // Marges esquerre i dret
    this.alertOverlay.fillRect(0, 0, 20, h);
    this.alertOverlay.fillRect(w - 20, 0, 20, h);
  }

  /** Reinicia el sistema de detecció */
  reset() {
    this.alertLevel = 0;
    this.alarmActive = false;
    this.detectionTimer = 0;
    this.alertOverlay.clear();
  }

  destroy() {
    this.alertOverlay.destroy();
    this.scene.events.off(EVENTS.PLAYER_DETECTED, this.onPlayerDetected, this);
    this.scene.events.off(EVENTS.ALARM_TRIGGERED, this.onAlarmTriggered, this);
  }
}
