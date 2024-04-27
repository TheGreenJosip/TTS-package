// playAudioStream.js

import Speaker from 'speaker';

// Configure the speaker
const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 48000,
});

// Pipe the process stdin to the speaker
process.stdin.pipe(speaker);

