@echo off
chcp 65001 >nul
echo ========================================================
echo   🚀 ĐANG KHỞI ĐỘNG EUROASIA KITCHEN (FULL HỆ THỐNG)
echo ========================================================
echo.
cd /d "%~dp0"
node scripts/clean_ports.js
start "EuroAsia Backend Server" cmd /k "node server/index.js"
echo Đang bật giao diện Web...
npx vite --configLoader runner --port 3000
pause
