@echo off
title Oryza Lokabasa Dev Starter
cls
echo ===================================================
echo            ORYZA LOKABASA DEV STARTER
echo ===================================================
echo.

:: 1. Check and create backend .env
if not exist "backend\.env" (
    echo [!] File backend\.env tidak ditemukan. Membuat file baru...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oryzalokabasa?schema=public"
        echo DIRECT_URL="postgresql://postgres:postgres@localhost:5432/oryzalokabasa?schema=public"
        echo JWT_SECRET="super-secret-key-for-oryza-lokabasa-development"
        echo PORT=5000
    ) > backend\.env
    echo [+] File backend\.env berhasil dibuat dengan konfigurasi default.
    echo.
) else (
    echo [v] File backend\.env sudah ada.
)

:: 2. Check and create frontend .env.local
if not exist "frontend\.env.local" (
    echo [!] File frontend\.env.local tidak ditemukan. Membuat file baru...
    (
        echo NEXT_PUBLIC_API_URL="http://localhost:5000/api"
    ) > frontend\.env.local
    echo [+] File frontend\.env.local berhasil dibuat.
    echo.
) else (
    echo [v] File frontend\.env.local sudah ada.
)

echo.
echo ===================================================
echo 3. KONFIGURASI DATABASE
echo ===================================================
echo Pastikan PostgreSQL Anda sudah aktif di port 5432.
echo.
set /p SETUP_DB="Apakah Anda ingin menjalankan setup database (migrate & seed)? [y/n]: "
if /I "%SETUP_DB%"=="y" (
    echo.
    echo JALANKAN SETUP DATABASE (backend)...
    cd backend
    echo Memasang dependencies backend...
    call npm install
    echo Menjalankan migrations dan seeder...
    call npm run setup
    cd ..
    echo [+] Setup database selesai.
    echo.
)

echo.
echo ===================================================
echo 4. MENJALANKAN BACKEND DAN FRONTEND
echo ===================================================
echo Backend akan berjalan di http://localhost:5000
echo Frontend akan berjalan di http://localhost:3000
echo.
echo Membuka terminal baru untuk Backend...
start "Oryza Backend" cmd /k "cd backend && npm install && npm run dev"

echo Membuka terminal baru untuk Frontend...
start "Oryza Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo [+] Selesai! Backend dan Frontend sedang dijalankan di jendela terpisah.
echo Anda dapat menutup jendela utama ini.
echo ===================================================
pause
