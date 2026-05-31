@echo off
cd /d "%~dp0"
set PATH=%PATH%;C:\Users\81904\AppData\Roaming\npm

:: このアプリは HashRouter を使用しているため URL は /#/xxx 形式。
:: 既定の "start URL" では、サイト本体(/)を開いている最中に管理画面(/#/admin)を開こうとしても
:: 「ハッシュ違いの同じページ」と見なされ、既存タブにフォーカスするだけで新しい画面が出ない。
:: そこで Chrome を --new-window で起動し、必ず別ウィンドウで開く（無ければ start にフォールバック）。
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

:: Vite(5173) と Express/tRPC(3000) の両方が LISTENING していないと
:: /api と /uploads のプロキシが機能しないので、両方を待ってからブラウザを開く。

:: 両方起動済みなら、ブラウザだけ開いて終わる。
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if errorlevel 1 goto boot
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if errorlevel 1 goto boot
if defined CHROME (
  start "" "%CHROME%" --new-window "http://localhost:5173/#/admin"
) else (
  start "" "http://localhost:5173/#/admin"
)
goto :eof

:boot
:: 未起動：ポーリング用ヘルパーを別窓で動かしつつ、本プロセスで pnpm dev を実行。
start "" /min cmd /c "%~dp0_wait-and-open.cmd /#/admin"
pnpm dev