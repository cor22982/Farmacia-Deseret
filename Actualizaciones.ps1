Write-Host "Actualizar proyecto..."
Write-Host "Actualizando backend..."
pm2 delete all
Set-Location "E:\Farmacia-Deseret"
git pull
npm install
pm2 start ecosystem.config.cjs
Write-Host "Actualizando fronted..."
Set-Location "C:\Users\HP\Videos\Farmacia-Deseret\UI"
git pull
npm install
if (Test-Path "build") {
    Write-Host "Eliminando carpeta 'dist'..."
    Remove-Item -Recurse -Force "dist"
} else {
    Write-Host "La carpeta 'dist' no existe, continuando..."
}
npm run build

pm2 serve dist 4000 --spa

Read-Host -Prompt "Presiona Enter para salir"