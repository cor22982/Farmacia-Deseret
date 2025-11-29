from fastapi import APIRouter, HTTPException, status, Body
from config.database import users_collection, serialize_doc, serialize_list
from datetime import datetime
import bcrypt

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(user: dict = Body(...)):
    """Crear un nuevo usuario"""
    # Hashear password
    if "password" in user:
        password_bytes = user["password"].encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        user["password"] = hashed.decode('utf-8')
    
    user["created_at"] = datetime.utcnow()
    user["updated_at"] = datetime.utcnow()
    
    try:
        result = users_collection.insert_one(user)
        user["_id"] = str(result.inserted_id)
        # No devolver password
        user.pop("password", None)
        return serialize_doc(user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("")
def get_users(skip: int = 0, limit: int = 100):
    """Obtener todos los usuarios"""
    users = list(users_collection.find({}, {"password": 0}).skip(skip).limit(limit))
    return serialize_list(users)

@router.get("/{user_id}")
def get_user(user_id: str):
    """Obtener un usuario por ID"""
    user = users_collection.find_one({"_id": user_id}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return serialize_doc(user)

@router.put("/{user_id}")
def update_user(user_id: str, user: dict = Body(...)):
    """Actualizar un usuario"""
    # Si se actualiza password, hashearlo
    if "password" in user:
        password_bytes = user["password"].encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        user["password"] = hashed.decode('utf-8')
    
    user["updated_at"] = datetime.utcnow()
    
    result = users_collection.update_one(
        {"_id": user_id},
        {"$set": user}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    updated_user = users_collection.find_one({"_id": user_id}, {"password": 0})
    return serialize_doc(updated_user)

@router.delete("/{user_id}")
def delete_user(user_id: str):
    """Eliminar un usuario"""
    result = users_collection.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": "Usuario eliminado", "user_id": user_id}