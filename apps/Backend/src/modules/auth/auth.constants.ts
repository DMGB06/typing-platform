export const ACCESS_TOKEN_COOKIE = 'access_token';

// Duración de sesión: la cookie y el JWT deben expirar juntos, si no el
// usuario ve la cookie viva con un token ya inválido.
export const SESSION_EXPIRES_IN = '1d';
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const REMEMBER_ME_EXPIRES_IN = '30d';
export const REMEMBER_ME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
