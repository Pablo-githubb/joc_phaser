/**
 * Player.js - Classe del jugador principal
 * 
 * Gestiona el moviment, animacions, interaccions i estat del jugador.
 * El jugador pot caminar, ajupir-se, pujar escales, amagar-se,
 * noquear guardes i interactuar amb objectes del nivell.
 */
import { PLAYER_CONFIG, STEALTH_CONFIG } from '../config/gameConfig.js';
import { PLAYER_STATES, EVENTS, DIRECTIONS } from '../utils/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player-sprite');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Propietats del jugador
    this.health = PLAYER_CONFIG.MAX_HEALTH;
    this.state = PLAYER_STATES.IDLE;
    this.direction = DIRECTIONS.RIGHT;
    this.isHidden = false;
    this.isInShadow = false;
    this.isInvulnerable = false;
    this.canInteract = false;
    this.nearbyObject = null;
    this.isClimbing = false;
    this.lootCollected = 0;
    this.hasMainLoot = false;

    // Configuració de físiques
    this.body.setSize(20, 38);
    this.body.setOffset(6, 10);
    this.body.setCollideWorldBounds(true);
    this.body.setGravityY(600);
    this.body.setMaxVelocity(PLAYER_CONFIG.SPEED, 500);

    // Controls del teclat
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      knockout: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // Indicador visual de sigil (cercle sobre el jugador)
    this.stealthIcon = scene.add.graphics();

    // Indicador d'interacció
    this.interactIcon = scene.add.text(0, 0, '[ E ]', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '8px',
      color: '#64b5f6',
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    this.setDepth(50);
    this.createAnimations();
  }

  /** Crea les animacions del spritesheet */
  createAnimations() {
    const s = this.scene;
    if (!s.anims.exists('player-idle')) {
      s.anims.create({ key: 'player-idle', frames: s.anims.generateFrameNumbers('player-sprite', { start: 0, end: 1 }), frameRate: 2, repeat: -1 });
    }
    if (!s.anims.exists('player-walk')) {
      s.anims.create({ key: 'player-walk', frames: s.anims.generateFrameNumbers('player-sprite', { start: 2, end: 7 }), frameRate: 10, repeat: -1 });
    }
    if (!s.anims.exists('player-climb')) {
      s.anims.create({ key: 'player-climb', frames: s.anims.generateFrameNumbers('player-sprite', { start: 8, end: 9 }), frameRate: 6, repeat: -1 });
    }
    if (!s.anims.exists('player-interact')) {
      s.anims.create({ key: 'player-interact', frames: s.anims.generateFrameNumbers('player-sprite', { start: 10, end: 11 }), frameRate: 6, repeat: -1 });
    }
    if (!s.anims.exists('player-knockout')) {
      s.anims.create({ key: 'player-knockout', frames: s.anims.generateFrameNumbers('player-sprite', { start: 12, end: 13 }), frameRate: 8, repeat: 0 });
    }
    this.play('player-idle');
  }

  /** Actualització principal (cada frame) */
  update() {
    if (this.state === PLAYER_STATES.HIDING || this.state === PLAYER_STATES.INTERACTING || this.state === PLAYER_STATES.KNOCKOUT_ANIM) return;
    this.handleMovement();
    this.updateStealthIcon();
    this.updateInteractIcon();
  }

  /** Gestiona el moviment segons les tecles premudes */
  handleMovement() {
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const jumpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                         Phaser.Input.Keyboard.JustDown(this.wasd.up);

    // Moviment en escales
    if (this.isClimbing) {
      this.body.setGravityY(0);
      this.body.allowGravity = false;
      this.body.setVelocityX(0);
      if (up) { this.body.setVelocityY(-PLAYER_CONFIG.CLIMB_SPEED); this.play('player-climb', true); }
      else if (down) { this.body.setVelocityY(PLAYER_CONFIG.CLIMB_SPEED); this.play('player-climb', true); }
      else { this.body.setVelocityY(0); this.anims.pause(); }
      this.state = PLAYER_STATES.CLIMBING;
      return;
    }
    // Restaurar gravetat en sortir de l'escala
    this.body.allowGravity = true;
    this.body.setGravityY(600);

    // Salt (tecla amunt quan és al terra)
    const onGround = this.body.blocked.down;
    if (jumpJustDown && onGround) {
      this.body.setVelocityY(PLAYER_CONFIG.JUMP_FORCE);
    }

    // Moviment horitzontal
    const speed = down ? PLAYER_CONFIG.SNEAK_SPEED : PLAYER_CONFIG.SPEED;
    if (left) {
      this.body.setVelocityX(-speed);
      this.setFlipX(true);
      this.direction = DIRECTIONS.LEFT;
      this.state = down ? PLAYER_STATES.SNEAKING : PLAYER_STATES.WALKING;
      this.play('player-walk', true);
    } else if (right) {
      this.body.setVelocityX(speed);
      this.setFlipX(false);
      this.direction = DIRECTIONS.RIGHT;
      this.state = down ? PLAYER_STATES.SNEAKING : PLAYER_STATES.WALKING;
      this.play('player-walk', true);
    } else {
      this.body.setVelocityX(0);
      if (onGround) {
        this.state = PLAYER_STATES.IDLE;
        this.play('player-idle', true);
      }
    }

    // Interacció amb objectes (tecla E)
    if (Phaser.Input.Keyboard.JustDown(this.wasd.interact)) this.tryInteract();
    // Noquejat (barra espaiadora)
    if (Phaser.Input.Keyboard.JustDown(this.wasd.knockout)) this.tryKnockout();
  }

  /** Intenta interactuar amb l'objecte proper */
  tryInteract() {
    if (this.canInteract && this.nearbyObject) {
      this.state = PLAYER_STATES.INTERACTING;
      this.play('player-interact', true);
      this.scene.events.emit('player-interact', this.nearbyObject);
    }
  }

  /** Intenta noquear un guarda proper */
  tryKnockout() {
    this.state = PLAYER_STATES.KNOCKOUT_ANIM;
    this.play('player-knockout');
    this.scene.events.emit('player-knockout-attempt', {
      x: this.x + (this.direction === DIRECTIONS.RIGHT ? 30 : -30),
      y: this.y, direction: this.direction,
    });
    this.scene.time.delayedCall(PLAYER_CONFIG.KNOCKOUT_DURATION, () => {
      if (this.state === PLAYER_STATES.KNOCKOUT_ANIM) this.state = PLAYER_STATES.IDLE;
    });
  }

  /** El jugador rep dany */
  takeDamage() {
    if (this.isInvulnerable || this.isHidden) return;
    this.health--;
    this.isInvulnerable = true;
    this.scene.events.emit(EVENTS.PLAYER_DAMAGED, this.health);
    // Parpelleig visual d'invulnerabilitat
    this.scene.tweens.add({
      targets: this, alpha: 0.3, duration: 100, yoyo: true, repeat: 7,
      onComplete: () => { this.setAlpha(1); this.isInvulnerable = false; this.state = PLAYER_STATES.IDLE; }
    });
    if (this.health <= 0) this.scene.events.emit(EVENTS.PLAYER_DIED);
  }

  /** Actualitza l'indicador de sigil sobre el jugador */
  updateStealthIcon() {
    this.stealthIcon.clear();
    this.stealthIcon.setPosition(this.x, this.y - 30);
    if (this.isInShadow || this.isHidden) {
      this.stealthIcon.fillStyle(0x64b5f6, 0.6);
      this.stealthIcon.fillCircle(0, 0, 5);
      this.setAlpha(STEALTH_CONFIG.SHADOW_ALPHA);
    } else {
      this.stealthIcon.fillStyle(0xffaa00, 0.8);
      this.stealthIcon.fillCircle(0, 0, 5);
      this.stealthIcon.lineStyle(1, 0xffaa00, 0.5);
      this.stealthIcon.strokeCircle(0, 0, 8);
      if (!this.isInvulnerable) this.setAlpha(STEALTH_CONFIG.NORMAL_ALPHA);
    }
  }

  /** Mostra la icona d'interacció si hi ha un objecte a prop */
  updateInteractIcon() {
    if (this.canInteract && this.nearbyObject) {
      this.interactIcon.setPosition(this.x, this.y - 45);
      this.interactIcon.setVisible(true);
    } else {
      this.interactIcon.setVisible(false);
    }
  }

  setNearbyObject(obj) { this.nearbyObject = obj; this.canInteract = obj !== null; }
  hide() { this.isHidden = true; this.state = PLAYER_STATES.HIDING; this.setAlpha(0); this.body.setVelocity(0, 0); this.body.setEnable(false); }
  unhide() { this.isHidden = false; this.state = PLAYER_STATES.IDLE; this.setAlpha(1); this.body.setEnable(true); }
  finishInteraction() { this.state = PLAYER_STATES.IDLE; this.play('player-idle', true); }

  destroy() {
    if (this.stealthIcon) this.stealthIcon.destroy();
    if (this.interactIcon) this.interactIcon.destroy();
    super.destroy();
  }
}
