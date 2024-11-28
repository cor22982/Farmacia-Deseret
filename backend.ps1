Write-Host "Automatizando el proyecto..."
Set-Location "E:\Farmacia-Deseret"
git pull
npm install
pm2 delete all
pm2 start ecosystem.config.cjs
Read-Host -Prompt "Presiona Enter para salir"
