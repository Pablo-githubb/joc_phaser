/**
 * MiniGameSystem.js - Mini-jocs d'interacció
 * 
 * Gestiona els mini-jocs de forçar panys (lock picking)
 * i hackejar ordinadors (hacking). Crea una interfície
 * temporal sobre el joc per al mini-joc.
 */
import { MINIGAME_CONFIG, COLORS } from '../config/gameConfig.js';
import { EVENTS } from '../utils/constants.js';
import ProgressBar from '../ui/ProgressBar.js';

export default class MiniGameSystem {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.currentType = null; // 'lockpick' o 'hack'
    this.progress = 0;
    this.timeRemaining = 0;
    this.targetObject = null;

    // Contenidor visual del mini-joc (overlay)
    // setScrollFactor(0) = fix a pantalla, no segueix la càmera
    this.container = scene.add.container(0, 0).setDepth(300).setVisible(false).setScrollFactor(0);

    // Fons semitransparent
    this.overlay = scene.add.graphics().setScrollFactor(0);
    this.container.add(this.overlay);

    // Títol del mini-joc
    this.title = scene.add.text(480, 200, '', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '14px', color: '#64b5f6',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.container.add(this.title);

    // Instruccions
    this.instructions = scene.add.text(480, 240, '', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '8px', color: '#aaaacc',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.container.add(this.instructions);

    // Barra de progrés (fixada a la pantalla, no segueix la càmera)
    this.progressBar = new ProgressBar(scene, 480, 290, {
      width: 250, height: 22,
      fillColor: COLORS.ACCENT_BLUE,
      showPercent: true,
      scrollFactor: 0,
    });
    this.progressBar.setDepth(301);
    this.progressBar.setScrollFactor(0);
    this.progressBar.setVisible(false); // Amagada fins que s'inicia un mini-joc

    // Temporitzador visual
    this.timerText = scene.add.text(480, 330, '', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '10px', color: '#ff8844',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Zona de clic per al mini-joc de lockpick
    this.clickZone = scene.add.rectangle(480, 290, 260, 80, 0x000000, 0.001)
      .setInteractive().setScrollFactor(0).setDepth(302).setVisible(false);

    this.clickZone.on('pointerdown', () => this.onMiniGameClick());

    // Tecles per al mini-joc de hacking
    this.hackKeys = [];
    this.hackSequence = [];
    this.hackIndex = 0;
  }

  /**
   * Inicia un mini-joc de forçar pany
   * @param {InteractiveObject} targetObj - Objecte que s'està forçant
   */
  startLockPick(targetObj) {
    this.isActive = true;
    this.currentType = 'lockpick';
    this.targetObject = targetObj;
    this.progress = 0;
    this.timeRemaining = MINIGAME_CONFIG.LOCK_PICK_TIME;

    this.container.setVisible(true);
    this.clickZone.setVisible(true);
    this.drawOverlay();
    this.title.setText('🔓 FORÇAR PANY');
    this.instructions.setText('Fes clic ràpidament per forçar el pany!');
    this.progressBar.setValue(0);
    this.progressBar.setVisible(true);

    this.scene.events.emit(EVENTS.MINIGAME_START, 'lockpick');
  }

  /**
   * Inicia un mini-joc de hackeig
   * @param {InteractiveObject} targetObj - Ordinador que s'està hackejant
   */
  startHack(targetObj) {
    this.isActive = true;
    this.currentType = 'hack';
    this.targetObject = targetObj;
    this.progress = 0;
    this.timeRemaining = MINIGAME_CONFIG.HACK_TIME;
    this.hackIndex = 0;

    // Generar seqüència aleatòria de tecles
    const keys = ['A', 'S', 'D', 'W'];
    this.hackSequence = [];
    for (let i = 0; i < MINIGAME_CONFIG.HACK_SEQUENCE_LENGTH; i++) {
      this.hackSequence.push(keys[Math.floor(Math.random() * keys.length)]);
    }

    this.container.setVisible(true);
    this.drawOverlay();
    this.title.setText('💻 HACKEJAR SISTEMA');
    this.instructions.setText('Prem les tecles en ordre:');
    this.progressBar.setValue(0);
    this.progressBar.setVisible(true);

    // Mostrar seqüència de tecles
    this.drawHackSequence();

    // Escoltar tecles
    this.scene.input.keyboard.on('keydown', this.onHackKeyPress, this);

    this.scene.events.emit(EVENTS.MINIGAME_START, 'hack');
  }

  /** Actualització del mini-joc actiu */
  update(delta) {
    if (!this.isActive) return;

    // Reduir el temps restant
    this.timeRemaining -= delta;
    const seconds = Math.max(0, Math.ceil(this.timeRemaining / 1000));
    this.timerText.setText(`Temps: ${seconds}s`);

    // Temps esgotat = fracàs
    if (this.timeRemaining <= 0) {
      this.fail();
    }
  }

  /** Clic al mini-joc de forçar pany */
  onMiniGameClick() {
    if (!this.isActive || this.currentType !== 'lockpick') return;

    this.progress += (1 / MINIGAME_CONFIG.LOCK_PICK_CLICKS);
    this.progressBar.setValue(this.progress);

    // Efecte visual de clic
    this.scene.cameras.main.shake(30, 0.002);

    if (this.progress >= 1) {
      this.success();
    }
  }

  /** Tecla premuda al mini-joc de hackeig */
  onHackKeyPress(event) {
    if (!this.isActive || this.currentType !== 'hack') return;

    if (!event || !event.key) return;
    const keyStr = event.key.toUpperCase();
    
    // Ignorar qualsevol tecla que no sigui del minijoc per evitar resets accidentals (ex: la E d'interactuar)
    const validKeys = ['A', 'S', 'D', 'W'];
    if (!validKeys.includes(keyStr)) return;

    const expectedKey = this.hackSequence[this.hackIndex];
    if (keyStr === expectedKey) {
      this.hackIndex++;
      this.progress = this.hackIndex / this.hackSequence.length;
      this.progressBar.setValue(this.progress);
      this.drawHackSequence();

      if (this.hackIndex >= this.hackSequence.length) {
        this.success();
      }
    } else {
      // Tecla incorrecta: reiniciar seqüència
      this.hackIndex = 0;
      this.progress = 0;
      this.progressBar.setValue(0);
      this.drawHackSequence();
      this.scene.cameras.main.shake(50, 0.005);
    }
  }

  /** Mini-joc completat amb èxit */
  success() {
    this.isActive = false;
    this.container.setVisible(false);
    this.clickZone.setVisible(false);
    this.progressBar.setVisible(false);

    if (this.targetObject) {
      this.targetObject.markUsed();
    }

    this.scene.input.keyboard.off('keydown', this.onHackKeyPress, this);
    this.scene.events.emit(EVENTS.MINIGAME_SUCCESS, this.currentType, this.targetObject);
    this.cleanupHackDisplay();
  }

  /** Mini-joc fracassat */
  fail() {
    this.isActive = false;
    this.container.setVisible(false);
    this.clickZone.setVisible(false);
    this.progressBar.setVisible(false);

    this.scene.input.keyboard.off('keydown', this.onHackKeyPress, this);
    this.scene.events.emit(EVENTS.MINIGAME_FAIL, this.currentType);
    this.cleanupHackDisplay();
  }

  /** Dibuixa l'overlay semitransparent del mini-joc */
  drawOverlay() {
    this.overlay.clear();
    this.overlay.fillStyle(0x000000, 0.7);
    this.overlay.fillRect(180, 170, 600, 200);
    this.overlay.lineStyle(2, COLORS.ACCENT_BLUE, 0.6);
    this.overlay.strokeRoundedRect(180, 170, 600, 200, 8);
  }

  /** Dibuixa la seqüència de tecles del hackeig */
  drawHackSequence() {
    this.cleanupHackDisplay();
    this.hackKeys = [];

    const startX = 480 - (this.hackSequence.length * 25);
    this.hackSequence.forEach((key, i) => {
      const color = i < this.hackIndex ? '#44cc66' : (i === this.hackIndex ? '#64b5f6' : '#555577');
      const bg = i === this.hackIndex ? '[ ' : '  ';
      const bg2 = i === this.hackIndex ? ' ]' : '  ';
      const text = this.scene.add.text(startX + i * 50, 270, `${bg}${key}${bg2}`, {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '14px', color: color,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(303);
      this.hackKeys.push(text);
    });
  }

  /** Neteja els textos de la seqüència de hackeig */
  cleanupHackDisplay() {
    this.hackKeys.forEach(k => k.destroy());
    this.hackKeys = [];
  }

  /** Cancel·la el mini-joc actiu */
  cancel() {
    if (!this.isActive) return;
    this.isActive = false;
    this.container.setVisible(false);
    this.clickZone.setVisible(false);
    this.progressBar.setVisible(false);
    this.scene.input.keyboard.off('keydown', this.onHackKeyPress, this);
    this.cleanupHackDisplay();
  }

  destroy() {
    this.container.destroy();
    this.progressBar.destroy();
    this.timerText.destroy();
    this.clickZone.destroy();
    this.cleanupHackDisplay();
  }
}
