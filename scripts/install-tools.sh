#!/bin/bash

# Install UPX compression tool for executable size reduction
# Cross-platform installation support

echo "Checking for UPX compression tool..."

if command -v upx >/dev/null 2>&1; then
    echo "✅ UPX is already installed ($(upx --version | head -n1))"
    exit 0
fi

echo "📦 Installing UPX compression tool..."

# macOS with Homebrew
if command -v brew >/dev/null 2>&1; then
    echo "Using Homebrew to install UPX..."
    brew install upx
    exit $?
fi

# Linux with apt-get (Debian/Ubuntu)
if command -v apt-get >/dev/null 2>&1; then
    echo "Using apt-get to install UPX..."
    sudo apt-get update && sudo apt-get install -y upx-ucl
    exit $?
fi

# Linux with yum (RHEL/CentOS/Fedora)
if command -v yum >/dev/null 2>&1; then
    echo "Using yum to install UPX..."
    sudo yum install -y upx
    exit $?
fi

# Linux with dnf (Modern Fedora)
if command -v dnf >/dev/null 2>&1; then
    echo "Using dnf to install UPX..."
    sudo dnf install -y upx
    exit $?
fi

# Linux with pacman (Arch)
if command -v pacman >/dev/null 2>&1; then
    echo "Using pacman to install UPX..."
    sudo pacman -S --noconfirm upx
    exit $?
fi

# Windows with Chocolatey
if command -v choco >/dev/null 2>&1; then
    echo "Using Chocolatey to install UPX..."
    choco install upx -y
    exit $?
fi

# Fallback message
echo "❌ Could not automatically install UPX."
echo ""
echo "Please install UPX manually from: https://upx.github.io/"
echo ""
echo "Installation options:"
echo "  • macOS: brew install upx"
echo "  • Ubuntu/Debian: sudo apt-get install upx-ucl"
echo "  • Fedora/RHEL: sudo yum install upx"
echo "  • Arch: sudo pacman -S upx"
echo "  • Windows: choco install upx"
echo "  • Manual: Download from https://github.com/upx/upx/releases"
exit 1