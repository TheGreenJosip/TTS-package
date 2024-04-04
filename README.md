# TTS Application

The TTS (Text-to-Speech) Application is a Node.js-based service designed to convert text into spoken words, leveraging the Azure Cognitive Services Speech SDK. This application listens for text input via an HTTP server or directly from the clipboard and processes the text through a markdown preprocessor and an XML escaper before sending it to Azure's Text-to-Speech engine.

## Features

- **Clipboard Monitoring**: Automatically detects and processes text copied to the clipboard prefixed with "TTS".
- **HTTP Server**: Accepts text input via HTTP POST requests for conversion to speech.
- **Markdown Preprocessing**: Converts markdown-formatted text to plain text suitable for speech synthesis.
- **XML Character Escaping**: Ensures text is safe for XML/SSML processing by escaping special characters.

## Prerequisites

- Node.js (v14 or newer recommended)
- An Azure account with a Cognitive Services Speech subscription

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/tts-application.git
   cd tts-application
   ```

2. **Install dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or, using pnpm:

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory of the project, and add your Azure Cognitive Services Speech subscription key and region:

   ```plaintext
   SPEECH_KEY=your_subscription_key_here
   SPEECH_REGION=your_region_here
   ```

## Usage

### Starting the Application

Run the application with the following command:

```bash
node clipboardListener.js
```

The server will start listening for clipboard changes and HTTP POST requests on port 3000.

### Sending Text via HTTP

To send text for speech synthesis via HTTP, use the following `curl` command:

```bash
curl -X POST http://localhost:3000/tts -H "Content-Type: application/json" -d "{\"text\":\"Hello, world!\"}"
```

### Copying Text to Clipboard

Prefix any text with "TTS" and copy it to the clipboard. The application will automatically detect and process the text.

## Files and Directories

- `clipboardListener.js`: Main application script that starts the server and monitors the clipboard.
- `markdownPreprocessor.js`: Module for converting markdown text to plain text.
- `xmlEscaper.js`: Module for escaping special XML characters in text.
- `ttsServiceAzureAI.js`: Module for interfacing with Azure's Text-to-Speech service.
- `package.json` & `pnpm-lock.yaml`: Project metadata and dependency lock files.
- `node_modules/`: Directory containing all the project dependencies (generated after installation).

## Contributing

Contributions to the TTS Application are welcome! Please follow these steps to contribute:

1. **Fork the Repository**: Click the "Fork" button at the top right of this page.
2. **Clone Your Fork**: Clone your fork to your local machine.
3. **Create a Feature Branch**: `git checkout -b my-new-feature`
4. **Make Your Changes**: Add your feature or fix bugs.
5. **Commit Your Changes**: `git commit -am 'Add some feature'`
6. **Push to the Branch**: `git push origin my-new-feature`
7. **Submit a Pull Request**: Open a new pull request from your feature branch to the original project.

Please ensure your code adheres to the project's coding standards and include tests for new features or fixes.

## License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.

