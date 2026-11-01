@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-preview.ps1"
if errorlevel 1 (
  echo.
  echo Preview could not start. See the message above.
  pause
)
endlocal
