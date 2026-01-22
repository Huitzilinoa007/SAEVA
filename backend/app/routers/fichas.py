from fastapi import APIRouter
from supabase_client import supabase

router = APIRouter()

@router.get("/area/{area_id}")
def get_fichas_by_area(area_id: int):
    return supabase.table("fichas") \
        .select("*") \
        .eq("area_id", area_id) \
        .order("id").execute().data

@router.put("/{id}/estado")
def actualizar_estado(id: int, estado: int):
    return supabase.table("fichas") \
        .update({"estado": estado}) \
        .eq("id", id).execute().data

@router.get("/codigo/{codigo}")
def get_fichas_by_codigo(codigo: str):
    area_res = supabase.table("areas") \
        .select("id, nombre") \
        .eq("codigo", codigo) \
        .limit(1) \
        .execute()

    if not area_res.data:
        return {"ok": False, "detail": "Área no encontrada"}

    area = area_res.data[0]

    fichas = supabase.table("fichas") \
        .select("id, nombre, descripcion, paso_actual") \
        .eq("area_id", area["id"]) \
        .order("id") \
        .execute()

    return {
        "ok": True,
        "area": area["nombre"],
        "cedulas": fichas.data
    }


@router.get("/{id}")
def get_ficha_detalle(id: int):
    res = supabase.table("fichas").select("*").eq("id", id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Cédula no encontrada")
    return res.data