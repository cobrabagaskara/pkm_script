@echo off
cls
echo.
echo 🔄 Memperbarui manifest.json...
echo.

node tools/generate-manifest.mjs

echo.
echo ✅ Selesai! Silakan commit perubahan manifest.json ke GitHub.
echo.
pause