@echo off
setlocal
title Parqueadero LOT - iniciar aplicacion

echo.
echo ============================================
echo   Parqueadero LOT - iniciar aplicacion
echo ============================================
echo.
echo Se abriran dos ventanas:
echo 1. Backend Spring Boot en http://localhost:8090
echo 2. Frontend React en http://localhost:3000
echo.

start "Backend Parqueadero LOT" cmd /k "cd /d ""%~dp0backend"" && call mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak >nul
start "Frontend Parqueadero LOT" cmd /k "cd /d ""%~dp0frontend-react"" && npm start"

echo.
echo Cuando el frontend termine de cargar, abra:
echo http://localhost:3000
pause
