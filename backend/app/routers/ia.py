from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from supabase_client import supabase
import json
import re

router = APIRouter(prefix="/ia", tags=["IA"])
client = OpenAI()


class TextoEntrada(BaseModel):
    texto: str
    cedula_id: int


@router.post("/mejorar-redaccion")
def mejorar_redaccion(data: TextoEntrada):
    palabras = len(data.texto.split())

    if palabras < 250 or palabras > 300:
        raise HTTPException(
            status_code=400,
            detail="El texto debe contener entre 250 y 300 palabras",
        )

    # ===== PROMPT DE EVALUACIÓN (NO TOCADO) =====
    prompt = f"""
Actúas como evaluador académico experto del Marco General de Evaluación CIEES 2024,
participando en un ejercicio formal de AUTOEVALUACIÓN institucional.

Tu tarea es DETERMINAR si el texto proporcionado constituye una
VALORACIÓN ARGUMENTADA válida conforme al Marco General de Evaluación 2024.

Evalúa estrictamente si el texto cumple con TODOS los elementos siguientes:

1. Análisis crítico del programa educativo (no descriptivo).
2. Relación explícita o implícita con un criterio de evaluación.
3. Identificación clara de fortalezas.
4. Identificación clara de áreas de mejora.
5. Argumentación y justificación de los juicios emitidos.
6. Contextualización académica, institucional, social o disciplinar.
7. Emisión explícita de un juicio argumentado sobre el grado de cumplimiento del criterio.

INSTRUCCIONES OBLIGATORIAS DE RESPUESTA:

Devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional.

Si el texto CUMPLE con TODOS los elementos:

{{
  "cumple": true,
  "faltantes": []
}}

Si el texto NO CUMPLE, devuelve:

{{
  "cumple": false,
  "faltantes": [
    "Describe qué elemento falta o es insuficiente y cómo debe abordarse",
    "Cada punto debe ser claro, accionable y comprensible para el usuario"
  ]
}}

REGLAS IMPORTANTES:
- NO reescribas el texto.
- NO sugieras redacción alternativa.
- NO agregues contenido.
- NO inventes información.

Texto a evaluar:
\"\"\"
{data.texto}
\"\"\"
"""

    # ===== VALIDACIÓN DE USOS =====
    uso_res = supabase.table("cedulas") \
        .select("ia_usos") \
        .eq("id", data.cedula_id) \
        .single() \
        .execute()

    if not uso_res.data:
        raise HTTPException(status_code=404, detail="Cédula no encontrada")

    if uso_res.data["ia_usos"] >= 3:
        raise HTTPException(
            status_code=403,
            detail="Esta cédula ya alcanzó el límite de 3 usos de IA"
        )

    # ===== LLAMADA 1: EVALUACIÓN =====
    try:
        response_eval = client.responses.create(
            model="gpt-5-mini",
            input=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        evaluacion = json.loads(response_eval.output_text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="La IA no devolvió un JSON válido de evaluación"
        )

    # ===== SI NO CUMPLE → REGRESAR FALTANTES =====
    if evaluacion.get("cumple") is False:
        incrementar_uso(data.cedula_id, uso_res.data["ia_usos"])
        return {
            "cumple": False,
            "faltantes": evaluacion.get("faltantes", [])
        }

    # ===== SI CUMPLE → SEGUNDA IA (REDACCIÓN) =====
    prompt_redaccion = f"""
Mejora la redacción académica del siguiente texto conforme al
Marco General de Evaluación CIEES 2024.

Devuelve EXACTAMENTE 3 versiones alternativas numeradas.
NO agregues información nueva.
NO cambies el sentido del texto.
Mantén un tono formal, evaluativo y académico.

Texto:
\"\"\"
{data.texto}
\"\"\"
"""

    try:
        response_redaccion = client.responses.create(
            model="gpt-5-mini",
            input=prompt_redaccion,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    opciones = parsear_opciones(response_redaccion.output_text)

    if len(opciones) < 3:
        raise HTTPException(
            status_code=500,
            detail="La IA no devolvió las 3 opciones esperadas"
        )

    incrementar_uso(data.cedula_id, uso_res.data["ia_usos"])

    return {
        "cumple": True,
        "opciones": opciones
    }


def parsear_opciones(texto: str):
    bloques = re.split(r"\n\s*\d+\.\s*", texto)
    return [b.strip() for b in bloques if b.strip()][:3]


def incrementar_uso(cedula_id: int, usos_actuales: int):
    supabase.table("cedulas") \
        .update({"ia_usos": usos_actuales + 1}) \
        .eq("id", cedula_id) \
        .execute()


@router.get("/{id}/ia-usos")
def obtener_ia_usos(id: int):
    res = supabase.table("cedulas") \
        .select("ia_usos") \
        .eq("id", id) \
        .single() \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Cédula no encontrada")

    return {
        "usos": res.data["ia_usos"],
        "restantes": max(0, 3 - res.data["ia_usos"])
    }
