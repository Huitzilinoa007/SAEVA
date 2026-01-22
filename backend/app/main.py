from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
from fastapi.middleware.cors import CORSMiddleware
from routers.fichas import router as fichas_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(fichas_router, prefix="/fichas", tags=["Fichas"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en producción NO usar *
    allow_credentials=True,
    allow_methods=["*"],  # MUY IMPORTANTE (OPTIONS)
    allow_headers=["*"],
)

class LoginData(BaseModel):
    nombreUsr: str
    password: str

@app.post("/login")
def login(data: LoginData):
    try:
        response = supabase.table("innovacion") \
            .select("id, nombreusr, password") \
            .eq("nombreusr", data.nombreUsr) \
            .limit(1) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not response or not response.data:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    user = response.data[0]

    if user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    return {
        "ok": True,
        "usuario": {
            "id": user["id"],
            "nombreUsr": user["nombreusr"]
        }
    }

class AreaLoginData(BaseModel):
    codigo: str

@app.post("/login-area")
def login_area(data: AreaLoginData):
    try:
        response = supabase.table("areas") \
            .select("id, nombre, codigo") \
            .eq("codigo", data.codigo) \
            .limit(1) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not response.data:
        raise HTTPException(status_code=401, detail="Código de área inválido")

    area = response.data[0]

    return {
        "ok": True,
        "area": area
    }
    
    
@app.get("/areas/resumen")
def get_areas_resumen():
    try:
        response = supabase.rpc("resumen_areas").execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not response.data:
        raise HTTPException(status_code=404, detail="No hay áreas")

    return {
        "ok": True,
        "data": response.data
    }
