@echo off
setlocal
title userservice - Spring Boot

REM Always run from this service folder
cd /d "%~dp0"

echo ============================================
echo   Starting userservice (Spring Boot)
echo ============================================

call mvnw.cmd spring-boot:run

echo ============================================
echo   userservice stopped.
echo ============================================
pause
