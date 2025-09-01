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
