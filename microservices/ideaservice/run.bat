@echo off
setlocal
title ideaservice - Spring Boot

REM Always run from this service folder
cd /d "%~dp0"

echo ============================================
echo   Starting ideaservice (Spring Boot)
echo ============================================

call mvnw.cmd spring-boot:run

echo ============================================
echo   ideaservice stopped.
echo ============================================
pause
