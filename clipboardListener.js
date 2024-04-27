// clipboardListener.js

// Import necessary modules
import os from 'os';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import clipboardy from 'clipboardy';
import { textToSpeechAzureAI } from './ttsServiceAzureAI.js';
import { prepareTextForTTS } from './markdownPreprocessor.js';
import { escapeXML } from './xmlEscaper.js';
import { extractTextFromURL } from './textExtractor.js';
import Speaker from 'speaker';
import { PassThrough } from 'stream';
import chalk from 'chalk';

// Load environment variables from .env file
dotenv.config();

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '0.0.0.0';
}

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  switch (level) {
    case 'info':
      console.log(`${chalk.blue('[INFO]')} ${timestamp} ${message}`);
      break;
    case 'error':
      console.error(`${chalk.red('[ERROR]')} ${timestamp} ${message}`);
      break;
    case 'request':
      console.log(`${chalk.green('[REQUEST]')} ${timestamp} ${message}`);
      break;
    default:
      console.log(`${chalk.yellow('[LOG]')} ${timestamp} ${message}`);
  }
}

function sendNotification(message) {
  exec(`terminal-notifier -message "${message}" -title "TTS-listener"`, (error) => {
    if (error) {
      console.error(`Notification error: ${error}`);
    }
  });
}

// Initialize Express app
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

let lastClipboardContent = '';
const ttsQueue = [];
let isProcessingQueue = false;
let currentSpeaker = null;
let audioStreamPassThrough = new PassThrough();

async function playAudioStream(audioStream) {
  if (currentSpeaker) {
    currentSpeaker.end();
  }

  audioStreamPassThrough = new PassThrough();
  audioStream.pipe(audioStreamPassThrough);

  const speaker = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 48000,
  });

  currentSpeaker = speaker;
  audioStreamPassThrough.pipe(speaker);

  return new Promise((resolve, reject) => {
    speaker.on('close', resolve);
    speaker.on('error', reject);
  });
}

function addToTTSQueue(text) {
  const processedText = prepareTextForTTS(text);
  const escapedText = escapeXML(processedText);
  ttsQueue.push(escapedText);
  sendNotification('New TTS input received.');
  log('New message added to queue. Queue length: ' + ttsQueue.length);
  processQueue();
}

async function processQueue() {
  if (isProcessingQueue || ttsQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  const textToConvert = ttsQueue.shift();
  log('Starting TTS request for queued message...');

  try {
    const audioStream = await textToSpeechAzureAI(textToConvert);
    log('TTS request completed.');
    log('Playing the audio stream...');

    await playAudioStream(audioStream);

    log('Audio playback finished. Processing next item in queue...');
    isProcessingQueue = false;
    processQueue();
  } catch (error) {
    log('An error occurred while processing TTS: ' + error.message, 'error');
    isProcessingQueue = false;
    processQueue();
  }
}

function stopCurrentTTS() {
  if (audioStreamPassThrough) {
    audioStreamPassThrough.unpipe();
    if (currentSpeaker) {
      currentSpeaker.end();
    }
  }
  ttsQueue.length = 0;
  isProcessingQueue = false;
  sendNotification('TTS playback stopped.');
}

async function checkClipboardForTTS() {
  try {
    const currentClipboardContent = clipboardy.readSync();
    const triggerWord = process.env.TRIGGER_WORD || 'TTS'; // Default to 'TTS' if not set
    const triggerRegex = new RegExp(`^${triggerWord}`, 'i'); // 'i' makes it case-insensitive

    if (triggerRegex.test(currentClipboardContent) && currentClipboardContent !== lastClipboardContent) {
      lastClipboardContent = currentClipboardContent;
      let textToConvert = currentClipboardContent.replace(triggerRegex, '').trim();
      addToTTSQueue(textToConvert);
    }
  } catch (error) {
    log('An error occurred while processing TTS: ' + error, 'error');
  }
}

app.post('/tts', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send('Text is required');
  }
  addToTTSQueue(text);
  res.send('Text added to TTS queue.');
});

app.post('/extract-text', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send('URL is required');
  }
  try {
    const text = await extractTextFromURL(url);
    addToTTSQueue(text);
    res.send('Text extracted and added to TTS queue.');
  } catch (error) {
    res.status(500).send('Error processing your request: ' + error.message);
  }
});

app.post('/stop-tts', (req, res) => {
  stopCurrentTTS();
  res.send('TTS playback stopped and queue cleared.');
});

app.listen(port, () => {
  const localIP = getLocalIPAddress();
  log(`Server listening at http://localhost:${port} and http://${localIP}:${port}`);
});

setInterval(checkClipboardForTTS, 1000);

