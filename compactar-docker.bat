@echo off
echo ========================================
echo   COMPACTAR DISCO VIRTUAL DE DOCKER
echo ========================================
echo.
echo Este script va a recuperar el espacio real eliminado.
echo.
echo PASO 1: Cerrando Docker Desktop...
taskkill /F /IM "Docker Desktop.exe" 2>nul
timeout /t 3 /nobreak >nul

echo PASO 2: Deteniendo WSL...
wsl --shutdown
timeout /t 3 /nobreak >nul

echo PASO 3: Compactando el disco virtual (esto puede tardar varios minutos)...
echo select vdisk file="%LOCALAPPDATA%\Docker\wsl\disk\docker_data.vhdx" > %TEMP%\compact.txt
echo attach vdisk readonly >> %TEMP%\compact.txt
echo compact vdisk >> %TEMP%\compact.txt
echo detach vdisk >> %TEMP%\compact.txt
echo exit >> %TEMP%\compact.txt

diskpart /s %TEMP%\compact.txt

del %TEMP%\compact.txt

echo.
echo ========================================
echo   COMPACTACION COMPLETADA
echo ========================================
echo.
echo Tamaño del disco antes: ~32 GB
echo Espacio recuperado esperado: ~13 GB
echo.
echo Ahora puedes iniciar Docker Desktop de nuevo.
echo.
pause
