@echo off
title Festival della Scienza - IIS Asproni-Fermi Iglesias (Tema: La Visione)
echo ====================================================================
echo   FESTIVAL DELLA SCIENZA - I.I.S. "G. ASPRONI - E. FERMI" IGLESIAS
echo   Avvio del Server Node.js sul tema LA VISIONE...
echo ====================================================================

where node >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:3000
    node server.js
    goto :eof
)

where agy-node >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:3000
    call agy-node server.js
    goto :eof
)

if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
    start "" http://localhost:3000
    call "%APPDATA%\Antigravity\bin\agy-node.cmd" server.js
    goto :eof
)

echo Errore: Node.js non trovato nel percorso di sistema.
pause
