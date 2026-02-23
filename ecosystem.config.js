module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "./backend",
      script: "./venv/Scripts/python.exe",
      args: `
        -c "
import subprocess, sys, os
from dotenv import load_dotenv

load_dotenv()  # carga backend/.env

host = os.getenv('HOST','')
port = os.getenv('PORT','')

subprocess.run([r'./venv/Scripts/pip.exe','install','-r','requirements.txt'])

subprocess.run([
    sys.executable,
    '-m','uvicorn',
    'main:app',
    '--host', host,
    '--port', port,
    '--reload'
])
        "
      `,
      autorestart: true,
      env: {
        PYTHONUNBUFFERED: "1"
      },
      output: "./logs/backend.log",
      error: "./logs/backend-error.log"
    }
  ]
};