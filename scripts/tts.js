// Ensure that your package.json includes "type": "module"
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';
import play from 'play-sound';

// Initialize the OpenAI client
const openai = new OpenAI();

// Initialize the audio player
const player = play();

const speechFile = path.resolve('speech.mp3');

async function getTextFromCommandLine() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    throw new Error('No text input or file flag provided.');
  }

  if (args[0] === '-file') {
    if (args.length < 2) {
      throw new Error('No filename provided.');
    }
    const textFilePath = path.resolve(args[1]);
    return fs.readFile(textFilePath, 'utf8');
  } else {
    return args.join(' '); // Join all arguments as they are part of the text
  }
}

async function main() {
  try {
    const textInput = await getTextFromCommandLine();

    console.log('Starting TTS request...');
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'shimmer',
      input: textInput,
    });
    console.log('TTS request completed.');

    console.log('Writing MP3 to file system...');
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(speechFile, buffer);
    console.log(`MP3 file written to ${speechFile}.`);

    console.log('Playing the audio file...');
    player.play(speechFile, (err) => {
      if (err) {
        console.error('Error playing the file:', err);
      } else {
        console.log('Audio playback finished.');
      }
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main(); // Execute the main function

