# Text-to-Speech (TTS) Package

This TTS package provides a seamless integration of multiple Text-to-Speech services, including OpenAI and AzureAI, with the capability to output synthesized speech in real-time through the speakers of a MacBook or save it to a file. It is designed to be used as a personal assistant for reading articles, providing insights into Home Assistant, smart-home setups, and more, with a focus on IoT and local software development terminology.

## Features

- **Multiple TTS Providers**: Support for OpenAI and AzureAI TTS services.
- **Clipboard Monitoring**: Listens to the clipboard for a specific trigger phrase to process text through the selected TTS service.
- **File Selection**: Allows users to put text or PDF files for speech synthesis into a folder (files) and to choose which one to process interactively through a CLI-Interface
- **Customizable Voice**: Utilizes SSML to enhance the voice quality, making it sound most human I could acchieve as this is a high requirement for the everyday use
- **Real-time Streaming**: Stream the synthesized speech in real-time as it's being received (currently only AzureAI, planned for OpenAI).
- **Save to File**: (Commented out) Functionality to save the synthesized speech to a file is included but not active by default.
- **Environment Configuration**: Uses an `.env` file to manage environment variables, default TTS-service and coresponding API keys

## Folder Structure

- `files/`: Directory containing text and PDF files to be read by the TTS service.
- `recordings/`: Directory where generated speech MP3 files are saved, if enabled.
- `scripts/`: Directory for additional scripts (left my learning files in there).
- `tts-provider/`: Directory containing TTS service provider modules.
  - `ttsServiceAzureAI.js`: Module for Azure AI TTS service.
  - `ttsServiceOpenAI.js`: Module for OpenAI TTS service.
- `clipboardListener.js`: Module that listens to clipboard for text starting with "TTS" and converts it to speech.
- `fileSelector.js`: Module for listing and selecting files for TTS conversion.
- `main.js`: Main entry point for the TTS service.

## Installation

To install the TTS package, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the cloned directory.
3. Run `npm install` to install the required dependencies.

## Configuration

Before using the TTS package, you need to set up your environment variables:

1. Rename the provided `.env.sample` file to `.env`.
2. Fill in the `.env` file with your OpenAI and AzureAI API keys and other configuration details.

## Usage

The package can be used in two main ways:

### As a Clipboard Listener

To start the clipboard listener in the background:

```bash
npm install pm2
pm2 start clipboardListener.js --name="clipboard-listener"
```

To stop the clipboard listener:

```bash
pm2 stop clipboard-listener
```

### As a Main Entry Point

Run the `main.js` file with the following command:

```bash
node main.js
```

You can also specify a text input directly or select a file with the `-file` flag: (.txt, .pdf)

```bash
node main.js "Your text here"
node main.js -file path/to/your/file.txt
```

Or as mentioned above you can add files in the folder named also files. For now, .txt and .pdf files are supported. 

When you then run the `main.js` file with the command from above, you'll be presented with a CLI-interface allowing you to choose the file you want to process interactively.

## Contributing

Contributions to the TTS package are welcome. Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

This TTS package is open-source and available under the [MIT License](LICENSE).
