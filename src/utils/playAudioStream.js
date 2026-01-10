/**
 * Audio playback helper.
 * Writes a stream to a temporary WAV file and plays it via an available system player.
 * @module utils/playAudioStream
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
 * Plays the given audio stream.
 *
 * @async
 * @param {import('stream').Readable} audioStream - Audio stream to play.
 * @returns {Promise<void>} Resolves when playback finishes.
 */
export async function playAudioStream(audioStream) {
  // Step 1: Create a temporary file to store the audio data
  const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  // Step 2: Write the audio stream to the temporary file.
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

  // Step 3: Play the audio file using `play-sound`.
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
