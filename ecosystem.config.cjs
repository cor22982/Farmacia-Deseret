module.exports = {
  apps: [{
    name: 'Farmacia',
    script: 'src\\app.js',
    args: 'start',
    log_file: './logs/logs_farmacia.txt',
    merge_logs: true,
  }],
}