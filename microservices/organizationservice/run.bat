@echo off
echo ========================================
echo   Demarrage du OrganizationService (Port 8087)
echo ========================================
echo.

cd /d "%~dp0"

echo Demarrage du OrganizationService avec Maven Wrapper...
echo.
call mvnw.cmd spring-boot:run

pause
