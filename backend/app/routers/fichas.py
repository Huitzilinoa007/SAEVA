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
