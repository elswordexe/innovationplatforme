@echo off
echo ========================================
echo   Demarrage de Eureka Server (Port 8761)
echo ========================================
echo.

cd /d "%~dp0"

echo Demarrage de Eureka avec Maven Wrapper...
echo.
call mvnw.cmd spring-boot:run

pause
