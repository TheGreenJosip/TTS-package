// ttsServiceOpenAI.js
import OpenAI from 'openai';
import { PassThrough } from 'stream';

const openai = new OpenAI();

export async function textToSpeechOpenAI(textInput) {
  console.log('Starting OpenAI TTS request...\n');
  const mp3Response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'shimmer',
    input: textInput,
    stream: true
  });
  console.log('OpenAI TTS request completed.\n');

  // Create a buffer from the response's arrayBuffer
  const buffer = Buffer.from(await mp3Response.arrayBuffer());

  // Create a PassThrough stream to handle the audio data
  const bufferStream = new PassThrough();
  // Write the synthesized audio data to the stream
  bufferStream.end(Buffer.from(buffer));
  // Return the stream for further processing
  return bufferStream;
}