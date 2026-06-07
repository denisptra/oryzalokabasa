@echo off
title Deploy Oryza Lokabasa - Hero Title Fix
echo ===================================================
echo    DEPLOY: Hero Title Split (Putih + Emas)
echo ===================================================
echo.

echo [1/4] Committing changes...
cd /d d:\oryzalokabasa
git add frontend/src/components/Hero.jsx
git add frontend/src/app/panel-admin/hero-slider/page.jsx
git commit -m "feat: hero title split - baris atas putih, baris bawah emas (gunakan pipe delimiter)"

echo.
echo [2/4] Pushing to remote...
git push origin main

echo.
echo [3/4] Connecting to server via SSH...
echo Password: OryzaLokabasa123!
echo.
echo Jalankan perintah berikut di server:
echo   ssh root@154.19.37.25
echo   cd /var/www/oryzalokabasa (atau lokasi project di server)
echo   git pull origin main
echo   cd frontend
echo   npm run build
echo   pm2 restart all

echo.
echo [4/4] Atau jalankan langsung:
ssh -o StrictHostKeyChecking=no root@154.19.37.25 "cd /var/www/oryzalokabasa && git pull origin main && cd frontend && npm run build && pm2 restart all"

echo.
echo ===================================================
echo    DEPLOYMENT SELESAI!
echo ===================================================
pause
