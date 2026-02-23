Write-Host "Actualizar proyecto..."
pm2 delete all
Write-Host "Levantando frontend..."
cd .\frontend\
npm install
npm run build
pm2 start ecosystem.config.js
Write-Host "Levantando backend..."
cd ..
pm2 start ecosystem.config.js


