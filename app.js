/**
 * Application entrypoint.
 * Boots configuration, validates required environment variables, and starts the clipboard listener + HTTP API.
 * @module app
 */

import { startClipboardListener } from "./src/listeners/clipboardListener.js";
import { loadConfig } from "./src/config/env.js";
import { log } from "./src/utils/logger.js";

// Fail-fast env validation at startup.
// Intentionally exits early to avoid confusing runtime failures later (e.g. missing Azure credentials).
try {
	loadConfig();
} catch (err) {
	log(err?.message || String(err), 'error');
	process.exit(1);
}

// Start the clipboard listener
startClipboardListener();

console.log('Application started. Listening to clipboard events...');