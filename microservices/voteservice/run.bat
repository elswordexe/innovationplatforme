@echo off
setlocal
title voteservice - Spring Boot

REM Always run from this service folder
cd /d "%~dp0"

echo ============================================
echo   Starting voteservice (Spring Boot)
echo ============================================

call mvnw.cmd spring-boot:run

echo ============================================
echo   voteservice stopped.
echo ============================================
pause
