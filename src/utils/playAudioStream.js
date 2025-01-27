/**
 * playAudioStream.js
 * 
 * This script defines a `playAudioStream` function that takes an audio stream as input,
 * writes it to a temporary file, and plays it using the `play-sound` module. 
 * The function ensures proper cleanup of the temporary file after playback.
 * 
 * The `play-sound` module is used to shell out to an available audio player on the system.
 * This approach is compatible with Apple Silicon (M1/M2/M3) and other platforms.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { PassThrough } from 'stream';
import { promisify } from 'util';
import player from 'play-sound';

// Promisify the `fs.unlink` function for easier async/await usage
const unlinkAsync = promisify(fs.unlink);

// Create an instance of the `play-sound` player
const audioPlayer = player();

/**
 * Plays the given audio stream by writing it to a temporary file and using `play-sound` to play it.
 * @param {Stream} audioStream - The audio stream to play.
 * @returns {Promise<void>} - Resolves when playback finishes or rejects if an error occurs.
 */
export async function playAudioStream(audioStream) {
  // Step 1: Create a temporary file to store the audio data
  const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  // Step 2: Write the audio stream to the temporary file
  await new Promise((resolve, reject) => {
    const passThrough = new PassThrough(); // PassThrough stream to handle the audio data
    const writeStream = fs.createWriteStream(tempFilePath);

    // Pipe the audio stream through the PassThrough and into the file
    audioStream.pipe(passThrough).pipe(writeStream);

    // Resolve the promise when the file is fully written
    writeStream.on('finish', resolve);

    // Reject the promise if an error occurs during writing
    writeStream.on('error', (err) => {
      reject(new Error(`Failed to write audio stream to file: ${err.message}`));
    });
  });

  // Step 3: Play the audio file using `play-sound`
  return new Promise((resolve, reject) => {
    audioPlayer.play(tempFilePath, (err) => {
      // Step 4: Clean up the temporary file after playback
      unlinkAsync(tempFilePath).catch((cleanupErr) => {
        console.error(`Failed to delete temporary file: ${cleanupErr.message}`);
      });

      // Handle playback errors
      if (err) {
        reject(new Error(`Failed to play audio: ${err.message}`));
      } else {
        resolve(); // Playback finished successfully
      }
    });
  });
}
