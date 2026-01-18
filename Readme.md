Te ayudaré a crear un proyecto completo con Docker, MongoDB, FastAPI y React con volúmenes persistentes.Ahora te proporcionaré la estructura completa del proyecto y los archivos adicionales necesarios:

## 📁 Estructura del Proyecto

```
proyecto/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .dockerignore
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       └── index.css
└── README.md
```



## 🏃‍♂️ Comandos para Ejecutar el Proyecto

```bash
# 1. Construir e iniciar todos los contenedores
docker-compose up --build

# 2. Ejecutar en segundo plano
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Detener los contenedores
docker-compose down

# 5. Detener y eliminar volúmenes (¡cuidado! esto borra los datos)
docker-compose down -v

# 6. Ver volúmenes creados
docker volume ls

docker compose -f .\\dockerdeploy.yml up --build -d
```

## 🔍 Verificación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **MongoDB**: localhost:27017


## .ENV son

- NEXT_PUBLIC_API_URL=http://192.168.1.5:8000 en la carpeta frontend
- En la raiz del proyecto
```
# ========================================
# CONFIGURACIÓN DE MONGODB
# ========================================
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DATABASE=farmacia
MONGO_PORT=27017
MONGO_URL=urldeladb


# ========================================
# CONFIGURACIÓN DE BACKEND
# ========================================
BACKEND_PORT=8000
# URL del backend accesible desde el navegador
BACKEND_URL=http://localhost:8000

# ========================================
# CONFIGURACIÓN DE FRONTEND
# ========================================
FRONTEND_PORT=3000
# IP específica donde se expondrá el frontend
# 0.0.0.0 = todas las interfaces (accesible desde cualquier IP)
# 127.0.0.1 = solo localhost
# 192.168.1.X = IP específica de tu red local
FRONTEND_HOST=192.168.1.5

# Si quieres exponer en una IP específica de red local, por ejemplo:
# FRONTEND_HOST=192.168.1.100

## 💾 Persistencia de Datos

Los volúmenes configurados garantizan que:
- **mongodb_data**: Los datos de MongoDB persisten incluso si eliminas el contenedor
- **backend_data**: Archivos del backend se mantienen
- **frontend_build**: Los builds de producción se mantienen
```
- en backend
```
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DATABASE=farmacia
MONGO_PORT=27017

# Backend
BACKEND_PORT=8000
BACKEND_URL=http://localhost:8000

# Frontend
FRONTEND_HOST=0.0.0.0
FRONTEND_PORT=3000
```
