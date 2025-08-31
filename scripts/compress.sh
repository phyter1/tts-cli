#!/bin/bash

# Compress the built executable using UPX
# Note: UPX compression may cause issues on modern macOS, especially Apple Silicon

echo "🗜️  Compressing TTS CLI executable..."

# Check if executable exists
if [ ! -f "dist/tts" ]; then
    echo "❌ Error: dist/tts not found!"
    echo "💡 Run 'bun run build' first to create the executable"
    exit 1
fi

# Check if UPX is installed
if ! command -v upx >/dev/null 2>&1; then
    echo "❌ UPX is not installed!"
    echo "💡 Run 'bun run install-tools' to install UPX"
    exit 1
fi

# Get original size
original_size=$(ls -lh dist/tts | awk '{print $5}')
echo "📏 Original size: ${original_size}"

# Warn about macOS issues
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "⚠️  Warning: UPX compression on macOS may cause runtime issues"
    echo "   The compressed executable may be killed by macOS security (Gatekeeper/XProtect)"
    echo "   Consider using the uncompressed version for distribution on macOS"
    echo ""
    read -p "Continue with compression? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Compression cancelled."
        exit 0
    fi
fi

# Compress based on platform
echo "🔄 Compressing executable..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - try safer compression options
    # Using less aggressive compression to avoid runtime issues
    upx --force-macos -7 dist/tts 2>/dev/null || \
    upx --force-macos --best dist/tts 2>/dev/null || \
    upx --force-macos dist/tts
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "⚠️  IMPORTANT: The compressed executable may not work on macOS due to security restrictions"
        echo "   If the compressed version doesn't run:"
        echo "   1. Use the uncompressed version: dist/tts-original"
        echo "   2. Or clear quarantine: xattr -cr dist/tts"
        echo "   3. Or sign the binary: codesign --sign - --force dist/tts"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    upx --best --no-lzma dist/tts.exe
else
    # Linux and other Unix-like systems
    upx --best --no-lzma dist/tts
fi

if [ $? -eq 0 ]; then
    # Get compressed size
    compressed_size=$(ls -lh dist/tts | awk '{print $5}')
    echo "✅ Compression completed!"
    echo "📊 Size reduction: ${original_size} → ${compressed_size}"
    
    # Test if compressed executable works
    echo ""
    echo "🧪 Testing compressed executable..."
    if timeout 2 ./dist/tts --help >/dev/null 2>&1; then
        echo "✅ Compressed executable appears to work!"
    else
        echo "❌ Compressed executable doesn't run properly!"
        echo "💡 Use the uncompressed version: dist/tts-original"
        echo "💡 Or try fixing with: xattr -cr dist/tts && codesign --sign - --force dist/tts"
    fi
else
    echo "❌ Compression failed!"
    echo "💡 The uncompressed version is still available: dist/tts"
    exit 1
fi