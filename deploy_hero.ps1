# Deploy script untuk OryzaLokabasa - Hero Title Fix
# Jalankan: powershell -ExecutionPolicy Bypass -File deploy_hero.ps1

$ErrorActionPreference = "Continue"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   DEPLOY: Hero Title Split (Putih + Emas)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Git commit and push
Write-Host "[1/3] Committing changes..." -ForegroundColor Yellow
Set-Location "d:\oryzalokabasa"
git add frontend/src/components/Hero.jsx
git add frontend/src/app/panel-admin/hero-slider/page.jsx
git commit -m "feat: hero title split - baris atas putih, baris bawah emas (gunakan pipe delimiter)"
Write-Host ""

Write-Host "[2/3] Pushing to remote..." -ForegroundColor Yellow
git push origin main
Write-Host ""

# Step 3: SSH to server and deploy
Write-Host "[3/3] Deploying to server..." -ForegroundColor Yellow
$env:SSHPASS = "OryzaLokabasa123!"

# Try SSH deployment
ssh -o StrictHostKeyChecking=no root@154.19.37.25 @"
cd /var/www/oryzalokabasa || cd /root/oryzalokabasa || { echo 'Finding project directory...'; find / -name 'oryzalokabasa' -type d 2>/dev/null | head -5; exit 1; }
echo 'Pulling latest changes...'
git pull origin main
echo 'Rebuilding frontend...'
cd frontend
npm run build
echo 'Restarting services...'
pm2 restart all 2>/dev/null || systemctl restart oryzalokabasa 2>/dev/null || echo 'No process manager found, please restart manually'
echo 'Deploy complete!'
"@

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SELESAI!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Read-Host "Press Enter to exit"
