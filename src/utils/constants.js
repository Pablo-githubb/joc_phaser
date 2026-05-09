/**
 * constants.js - Constants globals del joc
 * 
 * Defineix els noms d'escenes, events personalitzats,
 * claus d'assets, i tipus d'objectes interactius.
 */

// === NOMS DE LES ESCENES ===
// Usem constants per evitar errors tipogràfics en les referències
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  LEVEL_SELECT: 'LevelSelectScene',
  GAME: 'GameScene',
  HUD: 'HUDScene',
  PAUSE: 'PauseScene',
  GAME_OVER: 'GameOverScene',
};

// === EVENTS PERSONALITZATS ===
// Events emesos entre escenes i entitats per comunicar-se
export const EVENTS = {
  // Events del jugador
  PLAYER_DETECTED: 'player-detected',
  PLAYER_HIDDEN: 'player-hidden',
  PLAYER_DAMAGED: 'player-damaged',
  PLAYER_DIED: 'player-died',

  // Events de botí
  LOOT_COLLECTED: 'loot-collected',
  MAIN_LOOT_COLLECTED: 'main-loot-collected',

  // Events de seguretat
  ALARM_TRIGGERED: 'alarm-triggered',
  CAMERA_DISABLED: 'camera-disabled',
  GUARD_KNOCKED: 'guard-knocked',

  // Events de mini-joc
  MINIGAME_START: 'minigame-start',
  MINIGAME_SUCCESS: 'minigame-success',
  MINIGAME_FAIL: 'minigame-fail',

  // Events de nivell
  LEVEL_COMPLETE: 'level-complete',
  LEVEL_FAILED: 'level-failed',

  // Events d'UI
  UPDATE_HUD: 'update-hud',
  PAUSE_GAME: 'pause-game',
  RESUME_GAME: 'resume-game',
};

// === CLAUS D'ASSETS ===
// Identifiquen els assets carregats a la memòria
export const ASSETS = {
  // Spritesheets
  PLAYER: 'player-sprite',
  GUARD: 'guard-sprite',
  
  // Imatges
  TILESET: 'building-tileset',
  LOGO: 'game-logo',
  MENU_BG: 'menu-background',
  
  // Àudio
  MUSIC_MENU: 'music-menu',
  MUSIC_STEALTH: 'music-stealth',
  MUSIC_ALERT: 'music-alert',
  SFX_FOOTSTEP: 'sfx-footstep',
  SFX_DOOR: 'sfx-door',
  SFX_ALARM: 'sfx-alarm',
  SFX_COIN: 'sfx-coin',
  SFX_KNOCKOUT: 'sfx-knockout',
  SFX_LOCKPICK: 'sfx-lockpick',
  SFX_SUCCESS: 'sfx-success',
};

// === TIPUS D'OBJECTES INTERACTIUS ===
export const INTERACTIVE_TYPES = {
  DOOR: 'door',
  LOCKER: 'locker',
  COMPUTER: 'computer',
  SAFE: 'safe',
  FUSE_BOX: 'fuse-box',
  EXIT: 'exit',
};

// === ESTATS DEL GUARDA ===
export const GUARD_STATES = {
  PATROL: 'patrol',
  IDLE: 'idle',
  ALERT: 'alert',
  CHASE: 'chase',
  KNOCKOUT: 'knockout',
  RETURN: 'return',
};

// === ESTATS DEL JUGADOR ===
export const PLAYER_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  SNEAKING: 'sneaking',
  CLIMBING: 'climbing',
  HIDING: 'hiding',
  INTERACTING: 'interacting',
  KNOCKOUT_ANIM: 'knockout-anim',
  DAMAGED: 'damaged',
};

// === DIRECCIONS ===
export const DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
};
