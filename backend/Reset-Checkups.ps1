Write-Host "Running Check-Ups Reset..." -ForegroundColor Cyan
cd $PSScriptRoot
node reset-checkups.js
Write-Host "`nReset Complete! Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
