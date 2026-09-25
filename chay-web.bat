@echo off
REM ============================================================
REM  Bam dup vao file nay de chay web To Mau (Windows).
REM  Moi lan chay se tu dong:
REM    1. Tai ban moi nhat tu GitHub (nhanh main)
REM    2. Cai them thu vien neu ban moi can
REM    3. Chay web va mo trinh duyet http://localhost:5173
REM  Lan dau chay se tu tao bieu tuong "Web To Mau" ngoai Desktop.
REM ============================================================
title Web To Mau
cd /d "%~dp0"

REM Ca khoi ben duoi duoc doc 1 lan truoc khi chay, nen git pull co sua file nay cung khong sao.
(

  echo.
  echo [1/3] Dang kiem tra ban moi nhat...
  where git >nul 2>nul
  if errorlevel 1 (
    echo    Khong tim thay Git - bo qua buoc cap nhat.
  ) else (
    git checkout -- package-lock.json >nul 2>nul
    git checkout main >nul 2>nul
    git pull --ff-only
    if errorlevel 1 echo    Khong cap nhat duoc ^(mat mang?^) - van chay ban hien co.
  )

  echo.
  echo [2/3] Dang kiem tra thu vien...
  call npm install --no-audit --no-fund --loglevel=error
  if errorlevel 1 (
    echo    Cai thu vien bi loi. Hay chup man hinh nay gui ho tro.
    pause
    exit /b 1
  )

  REM Tao bieu tuong ngoai Desktop - chi lam 1 lan.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=[Environment]::GetFolderPath('Desktop'); $l=Join-Path $d 'Web To Mau.lnk'; if(-not (Test-Path $l)){ $s=(New-Object -ComObject WScript.Shell).CreateShortcut($l); $s.TargetPath='%~f0'; $s.WorkingDirectory='%~dp0'; $s.IconLocation='%SystemRoot%\System32\imageres.dll,186'; $s.Save(); Write-Host '   Da tao bieu tuong Web To Mau ngoai Desktop.' }"

  echo.
  echo [3/3] Dang chay web... Trinh duyet se tu mo sau vai giay.
  echo      DUNG TAT CUA SO NAY khi dang dung web. Muon tat web: bam Ctrl + C.
  echo.
  start "" cmd /c "timeout /t 8 >nul && start http://localhost:5173"
  call npm run dev
  pause
)
