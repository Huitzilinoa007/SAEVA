from fastapi import APIRouter
from supabase_client import supabase
from fastapi.responses import StreamingResponse
import requests

router = APIRouter(prefix="")

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


@router.get("/evidencias/{evidencia_id}/{filename}")
def ver_evidencia(evidencia_id: int, filename: str):
    evidencia = supabase.table("evidencias") \
        .select("*") \
        .eq("id", evidencia_id) \
        .single() \
        .execute()

    if not evidencia.data:
        raise HTTPException(404, "Evidencia no encontrada")

    # URL REAL del storage (UUID)
    url_storage = evidencia.data["archivo_url"]

    # Nombre bonito (BD)
    nombre_bonito = evidencia.data["nombre_archivo"]

    r = requests.get(url_storage, stream=True)

    return StreamingResponse(
        r.iter_content(chunk_size=8192),
        media_type="application/pdf",
        headers={
            # 👇 CLAVE ABSOLUTA
            "Content-Disposition": f'inline; filename="{nombre_bonito}"'
        }
    )