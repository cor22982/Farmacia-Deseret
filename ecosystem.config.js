module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "./backend",
      script: "./venv/Scripts/python.exe",
      args: `
        -c "
import subprocess, sys
subprocess.run([r'./venv/Scripts/pip.exe','install','-r','requirements.txt'])
subprocess.run([sys.executable,'-m','uvicorn','main:app','--host','127.0.0.1','--port','8000','--reload'])
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