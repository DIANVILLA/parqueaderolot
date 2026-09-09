@echo off
setlocal
title Parqueadero LOT - crear base de datos

echo.
echo ============================================
echo   Parqueadero LOT - base de datos MySQL
echo ============================================
echo.

set "MYSQL_EXE=mysql"
where mysql >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
  ) else (
    echo No se encontro mysql.exe.
    echo Instale MySQL Server o agregue mysql.exe al PATH de Windows.
    pause
    exit /b 1
  )
)

set /p MYSQL_USER=Usuario MySQL [root]: 
if "%MYSQL_USER%"=="" set "MYSQL_USER=root"

set /p MYSQL_PASS=Clave MySQL: 

echo.
echo Creando base parqueaderolot y tablas necesarias...
"%MYSQL_EXE%" -u%MYSQL_USER% -p%MYSQL_PASS% < "%~dp0database\parqueaderolot_schema.sql"
if errorlevel 1 (
  echo No se pudo crear la base de datos. Revise usuario, clave y servicio MySQL.
  pause
  exit /b 1
)

echo.
echo Base de datos lista.
echo Usuario de prueba: ricardoriascos07@gmail.com
echo Clave: 1234
pause
