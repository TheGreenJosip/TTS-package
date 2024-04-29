// clipboardListener.js

// Import necessary modules
import os from 'os';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import clipboardy from 'clipboardy';
import { prepareTextForTTS } from '../preprocessors/markdownPreprocessor.js';
import { escapeXML } from '../preprocessors/xmlEscaper.js';
import { extractTextFromURL } from '../services/textExtractor.js';
import chalk from 'chalk';
import { ttsQueue } from '../services/ttsQueue.js'; // Import the ttsQueue module

import { log } from '../utils/logger.js';
import { sendNotification } from '../utils/notifier.js';

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

// Function to initialize and start the clipboard listener
export function startClipboardListener() {
  // Initialize Express app
  const app = express();
  app.use(bodyParser.json());

  const port = process.env.PORT || 3000;

  let lastClipboardContent = '';

  // Function to check clipboard content for TTS processing
  async function checkClipboardForTTS() {
    try {
      const currentClipboardContent = clipboardy.readSync();
      const triggerWord = process.env.TRIGGER_WORD || 'TTS'; // Default to 'TTS' if not set
      const triggerRegex = new RegExp(`^${triggerWord}`, 'i'); // 'i' makes it case-insensitive

      if (triggerRegex.test(currentClipboardContent) && currentClipboardContent !== lastClipboardContent) {
        lastClipboardContent = currentClipboardContent;
        let textToConvert = currentClipboardContent.replace(triggerRegex, '').trim();
        const processedText = prepareTextForTTS(textToConvert);
        const escapedText = escapeXML(processedText);
        ttsQueue.enqueue(escapedText); // Use the ttsQueue to enqueue the text
        sendNotification('New TTS input received.');
        log('New message added to queue. Queue length: ' + ttsQueue.queue.length);
      }
    } catch (error) {
      log('An error occurred while processing TTS: ' + error, 'error');
    }
  }

  // Express routes for TTS processing
  app.post('/tts', (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).send('Text is required');
    }
    const processedText = prepareTextForTTS(text);
    const escapedText = escapeXML(processedText);
    ttsQueue.enqueue(escapedText); // Use the ttsQueue to enqueue the text
    res.send('Text added to TTS queue.');
  });

  app.post('/extract-text', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).send('URL is required');
    }
    try {
      const text = await extractTextFromURL(url);
      const processedText = prepareTextForTTS(text);
      const escapedText = escapeXML(processedText);
      ttsQueue.enqueue(escapedText); // Use the ttsQueue to enqueue the text
      res.send('Text extracted and added to TTS queue.');
    } catch (error) {
      res.status(500).send('Error processing your request: ' + error.message);
    }
  });

  app.post('/stop-tts', (req, res) => {
    ttsQueue.clear(); // Clear the TTS queue
    res.send('TTS playback stopped and queue cleared.');
  });

  // Start the Express server
  app.listen(port, () => {
    const localIP = getLocalIPAddress();
    log(`Server listening at http://localhost:${port} and http://${localIP}:${port}`);
  });

  // Start checking the clipboard content periodically
  setInterval(checkClipboardForTTS, 1000);
}