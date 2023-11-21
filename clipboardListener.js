//////
//clipboardListener.js
// To start in the background: npm install pm2; pm2 start clipboardListener.js --name="clipboard-listener"
// To stop: pm2 stop clipboard-listener
//////

import dotenv from 'dotenv';
import clipboardy from 'clipboardy';
import { textToSpeechAzureAI } from './tts-provider/ttsServiceAzureAI.js';
import { textToSpeechOpenAI } from './tts-provider/ttsServiceOpenAI.js';
import Speaker from 'speaker';
import play from 'play-sound';
import fs from 'fs/promises';

// ANSI escape code for bold text
const BOLD = '\x1b[1m';
// ANSI escape code to reset text formatting
const RESET = '\x1b[0m';

// Load the .env file
dotenv.config();

// Store the last clipboard content to check for changes
let lastClipboardContent = '';
const player = play();

// Print welcome message with the TTS provider in bold
const ttsServiceName = process.env.TTS_SERVICE || 'openai';
console.log(`Welcome - Clipboard listener started with TTS-provider ${BOLD}${ttsServiceName.toUpperCase()}${RESET}\n`);

async function checkClipboardForTTS() {
  try {
    const currentClipboardContent = clipboardy.readSync();

    if (currentClipboardContent.startsWith('TTS') && currentClipboardContent !== lastClipboardContent) {
      lastClipboardContent = currentClipboardContent;
      const textToConvert = currentClipboardContent.replace('TTS', '').trim();

      console.log('\nStarting TTS request...');
      if (ttsServiceName === 'azureai') {
        const audioStream = await textToSpeechAzureAI(textToConvert);
        console.log('TTS request completed.');

        console.log('Playing the audio stream...');
        const speaker = new Speaker({
	 	      channels: 1, // mono
		      bitDepth: 16,
		      sampleRate: 48000, // Adjusted to match the high-fidelity format
	      });

        // Pre-buffering: Add a short delay before piping to the speaker
        setTimeout(() => {
        audioStream.pipe(speaker);
          }, 10); // Delay in milliseconds

        speaker.on('flush', () => {
        console.log('Audio data has been flushed to the hardware.');
        });
        speaker.on('close', () => {
        console.log('Audio playback finished.');
        });
      } else if (ttsServiceName === 'openai') {
        const audioBuffer = await textToSpeechOpenAI(textToConvert);
        console.log('TTS request completed.');

        // Save the buffer to a temporary file and play it
        const tempFilePath = 'temp-tts-output.mp3';
        await fs.writeFile(tempFilePath, audioBuffer);
        console.log('Playing the audio file...');
        player.play(tempFilePath, async (err) => {
          if (err) {
            console.error('Error playing the file:', err);
          }
          // The "Audio playback finished." message is intentionally omitted here
          // to prevent it from being logged twice.
          // Delete the temporary file after playback
          await fs.unlink(tempFilePath);
        });
      } else {
        throw new Error('Unknown TTS service provider');
      }
    }
  } catch (error) {
    console.error('An error occurred while processing TTS:', error);
  }
}

// Poll the clipboard content every second (1000 milliseconds)
setInterval(checkClipboardForTTS, 1000);
