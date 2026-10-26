@echo off
cd /d "%~dp0"
echo ========================================================
echo   Pushing Arcade Games to: vaishnavgupta07/arcade-games
echo ========================================================
set PATH=C:\Users\bsmit\AppData\Local\Programs\MinGit\cmd;%PATH%

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Arcade games repository pushed to GitHub.
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   Authentication required:
    echo   Please use your GitHub username & Personal Access Token.
    echo ========================================================
)
echo.
pause
