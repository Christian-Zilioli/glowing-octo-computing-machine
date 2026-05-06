@echo off
title IoT Monitor - Launcher
color 0A

echo.
echo  ==========================================
echo   IOT_MONITOR - Avvio in corso...
echo  ==========================================
echo.

:: Controlla che node sia installato
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERRORE] Node.js non trovato. Installalo da https://nodejs.org
    pause
    exit /b 1
)

:: Controlla che le dipendenze siano installate
if not exist "node_modules" (
    echo  [INFO] node_modules non trovato, installo le dipendenze...
    call npm install
    echo.
)

:: Resetta db.json se e' corrotto
node -e "try{JSON.parse(require('fs').readFileSync('db.json','utf8'))}catch(e){require('fs').writeFileSync('db.json','{\"readings\":[]}');console.log('[DB] db.json resettato');}"

echo  Avvio server principale...
start "IoT - Server" cmd /k "color 0B && echo  SERVER (HTTP + UDP + WebSocket) && echo. && node server.js"
timeout /t 2 /nobreak >nul

echo  Avvio sensore meteo...
start "IoT - Meteo" cmd /k "color 0E && echo  SENSORE: Meteo (Open-Meteo) && echo. && node sensors/sensor_meteo.js"
timeout /t 1 /nobreak >nul

echo  Avvio sensore crypto...
start "IoT - Crypto" cmd /k "color 0D && echo  SENSORE: Crypto (CoinGecko) && echo. && node sensors/sensor_crypto.js"
timeout /t 1 /nobreak >nul

echo  Avvio sensore sismica...
start "IoT - Sismica" cmd /k "color 04 && echo  SENSORE: Sismica (USGS) && echo. && node sensors/sensor_sismica.js"
timeout /t 2 /nobreak >nul

echo.
echo  ==========================================
echo   Tutti i processi avviati!
echo   Apri il browser su: http://localhost:3000
echo  ==========================================
echo.

:: Apre automaticamente il browser
start "" "http://localhost:3000"

echo  Premi un tasto per SPEGNERE tutto...
pause >nul

:: Chiude tutti i terminali dei sensori e del server
echo.
echo  Spegnimento in corso...
taskkill /fi "WindowTitle eq IoT - Server*"    /f >nul 2>&1
taskkill /fi "WindowTitle eq IoT - Meteo*"     /f >nul 2>&1
taskkill /fi "WindowTitle eq IoT - Crypto*"    /f >nul 2>&1
taskkill /fi "WindowTitle eq IoT - Sismica*"   /f >nul 2>&1

echo  Tutti i processi terminati.
timeout /t 2 /nobreak >nul