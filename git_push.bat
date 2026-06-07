@echo off
echo Checking git status...
git status
echo.
echo Adding changes...
git add frontend/src/components/Hero.jsx frontend/src/app/panel-admin/hero-slider/page.jsx
echo.
echo Committing...
git commit -m "feat: hero title split - white top, gold bottom using pipe delimiter"
echo.
echo Pushing to remote...
git push origin main
echo.
echo Done!
pause
