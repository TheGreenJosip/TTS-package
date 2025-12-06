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

export async function getVoices() {
  try {
    const voices = await getAvailableVoices();
    // Transform or filter if necessary, but returning raw list is fine for now
    return voices.map(v => ({
      name: v.shortName,
      displayName: `${v.localName} (${v.locale})`,
      locale: v.locale,
      gender: v.gender
    }));
  } catch (error) {
    console.error('Failed to get voices:', error);
    return [];
  }
}
