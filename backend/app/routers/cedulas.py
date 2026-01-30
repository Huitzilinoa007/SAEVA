from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from datetime import datetime

router = APIRouter(prefix="/cedulas")

@router.get("/area/{area_id}")
def get_cedulas_by_area(area_id: int):
    return supabase.table("cedulas") \
        .select("id, nombre, estado") \
        .eq("area_id", area_id) \
        .order("id") \
        .execute().data


@router.get("/{id}")
def get_cedula(id: int):
    res = supabase.table("cedulas") \
        .select("*") \
        .eq("id", id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Cédula no encontrada")

    return res.data


@router.put("/{id}/estado")
def actualizar_estado(id: int, estado: int):
    return supabase.table("cedulas") \
        .update({"estado": estado}) \
        .eq("id", id) \
        .execute().data


@router.put("/{id}/valoracion")
def guardar_valoracion(id: int, data: dict):
    # 1️⃣ Obtener estado actual
    actual = supabase.table("cedulas") \
        .select("estado") \
        .eq("id", id) \
        .single() \
        .execute()

    if not actual.data:
        raise HTTPException(status_code=404, detail="Cédula no encontrada")

    estado_actual = actual.data["estado"]
    step = data.get("step")
    valoracion = data.get("valoracion")

    if step is None:
        raise HTTPException(status_code=400, detail="Step requerido")

    if not valoracion:
        raise HTTPException(status_code=400, detail="Valoración requerida")

    update_data = {
        "valoracion": valoracion,
        "fecha_envio": datetime.now().isoformat()
    }

    # 2️⃣ Avanzar estado SOLO si el step coincide
    if estado_actual == step:
        nuevo_estado = step + 1

        if 1 <= nuevo_estado <= 4:
            update_data["estado"] = nuevo_estado

    # 3️⃣ Ejecutar update
    res = supabase.table("cedulas") \
        .update(update_data) \
        .eq("id", id) \
        .execute()

    return {
        "ok": True,
        "actualizado": update_data
    }



@router.get("/{cedula_id}/evidencias")
def get_evidencias(cedula_id: int):
    return supabase.table("evidencias") \
        .select("*") \
        .eq("cedula_id", cedula_id) \
        .execute().data


@router.get("/codigo/{codigo}")
def get_cedulas_by_codigo(codigo: str):
    area_res = supabase.table("areas") \
        .select("id, nombre") \
        .eq("codigo", codigo) \
        .single() \
        .execute()

    if not area_res.data:
        raise HTTPException(status_code=404, detail="Área no encontrada")

    area = area_res.data

    cedulas = supabase.table("cedulas") \
        .select("id, estandar_nombre, estado, criterio_nombre") \
        .eq("area_id", area["id"]) \
        .order("id") \
        .execute()

    return {
        "area": area["nombre"],
        "cedulas": cedulas.data
    }

@router.put("/{id}/responsable")
def actualizar_responsable(id: int, data: dict):

    # 1️⃣ Obtener estado actual
    actual = supabase.table("cedulas") \
        .select("estado") \
        .eq("id", id) \
        .single() \
        .execute()

    if not actual.data:
        raise HTTPException(status_code=404, detail="Cédula no encontrada")

    estado_actual = actual.data["estado"]
    step = data.get("step")

    if step is None:
        raise HTTPException(status_code=400, detail="Step requerido")

    update_data = {}

    # 2️⃣ Actualizar responsable SOLO si vienen ambos campos
    nombre = data.get("nombre_responsable")
    cargo = data.get("cargo_responsable")

    if nombre is not None and cargo is not None:
        update_data.update({
            "nombre_responsable": nombre,
            "cargo_responsable": cargo
        })

    # 3️⃣ Avanzar estado SOLO si coincide el step
    if estado_actual == step:
        nuevo_estado = step + 1

        if 1 <= nuevo_estado <= 4:
            update_data["estado"] = nuevo_estado

    # 4️⃣ Evitar update vacío
    if not update_data:
        return {
            "ok": False,
            "mensaje": "No hubo cambios para actualizar"
        }

    # 5️⃣ Ejecutar update
    res = supabase.table("cedulas") \
        .update(update_data) \
        .eq("id", id) \
        .execute()

    return {
        "ok": True,
        "actualizado": update_data
    }
