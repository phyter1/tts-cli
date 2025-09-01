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
