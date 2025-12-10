@echo off
title Microservices Launcher

echo ============================================
echo   STARTING SPRING MICRO-SERVICES SUITE
echo ============================================

REM
echo Starting Eureka server...
start cmd /k "cd eureka && mvnw spring-boot:run"

REM --- Open API Gateway ---
echo Starting API Gateway...
start cmd /k "cd gateway && mvnw spring-boot:run"

REM --- Open User Service ---
echo Starting User Service...
start cmd /k "cd userservice && mvnw spring-boot:run"

echo Starting idea Service...
start cmd /k "cd ideaservice && mvnw spring-boot:run"
echo Starting vote Service...
start cmd /k "cd voteservice && mvnw spring-boot:run"
echo Starting Workflow Service...
start cmd /k "cd workflowservice && mvnw spring-boot:run"

echo Starting Team Service...
start cmd /k "cd TeamService && mvnw spring-boot:run"

echo ============================================
echo   All services started in separate windows.
echo ============================================
pause
