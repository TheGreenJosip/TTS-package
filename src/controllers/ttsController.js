/**
 * TTS controller.
 * Orchestrates voice settings, Azure synthesis, and local playback.
 * @module controllers/ttsController
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { textToSpeechAzureAI } from '../services/ttsServiceAzureAI.js';
import { playAudioStream } from '../utils/playAudioStream.js';

// Derive __dirname in ES module.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Loads the default voice + SSML settings from `config/voiceSettings.json`.
 * @returns {{voiceName: string, options: Object}}
 */
function loadVoiceSettings() {
  const voiceSettingsPath = path.join(__dirname, '../../config/voiceSettings.json');
  const voiceSettings = JSON.parse(fs.readFileSync(voiceSettingsPath, 'utf8'));
  return voiceSettings;
}

/**
 * Synthesizes and plays a single text item.
 *
 * @async
 * @param {string} text - SSML-safe text to speak.
 * @param {Object} [options]
 * @param {string|null} [options.voice] - Optional Azure voice override.
 * @returns {Promise<void>}
 */
export async function processText(text, options = {}) {
  const voiceSettings = loadVoiceSettings();
  const voiceName = options.voice || voiceSettings.voiceName;
  try {
    const audioStream = await textToSpeechAzureAI(text, voiceName, voiceSettings.options);
    await playAudioStream(audioStream);
    console.log('Playback finished successfully.');
  } catch (error) {
    console.error('Playback failed:', error);
  }
}
