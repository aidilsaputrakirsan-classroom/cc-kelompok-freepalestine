@echo off
REM Log helper — Microservices (Modul 14) — Windows
REM Usage: scripts\logs.bat all|errors|metrics|export

set COMPOSE=docker compose -f docker-compose.microservices.yml
set GATEWAY_URL=http://localhost:8080

if "%1"=="" goto usage
if "%1"=="all" goto all
if "%1"=="errors" goto errors
if "%1"=="metrics" goto metrics
if "%1"=="export" goto export
goto usage

:all
echo Following microservices logs...
%COMPOSE% logs -f auth-service dashboard-service gateway
goto end

:errors
%COMPOSE% logs --no-color auth-service dashboard-service gateway 2>&1 | findstr "ERROR"
goto end

:metrics
curl -s %GATEWAY_URL%/metrics/auth
echo.
curl -s %GATEWAY_URL%/metrics/dashboard
goto end

:export
if not exist logs mkdir logs
%COMPOSE% logs --no-color > logs\microservices-export.log 2>&1
echo Saved to logs\microservices-export.log
goto end

:usage
echo Usage: scripts\logs.bat {all^|errors^|metrics^|export}
: end
