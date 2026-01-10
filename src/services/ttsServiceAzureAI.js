/**
 * Azure Cognitive Services Speech (TTS) integration.
 * Wraps the Speech SDK and returns audio as a Node stream.
 * @module services/ttsServiceAzureAI
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { PassThrough } from 'stream';
import { generateSSML } from '../utils/ssmlGenerator.js';
import { log } from '../utils/logger.js';

/**
 * Synthesizes speech using Azure Speech SDK.
 *
 * @async
 * @param {string} textInput - Text to synthesize (will be wrapped into SSML).
 * @param {string} [voiceName] - Azure voice short name (e.g. "en-US-AvaNeural").
 * @param {Object} [options] - Prosody/style options passed to the SSML generator.
 * @returns {Promise<import('stream').Readable>} A readable stream of WAV audio.
 */
export async function textToSpeechAzureAI(textInput, voiceName = "en-AU-FreyaNeural", options = {}) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm;

  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  // Use the SSML generator to create the SSML text
  const ssmlText = generateSSML(textInput, voiceName, options);

  return new Promise((resolve, reject) => {
    speechSynthesizer.speakSsmlAsync(
      ssmlText,
      result => {
        speechSynthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const bufferStream = new PassThrough();
          bufferStream.end(Buffer.from(result.audioData));
          resolve(bufferStream);
        } else {
          reject(new Error('Speech synthesis canceled, ' + result.errorDetails));
        }
      },
      error => {
        speechSynthesizer.close();
        reject(error);
      }
    );
  });
}

/**
 * Fetches available voices from Azure.
 *
 * @async
 * @returns {Promise<Array<Object>>} Raw voice objects returned by the Speech SDK.
 */
export async function getAvailableVoices() {
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  try {
    const result = await speechSynthesizer.getVoicesAsync();
    if (result.reason === sdk.ResultReason.VoicesListRetrieved) {
      return result.voices;
    } else {
      log(`Error retrieving voices: ${result.errorDetails || 'unknown error'}`, 'error');
      return [];
    }
  } catch (error) {
    log(`Exception retrieving voices: ${error?.message || String(error)}`, 'error');
    return [];
  } finally {
    speechSynthesizer.close();
  }
}