Write-Host "Levantando proyecto..."
pm2 delete all
Set-Location "E:\Farmacia-Deseret"
pm2 start ecosystem.config.cjs
Set-Location "C:\Users\HP\Videos\Farmacia-Deseret\UI"
pm2 serve dist 4000 --spa
Read-Host -Prompt "Presiona Enter para salir"