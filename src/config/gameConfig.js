/**
 * gameConfig.js - Configuració global del joc
 * 
 * Conté totes les constants de disseny del joc: velocitats, gravetat,
 * rangs de detecció, temporitzacions, etc.
 * Centralitzar aquests valors permet ajustar el balanceig del joc fàcilment.
 */

// === CONFIGURACIÓ DEL JUGADOR ===
export const PLAYER_CONFIG = {
  // Velocitat de moviment horitzontal (píxels/segon)
  SPEED: 160,
  // Velocitat quan s'ajup o es mou sigilosament
  SNEAK_SPEED: 80,
  // Velocitat de pujar escales
  CLIMB_SPEED: 120,
  // Força del salt (píxels/segon, negatiu perquè va cap amunt)
  JUMP_FORCE: -300,
  // Vida màxima del jugador
  MAX_HEALTH: 3,
  // Rang d'interacció amb objectes (píxels)
  INTERACT_RANGE: 40,
  // Temps d'invulnerabilitat després de rebre dany (ms)
  INVULNERABLE_TIME: 1500,
  // Durada de l'animació de noquejat (ms)
  KNOCKOUT_DURATION: 400,
};

// === CONFIGURACIÓ DELS GUARDES ===
export const GUARD_CONFIG = {
  // Velocitat de patrulla normal
  PATROL_SPEED: 60,
  // Velocitat de persecució
  CHASE_SPEED: 130,
  // Distància de visió del guarda (píxels)
  VISION_RANGE: 180,
  // Angle del con de visió (graus)
  VISION_ANGLE: 70,
  // Temps d'espera als punts de patrulla (ms)
  WAIT_TIME: 2000,
  // Temps per passar d'alerta a persecució (ms)
  ALERT_TIME: 800,
  // Temps que el guarda roman noquejat (ms)
  KNOCKOUT_TIME: 10000,
  // Distància d'atac cos a cos (píxels)
  ATTACK_RANGE: 35,
};

// === CONFIGURACIÓ DE LES CÀMERES DE SEGURETAT ===
export const CAMERA_CONFIG = {
  // Velocitat de rotació (graus/segon)
  ROTATION_SPEED: 30,
  // Angle mínim de rotació (graus)
  MIN_ANGLE: -60,
  // Angle màxim de rotació (graus)
  MAX_ANGLE: 60,
  // Distància de detecció (píxels)
  DETECTION_RANGE: 200,
  // Angle del con de detecció (graus)
  CONE_ANGLE: 45,
};

// === CONFIGURACIÓ DELS LÀSERS ===
export const LASER_CONFIG = {
  // Temps que el làser està activat (ms)
  ON_TIME: 2000,
  // Temps que el làser està desactivat (ms)
  OFF_TIME: 1500,
  // Color del làser
  COLOR: 0xff0044,
  // Amplada del raig
  WIDTH: 3,
};

// === CONFIGURACIÓ DEL SIGIL ===
export const STEALTH_CONFIG = {
  // Opacitat del jugador quan està amagat a les ombres
  SHADOW_ALPHA: 0.3,
  // Opacitat normal del jugador
  NORMAL_ALPHA: 1.0,
  // Temps per ser detectat quan és visible (ms)
  DETECTION_TIME: 600,
};

// === CONFIGURACIÓ DELS MINI-JOCS ===
export const MINIGAME_CONFIG = {
  // Nombre de clics per forçar un pany
  LOCK_PICK_CLICKS: 6,
  // Temps límit per forçar un pany (ms)
  LOCK_PICK_TIME: 8000,
  // Llargada de la seqüència de hackeig
  HACK_SEQUENCE_LENGTH: 5,
  // Temps per completar el hackeig (ms)
  HACK_TIME: 10000,
};

// === CONFIGURACIÓ DE LA PANTALLA ===
export const SCREEN_CONFIG = {
  // Resolució del joc
  WIDTH: 960,
  HEIGHT: 540,
  // Mida dels tiles del tilemap
  TILE_SIZE: 32,
};

// === CONFIGURACIÓ D'ÀUDIO ===
export const AUDIO_CONFIG = {
  // Volum de la música de fons (0-1)
  MUSIC_VOLUME: 0.4,
  // Volum dels efectes de so (0-1)
  SFX_VOLUME: 0.6,
};

// === COLORS DEL JOC ===
export const COLORS = {
  // Colors principals de la paleta
  BACKGROUND: 0x0a0a12,
  DARK_BLUE: 0x1a1a2e,
  MEDIUM_BLUE: 0x16213e,
  ACCENT_BLUE: 0x64b5f6,
  LIGHT_BLUE: 0x90caf9,
  
  // Colors d'estat
  DANGER: 0xff4444,
  WARNING: 0xffaa00,
  SUCCESS: 0x4caf50,
  GOLD: 0xffd700,
  
  // Colors d'entorn
  SHADOW: 0x111122,
  LIGHT: 0xffffee,
  WALL: 0x2d2d44,
  FLOOR: 0x3d3d55,
  
  // Colors d'UI
  UI_BG: 0x1a1a2e,
  UI_BORDER: 0x64b5f6,
  UI_TEXT: 0xffffff,
};
