@echo off
title Deploy Oryza Lokabasa - Golden Break + CSS Fix
echo ===================================================
echo    DEPLOY: Golden Break Hero + Tailwind v4 Fix
echo ===================================================
echo.

echo [1/4] Adding changed files...
cd /d d:\oryzalokabasa
git add frontend/src/components/Hero.jsx
git add frontend/src/app/globals.css
echo.

echo [2/4] Committing...
git commit -m "feat: golden wave break at hero bottom + fix tailwind v4 custom colors"
echo.

echo [3/4] Pushing to GitHub...
git push origin main
echo.

echo [4/4] Deploying to server...
ssh -o StrictHostKeyChecking=no root@154.19.37.25 "cd /var/www/oryzalokabasa && git pull origin main && cd frontend && npm run build && pm2 restart all"

echo.
echo ===================================================
echo    DEPLOYMENT SELESAI!
echo ===================================================
pause
