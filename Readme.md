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

## 🚀 Instrucciones de Instalación

### 1. Crear la estructura de carpetas:
```bash
mkdir proyecto
cd proyecto
mkdir backend frontend
```

### 2. Crear archivo .dockerignore para el backend:
```bash
# backend/.dockerignore
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.env
.venv
```

### 3. Crear archivo .dockerignore para el frontend:
```bash
# frontend/.dockerignore
node_modules
npm-debug.log
build
.git
.gitignore
README.md
```

### 4. Crear package.json para React:
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### 5. Crear archivos de React básicos:

**frontend/public/index.html:**
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>FastAPI + React + MongoDB</title>
  </head>
  <body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta aplicación.</noscript>
    <div id="root"></div>
  </body>
</html>
```

**frontend/src/index.js:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**frontend/src/index.css:**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}
```

**frontend/src/App.js:**
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items/`);
      setItems(response.data);
    } catch (error) {
      console.error('Error al obtener items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/items/`, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
      setFormData({ name: '', description: '', price: '', quantity: '' });
      fetchItems();
    } catch (error) {
      console.error('Error al crear item:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Error al eliminar item:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 FastAPI + React + MongoDB</h1>
        <p>Sistema de Gestión de Inventario</p>
      </header>

      <div className="container">
        <div className="form-section">
          <h2>Agregar Nuevo Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Agregar Item'}
            </button>
          </form>
        </div>

        <div className="items-section">
          <h2>Items en Inventario ({items.length})</h2>
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="item-details">
                  <span className="price">${item.price.toFixed(2)}</span>
                  <span className="quantity">Stock: {item.quantity}</span>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

## 🎨 CSS para el Frontend

Crea `frontend/src/App.css`:
```css
.App {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.App-header {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.App-header h1 {
  color: #667eea;
  margin-bottom: 0.5rem;
}

.App-header p {
  color: #666;
}

.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.form-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.items-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.items-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.item-card h3 {
  color: #667eea;
  margin-bottom: 0.5rem;
}

.item-card p {
  color: #666;
  margin-bottom: 1rem;
}

.item-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4caf50;
}

.quantity {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

.delete-btn {
  width: 100%;
  background: #f44336;
  padding: 0.5rem;
}

.delete-btn:hover {
  background: #d32f2f;
}
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