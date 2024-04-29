import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { textToSpeechAzureAI } from '../services/ttsServiceAzureAI.js';
import { playAudioStream } from '../utils/playAudioStream.js';

// Derive __dirname in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load voice settings from voiceSettings.json
function loadVoiceSettings() {
  const voiceSettingsPath = path.join(__dirname, '../../config/voiceSettings.json');
  const voiceSettings = JSON.parse(fs.readFileSync(voiceSettingsPath, 'utf8'));
  return voiceSettings;
}

export async function processText(text) {
  const voiceSettings = loadVoiceSettings();
  try {
    const audioStream = await textToSpeechAzureAI(text, voiceSettings.voiceName, voiceSettings.options);
    await playAudioStream(audioStream);
    console.log('Playback finished successfully.');
  } catch (error) {
    console.error('Playback failed:', error);
  }
}
