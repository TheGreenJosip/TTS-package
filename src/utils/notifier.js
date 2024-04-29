import { exec } from 'child_process';

function sendNotification(message) {
  exec(`terminal-notifier -message "${message}" -title "TTS-listener"`, (error) => {
    if (error) {
      console.error(`Notification error: ${error}`);
    }
  });
}

export { sendNotification };
