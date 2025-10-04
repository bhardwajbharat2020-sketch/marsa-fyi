@echo off
echo Starting development servers...

echo Starting React development server...
start cmd /k "cd client && npm start"

timeout /t 5

echo Starting Node.js server...
start cmd /k "cd server && npm start"

echo Development servers started!
echo React app will be available at http://localhost:3000
echo Node.js server will be available at http://localhost:5000