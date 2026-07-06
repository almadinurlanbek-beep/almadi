@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules\.bin\supabase.cmd" (
  echo Supabase CLI was not found in node_modules.
  echo Open the project in VS Code and install dependencies first.
  pause
  exit /b 1
)

echo This helper connects Supabase CLI and deploys the ai Edge Function.
echo Do not share your tokens or keys in chat.
echo.
echo 1. Create a Supabase access token here:
echo    https://supabase.com/dashboard/account/tokens
echo.
set /p SUPABASE_TOKEN=Paste Supabase access token and press Enter: 

if "%SUPABASE_TOKEN%"=="" (
  echo Token is empty.
  pause
  exit /b 1
)

call node_modules\.bin\supabase.cmd login --token "%SUPABASE_TOKEN%"
if errorlevel 1 (
  echo Supabase login failed.
  pause
  exit /b 1
)

echo.
set /p GEMINI_KEY=Paste GEMINI_API_KEY and press Enter: 

if "%GEMINI_KEY%"=="" (
  echo Gemini key is empty.
  pause
  exit /b 1
)

call node_modules\.bin\supabase.cmd secrets set GEMINI_API_KEY="%GEMINI_KEY%"
if errorlevel 1 (
  echo Failed to save GEMINI_API_KEY.
  pause
  exit /b 1
)

call node_modules\.bin\supabase.cmd functions deploy ai
if errorlevel 1 (
  echo Failed to deploy ai function.
  pause
  exit /b 1
)

echo.
echo Done. The ai function is deployed.
pause
