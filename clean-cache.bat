@echo off
echo Limpiando cache de Next.js...

REM Detener procesos de Node.js
taskkill /f /im node.exe 2>nul

REM Eliminar directorio .next
if exist ".next" (
    echo Eliminando directorio .next...
    rmdir /s /q ".next"
)

REM Eliminar node_modules/.cache si existe
if exist "node_modules\.cache" (
    echo Eliminando cache de node_modules...
    rmdir /s /q "node_modules\.cache"
)

echo Cache limpiada exitosamente!
echo.
echo Para iniciar el servidor de desarrollo ejecuta:
echo npm run dev
pause
