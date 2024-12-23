Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Crear formulario
$win = New-Object System.Windows.Forms.Form
$win.Text = 'FARMACIA DESERET'
$win.ClientSize = '700,300'
$win.BackColor = "#01609a"
$win.ForeColor = "#ffffff"

# Agregar etiqueta principal
$label = New-Object System.Windows.Forms.Label
$label.Location = New-Object System.Drawing.Point(120,80)
$label.Text = 'Actualizaciones Farmacia'
$label.AutoSize = $true
$label.Font = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold)

# Crear barra de progreso
$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(200, 150)
$progressBar.Size = New-Object System.Drawing.Size(300, 30)
$progressBar.Visible = $false

# Crear etiqueta de porcentaje
$progressLabel = New-Object System.Windows.Forms.Label
$progressLabel.Location = New-Object System.Drawing.Point(220,180)
$progressLabel.Size = New-Object System.Drawing.Size(280, 20)
$progressLabel.Text = "0%"
$progressLabel.Font = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Bold)
$progressLabel.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$progressLabel.Visible = $false

# Agregar botón
$button = New-Object System.Windows.Forms.Button
$button.Location = New-Object System.Drawing.Point(300,250)
$button.Text = 'ACTUALIZAR AHORA'
$button.AutoSize = $true

# Evento click del botón
$button.add_Click({
    $progressBar.Visible = $true  # Mostrar la barra de progreso
    $progressLabel.Visible = $true  # Mostrar el porcentaje de progreso
    $progressBar.Value = 0

    # Lista de comandos
    $commands = @(
        { pm2 delete all },
        { Set-Location "E:\Farmacia-Deseret"; git pull; npm install; pm2 start ecosystem.config.cjs },
        { Write-Host "Actualizando frontend..."; Set-Location "C:\Users\HP\Videos\Farmacia-Deseret\UI"; git pull; npm install },
        { if (Test-Path "dist") { Write-Host "Eliminando carpeta 'dist'..."; Remove-Item -Recurse -Force "dist" } else { Write-Host "La carpeta 'dist' no existe, continuando..." } },
        { npm run build },
        { pm2 serve dist 4000 --spa }
    )

    # Ejecutar cada comando y actualizar barra de progreso
    $total = $commands.Count
    $progressStep = [math]::Floor(100 / $total)

    for ($i = 0; $i -lt $total; $i++) {
        Invoke-Command -ScriptBlock $commands[$i]  # Ejecutar comando
        $progressBar.Value += $progressStep
        $progressLabel.Text = "$($progressBar.Value)%"
        Start-Sleep -Milliseconds 500  # Simulación de espera
    }

    # Asegurar que la barra llegue al 100%
    $progressBar.Value = 100
    $progressLabel.Text = "100%"
    Start-Sleep -Seconds 1

    # Cerrar ventana
    $win.Close()
})

# Añadir controles al formulario
$win.Controls.AddRange(@($label, $button, $progressBar, $progressLabel))

# Mostrar formulario
$win.ShowDialog()
$win.Dispose()
