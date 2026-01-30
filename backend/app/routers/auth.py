from fastapi import APIRouter, HTTPException
from supabase_client import supabase

router = APIRouter()

@router.post("/login")
def login(nombreUsr: str, password: str):
    res = supabase.table("innovacion").select("*") \
        .eq("nombreUsr", nombreUsr) \
        .eq("password", password).execute()

    if not res.data:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {"message": "Login correcto"}
