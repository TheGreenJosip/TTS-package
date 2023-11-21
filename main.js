// main.js
import dotenv from 'dotenv';
import { listFiles, getTextFromFile, chooseFile } from './fileSelector.js';
import { textToSpeechAzureAI } from './tts-provider/ttsServiceAzureAI.js';
import { textToSpeechOpenAI } from './tts-provider/ttsServiceOpenAI.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import play from 'play-sound';
import Speaker from 'speaker';
import { createWriteStream } from 'fs';

// Load environment variables from .env file
dotenv.config();

const player = play();

// ANSI escape code for bold text
const BOLD = '\x1b[1m';
// ANSI escape code to reset text formatting
const RESET = '\x1b[0m';

// Get the directory name equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureRecordingsDirExists(recordingsDir) {
  try {
    await fs.access(recordingsDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(recordingsDir);
    } else {
      throw error;
    }
  }
}

async function main() {
  try {
    const recordingsDir = path.resolve(__dirname, 'recordings');
    await ensureRecordingsDirExists(recordingsDir);

    const args = process.argv.slice(2);
    let textInput = '';
    let filePath = '';

    // Determine the source of the text input
    if (args.length > 0 && args[0] !== '-file') {
      textInput = args.join(' ');
    } else if (args.length > 1 && args[0] === '-file') {
      filePath = path.resolve(args[1]);
      textInput = await getTextFromFile(filePath);
    } else {
      const filesDirectory = path.join(__dirname, 'files');
      const files = await listFiles(filesDirectory);
      if (files.length === 0) {
        console.log('No text or PDF files found in the files directory.');
        return;
      }
      const selectedFileName = await chooseFile(files);
      filePath = path.join(filesDirectory, selectedFileName);
      textInput = await getTextFromFile(filePath);
    }

    // Determine TTS service based on environment variable
    const ttsServiceName = process.env.TTS_SERVICE || 'openai';
    console.log(`\nStarting TTS request with ${BOLD}${ttsServiceName.toUpperCase()}${RESET}\n`);

    // Perform TTS conversion and play audio
    if (ttsServiceName === 'azureai') {
      const audioStream = await textToSpeechAzureAI(textInput);
      console.log('TTS request completed.');

      console.log('Playing audio stream...');
      const speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 48000,
      });

      audioStream.pipe(speaker);
      speaker.on('close', () => console.log('Audio playback finished.'));

      /*
      // Save the audio to a file in the /recordings directory
      const outputFile = path.join(recordingsDir, 'azureai-output.wav');
      const writeStream = createWriteStream(outputFile);
      audioStream.pipe(writeStream);
      writeStream.on('finish', () => {
        console.log(`Audio saved to file: ${outputFile}`);
      });
      */

    } else if (ttsServiceName === 'openai') {
      const audioStream = await textToSpeechOpenAI(textInput);
      console.log('TTS request completed.');

      const tempFilePath = path.join(recordingsDir, 'temp-tts-output.mp3');
      const writeStream = createWriteStream(tempFilePath);
      audioStream.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('Playing the audio file...');
        player.play(tempFilePath, (err) => {
          if (err) console.error('Error playing the file:', err);
          fs.unlink(tempFilePath, (err) => {
            if (err) console.error('Error deleting the temp file:', err);
            else console.log('Temp file deleted.');
          });
        });
      });

      /*
      // Save the audio to a file in the /recordings directory
      const outputFile = path.join(recordingsDir, 'openai-output.mp3');
      const writeStream = createWriteStream(outputFile);
      audioStream.pipe(writeStream);
      writeStream.on('finish', () => {
        console.log(`Audio saved to file: ${outputFile}`);
      });
      */

    } else {
      throw new Error('Unknown TTS service provider');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
