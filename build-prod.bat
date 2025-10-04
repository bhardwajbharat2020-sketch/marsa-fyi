@echo off
echo Building React app for production...
cd client
npm run build
cd ..

echo Production build complete!
echo To start the production server:
echo cd server ^&^& npm start