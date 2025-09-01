#!/bin/bash

# Alternative compression strategy for macOS
# Uses built-in compression that maintains executable integrity

echo "🗜️  Safe compression for TTS CLI executable..."

# Check if executable exists
if [ ! -f "dist/tts-cli" ] && [ ! -f "dist/tts-cli-original" ]; then
    echo "❌ Error: No executable found in dist/"
    echo "💡 Run 'bun run build' first"
    exit 1
fi

# Use original if it exists (in case we're re-running)
if [ -f "dist/tts-cli-original" ]; then
    echo "📦 Using original uncompressed executable"
    cp dist/tts-cli-original dist/tts-cli
fi

# Get original size
original_size=$(ls -lh dist/tts-cli | awk '{print $5}')
echo "📏 Original size: ${original_size}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Using macOS-safe compression strategy..."
    
    # Option 1: Create a compressed disk image (DMG)
    echo "📀 Creating compressed DMG..."
    mkdir -p dist/dmg
    cp dist/tts-cli dist/dmg/
    hdiutil create -volname "TTS CLI" -srcfolder dist/dmg -ov -format UDZO dist/tts-cli.dmg
    rm -rf dist/dmg
    
    dmg_size=$(ls -lh dist/tts-cli.dmg | awk '{print $5}')
    echo "✅ Created DMG: dist/tts-cli.dmg (${dmg_size})"
    
    # Option 2: Create a tar.gz archive (preserves permissions)
    echo "📦 Creating tar.gz archive..."
    tar -czf dist/tts-cli.tar.gz -C dist tts-cli
    tar_size=$(ls -lh dist/tts-cli.tar.gz | awk '{print $5}')
    echo "✅ Created archive: dist/tts-cli.tar.gz (${tar_size})"
    
    # Option 3: Create a zip archive (may need chmod after extraction)
    echo "🗂️  Creating zip archive..."
    cd dist && zip -9 tts-cli.zip tts-cli && cd ..
    zip_size=$(ls -lh dist/tts-cli.zip | awk '{print $5}')
    echo "✅ Created archive: dist/tts-cli.zip (${zip_size})"
    
    # Option 4: Generate platform-specific installers
    echo "🚀 Generating platform-specific installers..."
    bash scripts/generate-installers.sh
    
    if [ -f "installer/install" ]; then
        installer_size=$(ls -lh installer/install | awk '{print $5}')
        echo "✅ Created universal installer: installer/install (${installer_size})"
    fi
    
    echo ""
    echo "📊 Compression Summary:"
    echo "  Original executable: ${original_size}"
    echo "  DMG archive: ${dmg_size} (best for macOS distribution)"
    echo "  Self-extracting: ${installer_size} (easiest installation)"
    echo "  Tar.gz archive: ${tar_size} (preserves permissions)"
    echo "  ZIP archive: ${zip_size} (most compatible)"
    echo ""
    echo "💡 Recommended options:"
    echo "   • DMG: Best for macOS users (double-click to mount)"
    echo "   • Self-extracting: Easiest - just run: bash installer/install"
    echo "   • Tar.gz: Best for Unix users (preserves executable permissions)"
    
elif [[ "$OSTYPE" == "linux"* ]]; then
    echo "🐧 Linux: Using UPX compression..."
    
    # Linux usually works fine with UPX
    if command -v upx >/dev/null 2>&1; then
        upx --best --no-lzma dist/tts-cli
        compressed_size=$(ls -lh dist/tts-cli | awk '{print $5}')
        echo "✅ UPX compression successful: ${original_size} → ${compressed_size}"
    else
        # Fallback to tar.gz
        tar -czf dist/tts-cli.tar.gz -C dist tts-cli
        tar_size=$(ls -lh dist/tts-cli.tar.gz | awk '{print $5}')
        echo "✅ Created archive: dist/tts-cli.tar.gz (${tar_size})"
    fi
    
else
    echo "🪟 Windows: Using UPX compression..."
    
    # Windows usually works with UPX
    if command -v upx >/dev/null 2>&1; then
        upx --best --no-lzma dist/tts-cli.exe
        compressed_size=$(ls -lh dist/tts-cli.exe | awk '{print $5}')
        echo "✅ UPX compression successful: ${original_size} → ${compressed_size}"
    else
        # Fallback to zip
        zip -9 dist/tts-cli.zip dist/tts-cli.exe
        zip_size=$(ls -lh dist/tts-cli.zip | awk '{print $5}')
        echo "✅ Created archive: dist/tts-cli.zip (${zip_size})"
    fi
fi

echo ""
echo "✨ Safe compression complete!"
echo ""
echo "📝 Installation instructions for users:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "  Option 1 - Self-extracting installer (Easiest):"
    echo "    bash installer/install"
    echo ""
    echo "  Option 2 - DMG (macOS standard):"
    echo "    Double-click tts-cli.dmg, drag to desired location"
    echo ""
    echo "  Option 3 - Tar archive (preserves permissions):"
    echo "    tar -xzf tts-cli.tar.gz"
    echo "    ./tts-cli \"Hello, world!\""
    echo ""
    echo "  Option 4 - ZIP (may need chmod):"
    echo "    unzip tts-cli.zip"
    echo "    chmod +x tts-cli"
    echo "    ./tts-cli \"Hello, world!\""
else
    echo "  • Extract: tar -xzf tts-cli.tar.gz"
    echo "  • Run: ./tts-cli \"Hello, world!\""
fi