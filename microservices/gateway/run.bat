@echo off
echo ========================================
echo   Demarrage du Gateway (Port 8080)
echo ========================================
echo.

cd /d "%~dp0"

echo Demarrage du Gateway avec Maven Wrapper...
echo.
call mvnw.cmd spring-boot:run

pause
