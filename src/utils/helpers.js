/**
 * helpers.js - Funcions auxiliars reutilitzables
 * 
 * Conté funcions matemàtiques, de geometria, i utilitats
 * que s'usen a diverses parts del joc.
 */

/**
 * Calcula la distància entre dos punts
 * @param {number} x1 - Coordenada X del primer punt
 * @param {number} y1 - Coordenada Y del primer punt
 * @param {number} x2 - Coordenada X del segon punt
 * @param {number} y2 - Coordenada Y del segon punt
 * @returns {number} Distància en píxels
 */
export function distanceBetween(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Calcula l'angle entre dos punts (en radians)
 * @returns {number} Angle en radians
 */
export function angleBetween(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Converteix graus a radians
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converteix radians a graus
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Comprova si un punt està dins d'un con de visió
 * Usat per guardes i càmeres per detectar el jugador
 * 
 * @param {number} originX - X de l'origen del con
 * @param {number} originY - Y de l'origen del con
 * @param {number} targetX - X del punt a comprovar
 * @param {number} targetY - Y del punt a comprovar
 * @param {number} facingAngle - Angle de la direcció de visió (radians)
 * @param {number} coneAngle - Amplada del con (graus)
 * @param {number} range - Distància màxima del con (píxels)
 * @returns {boolean} True si el punt és dins del con
 */
export function isInVisionCone(originX, originY, targetX, targetY, facingAngle, coneAngle, range) {
  // Primer, comprovar si està dins del rang
  const dist = distanceBetween(originX, originY, targetX, targetY);
  if (dist > range) return false;

  // Calcular l'angle cap al punt objectiu
  const angleToTarget = angleBetween(originX, originY, targetX, targetY);

  // Calcular la diferència d'angle (normalitzada)
  let angleDiff = angleToTarget - facingAngle;
  // Normalitzar entre -PI i PI
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

  // Comprovar si està dins del con
  const halfCone = degToRad(coneAngle / 2);
  return Math.abs(angleDiff) <= halfCone;
}

/**
 * Interpola linealment entre dos valors
 * Útil per a animacions suaus
 */
export function lerp(start, end, t) {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

/**
 * Genera un número aleatori entre min i max (inclosos)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Converteix un color hexadecimal a format rgba
 * @param {number} hex - Color en format 0xRRGGBB
 * @param {number} alpha - Opacitat (0-1)
 * @returns {string} Color en format 'rgba(r,g,b,a)'
 */
export function hexToRGBA(hex, alpha = 1) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Guarda dades al localStorage de forma segura
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('No s\'ha pogut guardar al localStorage:', e);
  }
}

/**
 * Llegeix dades del localStorage de forma segura
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.warn('No s\'ha pogut llegir del localStorage:', e);
    return defaultValue;
  }
}
