# Deploy script for OryzaLokabasa
# SCP files to server and rebuild

$server = "root@154.19.37.25"
$password = "OryzaLokabasa123!"

# Copy updated files
Write-Host "Copying Hero.jsx to server..."
scp -o StrictHostKeyChecking=no "frontend\src\components\Hero.jsx" "${server}:/var/www/oryzalokabasa/frontend/src/components/Hero.jsx"

Write-Host "Copying admin hero-slider page to server..."
scp -o StrictHostKeyChecking=no "frontend\src\app\panel-admin\hero-slider\page.jsx" "${server}:/var/www/oryzalokabasa/frontend/src/app/panel-admin/hero-slider/page.jsx"

Write-Host "Rebuilding frontend on server..."
ssh -o StrictHostKeyChecking=no $server "cd /var/www/oryzalokabasa/frontend && npm run build && pm2 restart all"

Write-Host "Deployment complete!"
