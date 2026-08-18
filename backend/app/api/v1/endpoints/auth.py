"""Authentication endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import settings
from app.core.security import create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    api_key: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    if req.api_key == settings.api_key_admin:
        token = create_access_token({"sub": "admin", "role": "admin"})
        return LoginResponse(token=token, user={"username": "admin", "role": "admin"})
    elif req.api_key == settings.api_key_analyst:
        token = create_access_token({"sub": "analyst", "role": "analyst"})
        return LoginResponse(token=token, user={"username": "analyst", "role": "analyst"})
    raise HTTPException(status_code=401, detail="Invalid API key")

@router.get("/me")
async def me(user: dict = __import__('fastapi', fromlist=['Depends']).Depends(__import__('app.core.security', fromlist=['get_current_user']).get_current_user)):
    return {"username": user["sub"], "role": user["role"]}
