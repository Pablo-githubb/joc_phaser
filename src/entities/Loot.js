/**
 * Loot.js - Objectes de botí recollibles
 * 
 * Representa els objectes de valor que el jugador pot recollir.
 * Inclou monedes, joies i l'objectiu principal del nivell.
 */
import { EVENTS } from '../utils/constants.js';
import { COLORS } from '../config/gameConfig.js';

export default class Loot extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, 'loot-sprite');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = cos estàtic

    this.lootType = config.type || 'coin'; // coin, gem, main
    this.value = config.value || 10;
    this.isMainLoot = config.isMain || false;
    this.collected = false;

    this.setDepth(20);
    this.body.setSize(16, 16);

    // Animació de flotació suau
    scene.tweens.add({
      targets: this, y: y - 4, duration: 1200,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Efecte de brillantor
    this.glow = scene.add.graphics();
    this.glow.setDepth(19);
    this.animateGlow();
  }

  /** Animació de brillantor pulsant */
  animateGlow() {
    const color = this.isMainLoot ? 0xffd700 : 0x64b5f6;
    const drawGlow = () => {
      if (this.collected || !this.glow) return;
      this.glow.clear();
      this.glow.fillStyle(color, 0.15);
      this.glow.fillCircle(this.x, this.y, 14);
    };
    this.scene.time.addEvent({ delay: 100, callback: drawGlow, loop: true });
  }

  /** Recull el botí amb animació */
  collect() {
    if (this.collected) return;
    this.collected = true;

    // Animació de recollida (escalar i desaparèixer)
    this.scene.tweens.add({
      targets: this, scaleX: 1.5, scaleY: 1.5, alpha: 0, y: this.y - 30,
      duration: 300, ease: 'Power2',
      onComplete: () => { this.destroy(); }
    });

    // Text flotant amb el valor
    const valueText = this.scene.add.text(this.x, this.y - 20, `+${this.value}`, {
      fontFamily: '"Press Start 2P", cursive', fontSize: '10px',
      color: this.isMainLoot ? '#ffd700' : '#64b5f6',
    }).setOrigin(0.5).setDepth(100);

    this.scene.tweens.add({
      targets: valueText, y: valueText.y - 40, alpha: 0, duration: 800,
      onComplete: () => valueText.destroy(),
    });

    // Emetre event corresponent
    if (this.isMainLoot) {
      this.scene.events.emit(EVENTS.MAIN_LOOT_COLLECTED, this.value);
    } else {
      this.scene.events.emit(EVENTS.LOOT_COLLECTED, this.value);
    }
  }

  destroy() {
    if (this.glow) this.glow.destroy();
    super.destroy();
  }
}
