
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Text-to-Speech CLI tool built with Bun that uses Microsoft Edge TTS (via edge-tts-universal) to synthesize speech from text. The main executable is `src/index.ts`.

## Commands

### Development
```bash
# Install dependencies
bun install

# Run the TTS CLI
bun run src/index.ts "Your text here"

# Run with options
bun run src/index.ts "Hello" --voice en-GB-SoniaNeural --save output.mp3

# Check system setup
bun run src/index.ts --check

# List available voices
bun run src/index.ts --list-voices

# Format code with Biome
bunx biome format --write src/

# Lint code with Biome
bunx biome check src/

# Fix linting issues
bunx biome check --write src/
```

### Building
```bash
# Install compression tools (UPX) - cross-platform
bun run install-tools

# Build optimized executable
bun run build

# Compress existing executable
bun run compress

# Build and compress in one step
bun run build:compress

# Build, backup original, compress, and show sizes
bun run build:all

# Manual build commands
bun build --compile --minify --bytecode ./src/index.ts --outfile dist/tts
bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile dist/tts-linux
```

## Architecture

The application is a single-file CLI tool (`src/index.ts`) that:
- Uses Bun's native `$` utility for shell operations (audio playback, system checks)
- Leverages `edge-tts-universal` library for TTS synthesis via Microsoft Edge TTS API
- Supports multi-platform audio playback (macOS: afplay, Windows: PowerShell, Linux: ffplay/aplay/mpg123)
- Uses Bun.file for efficient file I/O operations
- Implements voice listing, rate/pitch adjustments, and file saving capabilities

Key implementation patterns:
- Direct use of Bun's `$` for shell commands instead of child_process or execa
- Bun.write() for file operations instead of fs.writeFile
- Platform detection via process.platform for cross-platform audio playback
- Temporary file cleanup after playback using `/tmp` directory

## Bun-Specific Guidelines

- Use `bun` to run TypeScript files directly, no compilation needed
- Use `Bun.$` for shell operations instead of child_process or execa
- Use `Bun.file()` and `Bun.write()` for file operations
- Bun automatically loads .env files, no dotenv needed
- Use `bun test` for testing (no test files currently exist)
- TypeScript runs natively without transpilation

## Code Style

- Biome is configured for formatting and linting
- Tab indentation (configured in biome.json)
- Double quotes for strings
- Strict TypeScript enabled in tsconfig.json
