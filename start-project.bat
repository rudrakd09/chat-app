@echo off
echo ====================================================================
echo Starting Full Stack Chat Application locally...
echo ====================================================================

echo [1/3] Checking and Installing Dependencies...
cd backend
call npm install
cd ../frontend
call npm install
cd ..

echo [2/3] Spinning up Node.js Backend Server...
cd backend
start cmd /k "npm run dev"

echo [3/3] Spinning up React Vite Frontend...
cd ../frontend
start cmd /c "npm run dev"

echo ====================================================================
echo All servers successfully started! 
echo A new terminal window is running your backend.
echo Your frontend is running and will open in your browser if configured.
echo Please navigate to http://localhost:5173 to view the project!
echo ====================================================================
pause
