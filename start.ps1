#!/usr/bin/env pwsh

# PowerShell equivalent of start.sh for Windows - React 16 compatible
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$currentDir = Get-Location

if ($scriptDir -eq $currentDir.Path) {
    Write-Host "Installing serve globally..." -ForegroundColor Green
    npm install -g serve
    
    Write-Host "Installing dependencies (React 16 compatible)..." -ForegroundColor Green
    npm install
    
    Write-Host "Building project with React 16..." -ForegroundColor Green
    npm run build
    
    Write-Host "Starting server on http://127.0.0.1:3020..." -ForegroundColor Green
    Write-Host "Note: This build uses React 16.14.0 for server compatibility" -ForegroundColor Yellow
    serve -s -l tcp://127.0.0.1:3020 dist
} else {
    Set-Location $scriptDir
    & "$scriptDir\start.ps1"
}
