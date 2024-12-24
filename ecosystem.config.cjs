module.exports = {
  apps: [{
    name: 'Farmacia',
    script: 'src\\app.js',
    args: 'start',
    watch: ['src/database/actualizaciones/.env', 'src/database/actualizaciones/actualizaciones.js'], // Rutas específicas para monitorear
    watch_delay: 50, // Retraso de 1 segundo antes de reiniciar
    ignore_watch: ['node_modules', '\\.git', '*.log'], // Ignorar carpetas y archivos innecesarios
    log_file: './logs/logs_farmacia.txt',
    merge_logs: true,
    watch_options: {
      usePolling: true, // Forzar "polling" para sistemas de archivos inestables
      followSymlinks: false, // No seguir enlaces simbólicos
    },
  }],
};
