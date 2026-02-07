from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
from fastapi.middleware.cors import CORSMiddleware
from routers.cedulas import router as cedulas_router
from routers.areas import router as areas_router
from routers.ia import router as ia_router
from routers.evidencias import router as evidencias_router


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(cedulas_router)
app.include_router(ia_router)
app.include_router(areas_router)
app.include_router(evidencias_router)

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
