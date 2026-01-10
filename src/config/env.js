/**
 * Environment configuration loader/validator.
 * Centralizes env access, applies defaults, and fails fast on missing required settings.
 * @module config/env
 */

import dotenv from 'dotenv';

/**
 * @typedef {Object} AppConfig
 * @property {string} speechKey
 * @property {string} speechRegion
 * @property {number} port
 * @property {string} triggerWord
 * @property {number} maxQueueLength
 * @property {number} ttsMaxRetries
 * @property {number} ttsRetryBaseDelayMs
 */

let cachedConfig = null;

/**
 * Reads an environment variable and throws if it is missing.
 * @param {string} name - Environment variable name.
 * @returns {string} The value.
 */
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Parses a value as integer and falls back if parsing fails.
 * @param {unknown} value - Value to parse.
 * @param {number} fallback - Default if value is not a valid integer.
 * @returns {number}
 */
function toInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Loads and validates environment variables.
 *
 * - Loads from `.env` (if present)
 * - Validates required vars
 * - Applies safe defaults for optional vars
 *
 * @returns {AppConfig}
 */
export function loadConfig() {
  if (cachedConfig) return cachedConfig;

  dotenv.config();

  const speechKey = requireEnv('SPEECH_KEY');
  const speechRegion = requireEnv('SPEECH_REGION');

  const port = toInt(process.env.PORT, 4753);
  const triggerWord = process.env.TRIGGER_WORD || 'TTS';

  const maxQueueLength = toInt(process.env.MAX_QUEUE_LENGTH, 100);
  const ttsMaxRetries = toInt(process.env.TTS_MAX_RETRIES, 2);
  const ttsRetryBaseDelayMs = toInt(process.env.TTS_RETRY_BASE_DELAY_MS, 500);

  cachedConfig = {
    speechKey,
    speechRegion,
    port,
    triggerWord,
    maxQueueLength,
    ttsMaxRetries,
    ttsRetryBaseDelayMs
  };

  return cachedConfig;
}
