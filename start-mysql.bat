@echo off
echo Starting MySQL service...
net start MySQL80
if %ERRORLEVEL% == 0 (
    echo MySQL service started successfully!
) else (
    echo Failed to start MySQL service. You may need to run this as Administrator.
    echo Right-click this file and select "Run as administrator"
    pause
)
pause