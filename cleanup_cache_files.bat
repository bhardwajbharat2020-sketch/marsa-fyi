@echo off
echo Cleaning up cache files...

REM Remove node_modules cache directories
if exist "client\node_modules\.cache" (
    echo Removing client\node_modules\.cache
    rmdir /s /q "client\node_modules\.cache"
)

if exist "client\.cache" (
    echo Removing client\.cache
    rmdir /s /q "client\.cache"
)

REM Remove other common cache directories
if exist ".cache" (
    echo Removing .cache
    rmdir /s /q ".cache"
)

if exist "node_modules" (
    echo Removing node_modules
    rmdir /s /q "node_modules"
)

echo Cache cleanup completed.
echo.
echo To reinstall dependencies, run:
echo cd client && npm install