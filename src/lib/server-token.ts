/**
 * A unique token generated at server startup.
 * When the server restarts, this value changes, making all existing
 * iron-session cookies invalid — forcing users to log in again.
 */
export const SERVER_TOKEN = Date.now().toString()
