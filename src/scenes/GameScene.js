/**
 * GameScene.js - Escena principal del joc (gameplay)
 * 
 * Aquesta és l'escena on es juga. Carrega el nivell, crea totes
 * les entitats (jugador, guardes, càmeres, làsers, objectes),
 * gestiona les col·lisions i la lògica de victòria/derrota.
 */
import { SCENES, EVENTS, INTERACTIVE_TYPES } from '../utils/constants.js';
import { SCREEN_CONFIG, COLORS, PLAYER_CONFIG } from '../config/gameConfig.js';
import { distanceBetween } from '../utils/helpers.js';
import Player from '../entities/Player.js';
import Guard from '../entities/Guard.js';
import SecurityCamera from '../entities/SecurityCamera.js';
import Laser from '../entities/Laser.js';
import Loot from '../entities/Loot.js';
import InteractiveObject from '../entities/InteractiveObject.js';
import DetectionSystem from '../systems/DetectionSystem.js';
import StealthSystem from '../systems/StealthSystem.js';
import MiniGameSystem from '../systems/MiniGameSystem.js';
import LevelManager from '../levels/LevelManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  /** Rebre les dades del nivell seleccionat */
  init(data) {
    this.levelId = data.levelId || 1;
  }

  create() {
    const { WIDTH, HEIGHT } = SCREEN_CONFIG;
    this.levelManager = new LevelManager();
    this.levelData = this.levelManager.getLevelData(this.levelId);

    if (!this.levelData) {
      console.error('No s\'ha trobat el nivell:', this.levelId);
      this.scene.start(SCENES.LEVEL_SELECT);
      return;
    }

    // === CONFIGURACIÓ DEL MÓN ===
    this.physics.world.setBounds(0, 0, this.levelData.width, this.levelData.height);
    this.cameras.main.setBackgroundColor('#0a0a18');

    // Temporitzador del nivell
    this.levelTime = 0;
    this.totalLootCollected = 0;
    this.wasDetected = false;
    this.levelComplete = false;
    this.isPaused = false;

    // === CREAR L'ENTORN ===
    this.createEnvironment();

    // === CREAR PLATAFORMES ===
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    // === CREAR ESCALES ===
    this.ladderZones = [];
    this.createLadders();

    // === SISTEMES ===
    this.detectionSystem = new DetectionSystem(this);
    this.stealthSystem = new StealthSystem(this);
    this.miniGameSystem = new MiniGameSystem(this);

    // Carregar zones d'ombra
    this.stealthSystem.loadShadowZones(this.levelData.shadows);

    // === JUGADOR ===
    const ps = this.levelData.playerStart;
    this.player = new Player(this, ps.x, ps.y);
    this.platformCollider = this.physics.add.collider(this.player, this.platforms);

    // === GUARDES ===
    this.guards = [];
    this.createGuards();

    // === CÀMERES DE SEGURETAT ===
    this.securityCameras = [];
    this.createSecurityCameras();

    // === LÀSERS ===
    this.lasers = [];
    this.createLasers();

    // === OBJECTES INTERACTIUS ===
    this.interactiveObjects = [];
    this.createInteractiveObjects();

    // === BOTÍ ===
    this.lootItems = this.add.group();
    this.createLoot();

    // === COL·LISIONS ===
    this.setupCollisions();

    // === EVENTS ===
    this.setupEvents();

    // === CÀMERA DEL JOC ===
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, this.levelData.width, this.levelData.height);
    this.cameras.main.fadeIn(500, 10, 10, 18);

    // === HUD ===
    this.scene.launch(SCENES.HUD, {
      health: this.player.health,
      levelName: this.levelData.name,
      totalLoot: this.levelData.totalLoot,
    });

    // === TUTORIALS ===
    this.createTutorials();

    // === CONTROLS DE PAUSA ===
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());

    // === MÚSICA ===
    try {
      if (this.cache.audio.exists('music-stealth')) {
        this.bgMusic = this.sound.add('music-stealth', { loop: true, volume: 0.25 });
        this.bgMusic.play();
      }
    } catch (e) { /* Ignorar errors d'àudio */ }

    // Registrar l'esdeveniment de tancament per aturar la música
    this.events.on('shutdown', this.shutdown, this);
  }

  /** Crea l'entorn visual de fons (parets, decoració) */
  createEnvironment() {
    const g = this.add.graphics();
    const ld = this.levelData;

    // Fons base (un sol rectangle, molt més eficient que un bucle de tiles)
    g.fillStyle(0x12121e, 1);
    g.fillRect(0, 0, ld.width, ld.height);

    // Quadrícula subtil de maons (línies horitzontals i verticals)
    g.lineStyle(1, 0x1a1a2e, 0.4);
    for (let x = 0; x < ld.width; x += 32) {
      g.lineBetween(x, 0, x, ld.height);
    }
    for (let y = 0; y < ld.height; y += 32) {
      g.lineBetween(0, y, ld.width, y);
    }

    // Línia decorativa superior
    g.fillStyle(0x333344, 0.5);
    g.fillRect(0, 0, ld.width, 3);
  }

  /** Crea les plataformes sòlides del nivell */
  createPlatforms() {
    this.levelData.platforms.forEach(p => {
      const platform = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);

      // Visual de la plataforma
      const g = this.add.graphics();
      g.setDepth(8);

      if (p.h > 20) {
        // Paret vertical
        g.fillStyle(0x2a2a40, 1);
        g.fillRect(p.x, p.y, p.w, p.h);
        g.lineStyle(1, 0x222235, 0.5);
        // Dibuixar maons
        for (let by = p.y; by < p.y + p.h; by += 16) {
          for (let bx = p.x; bx < p.x + p.w; bx += 32) {
            const offset = (Math.floor((by - p.y) / 16) % 2) * 16;
            g.strokeRect(bx + offset, by, 32, 16);
          }
        }
      } else {
        // Plataforma/terra horitzontal
        g.fillStyle(0x3a3a52, 1);
        g.fillRect(p.x, p.y, p.w, p.h);
        g.fillStyle(0x444460, 1);
        g.fillRect(p.x, p.y, p.w, 3);
        g.lineStyle(1, 0x222235, 0.4);
        g.strokeRect(p.x, p.y, p.w, p.h);
      }
    });
  }

  /** Crea les zones d'escales */
  createLadders() {
    if (!this.levelData.ladders) return;

    this.levelData.ladders.forEach(l => {
      // Zona invisible per detectar quan el jugador hi és
      const zone = this.add.zone(l.x + l.w / 2, l.y + l.h / 2, l.w, l.h);
      this.physics.add.existing(zone, true);
      this.ladderZones.push(zone);

      // Visual de l'escala
      const g = this.add.graphics();
      g.setDepth(7);
      g.fillStyle(0x555544, 0.8);
      // Barres verticals
      g.fillRect(l.x + 2, l.y, 4, l.h);
      g.fillRect(l.x + l.w - 6, l.y, 4, l.h);
      // Graons horitzontals
      for (let gy = l.y + 12; gy < l.y + l.h; gy += 16) {
        g.fillRect(l.x + 4, gy, l.w - 8, 3);
      }
    });
  }

  /** Crea els guardes del nivell */
  createGuards() {
    this.levelData.guards.forEach(gd => {
      const guard = new Guard(this, gd.x, gd.y, { waypoints: gd.waypoints });
      this.physics.add.collider(guard, this.platforms);
      this.guards.push(guard);
    });
  }

  /** Crea les càmeres de seguretat */
  createSecurityCameras() {
    if (!this.levelData.cameras) return;
    this.levelData.cameras.forEach(cd => {
      const cam = new SecurityCamera(this, cd.x, cd.y, cd);
      this.securityCameras.push(cam);
    });
  }

  /** Crea els làsers */
  createLasers() {
    if (!this.levelData.lasers) return;
    this.levelData.lasers.forEach(ld => {
      const laser = new Laser(this, ld.x1, ld.y1, ld.x2, ld.y2, ld);
      this.lasers.push(laser);
    });
  }

  /** Crea els objectes interactius */
  createInteractiveObjects() {
    this.levelData.objects.forEach(od => {
      const obj = new InteractiveObject(this, od.x, od.y, od);
      this.interactiveObjects.push(obj);
    });
  }

  /** Crea els objectes de botí */
  createLoot() {
    this.levelData.loot.forEach(ld => {
      const loot = new Loot(this, ld.x, ld.y, ld);
      this.lootItems.add(loot);
    });
  }

  /** Crea els missatges de tutorial */
  createTutorials() {
    if (!this.levelData.tutorials) return;
    this.levelData.tutorials.forEach(t => {
      const text = this.add.text(t.x, t.y, t.text, {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '7px', color: '#556677',
        backgroundColor: '#0a0a1880',
        padding: { x: 4, y: 4 },
      }).setDepth(5).setOrigin(0.5);

      // Animació de flotació suau
      this.tweens.add({
        targets: text, y: t.y - 3, duration: 2000,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });
  }

  /** Configura les col·lisions entre entitats */
  setupCollisions() {
    // Col·lisió jugador-botí (recollir)
    this.physics.add.overlap(this.player, this.lootItems, (player, loot) => {
      if (!loot.collected) loot.collect();
    });

    // Detecció de proximitat amb objectes interactius
    this.interactiveObjects.forEach(obj => {
      this.physics.add.overlap(this.player, obj.zone, () => {
        this.player.setNearbyObject(obj);
        obj.showLabel();
      });

      // Afegir col·lisió sòlida per a les portes
      if (obj.type === INTERACTIVE_TYPES.DOOR && obj.doorCollider) {
        // Bloquejar jugador
        this.physics.add.collider(this.player, obj.doorCollider, null, () => !obj.isOpen);
        // Bloquejar guardes
        this.guards.forEach(guard => {
          this.physics.add.collider(guard, obj.doorCollider, null, () => !obj.isOpen);
        });
      }
    });
  }

  /** Configura els events del joc */
  setupEvents() {
    // Interacció del jugador amb un objecte
    this.events.on('player-interact', (obj) => {
      const result = obj.interact();
      this.handleInteractionResult(result, obj);
    });

    // Noquejat de guarda
    this.events.on('player-knockout-attempt', (data) => {
      this.guards.forEach(guard => {
        const dist = distanceBetween(data.x, data.y, guard.x, guard.y);
        if (dist < 40 && guard.state !== 'knockout') {
          // Comprovar que el guarda no mira cap al jugador
          const guardFacingRight = guard.direction === 'right';
          const playerOnRight = data.x > guard.x;
          if (guardFacingRight !== (data.direction === 'left' ? false : true) ||
              (!guardFacingRight && playerOnRight) || (guardFacingRight && !playerOnRight)) {
            guard.knockout();
          }
        }
      });
    });

    // Botí recollit
    this.events.on(EVENTS.LOOT_COLLECTED, (value) => {
      this.totalLootCollected += value;
      this.events.emit(EVENTS.UPDATE_HUD, {
        loot: this.totalLootCollected,
        health: this.player.health,
      });
    });

    // Objectiu principal recollit
    this.events.on(EVENTS.MAIN_LOOT_COLLECTED, (value) => {
      this.totalLootCollected += value;
      this.player.hasMainLoot = true;
      this.events.emit(EVENTS.UPDATE_HUD, {
        loot: this.totalLootCollected,
        health: this.player.health,
        mainLoot: true,
      });
      // Missatge de notificació
      this.showNotification('★ OBJECTIU ACONSEGUIT! Ves a la sortida!');
    });

    // Jugador detectat
    this.events.on(EVENTS.PLAYER_DETECTED, () => {
      this.wasDetected = true;
    });

    // Jugador mort
    this.events.on(EVENTS.PLAYER_DIED, () => {
      this.gameOver(false);
    });

    // Dany rebut
    this.events.on(EVENTS.PLAYER_DAMAGED, (health) => {
      this.events.emit(EVENTS.UPDATE_HUD, {
        health, loot: this.totalLootCollected,
      });
    });

    // Mini-joc completat
    this.events.on(EVENTS.MINIGAME_SUCCESS, (type, obj) => {
      this.player.finishInteraction();
      if (obj && obj.linkedId) {
        this.handleLinkedAction(obj.linkedId);
      }
      this.showNotification('✓ Completat!');
    });

    // Mini-joc fracassat
    this.events.on(EVENTS.MINIGAME_FAIL, () => {
      this.player.finishInteraction();
      this.showNotification('✗ Temps esgotat!');
    });
  }

  /** Gestiona el resultat d'una interacció amb un objecte */
  handleInteractionResult(result, obj) {
    switch (result) {
      case 'locked':
        this.miniGameSystem.startLockPick(obj);
        break;
      case 'hack':
        this.miniGameSystem.startHack(obj);
        break;
      case 'fuse':
        this.miniGameSystem.startHack(obj);
        break;
      case 'hide':
        if (this.player.isHidden) {
          this.player.unhide();
        } else {
          this.player.hide();
          this.player.setPosition(obj.x, obj.y);
        }
        this.player.finishInteraction();
        break;
      case 'exit':
        if (this.player.hasMainLoot) {
          this.levelComplete = true;
          this.gameOver(true);
        } else {
          this.showNotification('Necessites l\'objectiu principal!');
          this.player.finishInteraction();
        }
        break;
      case 'opened':
      case 'already-open':
      case 'already-used':
        this.player.finishInteraction();
        break;
    }
  }

  /** Executa accions vinculades (desactivar càmeres/làsers) */
  handleLinkedAction(linkedId) {
    // Desactivar càmeres vinculades
    this.securityCameras.forEach(cam => {
      cam.disable();
    });
    // Desactivar làsers vinculats
    this.lasers.forEach(laser => {
      laser.disable();
    });
  }

  /** Mostra una notificació temporal a la pantalla */
  showNotification(message) {
    const text = this.add.text(
      this.cameras.main.scrollX + SCREEN_CONFIG.WIDTH / 2,
      this.cameras.main.scrollY + 60,
      message,
      {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '10px', color: '#64b5f6',
        backgroundColor: '#0a0a12cc',
        padding: { x: 12, y: 8 },
      }
    ).setOrigin(0.5).setDepth(250);

    this.tweens.add({
      targets: text, alpha: 0, y: text.y - 30,
      duration: 2500, delay: 1500,
      onComplete: () => text.destroy(),
    });
  }

  /** Pausa/reprèn el joc */
  togglePause() {
    if (this.levelComplete) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      this.scene.launch(SCENES.PAUSE);
      this.scene.pause();
    }
  }

  /** Fi de partida (victòria o derrota) */
  gameOver(won) {
    if (this.levelComplete && !won) return;
    this.levelComplete = true;
    this.physics.pause();

    if (this.bgMusic) this.bgMusic.stop();

    let stars = 0;
    if (won) {
      stars = this.levelManager.completeLevel(this.levelId, {
        loot: this.totalLootCollected,
        totalLoot: this.levelData.totalLoot,
        time: this.levelTime,
        detected: this.wasDetected,
      });
    }

    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(600, 10, 10, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop(SCENES.HUD);
        this.scene.start(SCENES.GAME_OVER, {
          won,
          stars,
          levelId: this.levelId,
          loot: this.totalLootCollected,
          totalLoot: this.levelData.totalLoot,
          time: this.levelTime,
          detected: this.wasDetected,
        });
      });
    });
  }

  /** Actualització principal del joc (cada frame) */
  update(time, delta) {
    if (this.isPaused || this.levelComplete) return;

    // Temporitzador del nivell
    this.levelTime += delta;

    // Actualitzar el jugador
    this.player.update();

    // Comprovar si el jugador està en una escala
    this.checkLadders();

    // Comprovar proximitat amb objectes interactius
    this.checkObjectProximity();

    // Actualitzar guardes
    this.guards.forEach(g => g.update(time, delta, this.player));

    // Actualitzar càmeres de seguretat
    this.securityCameras.forEach(c => c.update(delta, this.player));

    // Actualitzar làsers
    this.lasers.forEach(l => l.update(delta, this.player));

    // Actualitzar sistemes
    this.stealthSystem.update(this.player);
    this.detectionSystem.update(delta, this.player);
    this.miniGameSystem.update(delta);

    // Actualitzar HUD amb el temps
    this.events.emit(EVENTS.UPDATE_HUD, {
      health: this.player.health,
      loot: this.totalLootCollected,
      time: this.levelTime,
    });
  }

  /** Comprova si el jugador està en una escala */
  checkLadders() {
    let onLadder = false;
    const pb = this.player.getBounds();

    this.ladderZones.forEach(zone => {
      const zb = zone.getBounds();
      // Overlap amb el cos del jugador (no només el punt central)
      if (Phaser.Geom.Rectangle.Overlaps(pb, zb)) {
        onLadder = true;
      }
    });

    const wantsClimb = this.player.cursors.up.isDown || this.player.wasd.up.isDown ||
                       this.player.cursors.down.isDown || this.player.wasd.down.isDown;

    const wasClimbing = this.player.isClimbing;
    this.player.isClimbing = onLadder && wantsClimb;

    // Desactivar col·lisió amb plataformes quan pugem per no topar amb el sostre de la plataforma
    if (this.platformCollider) {
      // Permetre passar a través de les plataformes des de baix (one-way) quan s'està escalant
      this.platformCollider.active = !this.player.isClimbing;
    }
  }

  /** Comprova la proximitat del jugador amb objectes interactius */
  checkObjectProximity() {
    let nearestObj = null;
    let nearestDist = PLAYER_CONFIG.INTERACT_RANGE;

    this.interactiveObjects.forEach(obj => {
      const dist = distanceBetween(this.player.x, this.player.y, obj.x, obj.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestObj = obj;
      } else {
        obj.hideLabel();
      }
    });

    this.player.setNearbyObject(nearestObj);
    if (nearestObj) nearestObj.showLabel();
  }

  /** Neteja l'escena en sortir */
  shutdown() {
    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic.destroy();
      this.bgMusic = null;
    }
    this.guards.forEach(g => g.destroy());
    this.securityCameras.forEach(c => c.destroy());
    this.lasers.forEach(l => l.destroy());
    this.interactiveObjects.forEach(o => o.destroy());
    this.detectionSystem.destroy();
    this.stealthSystem.destroy();
    this.miniGameSystem.destroy();
  }
}
