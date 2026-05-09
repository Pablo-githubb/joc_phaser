/**
 * main.js - Punt d'entrada principal del joc Shadow Heist
 * 
 * Configura el motor Phaser 3 i registra totes les escenes del joc.
 * Aquest fitxer és el primer que s'executa quan el navegador carrega index.html.
 * 
 * Estructura del joc:
 * - BootScene: Splash screen inicial
 * - PreloadScene: Càrrega d'assets (sprites, àudio)
 * - MenuScene: Menú principal amb fons animat
 * - LevelSelectScene: Selecció de nivells
 * - GameScene: Escena principal de joc (gameplay)
 * - HUDScene: Interfície superposada (vida, botí, temps)
 * - PauseScene: Menú de pausa
 * - GameOverScene: Pantalla de victòria/derrota
 */
import Phaser from 'phaser';
import { SCREEN_CONFIG } from './config/gameConfig.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import HUDScene from './scenes/HUDScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';

/**
 * Configuració global del motor Phaser 3
 * Defineix la resolució, el mode de renderitzat, les físiques
 * i les escenes que formen part del joc.
 */
const config = {
  // Tipus de renderitzat: AUTO detecta si el navegador suporta WebGL
  type: Phaser.AUTO,
  
  // Resolució del canvas del joc
  width: SCREEN_CONFIG.WIDTH,
  height: SCREEN_CONFIG.HEIGHT,

  // Element HTML on es renderitza el canvas
  parent: 'game-container',

  // Configuració del sistema de físiques Arcade
  // (físiques simples i ràpides per a jocs 2D)
  physics: {
    default: 'arcade',
    arcade: {
      // Gravetat global (cada entitat pot sobreescriure-la)
      gravity: { y: 0 },
      // Activar/desactivar el mode de depuració visual
      // (mostra les hitboxes i vectors de velocitat)
      debug: false,
    },
  },

  // Escala del joc per adaptar-se a la finestra del navegador
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Renderitzat de píxels nítids (sense suavitzat antialiasing)
  // Ideal per a jocs de pixel art
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },

  // Color de fons per defecte del canvas
  backgroundColor: '#0a0a12',

  // Registre de totes les escenes del joc
  // L'ordre determina quina escena s'inicia primer (la primera de la llista)
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    LevelSelectScene,
    GameScene,
    HUDScene,
    PauseScene,
    GameOverScene,
  ],

  // Configuració d'àudio
  audio: {
    // Desactivar àudio si no hi ha suport
    disableWebAudio: false,
  },
};

// === INICIALITZAR EL JOC ===
// Crear la instància de Phaser amb la configuració definida
const game = new Phaser.Game(config);

// Amagar la pantalla de càrrega HTML un cop Phaser ha arrencat
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, 3000);
});
