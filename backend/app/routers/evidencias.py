from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter()

@router.get("/formulario/{formulario_id}")
def get_evidencias(formulario_id: int):
    return supabase.table("evidencias") \
        .select("*") \
        .eq("formulario_id", formulario_id).execute().data

@router.post("/")
def crear_evidencia(formulario_id: int, tipo: str, archivo_url: str):
    return supabase.table("evidencias").insert({
        "formulario_id": formulario_id,
        "tipo": tipo,
        "archivo_url": archivo_url
    }).execute().data
