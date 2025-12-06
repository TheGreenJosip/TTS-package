import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { PassThrough } from 'stream';
import { generateSSML } from '../utils/ssmlGenerator.js';


export async function textToSpeechAzureAI(textInput, voiceName = "en-AU-FreyaNeural", options = {}) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm;

  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  // Use the SSML generator to create the SSML text
  const ssmlText = generateSSML(textInput, voiceName, options);

  return new Promise((resolve, reject) => {
    speechSynthesizer.speakSsmlAsync(
      ssmlText,
      result => {
        speechSynthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          const bufferStream = new PassThrough();
          bufferStream.end(Buffer.from(result.audioData));
          resolve(bufferStream);
        } else {
          reject(new Error('Speech synthesis canceled, ' + result.errorDetails));
        }
      },
      error => {
        speechSynthesizer.close();
        reject(error);
      }
    );
  });
}

export async function getAvailableVoices() {
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  try {
    console.log('[DEBUG] Requesting voices from Azure...');
    const result = await speechSynthesizer.getVoicesAsync();
    console.log('[DEBUG] Azure result reason:', result.reason);
    if (result.reason === sdk.ResultReason.VoicesListRetrieved) {
      return result.voices;
    } else {
      console.error('Error retrieving voices:', result.errorDetails);
      return [];
    }
  } catch (error) {
    console.error('Exception retrieving voices:', error);
    return [];
  } finally {
    speechSynthesizer.close();
  }
}