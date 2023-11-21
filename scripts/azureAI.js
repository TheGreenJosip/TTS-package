import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { config } from "dotenv";
import { PassThrough } from "stream";
import Speaker from "speaker";

config();

function synthesizeSpeech() {
    const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
    speechConfig.speechSynthesisVoiceName = "en-AU-ElsieNeural";
    const audioConfig = sdk.AudioConfig.fromSpeakerOutput();
    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    speechSynthesizer.speakTextAsync(
        "I'm excited to try text to speech",
        result => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                const { audioData } = result;

                // Create a PassThrough stream to play the audio
                const bufferStream = new PassThrough();
                bufferStream.end(Buffer.from(audioData));

                // Set up the speaker
                const speaker = new Speaker({
                    channels: 1, // mono
                    bitDepth: 16,
                    sampleRate: 16000,
                });

                // Pipe the audio stream to the speaker
                bufferStream.pipe(speaker);

                bufferStream.on('end', () => {
                    console.log('Audio playback finished');
                });
            } else {
                console.error('Text-to-speech failed:', result.errorDetails);
            }

            speechSynthesizer.close();
        },
        error => {
            console.log(error);
            speechSynthesizer.close();
        });
}

synthesizeSpeech();
