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
```

## 🔍 Verificación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

## 💾 Persistencia de Datos

Los volúmenes configurados garantizan que:
- **mongodb_data**: Los datos de MongoDB persisten incluso si eliminas el contenedor
- **backend_data**: Archivos del backend se mantienen
- **frontend_build**: Los builds de producción se mantienen

Incluso si ejecutas `docker-compose down`, los datos en MongoDB se conservarán. Solo se eliminarán con `docker-compose down -v`.

¡Tu proyecto está listo! Todos los inserts en MongoDB se guardarán de forma persistente gracias a los volúmenes de Docker.
