// ttsServiceAzureAI.js
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { PassThrough } from 'stream';

export async function textToSpeechAzureAI(textInput) {
  // Initialize the speech synthesizer configuration with the Azure API key and region.
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);

  // Set the output format
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm;

  // Create the speech synthesizer instance.
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  // Construct SSML with a natural-sounding contour pattern and an audio effect.
  const ssmlText = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-AU-FreyaNeural" effect="eq_car">
    <mstts:express-as style="assistant">
      <prosody rate="medium" pitch="medium">
          ${textInput}
      </prosody>
    </mstts:express-as>
  </voice>
</speak>`;

  // Return a promise that resolves with the synthesized speech audio stream.
  return new Promise((resolve, reject) => {
    // Perform the text-to-speech synthesis with the provided SSML.
    speechSynthesizer.speakSsmlAsync(
      ssmlText,
      result => {
        // Close the synthesizer to release resources.
        speechSynthesizer.close();
        // Check if the synthesis was successful.
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          // Create a PassThrough stream to handle the audio data.
          const bufferStream = new PassThrough();
          // Write the synthesized audio data to the stream.
          bufferStream.end(Buffer.from(result.audioData));
          // Resolve the promise with the audio stream.
          resolve(bufferStream);
        } else {
          // If synthesis was canceled or failed, reject the promise with an error.
          reject(new Error('Speech synthesis canceled, ' + result.errorDetails));
        }
      },
      error => {
        // Close the synthesizer in case of an error and reject the promise.
        speechSynthesizer.close();
        reject(error);
      }
    );
  });
}

/*
Contour pattern explanation:
- (0%,+1st): The sentence starts with a pitch one semitone above the baseline. This slight elevation adds a sense of anticipation or importance to the beginning of the speech.

- (25%,+0.5st): As the sentence progresses, the pitch is slightly reduced to half a semitone above the baseline. This reduction creates a gentle descent in tone, which can help draw the listener into the narrative flow.

- (50%,+0Hz): At the midpoint, the pitch levels out to the baseline. This neutral point provides a natural pause in the dynamic range of the speech, offering a moment of reflection or emphasis on the content.

- (75%,-0.5st): Nearing the end, the pitch decreases slightly below the baseline by half a semitone. This downward inflection can signal a conclusion or imply a transition to a new thought.

- (100%,+0.5st): The sentence ends with a slight pitch rise, returning to half a semitone above the baseline. This uplift prevents the voice from sounding too monotonous and can leave the listener with a sense of completion or readiness for the next point.
*/

