#!/bin/bash

# Generate platform-specific installers for TTS CLI
# Creates installers for macOS/Linux (bash) and Windows (PowerShell)

echo "🚀 Generating platform-specific installers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if executable exists
if [ ! -f "dist/tts-cli" ] && [ ! -f "dist/tts-cli.exe" ]; then
    echo "❌ Error: No executable found in dist/"
    echo "💡 Run 'bun run build' first"
    exit 1
fi

# Create installer directory
mkdir -p installer

# ===========================
# 1. Unix Installer (macOS/Linux)
# ===========================
echo ""
echo "📦 Creating Unix installer (macOS/Linux)..."

cat > installer/install.sh << 'EOF'
#!/bin/bash

# TTS CLI Installer for macOS and Linux
# This script extracts and installs the TTS CLI binary

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "     TTS CLI Installer (Unix)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_NAME="macOS"
    DEFAULT_BIN_DIR="/usr/local/bin"
elif [[ "$OSTYPE" == "linux"* ]]; then
    OS_NAME="Linux"
    DEFAULT_BIN_DIR="/usr/local/bin"
else
    echo "⚠️  Unsupported OS: $OSTYPE"
    echo "This installer supports macOS and Linux only."
    exit 1
fi

echo "🖥️  Detected OS: $OS_NAME"
echo ""

# Find the line where the payload starts
PAYLOAD_LINE=$(awk '/^__PAYLOAD_BELOW__/ {print NR + 1; exit 0; }' "$0")

# Extract to temporary directory
echo "📦 Extracting TTS CLI..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
tail -n +$PAYLOAD_LINE "$OLDPWD/$0" | tar -xz
chmod +x tts-cli

# Verify extraction
if [ ! -f "tts-cli" ]; then
    echo "❌ Error: Failed to extract tts-cli binary"
    exit 1
fi

echo "✅ Extraction successful!"
echo ""

# Determine installation directory
if [ -w "$DEFAULT_BIN_DIR" ]; then
    BIN_DIR="$DEFAULT_BIN_DIR"
    NEEDS_SUDO=false
elif [ -d "$HOME/.local/bin" ]; then
    BIN_DIR="$HOME/.local/bin"
    NEEDS_SUDO=false
elif [ -d "$HOME/bin" ]; then
    BIN_DIR="$HOME/bin"
    NEEDS_SUDO=false
else
    # Create ~/.local/bin if it doesn't exist
    BIN_DIR="$HOME/.local/bin"
    mkdir -p "$BIN_DIR"
    NEEDS_SUDO=false
fi

# Check if we need sudo for system-wide installation
if [[ "$BIN_DIR" == "/usr/local/bin" ]] && [ ! -w "$BIN_DIR" ]; then
    NEEDS_SUDO=true
fi

# Ask user for installation preference
echo "📍 Installation Options:"
echo "  1) System-wide ($DEFAULT_BIN_DIR) $([ "$NEEDS_SUDO" = true ] && echo "[requires sudo]")"
echo "  2) User only ($HOME/.local/bin)"
echo "  3) Current directory"
echo "  4) Cancel installation"
echo ""
read -p "Choose installation option (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        BIN_DIR="$DEFAULT_BIN_DIR"
        if [ "$NEEDS_SUDO" = true ]; then
            echo "🔐 Installing to $BIN_DIR (requires sudo)..."
            sudo cp tts-cli "$BIN_DIR/tts-cli"
            sudo chmod +x "$BIN_DIR/tts-cli"
        else
            echo "📦 Installing to $BIN_DIR..."
            cp tts-cli "$BIN_DIR/tts-cli"
        fi
        ;;
    2)
        BIN_DIR="$HOME/.local/bin"
        mkdir -p "$BIN_DIR"
        echo "📦 Installing to $BIN_DIR..."
        cp tts-cli "$BIN_DIR/tts-cli"
        ;;
    3)
        echo "📦 Installing to current directory..."
        cp tts-cli "$OLDPWD/"
        cd "$OLDPWD"
        echo "✅ TTS CLI installed as ./tts-cli"
        echo "📝 Usage: ./tts-cli \"Hello, world!\""
        rm -rf "$TEMP_DIR"
        exit 0
        ;;
    *)
        echo "❌ Installation cancelled"
        rm -rf "$TEMP_DIR"
        exit 0
        ;;
esac

# Check if bin directory is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo ""
    echo "⚠️  Note: $BIN_DIR is not in your PATH"
    echo ""
    echo "📝 Add it to your PATH by adding this line to your shell config:"
    
    # Detect shell and provide appropriate instructions
    if [[ "$SHELL" == *"zsh"* ]]; then
        CONFIG_FILE="$HOME/.zshrc"
        echo "    echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> $CONFIG_FILE"
    elif [[ "$SHELL" == *"bash"* ]]; then
        if [ -f "$HOME/.bash_profile" ]; then
            CONFIG_FILE="$HOME/.bash_profile"
        else
            CONFIG_FILE="$HOME/.bashrc"
        fi
        echo "    echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> $CONFIG_FILE"
    elif [[ "$SHELL" == *"fish"* ]]; then
        CONFIG_FILE="$HOME/.config/fish/config.fish"
        echo "    echo 'set -gx PATH $BIN_DIR \$PATH' >> $CONFIG_FILE"
    else
        echo "    export PATH=\"$BIN_DIR:\$PATH\""
    fi
    
    echo ""
    echo "Then reload your shell configuration or restart your terminal."
fi

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "✅ TTS CLI successfully installed to $BIN_DIR"
echo "📝 Usage: tts-cli \"Hello, world!\""
echo ""
echo "Try it now:"
echo "  tts-cli --help"
echo "  tts-cli \"Welcome to text to speech!\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
__PAYLOAD_BELOW__
EOF

# Append the binary to the installer
if [ -f "dist/tts-cli" ]; then
    tar -cz -C dist tts-cli >> installer/install.sh
    chmod +x installer/install.sh
    echo "✅ Created Unix installer: installer/install.sh"
fi

# ===========================
# 2. Windows PowerShell Installer
# ===========================
echo ""
echo "📦 Creating Windows PowerShell installer..."

cat > installer/install.ps1 << 'EOF'
# TTS CLI Installer for Windows
# Run this script in PowerShell with: powershell -ExecutionPolicy Bypass -File install.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "     TTS CLI Installer (Windows)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

# Function to extract embedded executable
function Extract-Executable {
    $scriptPath = $MyInvocation.ScriptName
    if (-not $scriptPath) {
        $scriptPath = $PSCommandPath
    }
    
    # Read the script content
    $content = Get-Content -Path $scriptPath -Raw
    
    # Find the marker
    $marker = "# __PAYLOAD_BELOW__"
    $markerIndex = $content.IndexOf($marker)
    
    if ($markerIndex -eq -1) {
        throw "Payload marker not found in installer"
    }
    
    # Get the base64 payload
    $base64Start = $markerIndex + $marker.Length + 1
    $base64Data = $content.Substring($base64Start).Trim()
    
    # Decode and save
    $bytes = [Convert]::FromBase64String($base64Data)
    $tempFile = Join-Path $env:TEMP "tts-cli.exe"
    [System.IO.File]::WriteAllBytes($tempFile, $bytes)
    
    return $tempFile
}

try {
    Write-Host "📦 Extracting TTS CLI..." -ForegroundColor Yellow
    
    # Extract the executable
    $exePath = Extract-Executable
    
    if (-not (Test-Path $exePath)) {
        throw "Failed to extract tts-cli.exe"
    }
    
    Write-Host "✅ Extraction successful!" -ForegroundColor Green
    Write-Host ""
    
    # Determine installation directory
    $defaultPaths = @(
        "$env:LOCALAPPDATA\Microsoft\WindowsApps",  # User PATH by default on Windows 10+
        "$env:USERPROFILE\bin",                      # User bin directory
        "$env:PROGRAMFILES\tts-cli",                 # Program Files (requires admin)
        "C:\tools\tts-cli"                           # Common tools directory
    )
    
    # Show installation options
    Write-Host "📍 Installation Options:" -ForegroundColor Cyan
    Write-Host "  1) User directory ($env:LOCALAPPDATA\Microsoft\WindowsApps)"
    Write-Host "  2) User bin ($env:USERPROFILE\bin)"
    if ($isAdmin) {
        Write-Host "  3) Program Files ($env:PROGRAMFILES\tts-cli)"
        Write-Host "  4) Tools directory (C:\tools\tts-cli)"
        Write-Host "  5) Current directory"
        Write-Host "  6) Cancel installation"
    } else {
        Write-Host "  3) Current directory"
        Write-Host "  4) Cancel installation"
        Write-Host ""
        Write-Host "  💡 Run as Administrator for system-wide installation options" -ForegroundColor Yellow
    }
    Write-Host ""
    
    $choice = Read-Host "Choose installation option"
    
    # Process choice
    switch ($choice) {
        "1" {
            $installDir = "$env:LOCALAPPDATA\Microsoft\WindowsApps"
            $addToPath = $false  # Usually already in PATH
        }
        "2" {
            $installDir = "$env:USERPROFILE\bin"
            $addToPath = $true
        }
        "3" {
            if ($isAdmin) {
                $installDir = "$env:PROGRAMFILES\tts-cli"
                $addToPath = $true
            } else {
                $installDir = Get-Location
                $addToPath = $false
                Write-Host "📦 Installing to current directory..." -ForegroundColor Yellow
            }
        }
        "4" {
            if ($isAdmin) {
                $installDir = "C:\tools\tts-cli"
                $addToPath = $true
            } else {
                Write-Host "❌ Installation cancelled" -ForegroundColor Red
                Remove-Item $exePath -Force
                exit 0
            }
        }
        "5" {
            if ($isAdmin) {
                $installDir = Get-Location
                $addToPath = $false
                Write-Host "📦 Installing to current directory..." -ForegroundColor Yellow
            } else {
                Write-Host "❌ Invalid option" -ForegroundColor Red
                Remove-Item $exePath -Force
                exit 1
            }
        }
        "6" {
            if ($isAdmin) {
                Write-Host "❌ Installation cancelled" -ForegroundColor Red
                Remove-Item $exePath -Force
                exit 0
            } else {
                Write-Host "❌ Invalid option" -ForegroundColor Red
                Remove-Item $exePath -Force
                exit 1
            }
        }
        default {
            Write-Host "❌ Invalid option" -ForegroundColor Red
            Remove-Item $exePath -Force
            exit 1
        }
    }
    
    # Create installation directory if needed
    if (-not (Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    }
    
    # Copy executable
    $targetPath = Join-Path $installDir "tts-cli.exe"
    Write-Host "📦 Installing to $installDir..." -ForegroundColor Yellow
    Copy-Item -Path $exePath -Destination $targetPath -Force
    
    # Clean up temp file
    Remove-Item $exePath -Force
    
    # Add to PATH if needed
    if ($addToPath) {
        $currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
        if ($currentPath -notlike "*$installDir*") {
            Write-Host ""
            Write-Host "📝 Adding $installDir to PATH..." -ForegroundColor Yellow
            
            $newPath = "$currentPath;$installDir"
            [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
            
            # Update current session
            $env:Path = "$env:Path;$installDir"
            
            Write-Host "✅ PATH updated successfully!" -ForegroundColor Green
            Write-Host "   Restart your terminal for changes to take effect." -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "✅ TTS CLI successfully installed!" -ForegroundColor Green
    Write-Host "📝 Usage: tts-cli `"Hello, world!`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Try it now (in a new terminal):" -ForegroundColor Yellow
    Write-Host "  tts-cli --help"
    Write-Host "  tts-cli `"Welcome to text to speech!`""
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Installation failed: $_" -ForegroundColor Red
    exit 1
}

# __PAYLOAD_BELOW__
EOF

# ===========================
# 3. Windows Batch Installer (Alternative)
# ===========================
echo "📦 Creating Windows batch installer..."

cat > installer/install.bat << 'EOF'
@echo off
setlocal EnableDelayedExpansion

echo.
echo ==========================================
echo      TTS CLI Installer (Windows)
echo ==========================================
echo.

:: Check if PowerShell is available
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is required but not found.
    echo Please install PowerShell or use the manual installation method.
    pause
    exit /b 1
)

:: Run the PowerShell installer
echo Launching PowerShell installer...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1"

if %errorlevel% neq 0 (
    echo.
    echo Installation failed. You may need to run as Administrator.
    echo Or try: powershell -ExecutionPolicy Bypass -File install.ps1
)

pause
EOF

echo "✅ Created Windows batch installer: installer/install.bat"

# ===========================
# 4. Cross-platform installer selector
# ===========================
echo "📦 Creating universal installer script..."

cat > installer/install << 'EOF'
#!/bin/sh

# Universal installer that detects the platform and runs the appropriate installer

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "     TTS CLI Universal Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect the operating system
if [ "$(uname)" = "Darwin" ]; then
    echo "🖥️  Detected: macOS"
    echo "Running Unix installer..."
    exec bash "$SCRIPT_DIR/install.sh"
elif [ "$(uname)" = "Linux" ]; then
    echo "🖥️  Detected: Linux"
    echo "Running Unix installer..."
    exec bash "$SCRIPT_DIR/install.sh"
elif [ -n "$COMSPEC" ] || [ "$(uname -s | cut -c 1-5)" = "MINGW" ] || [ "$(uname -s | cut -c 1-4)" = "MSYS" ]; then
    echo "🖥️  Detected: Windows"
    echo "Running Windows installer..."
    
    # Try PowerShell first
    if command -v powershell >/dev/null 2>&1; then
        powershell -ExecutionPolicy Bypass -File "$SCRIPT_DIR/install.ps1"
    else
        # Fall back to batch file
        cmd //c "$SCRIPT_DIR\\install.bat"
    fi
else
    echo "⚠️  Unsupported operating system: $(uname)"
    echo "Please use the platform-specific installer:"
    echo "  - Unix/Linux/macOS: bash install.sh"
    echo "  - Windows: powershell -ExecutionPolicy Bypass -File install.ps1"
    exit 1
fi
EOF

chmod +x installer/install
echo "✅ Created universal installer: installer/install"

# ===========================
# 5. Generate Windows executable installer if on Windows or if .exe exists
# ===========================
if [ -f "dist/tts-cli.exe" ]; then
    echo ""
    echo "📦 Adding Windows executable to PowerShell installer..."
    
    # Encode the exe file as base64 and append to PowerShell script
    base64 dist/tts-cli.exe >> installer/install.ps1
    
    echo "✅ Windows executable embedded in installer/install.ps1"
fi

# ===========================
# Summary
# ===========================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installer generation complete!"
echo ""
echo "📦 Generated installers:"
echo "  • installer/install       - Universal installer (auto-detects OS)"
echo "  • installer/install.sh    - Unix/Linux/macOS installer"
echo "  • installer/install.ps1   - Windows PowerShell installer"
echo "  • installer/install.bat   - Windows batch launcher"
echo ""
echo "📝 Usage:"
echo "  Universal:  bash installer/install"
echo "  Unix:       bash installer/install.sh"
echo "  Windows:    powershell -ExecutionPolicy Bypass -File installer\\install.ps1"
echo "           or double-click installer\\install.bat"
echo ""
echo "💡 The universal installer will automatically detect the OS"
echo "   and run the appropriate platform-specific installer."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"