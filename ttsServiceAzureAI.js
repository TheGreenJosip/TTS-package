import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { PassThrough } from 'stream';

export async function textToSpeechAzureAI(textInput) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm;

  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  // Adjusted SSML to match the provided settings
  const ssmlText = `
  <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="en-AU-FreyaNeural">
      <mstts:express-as style="assistant">
        <prosody rate="medium" pitch="medium">
          ${textInput} <!-- This now includes SSML tags for pauses -->
        </prosody>
      </mstts:express-as>
    </voice>
  </speak>`;

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

