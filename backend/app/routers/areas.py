from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter()

@router.get("/")
def get_areas():
    return supabase.table("areas").select("*").execute().data

@router.post("/")
def create_area(nombre: str, codigo: str):
    return supabase.table("areas").insert({
        "nombre": nombre,
        "codigo": codigo
    }).execute().data

@router.put("/{id}")
def update_area(id: int, nombre: str, codigo: str):
    return supabase.table("areas").update({
        "nombre": nombre,
        "codigo": codigo
    }).eq("id", id).execute().data

@router.delete("/{id}")
def delete_area(id: int):
    return supabase.table("areas").delete().eq("id", id).execute().data
