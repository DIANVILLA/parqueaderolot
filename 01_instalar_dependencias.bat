@echo off
setlocal
title Parqueadero LOT - instalar dependencias

echo.
echo ============================================
echo   Parqueadero LOT - instalacion local
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js. Instale Node.js LTS y vuelva a ejecutar este archivo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo No se encontro npm. Revise la instalacion de Node.js.
  pause
  exit /b 1
)

where java >nul 2>nul
if errorlevel 1 (
  echo No se encontro Java. Instale Java JDK 25 y vuelva a ejecutar este archivo.
  pause
  exit /b 1
)

echo Instalando dependencias del frontend...
cd /d "%~dp0frontend-react"
call npm install
if errorlevel 1 (
  echo No se pudieron instalar las dependencias del frontend.
  pause
  exit /b 1
)

echo.
echo Preparando dependencias del backend...
cd /d "%~dp0backend"
call mvnw.cmd -q -DskipTests package
if errorlevel 1 (
  echo No se pudo preparar el backend. Revise Java 25 y la conexion a internet.
  pause
  exit /b 1
)

echo.
echo Dependencias instaladas correctamente.
pause
