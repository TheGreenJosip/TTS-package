/**
 * Web page text extraction.
 * Fetches HTML and returns a cleaned text version of the <body>.
 * @module services/textExtractor
 */

import axios from 'axios';
import cheerio from 'cheerio';

export async function extractTextFromURL(url) {
  /**
   * Note: this is intentionally simple and does not attempt readability heuristics.
   * If you need better extraction later, consider a readability library.
   */
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const text = $('body').text();

    // Clean up the text: remove extra spaces, newlines, etc.
    return text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Error extracting text from URL:', error);
    throw error;
  }
}

