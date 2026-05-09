/**
 * LevelManager.js - Gestor de nivells i progressió
 * 
 * Gestiona la càrrega de nivells, la progressió del jugador,
 * les puntuacions i el desbloqueig de nous nivells.
 * Les dades es guarden al localStorage.
 */
import { saveToStorage, loadFromStorage } from '../utils/helpers.js';

// Clau per guardar les dades al localStorage
const STORAGE_KEY = 'shadow-heist-progress';

export default class LevelManager {
  constructor() {
    // Dades de progressió del jugador
    this.progress = loadFromStorage(STORAGE_KEY, {
      unlockedLevels: [1],      // Nivells desbloquejats
      scores: {},                // Puntuacions per nivell {levelId: {stars, loot, time}}
      totalLoot: 0,              // Botí total acumulat
    });
  }

  /**
   * Obté les dades d'un nivell específic
   * @param {number} levelId - ID del nivell (1, 2, ...)
   * @returns {object} Dades del nivell (plataformes, guardes, objectes, etc.)
   */
  getLevelData(levelId) {
    return LEVELS[levelId] || null;
  }

  /**
   * Comprova si un nivell està desbloquejat
   */
  isLevelUnlocked(levelId) {
    return this.progress.unlockedLevels.includes(levelId);
  }

  /**
   * Completa un nivell i guarda la puntuació
   * @param {number} levelId - ID del nivell completat
   * @param {object} stats - Estadístiques {loot, time, detected}
   */
  completeLevel(levelId, stats) {
    // Calcular estrelles (1-3)
    let stars = 1;
    if (!stats.detected) stars++; // No detectat = estrella extra
    if (stats.loot >= stats.totalLoot * 0.8) stars++; // 80%+ botí = estrella extra

    // Guardar la millor puntuació
    const prev = this.progress.scores[levelId];
    if (!prev || stars > prev.stars) {
      this.progress.scores[levelId] = { stars, loot: stats.loot, time: stats.time };
    }

    // Desbloquejar el següent nivell
    const nextLevel = levelId + 1;
    if (!this.progress.unlockedLevels.includes(nextLevel) && LEVELS[nextLevel]) {
      this.progress.unlockedLevels.push(nextLevel);
    }

    // Acumular botí total
    this.progress.totalLoot += stats.loot;

    // Guardar al localStorage
    this.save();
    return stars;
  }

  /**
   * Obté la puntuació d'un nivell
   */
  getScore(levelId) {
    return this.progress.scores[levelId] || null;
  }

  /**
   * Obté el nombre total de nivells disponibles
   */
  getTotalLevels() {
    return Object.keys(LEVELS).length;
  }

  /**
   * Guarda les dades al localStorage
   */
  save() {
    saveToStorage(STORAGE_KEY, this.progress);
  }

  /**
   * Reinicia tota la progressió
   */
  resetProgress() {
    this.progress = { unlockedLevels: [1], scores: {}, totalLoot: 0 };
    this.save();
  }
}

// ====================================================================
// DADES DELS NIVELLS
// Cada nivell defineix les plataformes, zones d'ombra, guardes,
// càmeres, làsers, objectes interactius i botí.
// Les coordenades són en píxels.
// ====================================================================

const LEVELS = {
  // --- NIVELL 1: TUTORIAL - "La Primera Missió" ---
  1: {
    id: 1,
    name: 'La Primera Missió',
    description: 'Aprèn les bases del robatori sigilós.',
    // Mida del nivell en píxels
    width: 1920,
    height: 540,
    // Posició inicial del jugador
    playerStart: { x: 80, y: 440 },
    // Plataformes solides
    platforms: [
      // Terra
      { x: 0, y: 480, w: 1920, h: 60 },
      // Primer pis esquerra (x:200-520)
      { x: 200, y: 360, w: 320, h: 16 },
      // Primer pis dret (x:620-1300)
      { x: 620, y: 360, w: 680, h: 16 },
      // Segon pis (x:450-1200)
      { x: 450, y: 240, w: 750, h: 16 },
      // Parets externes
      { x: 0, y: 0, w: 16, h: 540 },
      { x: 1904, y: 0, w: 16, h: 540 },
      { x: 0, y: 0, w: 1920, h: 16 },
      // Paret interior: nomes entre 1r pis i 2n pis (NO al terra - la porta hi passa)
      { x: 570, y: 240, w: 16, h: 120 },
      // Paret final del segon pis
      { x: 1200, y: 240, w: 16, h: 120 },
    ],
    // ESCALES - 3 escales per arribar a l'objectiu
    // A: Terra→1r pis esq., B: Terra→1r pis dret, C: 1r pis dret→2n pis
    ladders: [
      { x: 258, y: 360, w: 24, h: 120 },   // Escala A: terra → 1r pis esq.
      { x: 820, y: 360, w: 24, h: 120 },   // Escala B: terra → 1r pis dret
      { x: 960, y: 240, w: 24, h: 120 },   // Escala C: 1r pis dret → 2n pis (objectiu)
    ],
    // Zones d'ombra
    shadows: [
      { x: 16, y: 400, width: 140, height: 80 },
      { x: 350, y: 290, width: 100, height: 70 },
      { x: 700, y: 290, width: 100, height: 70 },
      { x: 650, y: 170, width: 100, height: 70 },
      { x: 1050, y: 170, width: 100, height: 70 },
    ],
    // Guardes
    guards: [
      {
        x: 900, y: 440,
        waypoints: [{ x: 640, y: 440 }, { x: 1150, y: 440 }],
      },
    ],
    // Cameres de seguretat
    cameras: [],
    // Lasers
    lasers: [],
    // Objectes interactius
    objects: [
      { x: 578, y: 458, type: 'door', locked: true },       // Porta: y=458 per recolzar al terra (480-22=458)
      { x: 1100, y: 210, type: 'computer', linkedId: 'cam1' }, // Ordinador al segon pis
      { x: 1800, y: 450, type: 'exit' },                     // Sortida
    ],

    // Botí
    loot: [
      { x: 350, y: 320, type: 'coin', value: 10 },
      { x: 450, y: 320, type: 'coin', value: 10 },
      { x: 730, y: 320, type: 'coin', value: 15 },
      { x: 1050, y: 320, type: 'coin', value: 10 },
      { x: 650, y: 200, type: 'gem', value: 25 },
      { x: 950, y: 200, type: 'main', value: 100, isMain: true },  // Objectiu principal al segon pis
    ],
    // Botí total disponible
    totalLoot: 170,
    // Missatges de tutorial
    tutorials: [
      { x: 100, y: 400, text: '← → per moure\'t' },
      { x: 100, y: 370, text: '↑ per saltar' },
      { x: 270, y: 320, text: '↑/W per pujar escales' },
      { x: 578, y: 415, text: 'E per interactuar' },
      { x: 834, y: 415, text: '↑/W per pujar escales' },
      { x: 974, y: 315, text: '↑/W per pujar escales' },
      { x: 950, y: 170, text: '★ Objectiu principal!' },
    ],
  },

  // --- NIVELL 2: "El Museu" ---
  2: {
    id: 2,
    name: 'El Museu',
    description: 'Roba la joia del museu sense activar l\'alarma.',
    width: 2400,
    height: 540,
    playerStart: { x: 80, y: 440 },
    platforms: [
      // Terra
      { x: 0, y: 480, w: 2400, h: 60 },
      // Primer pis
      { x: 200, y: 360, w: 500, h: 16 },
      { x: 800, y: 360, w: 400, h: 16 },
      { x: 1300, y: 360, w: 500, h: 16 },
      // Segon pis
      { x: 400, y: 240, w: 400, h: 16 },
      { x: 900, y: 240, w: 700, h: 16 },
      // Tercer pis
      { x: 800, y: 120, w: 400, h: 16 },
      // Parets
      { x: 0, y: 0, w: 16, h: 540 },
      { x: 2384, y: 0, w: 16, h: 540 },
      { x: 0, y: 0, w: 2400, h: 16 },
      // Parets interiors (ajustades per no bloquejar la porta)
      { x: 700, y: 360, w: 16, h: 76 },
      { x: 1200, y: 360, w: 16, h: 76 },
      { x: 1800, y: 240, w: 16, h: 196 },
    ],
    ladders: [
      { x: 250, y: 360, w: 24, h: 120 },
      { x: 850, y: 240, w: 24, h: 120 },
      { x: 1350, y: 360, w: 24, h: 120 },
      { x: 1050, y: 120, w: 24, h: 120 },
    ],
    shadows: [
      { x: 16, y: 400, width: 100, height: 80 },
      { x: 350, y: 290, width: 80, height: 70 },
      { x: 1400, y: 290, width: 80, height: 70 },
      { x: 500, y: 170, width: 80, height: 70 },
      { x: 1200, y: 170, width: 80, height: 70 },
      { x: 900, y: 50, width: 80, height: 70 },
    ],
    guards: [
      {
        x: 400, y: 440,
        waypoints: [{ x: 200, y: 440 }, { x: 650, y: 440 }],
      },
      {
        x: 900, y: 320,
        waypoints: [{ x: 800, y: 320 }, { x: 1150, y: 320 }],
      },
      {
        x: 1500, y: 440,
        waypoints: [{ x: 1300, y: 440 }, { x: 1750, y: 440 }],
      },
    ],
    cameras: [
      { x: 600, y: 370, startAngle: -30, minAngle: -60, maxAngle: 30 },
      { x: 1500, y: 250, startAngle: 20, minAngle: -20, maxAngle: 60 },
    ],
    lasers: [
      { x1: 1200, y1: 370, x2: 1200, y2: 475, onTime: 2500, offTime: 1500 },
      { x1: 800, y1: 125, x2: 800, y2: 235, onTime: 2000, offTime: 2000 },
    ],
    objects: [
      { x: 708, y: 458, type: 'door', locked: true },
      { x: 1208, y: 458, type: 'door', locked: true },
      { x: 1808, y: 458, type: 'door', locked: true },
      { x: 500, y: 210, type: 'computer', linkedId: 'cam1' },
      { x: 1600, y: 330, type: 'safe', locked: true },
      { x: 1815, y: 350, type: 'fuse-box', linkedId: 'laser1' },
      { x: 2300, y: 450, type: 'exit' },
    ],
    loot: [
      { x: 400, y: 320, type: 'coin', value: 10 },
      { x: 550, y: 320, type: 'coin', value: 10 },
      { x: 900, y: 320, type: 'coin', value: 15 },
      { x: 1100, y: 320, type: 'gem', value: 25 },
      { x: 1400, y: 320, type: 'coin', value: 10 },
      { x: 600, y: 200, type: 'gem', value: 25 },
      { x: 1300, y: 200, type: 'coin', value: 15 },
      { x: 1000, y: 80, type: 'main', value: 200, isMain: true },
    ],
    totalLoot: 310,
    tutorials: [],
  },
};
