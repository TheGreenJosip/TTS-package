import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Reads the voice settings from the JSON file and returns it.
 */
function loadVoiceSettings() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const settingsPath = path.join(__dirname, '../../config/voiceSettings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return settings;
}

/**
 * Inserts pauses based on text structure and length.
 * @param {string} text - The input text to be analyzed and modified.
 * @returns {string} The modified text with added pauses.
 */
function insertPauses(text) {
    // Insert a longer pause after headlines (assuming they end with a colon or are in title case)
    text = text.replace(/(:\s*|\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b\s*\n)/g, '$1<break time="800ms"/>');

    // Insert a moderate pause in longer sentences without commas
    text = text.replace(/([^.]{30,}?[.?!])(\s+)/g, (match, p1, p2) => {
        return p1.includes(',') ? match : `${p1}<break time="500ms"/>${p2}`;
    });

    return text;
}

/**
 * Replaces or decorates specific terms in the input text with SSML tags based on voice settings.
 * @param {string} text - The input text to be synthesized.
 * @returns {string} The text decorated with SSML tags.
 */
function decorateTextWithSSML(text) {
    const { ssmlDecorations } = loadVoiceSettings();

    ssmlDecorations.forEach(decoration => {
        const { type, text: targetText, phonetic, substitute } = decoration;
        switch (type) {
            case 'phoneme':
                text = text.replace(new RegExp(targetText, 'g'), `<phoneme alphabet="ipa" ph="${phonetic}">${targetText}</phoneme>`);
                break;
            case 'say-as':
                text = text.replace(new RegExp(targetText, 'g'), `<say-as interpret-as="${decoration['interpret-as']}">${targetText}</say-as>`);
                break;
            case 'sub':
                text = text.replace(new RegExp(decoration['original'], 'g'), `<sub alias="${substitute}">${decoration['original']}</sub>`);
                break;
            default:
                console.warn(`Unsupported SSML decoration type: ${type}`);
        }
    });

    return text;
}

/**
 * Generates an SSML string for Azure Cognitive Speech Service with advanced features.
 * @param {string} text - The text to be synthesized.
 * @returns {string} The generated SSML string.
 */
export function generateSSML(text) {
    const { voiceName, options } = loadVoiceSettings();
    let decoratedText = decorateTextWithSSML(text);
    decoratedText = insertPauses(decoratedText); // Insert pauses after processing decorations

    const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="${voiceName}">
            <mstts:express-as style="${options.style}">
                <prosody rate="${options.rate}" pitch="${options.pitch}">
                    ${decoratedText}
                </prosody>
            </mstts:express-as>
        </voice>
    </speak>`;

    return ssml;
}
