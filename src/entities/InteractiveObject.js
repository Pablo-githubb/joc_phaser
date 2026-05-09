/**
 * InteractiveObject.js - Objectes interactius del nivell
 * 
 * Representa portes, armaris, ordinadors, caixes fortes i fusibles.
 * El jugador pot interactuar amb ells prement la tecla E.
 */
import { INTERACTIVE_TYPES, EVENTS } from '../utils/constants.js';

export default class InteractiveObject {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = config.type || INTERACTIVE_TYPES.DOOR;
    this.isLocked = config.locked || false;
    this.isOpen = false;
    this.isUsed = false;
    this.linkedId = config.linkedId || null; // ID per vincular a càmeres/làsers

    // Gràfic de l'objecte
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(15);

    // Zona de col·lisió (per detectar proximitat del jugador)
    this.zone = scene.add.zone(x, y, 40, 48).setOrigin(0.5);
    scene.physics.add.existing(this.zone, true);

    // Cos sòlid per a les portes (bloqueja el pas quan estan tancades)
    if (this.type === INTERACTIVE_TYPES.DOOR) {
      this.doorCollider = scene.add.zone(x, y, 16, 48).setOrigin(0.5);
      scene.physics.add.existing(this.doorCollider, true);
    }

    // Etiqueta del tipus d'objecte
    this.label = scene.add.text(x, y - 30, '', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '6px', color: '#aaaacc',
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.draw();
  }

  /** Dibuixa l'objecte segons el seu tipus */
  draw() {
    this.graphics.clear();
    switch (this.type) {
      case INTERACTIVE_TYPES.DOOR:
        this.drawDoor(); break;
      case INTERACTIVE_TYPES.LOCKER:
        this.drawLocker(); break;
      case INTERACTIVE_TYPES.COMPUTER:
        this.drawComputer(); break;
      case INTERACTIVE_TYPES.SAFE:
        this.drawSafe(); break;
      case INTERACTIVE_TYPES.FUSE_BOX:
        this.drawFuseBox(); break;
      case INTERACTIVE_TYPES.EXIT:
        this.drawExit(); break;
    }
  }

  drawDoor() {
    const color = this.isOpen ? 0x556655 : (this.isLocked ? 0x664444 : 0x555566);
    this.graphics.fillStyle(color, 1);
    if (this.isOpen) {
      this.graphics.fillRect(this.x - 14, this.y - 22, 6, 44);
    } else {
      this.graphics.fillRect(this.x - 14, this.y - 22, 28, 44);
      // Pom de la porta
      this.graphics.fillStyle(this.isLocked ? 0xff6644 : 0xcccc88, 1);
      this.graphics.fillCircle(this.x + 8, this.y, 3);
    }
    this.label.setText(this.isLocked ? '🔒 Porta' : 'Porta');
  }

  drawLocker() {
    this.graphics.fillStyle(0x556677, 1);
    this.graphics.fillRect(this.x - 12, this.y - 24, 24, 48);
    this.graphics.lineStyle(1, 0x778899, 0.5);
    this.graphics.strokeRect(this.x - 12, this.y - 24, 24, 48);
    // Ranures
    this.graphics.lineStyle(1, 0x445566, 0.8);
    this.graphics.lineBetween(this.x - 8, this.y - 16, this.x + 8, this.y - 16);
    this.graphics.lineBetween(this.x - 8, this.y, this.x + 8, this.y);
    this.label.setText('Armari');
  }

  drawComputer() {
    // Pantalla
    this.graphics.fillStyle(0x334455, 1);
    this.graphics.fillRect(this.x - 10, this.y - 16, 20, 14);
    const screenColor = this.isUsed ? 0x225522 : 0x223355;
    this.graphics.fillStyle(screenColor, 1);
    this.graphics.fillRect(this.x - 8, this.y - 14, 16, 10);
    // Base
    this.graphics.fillStyle(0x444455, 1);
    this.graphics.fillRect(this.x - 4, this.y - 2, 8, 4);
    this.graphics.fillRect(this.x - 8, this.y + 2, 16, 2);
    this.label.setText('Ordinador');
  }

  drawSafe() {
    this.graphics.fillStyle(0x555566, 1);
    this.graphics.fillRect(this.x - 14, this.y - 14, 28, 28);
    this.graphics.lineStyle(2, 0x777788, 0.8);
    this.graphics.strokeRect(this.x - 14, this.y - 14, 28, 28);
    // Roda de combinació
    this.graphics.fillStyle(this.isOpen ? 0x44aa44 : 0xccaa44, 1);
    this.graphics.fillCircle(this.x, this.y, 6);
    this.graphics.fillStyle(0x555566, 1);
    this.graphics.fillCircle(this.x, this.y, 3);
    this.label.setText('Caixa forta');
  }

  drawFuseBox() {
    this.graphics.fillStyle(0x556655, 1);
    this.graphics.fillRect(this.x - 10, this.y - 12, 20, 24);
    this.graphics.lineStyle(1, 0x668866, 0.6);
    this.graphics.strokeRect(this.x - 10, this.y - 12, 20, 24);
    // Interruptors
    const c = this.isUsed ? 0x44aa44 : 0xaa4444;
    this.graphics.fillStyle(c, 1);
    this.graphics.fillRect(this.x - 6, this.y - 6, 4, 8);
    this.graphics.fillRect(this.x + 2, this.y - 6, 4, 8);
    this.label.setText('Fusibles');
  }

  drawExit() {
    this.graphics.fillStyle(0x225533, 0.8);
    this.graphics.fillRect(this.x - 16, this.y - 24, 32, 48);
    this.graphics.lineStyle(2, 0x44cc66, 0.8);
    this.graphics.strokeRect(this.x - 16, this.y - 24, 32, 48);
    // Senyal EXIT
    const exitText = this.scene.add.text(this.x, this.y - 30, 'SORTIDA', {
      fontFamily: '"Press Start 2P", cursive', fontSize: '6px', color: '#44cc66',
    }).setOrigin(0.5).setDepth(100);
    this.label.setText('Sortida');
  }

  /** Mostra l'etiqueta quan el jugador s'acosta */
  showLabel() { this.label.setVisible(true); }
  hideLabel() { this.label.setVisible(false); }

  /** Interactua amb l'objecte */
  interact() {
    switch (this.type) {
      case INTERACTIVE_TYPES.DOOR:
        if (this.isLocked) return 'locked';
        this.isOpen = !this.isOpen;
        this.draw();
        return 'opened';
      case INTERACTIVE_TYPES.LOCKER:
        return 'hide';
      case INTERACTIVE_TYPES.COMPUTER:
        if (this.isUsed) return 'already-used';
        return 'hack';
      case INTERACTIVE_TYPES.SAFE:
        if (this.isOpen) return 'already-open';
        if (this.isLocked) return 'locked';
        this.isOpen = true;
        this.draw();
        return 'opened';
      case INTERACTIVE_TYPES.FUSE_BOX:
        if (this.isUsed) return 'already-used';
        return 'fuse';
      case INTERACTIVE_TYPES.EXIT:
        return 'exit';
    }
  }

  /** Marca l'objecte com a usat (després d'un mini-joc completat) */
  markUsed() {
    this.isUsed = true;
    this.isLocked = false;
    this.isOpen = true;
    this.draw();
  }

  destroy() {
    this.graphics.destroy();
    this.zone.destroy();
    this.label.destroy();
  }
}
