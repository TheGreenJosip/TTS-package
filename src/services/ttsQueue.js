// ttsQueue.js
// This module will manage the queue of text inputs waiting to be processed.

import { processText } from '../controllers/ttsController.js'; // Ensure this path is correct

class TTSQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(text) {
    this.queue.push(text);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const textToConvert = this.queue.shift();

    try {
      // Use the processText function from ttsController to process the text
      await processText(textToConvert);
    } catch (error) {
      console.error('Error processing text:', error);
    } finally {
      this.isProcessing = false;
      // Continue processing the next item in the queue if any
      this.processQueue();
    }
  }

  // Method to clear the queue and stop current processing
  clear() {
    this.queue = []; // Clear the queue
    this.isProcessing = false; // Reset the processing flag
    // Optionally, you might want to implement additional logic to stop the current TTS processing immediately
  }
}

export const ttsQueue = new TTSQueue();
