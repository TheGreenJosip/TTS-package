import chalk from 'chalk';

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  switch (level) {
    case 'info':
      console.log(`${chalk.blue('[INFO]')} ${timestamp} ${message}`);
      break;
    case 'error':
      console.error(`${chalk.red('[ERROR]')} ${timestamp} ${message}`);
      break;
    case 'request':
      console.log(`${chalk.green('[REQUEST]')} ${timestamp} ${message}`);
      break;
    default:
      console.log(`${chalk.yellow('[LOG]')} ${timestamp} ${message}`);
  }
}

export { log };
