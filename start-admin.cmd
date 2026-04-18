@echo off
cd /d "%~dp0"
set PATH=%PATH%;C:\Users\81904\AppData\Roaming\npm

:: 既に 5173 で dev サーバーが起動中ならブラウザだけ開く。
:: 未起動なら pnpm dev を起動しつつ、5秒後にブラウザを開く。
:: このアプリは HashRouter を使っているため URL は /#/xxx 形式。
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if %errorlevel%==0 (
  start "" http://localhost:5173/#/admin
) else (
  start "" cmd /c "timeout /t 5 /nobreak >nul && start "" http://localhost:5173/#/admin"
  pnpm dev
)
