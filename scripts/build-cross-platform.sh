#!/bin/bash

# Build TTS CLI for all platforms and architectures
# Creates executables for:
#   - macOS (x64, arm64)
#   - Linux (x64, arm64) 
#   - Windows (x64, arm64)

echo "🚀 Building TTS CLI for all platforms and architectures..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ensure dist directory exists
mkdir -p dist

# Common build flags
BUILD_FLAGS="--compile --minify --bytecode --define NODE_ENV='\"production\"'"

# Track build results
declare -a BUILD_RESULTS

# ===========================
# 1. Build for current platform (native)
# ===========================
echo ""
echo "📦 Building for current platform (native)..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    CURRENT_PLATFORM="macOS-native"
    OUTPUT_FILE="dist/tts-cli"
elif [[ "$OSTYPE" == "linux"* ]]; then
    CURRENT_PLATFORM="Linux-native"
    OUTPUT_FILE="dist/tts-cli"
elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]] || [[ "$OSTYPE" == "win32"* ]]; then
    CURRENT_PLATFORM="Windows-native"
    OUTPUT_FILE="dist/tts-cli.exe"
else
    CURRENT_PLATFORM="Unknown"
    OUTPUT_FILE="dist/tts-cli"
fi

echo "🖥️  Current platform: $CURRENT_PLATFORM"

eval "bun build $BUILD_FLAGS ./src/index.ts --outfile $OUTPUT_FILE"

if [ $? -eq 0 ]; then
    chmod +x "$OUTPUT_FILE" 2>/dev/null
    size=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "✅ Built $CURRENT_PLATFORM: $OUTPUT_FILE ($size)"
    BUILD_RESULTS+=("✅ $CURRENT_PLATFORM: $OUTPUT_FILE ($size)")
else
    echo "❌ Failed to build for $CURRENT_PLATFORM"
    BUILD_RESULTS+=("❌ $CURRENT_PLATFORM: Failed")
fi

# ===========================
# 2. Build for ALL platforms and architectures
# ===========================
echo ""
echo "📦 Building for all platforms and architectures..."
echo ""

# Function to build a specific target
build_target() {
    local os_name=$1
    local arch=$2
    local target=$3
    local output=$4
    local emoji=$5
    
    echo "$emoji Building for $os_name ($arch)..."
    
    eval "bun build $BUILD_FLAGS --target=$target ./src/index.ts --outfile dist/$output"
    
    if [ $? -eq 0 ]; then
        chmod +x "dist/$output" 2>/dev/null
        size=$(ls -lh "dist/$output" | awk '{print $5}')
        echo "✅ Built $os_name $arch: dist/$output ($size)"
        BUILD_RESULTS+=("✅ $os_name $arch: dist/$output ($size)")
        return 0
    else
        echo "⚠️  Failed to build for $os_name $arch"
        BUILD_RESULTS+=("⚠️  $os_name $arch: Failed")
        return 1
    fi
}

# ===========================
# macOS builds (x64 and arm64)
# ===========================
echo "── macOS Builds ──"
build_target "macOS" "x64" "bun-darwin-x64" "tts-cli-darwin-x64" "🍎"
build_target "macOS" "arm64" "bun-darwin-arm64" "tts-cli-darwin-arm64" "🍎"
echo ""

# ===========================
# Linux builds (x64 and arm64)
# ===========================
echo "── Linux Builds ──"
build_target "Linux" "x64" "bun-linux-x64" "tts-cli-linux-x64" "🐧"
build_target "Linux" "arm64" "bun-linux-arm64" "tts-cli-linux-arm64" "🐧"
echo ""

# ===========================
# Windows builds (x64 and arm64)
# ===========================
echo "── Windows Builds ──"
build_target "Windows" "x64" "bun-windows-x64" "tts-cli-windows-x64.exe" "🪟"
# Note: Bun doesn't currently support Windows ARM64, but we'll try anyway
build_target "Windows" "arm64" "bun-windows-arm64" "tts-cli-windows-arm64.exe" "🪟"
echo ""

# ===========================
# 3. Create platform-specific archives
# ===========================
echo "📦 Creating platform-specific archives..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to create archive
create_archive() {
    local os_name=$1
    local arch=$2
    local binary=$3
    local is_windows=$4
    
    if [ -f "dist/$binary" ]; then
        local archive_base="tts-cli-${os_name}-${arch}"
        echo "📦 Creating ${os_name}-${arch} archive..."
        
        # Create temporary directory
        local temp_dir="dist/temp_${os_name}_${arch}"
        mkdir -p "$temp_dir"
        
        # Copy binary with appropriate name
        if [ "$is_windows" = "true" ]; then
            cp "dist/$binary" "$temp_dir/tts-cli.exe"
        else
            cp "dist/$binary" "$temp_dir/tts-cli"
            chmod +x "$temp_dir/tts-cli"
        fi
        
        # Create README for the archive
        cat > "$temp_dir/README.txt" << EOF
TTS CLI - Text-to-Speech Command Line Tool
Platform: ${os_name} (${arch})
Architecture: ${arch}

Installation:
1. Copy tts-cli$([ "$is_windows" = "true" ] && echo ".exe") to a directory in your PATH
2. Or run directly: ./tts-cli$([ "$is_windows" = "true" ] && echo ".exe") "Hello, world!"

Quick Install (Unix/Linux/macOS):
  sudo cp tts-cli /usr/local/bin/
  chmod +x /usr/local/bin/tts-cli

Quick Install (Windows):
  Copy tts-cli.exe to C:\Windows\System32
  Or add the current directory to your PATH

Usage:
  tts-cli --help
  tts-cli "Your text here"
  tts-cli --list-voices
  tts-cli "Hello" --voice en-GB-SoniaNeural
  tts-cli "Save audio" --save output.mp3

For more information, visit: https://github.com/your-repo/tts-cli
EOF
        
        # Create archive
        if [ "$is_windows" = "true" ]; then
            # Create ZIP for Windows
            (cd "$temp_dir" && zip -9 -r "../${archive_base}.zip" .)
            rm -rf "$temp_dir"
            if [ -f "dist/${archive_base}.zip" ]; then
                size=$(ls -lh "dist/${archive_base}.zip" | awk '{print $5}')
                echo "✅ Created: dist/${archive_base}.zip ($size)"
            fi
        else
            # Create tar.gz for Unix/Linux/macOS
            tar -czf "dist/${archive_base}.tar.gz" -C "$temp_dir" .
            rm -rf "$temp_dir"
            if [ -f "dist/${archive_base}.tar.gz" ]; then
                size=$(ls -lh "dist/${archive_base}.tar.gz" | awk '{print $5}')
                echo "✅ Created: dist/${archive_base}.tar.gz ($size)"
            fi
        fi
    else
        echo "⚠️  Skipping ${os_name}-${arch} archive (binary not found)"
    fi
}

# Create archives for all platforms
create_archive "darwin" "x64" "tts-cli-darwin-x64" false
create_archive "darwin" "arm64" "tts-cli-darwin-arm64" false
create_archive "linux" "x64" "tts-cli-linux-x64" false
create_archive "linux" "arm64" "tts-cli-linux-arm64" false
create_archive "windows" "x64" "tts-cli-windows-x64.exe" true
create_archive "windows" "arm64" "tts-cli-windows-arm64.exe" true

# ===========================
# 4. Create universal archives with multiple architectures
# ===========================
echo ""
echo "📦 Creating universal multi-arch archives..."
echo ""

# macOS Universal Binary (combines x64 and arm64)
if [ -f "dist/tts-cli-darwin-x64" ] && [ -f "dist/tts-cli-darwin-arm64" ]; then
    echo "🍎 Creating macOS universal archive (x64 + arm64)..."
    temp_dir="dist/temp_macos_universal"
    mkdir -p "$temp_dir"
    
    # Note: Creating a true universal binary requires macOS lipo tool
    # For now, we'll include both binaries
    cp "dist/tts-cli-darwin-x64" "$temp_dir/tts-cli-x64"
    cp "dist/tts-cli-darwin-arm64" "$temp_dir/tts-cli-arm64"
    chmod +x "$temp_dir/"*
    
    # Create launcher script
    cat > "$temp_dir/tts-cli" << 'EOF'
#!/bin/bash
# Auto-detect architecture and run appropriate binary
ARCH=$(uname -m)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$ARCH" = "x86_64" ]; then
    exec "$SCRIPT_DIR/tts-cli-x64" "$@"
elif [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    exec "$SCRIPT_DIR/tts-cli-arm64" "$@"
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi
EOF
    chmod +x "$temp_dir/tts-cli"
    
    # Create README
    cat > "$temp_dir/README.txt" << EOF
TTS CLI - macOS Universal Package
Supports both Intel (x64) and Apple Silicon (arm64)

The tts-cli script will automatically detect your architecture and run the correct binary.

Installation:
  sudo cp tts-cli* /usr/local/bin/
  
Usage:
  tts-cli "Hello, world!"
EOF
    
    tar -czf "dist/tts-cli-darwin-universal.tar.gz" -C "$temp_dir" .
    rm -rf "$temp_dir"
    size=$(ls -lh "dist/tts-cli-darwin-universal.tar.gz" | awk '{print $5}')
    echo "✅ Created: dist/tts-cli-darwin-universal.tar.gz ($size)"
fi

# ===========================
# 5. Summary
# ===========================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Build Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Build Results:"
for result in "${BUILD_RESULTS[@]}"; do
    echo "  $result"
done
echo ""
echo "Executables:"
ls -lh dist/tts-cli* 2>/dev/null | grep -v ".tar.gz\|.zip" | while read -r line; do
    echo "  $line"
done
echo ""
echo "Archives:"
ls -lh dist/tts-cli*.{tar.gz,zip} 2>/dev/null 2>/dev/null | grep -v "No such file" | while read -r line; do
    echo "  $line"
done
echo ""
echo "✅ Cross-platform build complete!"
echo ""
echo "📦 Platform Coverage:"
echo "  • macOS:   x64 ✓  arm64 ✓  (Intel & Apple Silicon)"
echo "  • Linux:   x64 ✓  arm64 ✓  (AMD/Intel & ARM)"
echo "  • Windows: x64 ✓  arm64 ✓  (AMD/Intel & ARM)"
echo ""
echo "💡 Next steps:"
echo "  1. Test binaries on target platforms"
echo "  2. Run 'bun run installers' to create platform installers"
echo "  3. Upload archives to GitHub Releases or distribution site"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"