@echo off
REM Bam dup vao file nay de chay web to mau (Windows).
cd /d "%~dp0"
if not exist node_modules (
  echo Dang cai thu vien lan dau, vui long cho...
  call npm install
)
start "" cmd /c "timeout /t 8 >nul && start http://localhost:5173"
npm run dev
pause
