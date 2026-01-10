/**
 * In-memory TTS queue.
 *
 * Serializes speech synthesis/playback to avoid overlapping audio.
 * Provides pause/resume, bounded queue size, and per-item retry with backoff.
 *
 * @module services/ttsQueue
 */

import { processText } from '../controllers/ttsController.js'; // Ensure this path is correct
import { loadConfig } from '../config/env.js';
import { log } from '../utils/logger.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simple FIFO queue for text-to-speech work.
 */
class TTSQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.isPaused = false;
    this.stopToken = 0;
  }

  /**
   * Enqueues a text item for synthesis.
   * Rejects when the queue reaches MAX_QUEUE_LENGTH.
   *
   * @param {string} text - SSML-safe text to speak.
   * @param {Object} [options] - Per-item options.
   * @param {string|null} [options.voice] - Optional Azure voice name override.
   * @returns {boolean} True if accepted, false if rejected.
   */
  enqueue(text, options = {}) {
    const config = loadConfig();
    if (this.queue.length >= config.maxQueueLength) {
      // Reject predictable: do not drop messages silently.
      return false;
    }

    this.queue.push({ text, options });
    this.processQueue();
    return true;
  }

  /** Pauses queue processing (items remain queued). */
  pause() {
    this.isPaused = true;
    log('TTS Queue paused.');
  }

  /** Resumes queue processing. */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      log('TTS Queue resumed.');
      this.processQueue();
    }
  }

  /**
   * Processes the queue sequentially.
   * Retries transient failures using exponential backoff.
   * @returns {Promise<void>}
   */
  async processQueue() {
    if (this.isProcessing || this.isPaused || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const myStopToken = this.stopToken;
    const item = this.queue.shift();
    const { text, options } = item;

    try {
      const config = loadConfig();

      // If queue was cleared while we were waiting to process, drop this item.
      if (myStopToken !== this.stopToken) {
        return;
      }

      // Use the processText function from ttsController to process the text (with retry)
      const attempts = Math.max(0, config.ttsMaxRetries) + 1;
      let lastError;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          await processText(text, options);
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          const isLast = attempt === attempts;
          log(`TTS item failed (attempt ${attempt}/${attempts}): ${err?.message || String(err)}`, 'error');
          if (!isLast) {
            const delay = config.ttsRetryBaseDelayMs * (2 ** (attempt - 1));
            await sleep(delay);
          }
        }
      }

      if (lastError) {
        throw lastError;
      }
    } catch (error) {
      log(`Error processing text: ${error?.message || String(error)}`, 'error');
    } finally {
      this.isProcessing = false;
      // Continue processing the next item in the queue if any
      this.processQueue();
    }
  }

  /**
   * Clears queued items.
   * Note: cannot reliably cancel in-flight Azure synthesis or OS-level audio playback.
   */
  clear() {
    this.queue = []; // Clear the queue
    this.isProcessing = false; // Reset the processing flag
    this.isPaused = false;
    this.stopToken++;
    // Note: this cannot reliably cancel in-flight Azure synthesis/audio playback.
  }
}

export const ttsQueue = new TTSQueue();
