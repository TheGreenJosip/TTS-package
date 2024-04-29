/**
 * Prepares text for TTS by removing or replacing certain markdown elements,
 * specifically targeting code blocks while preserving inline code, filenames,
 * function names, and removing URLs.
 * 
 * This implementation ensures that inline code marked by single backticks is
 * preserved, while code blocks enclosed in triple backticks are replaced with
 * "code snippet removed." URLs are also removed to prevent the TTS service from
 * reading them aloud.
 * 
 * @param {string} text The input text containing markdown, code snippets, and URLs.
 * @return {string} The processed text, ready for TTS.
 */
export function prepareTextForTTS(text) {
  // Temporarily replace inline code with a placeholder
  const inlineCodePlaceholder = text.match(/`([^`]+)`/g) || [];
  inlineCodePlaceholder.forEach((code, index) => {
    text = text.replace(code, `INLINECODEPLACEHOLDER${index}`);
  });

  // Replace code blocks with "code snippet removed."
  text = text.replace(/```[\s\S]*?```/g, 'code snippet removed.');

  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, 'URL removed.');

  // Restore the inline code from placeholders
  inlineCodePlaceholder.forEach((code, index) => {
    text = text.replace(`INLINECODEPLACEHOLDER${index}`, code);
  });

  // Continue with the rest of the markdown cleanup
  text = text
    .replace(/^(#+)\s+(.*)$/gm, '$2') // Remove markdown headers
    .replace(/^\s*[\-\*]\s+/gm, 'Next item, ') // Format list items
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold/italic markers
    .replace(/[\*\#]/g, ''); // Remove remaining markdown characters

  return text;
}
