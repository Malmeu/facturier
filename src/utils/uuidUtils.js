/**
 * Utilitaires pour la génération et la gestion des UUIDs
 */

/**
 * Génère un UUID v4 valide
 * @returns {string} UUID v4 valide
 */
export const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Vérifie si une chaîne est un UUID valide
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean} true si la chaîne est un UUID valide
 */
export const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Convertit un ID existant en UUID si nécessaire
 * @param {string|null} existingId - ID existant ou null
 * @returns {string} UUID valide
 */
export const ensureUUID = (existingId) => {
  if (!existingId) return generateUUID();
  if (isValidUUID(existingId)) return existingId;
  return generateUUID();
};
