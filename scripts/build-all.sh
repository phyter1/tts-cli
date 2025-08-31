#!/bin/bash

# Complete build process: build, backup, compress safely, and report
# This script combines all build steps for production-ready distribution

echo "🚀 Starting complete build process..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Build the executable
echo ""
echo "Step 1/3: Building executable..."
bash scripts/build.sh
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting..."
    exit 1
fi

# Step 2: Create backup of uncompressed version
echo ""
echo "Step 2/3: Creating backup..."
if [ -f "dist/tts" ]; then
    cp dist/tts dist/tts-original
    echo "✅ Backup created: dist/tts-original"
else
    echo "❌ No executable to backup!"
    exit 1
fi

# Step 3: Create compressed distribution files
echo ""
echo "Step 3/3: Creating compressed distribution files..."
bash scripts/compress-safe.sh
if [ $? -ne 0 ]; then
    echo "⚠️  Compression failed, but uncompressed build is available"
fi

# Final report
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Build Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Executables:"
ls -lh dist/tts* 2>/dev/null | grep -v ".dmg\|.tar.gz\|.zip" | while read -r line; do
    echo "  $line"
done
echo ""
echo "Distribution Archives:"
ls -lh dist/*.{dmg,tar.gz,zip} 2>/dev/null | while read -r line; do
    echo "  $line"
done

echo ""
echo "✅ Build complete!"
echo ""
echo "📝 Usage:"
echo "  Direct: ./dist/tts \"Hello, world!\""
echo "  From DMG: Mount and drag to Applications"
echo "  From Archive: Extract and run ./tts \"Hello, world!\""
echo ""
echo "🚀 Ready for distribution!"
echo ""