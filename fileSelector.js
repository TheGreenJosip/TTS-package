// fileSelector.js

import fs from 'fs/promises';
import path from 'path';
import PdfParse from 'pdf-parse';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export async function listFiles(directory) {
  const files = await fs.readdir(directory);
  return files.filter(file => file.endsWith('.txt') || file.endsWith('.pdf'));
}

export async function getTextFromFile(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();

  if (fileExtension === '.pdf') {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfData = await PdfParse(pdfBuffer);
    return pdfData.text;
  } else {
    return fs.readFile(filePath, 'utf8');
  }
}
// ANSI escape code for bold text
const BOLD = '\x1b[1m';
// ANSI escape code to reset text formatting
const RESET = '\x1b[0m';

export function chooseFile(files) {
  return new Promise((resolve, reject) => {
    console.log('Select a file to process:\n');

    // Group files by extension
    const filesByExtension = files.reduce((acc, file) => {
      const ext = path.extname(file).toLowerCase();
      if (!acc[ext]) {
        acc[ext] = [];
      }
      acc[ext].push(file);
      return acc;
    }, {});

    // Sort extensions and print files grouped by extension
    Object.keys(filesByExtension).sort().forEach((ext, extIndex, extArray) => {
      // Print the file extension as a header
      console.log(`${BOLD}${ext.toUpperCase()}${RESET}`);
      filesByExtension[ext].forEach((file, fileIndex) => {
        // Calculate the overall index by adding the count of previously listed files
        const overallIndex = extArray.slice(0, extIndex).reduce((sum, e) => sum + filesByExtension[e].length, 0) + fileIndex + 1;
        console.log(`${overallIndex}) ${file}`);
      });
    });

    rl.question('\nEnter the number of the file: ', (answer) => {
      const fileIndex = parseInt(answer, 10) - 1;
      // Create a flat array of files from the filesByExtension object
      const flatFiles = [].concat.apply([], Object.values(filesByExtension));
      if (fileIndex < 0 || fileIndex >= flatFiles.length || isNaN(fileIndex)) {
        reject(new Error('Invalid selection.'));
        rl.close();
        return;
      }
      resolve(flatFiles[fileIndex]);
      rl.close();
    });
  });
}
