/**
 * Desktop notification helper (best-effort).
 * Uses OS notifications when available; failures are intentionally silent.
 * @module utils/notifier
 */

import notifier from 'node-notifier';

/**
 * Sends a desktop notification.
 * @param {string} message - Notification body.
 */
function sendNotification(message) {
  notifier.notify({
    title: 'TTS-listener',
    message: message
  }, function (err, response) {
    if (err) {
      // Suppress error logging to avoid spamming console if notification fails
      // console.error(`Notification error: ${err}`);
    }
  });
}

export { sendNotification };
