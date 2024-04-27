// textExtractor.js

import axios from 'axios';
import cheerio from 'cheerio';

export async function extractTextFromURL(url) {
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

