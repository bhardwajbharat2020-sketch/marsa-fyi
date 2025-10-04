@echo off
echo Installing client dependencies...
cd client
npm install
cd ..

echo Installing server dependencies...
cd server
npm install
cd ..

echo Setup complete!
echo To start the development servers:
echo 1. Open a terminal and run: cd client ^&^& npm start
echo 2. Open another terminal and run: cd server ^&^& npm start