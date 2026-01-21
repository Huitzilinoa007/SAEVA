from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Area(BaseModel):
    id: int
    nombre: str
    codigo: str

class Ficha(BaseModel):
    id: int
    area_id: int
    nombre: str
    estado: int

class Formulario(BaseModel):
    id: int
    ficha_id: int
    valoracion: Optional[str]
    fecha_envio: Optional[datetime]

class Evidencia(BaseModel):
    id: int
    formulario_id: int
    tipo: str
    archivo_url: str
