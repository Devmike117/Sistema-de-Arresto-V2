# filename: deepface_service.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import os
import uvicorn

app = FastAPI(title="DeepFace Embedding Service")

# Permitir CORS para tu frontend / backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia esto a tus dominios en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate_embedding/")
async def generate_embedding(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Archivo no soportado")

    file_location = f"temp_{file.filename}"
    try:
        # Guardar temporalmente la imagen
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # Generar embedding con DeepFace
        result = DeepFace.represent(img_path=file_location, model_name='Facenet', enforce_detection=True)

        if not result or len(result) == 0:
            raise HTTPException(status_code=400, detail="No se detectó ninguna cara en la imagen")

        # Tomar solo la primera cara detectada
        embedding_vector = result[0]["embedding"]
        embedding_list = embedding_vector if isinstance(embedding_vector, list) else embedding_vector.tolist()

        # Imprimir en consola
        print(f"Embeddings generados para {file.filename}:\n{embedding_list}\n")

        return {"embedding": embedding_list, "model": "Facenet"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando embedding: {str(e)}")

    finally:
        if os.path.exists(file_location):
            os.remove(file_location)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
