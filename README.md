# TTS CLI

A fast Text-to-Speech command-line tool built with Bun that uses Microsoft Edge TTS for high-quality speech synthesis.

## Features

- 🎙️ High-quality text-to-speech using Microsoft Edge TTS
- 🌍 200+ voices across 100+ languages and locales
- 🎛️ Adjustable speech rate and pitch
- 💾 Save audio to file or play directly
- 🔍 System compatibility checking
- 📋 Voice listing and discovery
- 🚀 Cross-platform support (macOS, Windows, Linux)
- ⚡ Built with Bun for maximum performance

## Installation

### From Source

```bash
# Clone and install
git clone <repository-url>
cd tts_cli
bun install

# Install compression tools (optional, for smaller executables)
bun run install-tools
```

### Build Standalone Executable

```bash
# Build optimized executable
bun run build

# Build and compress (reduces size from ~57MB to ~19MB)
bun run build:compress

# Full build with size comparison
bun run build:all
```

## Usage

### Basic Usage

```bash
# Run from source
bun run src/index.ts "Hello, world!"

# Run standalone executable
./dist/tts "Hello, world!"
```

### Command Options

```bash
# Voice selection
./dist/tts "Hello" --voice en-GB-SoniaNeural

# Adjust speech parameters
./dist/tts "Fast speech" --rate +30% --pitch +10Hz
./dist/tts "Slow speech" --rate -20% --pitch -5Hz

# Save to file instead of playing
./dist/tts "Save this" --save output.mp3
./dist/tts "Save this" --output greeting.mp3

# System diagnostics
./dist/tts --check

# List all available voices
./dist/tts --list-voices

# Show help
./dist/tts --help
```

### Voice Examples

Popular voices by language:
- **English (US)**: `en-US-AriaNeural` (default), `en-US-DavisNeural`, `en-US-JennyNeural`
- **English (UK)**: `en-GB-SoniaNeural`, `en-GB-RyanNeural`, `en-GB-LibbyNeural`
- **Spanish**: `es-ES-ElviraNeural`, `es-MX-DaliaNeural`
- **French**: `fr-FR-DeniseNeural`, `fr-CA-SylvieNeural`
- **German**: `de-DE-KatjaNeural`, `de-DE-ConradNeural`
- **Japanese**: `ja-JP-NanamiNeural`, `ja-JP-KeitaNeural`
- **Mandarin**: `zh-CN-XiaoxiaoNeural`, `zh-CN-YunxiNeural`

## Development

### Requirements

- [Bun](https://bun.sh) v1.2.21+
- Internet connection (for Microsoft TTS API)
- Audio player:
  - **macOS**: `afplay` (built-in)
  - **Windows**: PowerShell (built-in)
  - **Linux**: `ffplay`, `aplay`, `mpg123`, or `play`

### Development Scripts

```bash
# Install dependencies
bun install

# Run in development
bun run src/index.ts "test message"

# Format code
bunx biome format --write src/

# Lint code
bunx biome check src/

# Run tests (when available)
bun test
```

### Build Scripts

```bash
# Build optimized executable (~57MB)
bun run build

# Compress executable (~19MB, requires UPX)
bun run compress

# Build and compress in one step
bun run build:compress

# Cross-platform builds
bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile dist/tts-linux
bun build --compile --target=bun-windows-x64 ./src/index.ts --outfile dist/tts.exe
```

## System Check

Run the built-in system diagnostics to verify your setup:

```bash
./dist/tts --check
```

This checks:
- ✅ Bun runtime version
- 🔊 Available audio players
- 🌐 Internet connectivity to TTS servers
- 💾 Temporary directory permissions

## Troubleshooting

### Audio Issues
- **macOS**: Ensure `afplay` is available (usually built-in)
- **Linux**: Install an audio player: `sudo apt install ffmpeg` or `sudo apt install alsa-utils`
- **Windows**: PowerShell should work by default

### Network Issues
- Ensure internet connection for Microsoft TTS API
- Check firewall settings if connection fails
- Try `--check` flag to diagnose connectivity

### Voice Not Found
- Use `--list-voices` to see all available voices
- Voice names are case-sensitive
- Default voice is `en-US-AriaNeural`

## Technical Details

- **TTS Engine**: Microsoft Edge Text-to-Speech API
- **Audio Formats**: MP3 output
- **Dependencies**: `edge-tts-universal` for TTS functionality
- **Runtime**: Bun with native TypeScript support
- **File Size**: ~19MB (compressed) or ~57MB (uncompressed) standalone executable

## License

This project was created using `bun init` and is built with [Bun](https://bun.sh), a fast all-in-one JavaScript runtime.
