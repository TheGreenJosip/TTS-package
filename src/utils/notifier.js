import notifier from 'node-notifier';

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
