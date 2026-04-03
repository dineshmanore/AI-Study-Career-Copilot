@echo off
set "src=C:\Users\Admin\.gemini\antigravity\brain\b2b07a13-17b9-4174-9208-3493aca315d7\scholarly_edge_logo_v1_1775205167343.png"
set "dest=c:\Users\Admin\Downloads\aspp\client\public\logo.png"
set "fav=c:\Users\Admin\Downloads\aspp\client\public\favicon.png"

echo Moving Scholarly Edge Logo...
if not exist "c:\Users\Admin\Downloads\aspp\client\public" mkdir "c:\Users\Admin\Downloads\aspp\client\public"

copy /Y "%src%" "%dest%"
copy /Y "%src%" "%fav%"

echo.
echo Logo has been successfully moved to the project assets!
echo You can now delete this script.
pause
