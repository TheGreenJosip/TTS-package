const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const play = require('play-sound');
const pdfParse = require('pdf-parse');
const readline = require('readline');

// Initialize the OpenAI client
const openai = new OpenAI();

// Initialize the audio player
const player = play();

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function listFiles(directory) {
  const files = await fs.readdir(directory);
  return files.filter(file => file.endsWith('.txt') || file.endsWith('.pdf'));
}

async function getTextFromFile(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();

  if (fileExtension === '.pdf') {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    return pdfData.text;
  } else {
    return fs.readFile(filePath, 'utf8');
  }
}

async function main() {
  try {
    const directory = __dirname;
    const files = await listFiles(directory);

    if (files.length === 0) {
      console.log('No text or PDF files found in the directory.');
      rl.close();
      return;
    }
    
    console.log('Select a file to process:\n');
    files.forEach((file, index) => {
      console.log(`${index + 1}) ${file}`);
    });

    rl.question('\n' + 'Enter the number of the file: ', async (answer) => { 
      const fileIndex = parseInt(answer, 10) - 1;
      if (fileIndex < 0 || fileIndex >= files.length || isNaN(fileIndex)) {
        console.log('Invalid selection.');
        rl.close();
        return;
      }

      const filePath = path.join(directory, files[fileIndex]);
      const textInput = await getTextFromFile(filePath);

      console.log('Starting TTS request...\n');
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'shimmer',
        input: textInput,
      });
      console.log('TTS request completed.\n');

      const speechFile = path.resolve(directory, './speech.mp3');
      console.log('Writing MP3 to file system...\n');
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.writeFile(speechFile, buffer);
      console.log(`MP3 file written to ${speechFile}.`);

      console.log('Playing the audio file...\n');
      player.play(speechFile, async (err) => {
        if (err) {
          console.error('Error playing the file:', err);
        } else {
          console.log('Audio playback finished.\n');
          console.log('Deleting MP3 file...');
          await fs.unlink(speechFile);
          console.log('MP3 file deleted.');
        }
        rl.close();
      });
    });
  } catch (error) {
    console.error('An error occurred:', error);
    rl.close();
  }
}

main();
