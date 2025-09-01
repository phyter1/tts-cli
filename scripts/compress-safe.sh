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
    
    # Option 4: Create a self-extracting script (maintains permissions)
    echo "🚀 Creating self-extracting installer..."
    mkdir -p installer
    cat > installer/install << 'EOF'
#!/bin/bash
echo "Installing TTS CLI..."
PAYLOAD_LINE=$(awk '/^__PAYLOAD_BELOW__/ {print NR + 1; exit 0; }' $0)

# Extract to temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
tail -n +$PAYLOAD_LINE "$OLDPWD/$0" | tar -xz
chmod +x tts-cli

# Determine the appropriate bin directory based on OS
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux"* ]]; then
    # Check for common bin directories in order of preference
    if [ -d "$HOME/.local/bin" ]; then
        BIN_DIR="$HOME/.local/bin"
    elif [ -d "$HOME/bin" ]; then
        BIN_DIR="$HOME/bin"
    elif [ -d "/usr/local/bin" ] && [ -w "/usr/local/bin" ]; then
        BIN_DIR="/usr/local/bin"
    else
        # Create ~/.local/bin if it doesn't exist
        BIN_DIR="$HOME/.local/bin"
        mkdir -p "$BIN_DIR"
    fi
elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
    # Windows (Git Bash, Cygwin, etc.)
    BIN_DIR="$HOME/bin"
    mkdir -p "$BIN_DIR"
fi

echo "✅ TTS CLI extracted successfully!"
echo ""

# Ask if user wants to install to bin folder
read -p "🤔 Would you like to install tts-cli to $BIN_DIR for global access? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Copy to bin directory
    cp tts-cli "$BIN_DIR/tts-cli"
    
    # Check if bin directory is in PATH
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        echo "⚠️  Note: $BIN_DIR is not in your PATH"
        echo ""
        echo "📝 Add it to your PATH by adding this line to your shell config:"
        if [[ "$SHELL" == *"zsh"* ]]; then
            echo "    echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.zshrc"
            echo "    source ~/.zshrc"
        elif [[ "$SHELL" == *"bash"* ]]; then
            echo "    echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.bashrc"
            echo "    source ~/.bashrc"
        else
            echo "    export PATH=\"$BIN_DIR:\$PATH\""
        fi
        echo ""
    fi
    
    echo "✅ TTS CLI installed to $BIN_DIR"
    echo "📝 Usage: tts-cli \"Hello, world!\""
else
    # Copy to current directory
    cp tts-cli "$OLDPWD/"
    cd "$OLDPWD"
    echo "✅ TTS CLI installed in current directory as ./tts-cli"
    echo "📝 Usage: ./tts-cli \"Hello, world!\""
fi

# Clean up temp directory
rm -rf "$TEMP_DIR"

exit 0
__PAYLOAD_BELOW__
EOF
    tar -cz -C dist tts-cli >> installer/install
    chmod +x installer/install
    installer_size=$(ls -lh installer/install | awk '{print $5}')
    echo "✅ Created self-extracting installer: installer/install (${installer_size})"
    
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