Given the restructuring and enhancements made to your project, the `README.md` should be updated to reflect these changes accurately. Below is a sophisticated and comprehensive `README.md` that incorporates all the modifications and adheres to best practices for documentation.

```markdown
# Advanced Text-to-Speech (TTS) Service

The Advanced TTS Service is a robust, Node.js-based solution designed to convert textual content into lifelike speech. Leveraging Azure Cognitive Services Speech SDK, this service introduces an innovative approach to processing and synthesizing speech, equipped with features like clipboard monitoring, HTTP server integration, markdown preprocessing, and XML character escaping. It's engineered for extensibility, maintainability, and seamless Azure integration, catering to a wide range of text-to-speech conversion needs.

## Core Features

- **Clipboard Monitoring**: Employs a sophisticated listener to detect and process text copied to the clipboard, prefixed with a customizable trigger word, facilitating immediate TTS conversion.
- **HTTP Server Integration**: Features an HTTP server capable of accepting text input via POST requests, enabling programmatic text-to-speech conversion through web services.
- **Markdown Preprocessing**: Incorporates a markdown preprocessor that converts markdown-formatted text into plain text, optimizing it for speech synthesis.
- **XML Character Escaping**: Utilizes an XML escaper to ensure text safety for XML/SSML processing, thereby enhancing the versatility and reliability of speech synthesis.
- **Queue Management**: Implements a TTS queue management system to manage and sequence text inputs for processing, ensuring orderly speech synthesis.
- **Azure Cognitive Speech Service Integration**: Seamlessly integrates with Azure's TTS service, supporting advanced SSML generation for enriched speech synthesis experiences.
- **Audio Playback**: Facilitates the playback of synthesized speech audio streams through system speakers, providing an immediate auditory output of the processed text.

## Project Structure

```
.
├── README.md
├── app.js
├── config
│   └── voiceSettings.json
├── package.json
├── pnpm-lock.yaml
└── src
    ├── controllers
    │   └── ttsController.js
    ├── listeners
    │   └── clipboardListener.js
    ├── preprocessors
    │   ├── markdownPreprocessor.js
    │   └── xmlEscaper.js
    ├── services
    │   ├── textExtractor.js
    │   ├── ttsQueue.js
    │   └── ttsServiceAzureAI.js
    └── utils
        ├── logger.js
        ├── notifier.js
        ├── playAudioStream.js
        └── ssmlGenerator.js
```

## Getting Started

### Prerequisites

- Node.js (v18.5 or newer recommended)
- An Azure account with an active Cognitive Services Speech subscription

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/TheGreenJosip/TTS-package
   cd TTS-package
   ```

2. **Install Dependencies**

   Using pnpm:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   Populate a `.env` file in the project root with your Azure subscription key, region, and other configurations:

   ```plaintext
   SPEECH_KEY=your_subscription_key_here
   SPEECH_REGION=your_region_here
   TRIGGER_WORD=your_trigger_word
   PORT=your_api_port
   ```

### Usage

#### Starting the Service

Execute the following command to start the TTS service:

```bash
node app.js
```

This initiates the clipboard monitoring and HTTP server, ready to process text for speech synthesis.

#### HTTP API

To convert text to speech via HTTP, send a POST request:

```bash
curl -X POST http://localhost:PORT/tts -H "Content-Type: application/json" -d "{\"text\":\"Hello, world!\"}"
```

#### Clipboard Interaction

Copy any text prefixed with the trigger word (default: "TTS") to the clipboard. The service will automatically detect, process, and convert the text to speech.

## Advanced Configuration

The `config/voiceSettings.json` file allows for detailed customization of voice and speech patterns. Adjust settings here to tailor the TTS output to your preferences.

## Contributing

Contributions are welcome! Please refer to the contributing guidelines for more details on how to participate in the project's development.

## Running in Background

To run the service in the background, consider using `pm2`:

```bash
pm2 start app.js --name tts-service
```

Manage the service with `pm2 stop tts-service` and `pm2 start tts-service`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```

### Key Points

- **Sophisticated Introduction**: The introduction now clearly outlines the service's capabilities and its integration with Azure Cognitive Services, setting a professional tone.
- **Detailed Feature Descriptions**: Each feature is described in detail, highlighting the service's functionality and technical sophistication.
- **Comprehensive Project Structure**: The updated project structure reflects the latest changes, providing clarity on the organization and modularity of the codebase.
- **Streamlined Getting Started Section**: The installation and usage instructions are concise, making it easy for users to get the service up and running.
- **Advanced Configuration**: A brief mention of advanced configuration options encourages users to explore and customize the service further.
- **Professional Tone**: Throughout the document, the language and structure aim to communicate a high level of professionalism and attention to detail, targeting an audience of senior developers and technical users.

This `README.md` serves as a comprehensive guide to your project, reflecting the latest structural changes and functionalities while maintaining a sophisticated and professional tone suitable for a senior developer audience.