// Import necessary modules
import os from 'os';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import clipboardy from 'clipboardy';
import { textToSpeechAzureAI } from './ttsServiceAzureAI.js';
import { prepareTextForTTS } from './markdownPreprocessor.js';
import { listAudioDevices  } from './audioSource.js';
import { escapeXML } from './xmlEscaper.js';
import Speaker from 'speaker';
import play from 'play-sound';
import fs from 'fs/promises';
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
      console.log(`${chalk.blue('[INFO]')} ${message}`);
      break;
    case 'error':
      console.error(`${chalk.red('[ERROR]')} ${chalk.gray(timestamp)} ${message}`);
      break;
    case 'request':
      console.log(`${chalk.green('[REQUEST]')} ${message}`);
      break;
    default:
      console.log(`${chalk.yellow('[LOG]')} ${message}`);
  }
}

// Initialize Express app
const app = express();
// Use bodyParser middleware for parsing JSON bodies
app.use(bodyParser.json());

// Set the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Initialize variables and configurations
const player = play();
let lastClipboardContent = '';
const ttsQueue = [];
let isProcessingQueue = false;

// Function to clean and prepare text for TTS, then add it to the queue
function addToTTSQueue(text) {
  const processedText = prepareTextForTTS(text);
  const escapedText = escapeXML(processedText);
  ttsQueue.push(escapedText);
  console.log(`New message added to queue. Queue length: ${ttsQueue.length}`);
  processQueue();
}

// Function to process the TTS queue
async function processQueue() {
  if (isProcessingQueue || ttsQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  const textToConvert = ttsQueue.shift();
  log('Starting TTS request for queued message...', 'info');

  try {
    const audioStream = await textToSpeechAzureAI(textToConvert);
    log('TTS request completed.', 'info');

    log('Playing the audio stream...', 'info');
    const speaker = new Speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: 48000,
    });

    audioStream.pipe(speaker);

    speaker.on('close', () => {
      log('Audio playback finished. Processing next item in queue...', 'info');
      isProcessingQueue = false;
      processQueue();
    });
  } catch (error) {
    log(`An error occurred while processing TTS: ${error.message}`, 'error');
    isProcessingQueue = false;
    processQueue();
  }
}

// Function to check the clipboard for new TTS content
async function checkClipboardForTTS() {
  try {
    const currentClipboardContent = clipboardy.readSync();

    if (currentClipboardContent.startsWith('TTS') && currentClipboardContent !== lastClipboardContent) {
      lastClipboardContent = currentClipboardContent;
      let textToConvert = currentClipboardContent.replace('TTS', '').trim();
      addToTTSQueue(textToConvert);
    }
  } catch (error) {
    log('An error occurred while processing TTS:', error);
  }
}

// Define an HTTP POST route for adding text to the TTS queue

app.post('/tts', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send('Text is required');
  }

  // Log the IP address or hostname of the requester
  // Note: req.ip or req.connection.remoteAddress can be used to get the requester's IP

  // Use the log function for structured and colored output
  log(`Received TTS request from ${req.ip} (hostname: ${req.hostname}) with text: ${text}`, 'request');

  addToTTSQueue(text);
  res.send('Text added to TTS queue.');
});


// Start the Express server
app.listen(port, () => {
  const localIP = getLocalIPAddress();
  log(`Server listening at http://localhost:${port} and http://${localIP}:${port}`, 'info');
});

// Start checking the clipboard every second
setInterval(checkClipboardForTTS, 1000);

