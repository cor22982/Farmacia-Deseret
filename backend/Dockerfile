FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando por defecto (se puede sobrescribir en docker-compose)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info --access-log > /logs/uvicorn.log 2>&1"]
