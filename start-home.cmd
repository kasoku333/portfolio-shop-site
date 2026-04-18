@echo off
cd /d "%~dp0"
set PATH=%PATH%;C:\Users\81904\AppData\Roaming\npm

:: Vite(5173) と Express/tRPC(3000) の両方が LISTENING していないと
:: /api と /uploads のプロキシが機能しないので、両方を待ってからブラウザを開く。

:: 両方起動済みなら、ブラウザだけ開いて終わる。
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if errorlevel 1 goto boot
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if errorlevel 1 goto boot
start "" http://localhost:5173/
goto :eof

:boot
:: 未起動：ポーリング用ヘルパーを別窓で動かしつつ、本プロセスで pnpm dev を実行。
start "" /min cmd /c "%~dp0_wait-and-open.cmd /"
pnpm dev
