@echo off
:: Vite(5173) と Express/tRPC(3000) の両方が LISTENING になるまで最大30秒ポーリングし、
:: 揃ったら第1引数で指定された HashRouter パス（例: /#/admin、/#/）をブラウザで開く。
:: start-admin.cmd / start-home.cmd から呼ばれる内部ヘルパー。
set HASH_PATH=%~1
if "%HASH_PATH%"=="" set HASH_PATH=/

:: Chrome を --new-window で開く（無ければ start にフォールバック）。理由は start-admin.cmd 参照。
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

set /a cnt=0
:wait_loop
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if errorlevel 1 goto not_ready
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if errorlevel 1 goto not_ready
goto open

:not_ready
timeout /t 2 /nobreak >nul
set /a cnt+=1
if %cnt% lss 15 goto wait_loop

:: 30秒経っても両方揃わなかった場合も、一応 Vite の画面だけは開く。
:open
if defined CHROME (
  start "" "%CHROME%" --new-window "http://localhost:5173%HASH_PATH%"
) else (
  start "" "http://localhost:5173%HASH_PATH%"
)
exit /b 0