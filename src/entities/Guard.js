/**
 * Guard.js - Classe dels guardes de seguretat
 * 
 * Els guardes patrullen entre punts de ruta, detecten el jugador
 * dins del seu camp de visió, i el persegueixen si l'alerten.
 * Poden ser noquejats pel jugador per l'esquena.
 */
import { GUARD_CONFIG } from '../config/gameConfig.js';
import { GUARD_STATES, EVENTS, DIRECTIONS } from '../utils/constants.js';
import { isInVisionCone, distanceBetween } from '../utils/helpers.js';

export default class Guard extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'guard-sprite');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Punts de patrulla (waypoints) definits al nivell
    this.waypoints = config.waypoints || [{ x: x - 100, y }, { x: x + 100, y }];
    this.currentWaypoint = 0;
    this.state = GUARD_STATES.PATROL;
    this.direction = DIRECTIONS.RIGHT;
    this.waitTimer = 0;
    this.alertTimer = 0;
    this.knockoutTimer = 0;

    // Configuració de físiques
    this.body.setSize(20, 38);
    this.body.setOffset(6, 10);
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(600);

    // Con de visió visual (triangle semitransparent)
    this.visionCone = scene.add.graphics();
    this.setDepth(40);

    this.createAnimations();
  }

  createAnimations() {
    const s = this.scene;
    if (!s.anims.exists('guard-idle')) {
      s.anims.create({ key: 'guard-idle', frames: s.anims.generateFrameNumbers('guard-sprite', { start: 0, end: 1 }), frameRate: 2, repeat: -1 });
    }
    if (!s.anims.exists('guard-walk')) {
      s.anims.create({ key: 'guard-walk', frames: s.anims.generateFrameNumbers('guard-sprite', { start: 2, end: 5 }), frameRate: 6, repeat: -1 });
    }
    if (!s.anims.exists('guard-alert')) {
      s.anims.create({ key: 'guard-alert', frames: s.anims.generateFrameNumbers('guard-sprite', { start: 6, end: 7 }), frameRate: 4, repeat: -1 });
    }
    if (!s.anims.exists('guard-knockout')) {
      s.anims.create({ key: 'guard-knockout', frames: s.anims.generateFrameNumbers('guard-sprite', { start: 8, end: 9 }), frameRate: 1, repeat: 0 });
    }
    this.play('guard-walk');
  }

  /** Actualització del guarda (cada frame) */
  update(time, delta, player) {
    this.drawVisionCone();

    switch (this.state) {
      case GUARD_STATES.PATROL: this.updatePatrol(delta); break;
      case GUARD_STATES.IDLE: this.updateIdle(delta); break;
      case GUARD_STATES.ALERT: this.updateAlert(delta, player); break;
      case GUARD_STATES.CHASE: this.updateChase(player); break;
      case GUARD_STATES.KNOCKOUT: this.updateKnockout(delta); break;
      case GUARD_STATES.RETURN: this.updateReturn(delta); break;
    }

    // Comprovar detecció del jugador (si no està noquejat)
    if (player && this.state !== GUARD_STATES.KNOCKOUT) {
      this.checkPlayerDetection(player);
    }
  }

  /** Moviment de patrulla entre waypoints */
  updatePatrol(delta) {
    const target = this.waypoints[this.currentWaypoint];
    const dist = Math.abs(this.x - target.x);

    if (dist < 5) {
      // Ha arribat al waypoint, esperar un moment
      this.body.setVelocityX(0);
      this.state = GUARD_STATES.IDLE;
      this.waitTimer = GUARD_CONFIG.WAIT_TIME;
      this.play('guard-idle', true);
    } else {
      // Moure's cap al waypoint
      const dir = target.x > this.x ? 1 : -1;
      this.body.setVelocityX(dir * GUARD_CONFIG.PATROL_SPEED);
      this.setFlipX(dir < 0);
      this.direction = dir > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
      this.play('guard-walk', true);
    }
  }

  /** Espera al waypoint actual */
  updateIdle(delta) {
    this.waitTimer -= delta;
    if (this.waitTimer <= 0) {
      // Avançar al següent waypoint
      this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
      this.state = GUARD_STATES.PATROL;
    }
  }

  /** Estat d'alerta (ha vist alguna cosa sospitosa) */
  updateAlert(delta, player) {
    this.alertTimer -= delta;
    this.body.setVelocityX(0);
    this.play('guard-alert', true);

    // Mostrar signe d'interrogació
    if (this.alertTimer <= 0) {
      if (player && this.canSeePlayer(player)) {
        this.state = GUARD_STATES.CHASE;
        this.scene.events.emit(EVENTS.ALARM_TRIGGERED);
      } else {
        this.state = GUARD_STATES.RETURN;
      }
    }
  }

  /** Persegueix el jugador */
  updateChase(player) {
    if (!player) { this.state = GUARD_STATES.RETURN; return; }
    const dir = player.x > this.x ? 1 : -1;
    this.body.setVelocityX(dir * GUARD_CONFIG.CHASE_SPEED);
    this.setFlipX(dir < 0);
    this.direction = dir > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
    this.play('guard-walk', true);

    // Atac cos a cos si està prou a prop
    const dist = distanceBetween(this.x, this.y, player.x, player.y);
    if (dist < GUARD_CONFIG.ATTACK_RANGE) {
      player.takeDamage();
    }

    // Perdre de vista el jugador
    if (!this.canSeePlayer(player) && dist > GUARD_CONFIG.VISION_RANGE * 1.5) {
      this.state = GUARD_STATES.RETURN;
    }
  }

  /** Guarda noquejat, espera per recuperar-se */
  updateKnockout(delta) {
    this.knockoutTimer -= delta;
    this.body.setVelocityX(0);
    if (this.knockoutTimer <= 0) {
      this.state = GUARD_STATES.RETURN;
      this.setAlpha(1);
      this.play('guard-idle', true);
    }
  }

  /** Torna al waypoint més proper */
  updateReturn(delta) {
    const target = this.waypoints[this.currentWaypoint];
    const dist = Math.abs(this.x - target.x);
    if (dist < 5) {
      this.state = GUARD_STATES.PATROL;
    } else {
      const dir = target.x > this.x ? 1 : -1;
      this.body.setVelocityX(dir * GUARD_CONFIG.PATROL_SPEED * 0.7);
      this.setFlipX(dir < 0);
      this.play('guard-walk', true);
    }
  }

  /** Comprova si el guarda pot veure el jugador */
  canSeePlayer(player) {
    if (player.isHidden || player.isInShadow) return false;
    const facingAngle = this.direction === DIRECTIONS.RIGHT ? 0 : Math.PI;
    return isInVisionCone(this.x, this.y, player.x, player.y, facingAngle, GUARD_CONFIG.VISION_ANGLE, GUARD_CONFIG.VISION_RANGE);
  }

  /** Detecta el jugador dins del camp de visió */
  checkPlayerDetection(player) {
    if (this.canSeePlayer(player)) {
      if (this.state === GUARD_STATES.PATROL || this.state === GUARD_STATES.IDLE || this.state === GUARD_STATES.RETURN) {
        this.state = GUARD_STATES.ALERT;
        this.alertTimer = GUARD_CONFIG.ALERT_TIME;
      }
    }
  }

  /** Noqueja el guarda */
  knockout() {
    this.state = GUARD_STATES.KNOCKOUT;
    this.knockoutTimer = GUARD_CONFIG.KNOCKOUT_TIME;
    this.body.setVelocityX(0);
    this.setAlpha(0.4);
    this.play('guard-knockout');
    this.scene.events.emit(EVENTS.GUARD_KNOCKED);
  }

  /** Dibuixa el con de visió del guarda */
  drawVisionCone() {
    this.visionCone.clear();
    if (this.state === GUARD_STATES.KNOCKOUT) return;

    const range = GUARD_CONFIG.VISION_RANGE;
    const halfAngle = (GUARD_CONFIG.VISION_ANGLE / 2) * (Math.PI / 180);
    const baseAngle = this.direction === DIRECTIONS.RIGHT ? 0 : Math.PI;

    // Color segons l'estat
    let color = 0xffff00; let alpha = 0.08;
    if (this.state === GUARD_STATES.ALERT) { color = 0xff8800; alpha = 0.15; }
    if (this.state === GUARD_STATES.CHASE) { color = 0xff0000; alpha = 0.2; }

    this.visionCone.fillStyle(color, alpha);
    this.visionCone.beginPath();
    this.visionCone.moveTo(this.x, this.y);
    // Dibuixar el con com un arc de punts
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const angle = baseAngle - halfAngle + (2 * halfAngle * i / steps);
      this.visionCone.lineTo(this.x + Math.cos(angle) * range, this.y + Math.sin(angle) * range);
    }
    this.visionCone.closePath();
    this.visionCone.fillPath();
  }

  destroy() {
    if (this.visionCone) this.visionCone.destroy();
    super.destroy();
  }
}
