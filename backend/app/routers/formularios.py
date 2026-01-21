from fastapi import APIRouter
from datetime import datetime
from supabase_client import supabase

router = APIRouter()

@router.get("/ficha/{ficha_id}")
def get_formulario(ficha_id: int):
    return supabase.table("formularios") \
        .select("*") \
        .eq("ficha_id", ficha_id).single().execute().data

@router.put("/{id}")
def guardar_valoracion(id: int, valoracion: str):
    return supabase.table("formularios") \
        .update({
            "valoracion": valoracion,
            "fecha_envio": datetime.now().isoformat()
        }).eq("id", id).execute().data
