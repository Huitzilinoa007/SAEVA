from fastapi import APIRouter
from datetime import datetime
from supabase_client import supabase

router = APIRouter()

router = APIRouter(prefix="/formularios", tags=["Formularios"])

@router.put("/{id}")
def guardar_valoracion(id: int, valoracion: str):
    return supabase.table("formularios") \
        .update({
            "valoracion": valoracion,
            "fecha_envio": datetime.now().isoformat()
        }).eq("id", id).execute().data


class FormularioUpdate(BaseModel):
    info_general: str | None = None
    nombre_responsable: str | None = None
    cargo_responsable: str | None = None

    eje_nombre: str | None = None
    eje_descripcion: str | None = None

    categoria_nombre: str | None = None
    categoria_descripcion: str | None = None

    indicador_nombre: str | None = None
    indicador_descripcion: str | None = None

    estandar_nombre: str | None = None
    estandar_descripcion: str | None = None

    criterio_nombre: str | None = None
    criterio_descripcion: str | None = None


@router.get("/ficha/{ficha_id}")
def obtener_formulario_por_ficha(ficha_id: int):
    res = supabase.table("formularios") \
        .select("*") \
        .eq("ficha_id", ficha_id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Formulario no encontrado")

    return res.data

@router.get("/{formulario_id}")
def obtener_formulario(formulario_id: int):
    res = supabase.table("formularios") \
        .select("*") \
        .eq("id", formulario_id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Formulario no encontrado")

    return res.data
