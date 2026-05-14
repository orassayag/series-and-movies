@echo off
setlocal
cd /d "%~dp0"
set TERM=xterm
call pnpm exec tsx src/main.ts add
pause
endlocal
