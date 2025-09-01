#!/bin/bash
# TTS CLI Installer Script
# Automatically detects platform and architecture, downloads and installs the appropriate binary

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO="phyter1/tts-cli"
BINARY_NAME="tts-cli"
INSTALL_DIR="/usr/local/bin"

# Functions
print_error() {
    echo -e "${RED}Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_info() {
    echo -e "${YELLOW}$1${NC}"
}

# Detect OS and Architecture
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"
    
    case "$OS" in
        Darwin*)
            PLATFORM="darwin"
            ;;
        Linux*)
            PLATFORM="linux"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            PLATFORM="windows"
            ;;
        *)
            print_error "Unsupported operating system: $OS"
            exit 1
            ;;
    esac
    
    case "$ARCH" in
        x86_64|amd64)
            ARCHITECTURE="x64"
            ;;
        arm64|aarch64)
            ARCHITECTURE="arm64"
            ;;
        *)
            print_error "Unsupported architecture: $ARCH"
            exit 1
            ;;
    esac
    
    # Special case for macOS to check if running on Apple Silicon
    if [ "$PLATFORM" = "darwin" ] && [ "$ARCHITECTURE" = "x64" ]; then
        if [ "$(sysctl -n sysctl.proc_translated 2>/dev/null)" = "1" ]; then
            ARCHITECTURE="arm64"
            print_info "Detected Apple Silicon (running under Rosetta 2)"
        fi
    fi
}

# Check for required tools
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed. Please install curl and try again."
        exit 1
    fi
    
    if [ "$PLATFORM" != "windows" ]; then
        if ! command -v tar &> /dev/null; then
            print_error "tar is required but not installed. Please install tar and try again."
            exit 1
        fi
    fi
}

# Download and install binary
install_binary() {
    print_info "Installing TTS CLI for $PLATFORM-$ARCHITECTURE..."
    
    # Determine file extension
    if [ "$PLATFORM" = "windows" ]; then
        FILE_EXT="zip"
        BINARY_NAME="tts-cli.exe"
    else
        FILE_EXT="tar.gz"
    fi
    
    # Construct download URL
    DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/tts-cli-${PLATFORM}-${ARCHITECTURE}.${FILE_EXT}"
    
    # Create temporary directory
    TMP_DIR=$(mktemp -d)
    trap "rm -rf $TMP_DIR" EXIT
    
    print_info "Downloading from: $DOWNLOAD_URL"
    
    # Download the release
    if ! curl -L --fail --progress-bar "$DOWNLOAD_URL" -o "$TMP_DIR/tts-cli.${FILE_EXT}"; then
        print_error "Failed to download TTS CLI. Please check your internet connection and try again."
        print_error "URL attempted: $DOWNLOAD_URL"
        exit 1
    fi
    
    # Extract the archive
    print_info "Extracting..."
    cd "$TMP_DIR"
    if [ "$PLATFORM" = "windows" ]; then
        unzip -q "tts-cli.${FILE_EXT}"
    else
        tar -xzf "tts-cli.${FILE_EXT}"
    fi
    
    # Make binary executable (Unix-like systems)
    if [ "$PLATFORM" != "windows" ]; then
        chmod +x "$BINARY_NAME"
    fi
    
    # Install the binary
    if [ "$PLATFORM" = "windows" ]; then
        # For Windows, install to user's home directory
        INSTALL_DIR="$HOME/bin"
        mkdir -p "$INSTALL_DIR"
        mv "$BINARY_NAME" "$INSTALL_DIR/"
        print_success "TTS CLI installed to $INSTALL_DIR/$BINARY_NAME"
        print_info "Add $INSTALL_DIR to your PATH to use tts-cli from anywhere"
    else
        # For Unix-like systems, try to install to system directory
        if [ -w "$INSTALL_DIR" ]; then
            mv "$BINARY_NAME" "$INSTALL_DIR/"
        else
            print_info "Installing to $INSTALL_DIR requires sudo permission..."
            sudo mv "$BINARY_NAME" "$INSTALL_DIR/"
        fi
        print_success "TTS CLI installed to $INSTALL_DIR/$BINARY_NAME"
    fi
}

# Verify installation
verify_installation() {
    if [ "$PLATFORM" = "windows" ]; then
        if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
            print_success "Installation complete!"
            print_info "Run '$INSTALL_DIR/$BINARY_NAME --help' to get started"
        else
            print_error "Installation verification failed"
            exit 1
        fi
    else
        if command -v tts-cli &> /dev/null; then
            print_success "Installation complete!"
            print_info "Run 'tts-cli --help' to get started"
            
            # Show version
            tts-cli --version 2>/dev/null || true
        else
            print_error "Installation verification failed"
            print_info "You may need to restart your terminal or add $INSTALL_DIR to your PATH"
        fi
    fi
}

# Main installation flow
main() {
    echo "==================================="
    echo "     TTS CLI Installer"
    echo "==================================="
    echo
    
    detect_platform
    print_info "Detected: $PLATFORM-$ARCHITECTURE"
    echo
    
    check_dependencies
    install_binary
    verify_installation
    
    echo
    echo "==================================="
    print_success "    Installation Successful!"
    echo "==================================="
}

# Run the installer
main "$@"