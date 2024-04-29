// playAudioStream.js

/**
 * This version of playAudioStream.js defines a playAudioStream 
 * function that takes an audio stream as its parameter, pipes it through a PassThrough stream, 
 * and then pipes it to the speaker for playback. The function returns a Promise that resolves 
 * when playback finishes or rejects if an error occurs, making it easier to work with in asynchronous code.
 */

import Speaker from 'speaker';
import { PassThrough } from 'stream';

/**
 * Plays the given audio stream through the speakers.
 * @param {Stream} audioStream - The audio stream to play.
 */
export function playAudioStream(audioStream) {
  // Create a new instance of Speaker for each call to handle different audio streams
  const speaker = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 48000,
  });

  // Create a PassThrough stream to pipe the audioStream through
  // This allows for handling the audio stream as it is received
  const passThrough = new PassThrough();
  audioStream.pipe(passThrough);

  // Pipe the processed audio stream to the speaker
  passThrough.pipe(speaker);

  return new Promise((resolve, reject) => {
    speaker.on('close', resolve);
    speaker.on('error', reject);
  });
}
