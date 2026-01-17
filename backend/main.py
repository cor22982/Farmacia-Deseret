from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import client
from fastapi.staticfiles import StaticFiles


# Importar routers
from routes import products, stock_batches, sales, users, shopping_cart, reports

# Crear aplicación FastAPI
app = FastAPI(
    title="Farmacia API",
    description="Sistema de gestión para farmacia con MongoDB",
    version="1.0.0"
)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(products.router)
app.include_router(stock_batches.router)
app.include_router(sales.router)
app.include_router(users.router)
app.include_router(shopping_cart.router)
app.include_router(reports.router)

# Rutas principales
@app.get("/")
def root():
    """Ruta raíz"""
    return {
        "message": "Farmacia API - Sistema de Gestión",
        "version": "1.0.0",
        "endpoints": {
            "products": "/products",
            "stock_batches": "/stock-batches",
            "sales": "/sales",
            "users": "/users",
            "shopping_cart": "/shopping-cart",
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    """Verificar estado de la API y la base de datos"""
    try:
        # Ping a MongoDB
        client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "message": "API funcionando correctamente"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# Evento de inicio
@app.on_event("startup")
async def startup_event():
    print("🚀 Iniciando Farmacia API...")
    print("📊 Conectando a MongoDB...")
    try:
        client.admin.command('ping')
        print("✅ Conexión exitosa a MongoDB")
    except Exception as e:
        print(f"❌ Error al conectar a MongoDB: {e}")

# Evento de cierre
@app.on_event("shutdown")
async def shutdown_event():
    print("👋 Cerrando Farmacia API...")
    client.close()
    print("✅ Conexión a MongoDB cerrada")