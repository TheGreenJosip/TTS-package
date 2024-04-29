/**
 * Escapes special characters in a string for XML/SSML compatibility.
 * 
 * @param {string} text The input text containing characters to be escaped.
 * @return {string} The escaped text, safe for XML/SSML usage.
 */
export function escapeXML(text) {
  return text.replace(/&/g, '&amp;') // Escape ampersands.
             .replace(/</g, '&lt;') // Escape less-than signs.
             .replace(/>/g, '&gt;') // Escape greater-than signs.
             .replace(/"/g, '&quot;') // Escape double quotes.
             .replace(/'/g, '&apos;'); // Escape single quotes.
}

