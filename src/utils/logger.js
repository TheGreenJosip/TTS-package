/**
 * Simple colored logger.
 * Provides consistent timestamped log output.
 * @module utils/logger
 */

import chalk from 'chalk';

/**
 * Logs a message to stdout/stderr.
 * @param {string} message - Message to log.
 * @param {'info'|'error'|'request'|string} [level='info'] - Log level.
 */
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
