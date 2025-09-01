#!/bin/bash

# Build optimized executable with Bun
# Creates a standalone binary that runs without Bun installed

echo "🔨 Building TTS CLI executable..."

# Ensure dist directory exists
mkdir -p dist

# Build with all optimizations
echo "📦 Compiling with optimizations..."
bun build \
    --compile \
    --minify \
    --bytecode \
    --define NODE_ENV='"production"' \
    ./src/index.ts \
    --outfile dist/tts-cli

if [ $? -eq 0 ]; then
    # Get file size
    size=$(ls -lh dist/tts-cli | awk '{print $5}')
    echo "✅ Build successful!"
    echo "📁 Output: dist/tts-cli (${size})"
    
    # Make executable (ensure proper permissions)
    chmod +x dist/tts-cli
else
    echo "❌ Build failed!"
    exit 1
fi