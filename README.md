# TTS CLI

<!-- Badges -->
<div align="center">

[![License](https://img.shields.io/github/license/phyter1/tts-cli)](LICENSE)
[![GitHub release](https://img.shields.io/github/release/phyter1/tts-cli.svg)](https://github.com/phyter1/tts-cli/releases)
[![Platform Support](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](https://github.com/phyter1/tts-cli/releases)
[![Bun Version](https://img.shields.io/badge/bun-%E2%89%A51.2.21-f472b6)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

<!-- Code Quality Badges -->
[![Build Status](https://github.com/phyter1/tts-cli/workflows/Code%20Quality/badge.svg)](https://github.com/phyter1/tts-cli/actions/workflows/code-quality.yml)
[![Security Workflow](https://github.com/phyter1/tts-cli/workflows/Security%20%26%20Vulnerability%20Scan/badge.svg)](https://github.com/phyter1/tts-cli/actions/workflows/security.yml)

<!-- Security & Compliance Badges -->
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/phyter1/tts-cli/badge)](https://securityscorecards.dev/viewer/?uri=github.com/phyter1/tts-cli)
[![Dependencies](https://img.shields.io/librariesio/github/phyter1/tts-cli)](https://libraries.io/github/phyter1/tts-cli)
[![Snyk Vulnerabilities](https://snyk.io/test/github/phyter1/tts-cli/badge.svg)](https://snyk.io/test/github/phyter1/tts-cli)

</div>

A fast Text-to-Speech command-line tool built with Bun that uses Microsoft Edge TTS for high-quality speech synthesis.

<div align="center">
<h3>
<a href="#-download">📥 Download Now</a> • 
<a href="#features">✨ Features</a> • 
<a href="#usage">📖 Usage</a> • 
<a href="#development">🛠️ Development</a>
</h3>

**🚀 Quick Install (macOS/Linux):** `curl -fsSL https://github.com/phyter1/tts-cli/releases/latest/download/install.sh | bash`

**📦 Windows:** [Download Latest Release](https://github.com/phyter1/tts-cli/releases/latest)

</div>

---

## 📥 Download

<div align="center">

### Quick Install - Choose Your Platform

| Platform | Architecture | Download | Size |
|----------|-------------|----------|------|
| **macOS** | Apple Silicon (M1/M2/M3) | [⬇️ Download Installer](https://github.com/phyter1/tts-cli/releases/latest/download/tts-cli-darwin-arm64.tar.gz) | ~19MB |
| **macOS** | Intel | [⬇️ Download Installer](https://github.com/phyter1/tts-cli/releases/latest/download/tts-cli-darwin-x64.tar.gz) | ~19MB |
| **Linux** | x64 | [⬇️ Download Installer](https://github.com/phyter1/tts-cli/releases/latest/download/tts-cli-linux-x64.tar.gz) | ~19MB |
| **Linux** | ARM64 | [⬇️ Download Installer](https://github.com/phyter1/tts-cli/releases/latest/download/tts-cli-linux-arm64.tar.gz) | ~19MB |
| **Windows** | x64 | [⬇️ Download Installer](https://github.com/phyter1/tts-cli/releases/latest/download/tts-cli-windows-x64.zip) | ~19MB |

#### Installation Instructions

**macOS/Linux:**
```bash
# Download and extract (replace URL with your platform's download link)
curl -L https://github.com/phyter1/tts-cli/releases/latest/download/tts-cli-darwin-arm64.tar.gz | tar xz
# Make executable
chmod +x tts-cli
# Move to PATH (optional)
sudo mv tts-cli /usr/local/bin/
# Test installation
tts-cli --help
```

**Windows:**
```powershell
# Download and extract the ZIP file
# Move tts-cli.exe to a folder in your PATH
# Or run directly from the extracted folder
.\tts-cli.exe --help
```

</div>

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

# Full build with installer creation
bun run build:all
```

### Quick Install (Pre-built)

```bash
# Run the self-extracting installer
bash installer/install
```

## Usage

### Basic Usage

```bash
# Run from source
bun run src/index.ts "Hello, world!"

# Run standalone executable
./dist/tts-cli "Hello, world!"

# Or if installed globally via installer
tts-cli "Hello, world!"
```

### Command Options

```bash
# Voice selection
tts-cli "Hello" --voice en-GB-SoniaNeural

# Adjust speech parameters
tts-cli "Fast speech" --rate +30% --pitch +10Hz
tts-cli "Slow speech" --rate -20% --pitch -5Hz

# Save to file instead of playing
tts-cli "Save this" --save output.mp3
tts-cli "Save this" --output greeting.mp3

# System diagnostics
tts-cli --check

# List all available voices
tts-cli --list-voices

# Show help
tts-cli --help
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
bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile dist/tts-cli-linux
bun build --compile --target=bun-windows-x64 ./src/index.ts --outfile dist/tts-cli.exe
```

## System Check

Run the built-in system diagnostics to verify your setup:

```bash
tts-cli --check
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

## 🔒 Security

This project maintains high security standards through comprehensive automated scanning:

### Security Measures
- **🔍 Static Analysis**: CodeQL and Semgrep scan for security vulnerabilities
- **🕵️ Secret Scanning**: TruffleHog and Gitleaks detect exposed credentials
- **📦 Dependency Scanning**: Snyk, OWASP, and npm audit check for vulnerable dependencies
- **🛡️ Container Security**: Trivy scans for container vulnerabilities
- **📋 License Compliance**: FOSSA ensures license compatibility
- **📊 Security Scorecard**: OpenSSF evaluates overall security posture

### Automated Workflows
- Daily security scans via GitHub Actions
- Pre-push hooks prevent insecure code commits
- SARIF integration with GitHub Security tab
- Real-time vulnerability notifications

All security scans run automatically on every push and are available in the [Security tab](https://github.com/phyter1/tts-cli/security).

## License

This project was created using `bun init` and is built with [Bun](https://bun.sh), a fast all-in-one JavaScript runtime.

Copyright (c) 2023 Ryan Lowe