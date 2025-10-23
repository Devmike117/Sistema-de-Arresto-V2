# 🔧 Troubleshooting Avanzado - Sistema de Arresto

## 📑 Índice de Problemas

1. [Problemas de DeepFace](#problemas-de-deepface)
2. [Errores de Base de Datos](#errores-de-base-de-datos)
3. [Problemas de Conectividad](#problemas-de-conectividad)
4. [Issues de Port-Forward](#issues-de-port-forward)
5. [Problemas de Almacenamiento](#problemas-de-almacenamiento)
6. [Errores de Build](#errores-de-build)
7. [Performance y Recursos](#performance-y-recursos)

---

## 🤖 Problemas de DeepFace

### Error: ModuleNotFoundError: No module named 'tensorflow.keras'

**Causa:** Incompatibilidad entre TensorFlow 2.16+ y DeepFace 0.0.95

**Síntomas:**
```
ModuleNotFoundError: No module named 'tensorflow.keras'
Traceback (most recent call last):
  File "deepface_service.py", line X
  from keras.models import ...
```

**Solución:**

1. Verificar `backend/requirements.txt`:
```txt
tensorflow-cpu==2.20.0
tf-keras
deepface
```

2. Reconstruir imagen:
```powershell
cd backend
docker build -t arresto-backend:latest .
```

3. Reiniciar pods:
```powershell
kubectl delete pods -l app=backend -n arresto-system
```

**Verificación:**
```powershell
kubectl logs -l app=backend -n arresto-system | Select-String "tensorflow|keras"
```

---

### Error: ECONNREFUSED ::1:8001 (IPv6)

**Causa:** Node.js resuelve `localhost` como `::1` (IPv6) en lugar de `127.0.0.1` (IPv4)

**Síntomas:**
```
Error: connect ECONNREFUSED ::1:8001
Error al validar imagen con DeepFace
```

**Solución:**

1. Editar `backend/routes/deepface.js`:
```javascript
// ❌ Incorrecto
axios.post('http://localhost:8001/generate_embedding/', ...)

// ✅ Correcto
axios.post('http://127.0.0.1:8001/generate_embedding/', ...)
```

2. Reconstruir y reiniciar:
```powershell
docker build -t arresto-backend:latest backend
kubectl delete pods -l app=backend -n arresto-system
```

**Verificación:**
```powershell
kubectl exec <backend-pod> -n arresto-system -- curl http://127.0.0.1:8001/health
```

---

### DeepFace no inicia (proceso muerto)

**Síntomas:**
```powershell
kubectl exec <backend-pod> -n arresto-system -- ps aux | grep python
# No muestra proceso de DeepFace
```

**Diagnóstico:**
```powershell
kubectl logs <backend-pod> -n arresto-system | Select-String "DeepFace|8001|error"
```

**Causas comunes:**

1. **Puerto ya en uso:**
```powershell
# Ver procesos usando puerto 8001
kubectl exec <backend-pod> -n arresto-system -- netstat -tulpn | grep 8001
```

2. **Error de dependencias:**
```powershell
# Verificar instalación de paquetes
kubectl exec <backend-pod> -n arresto-system -- python3 -c "import tensorflow, deepface; print('OK')"
```

3. **Archivo dañado:**
```powershell
# Verificar archivo existe
kubectl exec <backend-pod> -n arresto-system -- ls -la /app/python/deepface_service.py
```

**Solución:**
```powershell
# Reiniciar pod
kubectl delete pod <backend-pod> -n arresto-system

# Si persiste, reconstruir imagen
docker build -t arresto-backend:latest backend --no-cache
```

---

### Error: Failed to load resource: 503 (Service Unavailable)

**Causa:** DeepFace no está corriendo o no responde

**Diagnóstico completo:**

```powershell
# 1. Verificar pod está Running
kubectl get pods -n arresto-system

# 2. Ver logs del backend
kubectl logs <backend-pod> -n arresto-system --tail=100

# 3. Verificar proceso Python
kubectl exec <backend-pod> -n arresto-system -- ps aux | grep deepface

# 4. Probar endpoint
kubectl exec <backend-pod> -n arresto-system -- curl -v http://127.0.0.1:8001/health
```

**Soluciones:**

**A. Si proceso no existe:**
```powershell
# Ver error de inicio en logs
kubectl logs <backend-pod> -n arresto-system | Select-String "error|Error" -Context 5

# Reiniciar pod
kubectl delete pod <backend-pod> -n arresto-system
```

**B. Si proceso existe pero no responde:**
```powershell
# Verificar memoria del pod
kubectl top pod <backend-pod> -n arresto-system

# Si está usando >90% memoria, aumentar límites en 05-backend.yaml
```

**C. Si puerto incorrecto:**
```powershell
# Verificar puerto en logs
kubectl logs <backend-pod> -n arresto-system | Select-String "8001|uvicorn"

# Debe mostrar: "Uvicorn running on http://0.0.0.0:8001"
```

---

## 🗄️ Errores de Base de Datos

### Error: relation 'persons' does not exist

**Causa:** Tablas no creadas en PostgreSQL

**Diagnóstico:**
```powershell
# Ver tablas existentes
kubectl exec <postgres-pod> -n arresto-system -- psql -U admin -d arrest_registry -c "\dt"
```

**Solución completa:**

```powershell
# Obtener nombre del pod de PostgreSQL
$POSTGRES_POD = kubectl get pods -n arresto-system -l app=postgres -o jsonpath="{.items[0].metadata.name}"

# Crear tabla Persons
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -c "
CREATE TABLE IF NOT EXISTS Persons (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    alias VARCHAR(100),
    dob DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    state VARCHAR(100),
    municipality VARCHAR(100),
    community VARCHAR(100),
    id_number VARCHAR(50),
    photo_path VARCHAR(255),
    observaciones TEXT,
    privacy_notice BOOLEAN DEFAULT FALSE,
    privacy_notice_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
"

# Crear tabla Arrests
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -c "
CREATE TABLE IF NOT EXISTS Arrests (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    arrest_date TIMESTAMP DEFAULT NOW(),
    falta_administrativa VARCHAR(255),
    comunidad VARCHAR(255),
    arresting_officer VARCHAR(100),
    folio VARCHAR(100),
    rnd VARCHAR(100),
    sentencia TEXT
);
"

# Crear tabla FacialData
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -c "
CREATE TABLE IF NOT EXISTS FacialData (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    embedding FLOAT8[],
    image_path VARCHAR(255),
    capture_date TIMESTAMP DEFAULT NOW(),
    camera_id VARCHAR(50)
);
"

# Crear tabla Fingerprints
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -c "
CREATE TABLE IF NOT EXISTS Fingerprints (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    template BYTEA,
    scan_date TIMESTAMP DEFAULT NOW(),
    finger VARCHAR(20)
);
"

# Verificar
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -c "\dt"
```

**Verificación:**
```powershell
# Debe mostrar 4 tablas: persons, arrests, facialdata, fingerprints
```

---

### Error: FATAL: password authentication failed for user "arresto_user"

**Causa:** Usuario incorrecto en configuración

**Diagnóstico:**
```powershell
# Ver usuario correcto en secret
kubectl get secret postgres-secret -n arresto-system -o jsonpath="{.data.POSTGRES_USER}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

**Solución:**

1. Verificar `k8s/01-secrets.yaml`:
```yaml
data:
  POSTGRES_USER: YWRtaW4=  # base64 de "admin"
  POSTGRES_PASSWORD: YWRtaW4xMjM=  # base64 de "admin123"
  POSTGRES_DB: YXJyZXN0X3JlZ2lzdHJ5  # base64 de "arrest_registry"
```

2. Verificar `k8s/02-configmaps.yaml`:
```yaml
data:
  DB_USER: admin
  DB_PASSWORD: admin123
  DB_NAME: arrest_registry
```

3. Aplicar cambios:
```powershell
kubectl apply -f k8s/01-secrets.yaml -f k8s/02-configmaps.yaml
kubectl rollout restart deployment backend -n arresto-system
kubectl rollout restart deployment postgres -n arresto-system
```

---

### PostgreSQL no inicia (CrashLoopBackOff)

**Diagnóstico:**
```powershell
kubectl describe pod <postgres-pod> -n arresto-system
kubectl logs <postgres-pod> -n arresto-system --previous
```

**Causas comunes:**

**A. Permisos en PVC:**
```powershell
# Ver eventos
kubectl get events -n arresto-system | Select-String "postgres"

# Si hay error de permisos, eliminar y recrear PVC
kubectl delete pvc postgres-pvc -n arresto-system
kubectl delete pv postgres-pv
kubectl apply -f k8s/03-pvcs-local.yaml
kubectl delete pod <postgres-pod> -n arresto-system
```

**B. Datos corruptos:**
```powershell
# Backup datos si existen
# Luego eliminar directorio
Remove-Item -Path C:\tmp\k8s-postgres-data -Recurse -Force

# Recrear
kubectl delete pod <postgres-pod> -n arresto-system
```

**C. Recursos insuficientes:**
```powershell
# Aumentar límites en 04-postgres.yaml
resources:
  limits:
    memory: "1Gi"
  requests:
    memory: "512Mi"
```

---

## 🌐 Problemas de Conectividad

### Frontend no puede conectar con Backend

**Síntomas:**
```javascript
TypeError: Failed to fetch
Error al enviar la imagen al backend
```

**Diagnóstico:**

```powershell
# 1. Verificar port-forwards activos
Get-Job | Where-Object { $_.Name -like "*-pf" -and $_.State -eq "Running" }

# 2. Verificar API_BASE_URL en frontend
kubectl exec <frontend-pod> -n arresto-system -- cat /usr/share/nginx/html/static/js/main.*.js | grep -o "localhost:[0-9]*"

# 3. Probar backend directamente
curl http://localhost:5001/health
```

**Soluciones:**

**A. Port-forward caído:**
```powershell
.\k8s\port-forward.ps1
```

**B. URL incorrecta en frontend:**

Verificar `frontend/src/config.js`:
```javascript
// ✅ Correcto (con port-forward)
const API_BASE_URL = 'http://localhost:5001';

// ❌ Incorrecto
const API_BASE_URL = 'http://localhost:30525';  // NodePort no funciona en Windows
```

Reconstruir si es necesario:
```powershell
docker build -t arresto-frontend:latest frontend
kubectl delete pods -l app=frontend -n arresto-system
```

**C. CORS error:**

Verificar `backend/app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

### Backend no puede conectar con PostgreSQL

**Síntomas:**
```
Error: connect ECONNREFUSED 10.101.155.39:5432
Error al conectar con PostgreSQL
```

**Diagnóstico:**
```powershell
# 1. Verificar servicio PostgreSQL
kubectl get svc postgres-service -n arresto-system

# 2. Verificar endpoints
kubectl get endpoints postgres-service -n arresto-system

# 3. Probar DNS desde backend
kubectl exec <backend-pod> -n arresto-system -- nslookup postgres-service

# 4. Probar conectividad
kubectl exec <backend-pod> -n arresto-system -- nc -zv postgres-service 5432
```

**Soluciones:**

**A. Servicio no existe:**
```powershell
kubectl apply -f k8s/04-postgres.yaml
```

**B. Pod no está Ready:**
```powershell
kubectl get pods -l app=postgres -n arresto-system
# Si no está Running, ver logs
kubectl logs <postgres-pod> -n arresto-system
```

**C. Configuración incorrecta:**

Verificar `k8s/02-configmaps.yaml`:
```yaml
DB_HOST: postgres-service  # No IP, usar nombre del servicio
DB_PORT: "5432"
```

---

## 🔌 Issues de Port-Forward

### Port-forward se cierra automáticamente

**Causa:** Terminal cerrada o proceso interrumpido

**Solución permanente:**

Usar script con jobs en background:
```powershell
# port-forward.ps1 (ya creado)
.\k8s\port-forward.ps1

# Verificar que estén corriendo
Get-Job | Where-Object { $_.Name -like "*-pf" }
```

**Monitorear:**
```powershell
# Ver estado cada 5 segundos
while ($true) {
    Clear-Host
    Write-Host "Port-Forwards Status:" -ForegroundColor Cyan
    Get-Job | Where-Object { $_.Name -like "*-pf" } | Format-Table Name,State
    Start-Sleep -Seconds 5
}
```

---

### Error: Unable to listen on port 3000: address already in use

**Causa:** Puerto ya ocupado por otro proceso

**Diagnóstico:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :3000
```

**Soluciones:**

**A. Matar proceso:**
```powershell
# Obtener PID de la línea anterior (última columna)
Stop-Process -Id <PID> -Force
```

**B. Usar puerto alternativo:**
```powershell
# Cambiar puerto en port-forward
kubectl port-forward -n arresto-system svc/frontend-service 3001:80
# Acceder en http://localhost:3001
```

---

## 💾 Problemas de Almacenamiento

### PVC permanece en Pending

**Diagnóstico:**
```powershell
kubectl describe pvc postgres-pvc -n arresto-system
```

**Causas comunes:**

**A. No hay PV disponible:**
```powershell
kubectl get pv
# Si está vacío o todos están Bound a otros PVCs
```

**Solución:**
```powershell
kubectl apply -f k8s/03-pvcs-local.yaml
kubectl get pv,pvc -n arresto-system
```

**B. StorageClass incorrecto:**

Verificar `k8s/03-pvcs-local.yaml`:
```yaml
# PV debe tener:
storageClassName: ""

# PVC debe tener:
storageClassName: ""
volumeName: postgres-pv  # Especificar PV exacto
```

**C. Tamaño no coincide:**
```yaml
# PV:
capacity:
  storage: 10Gi

# PVC:
resources:
  requests:
    storage: 10Gi  # Debe ser igual o menor
```

---

### Error: no space left on device

**Causa:** Disco virtual Docker lleno

**Diagnóstico:**
```powershell
# Ver espacio usado por Docker
docker system df

# Ver tamaño del VHDX (Windows)
Get-Item C:\Users\*\AppData\Local\Docker\wsl\data\ext4.vhdx | Select-Object FullName,Length
```

**Solución inmediata:**
```powershell
# Limpiar recursos no usados
docker system prune -a --volumes -f
```

**Solución permanente (Windows):**

Compactar VHDX:

```bat
@echo off
echo Deteniendo Docker Desktop...
wsl --shutdown

echo Esperando 10 segundos...
timeout /t 10 /nobreak

echo Compactando disco virtual...
diskpart
select vdisk file="C:\Users\%USERNAME%\AppData\Local\Docker\wsl\data\ext4.vhdx"
compact vdisk
exit

echo Listo! Reinicia Docker Desktop.
pause
```

---

### Datos perdidos después de reiniciar pod

**Causa:** Uso de emptyDir o problema con PVC

**Diagnóstico:**
```powershell
kubectl get pvc -n arresto-system
# STATUS debe ser "Bound"
```

**Verificar montaje en pod:**
```powershell
kubectl describe pod <postgres-pod> -n arresto-system | Select-String "Mounts|Volumes"
```

**Solución:**

Asegurar que `04-postgres.yaml` use PVC:
```yaml
volumes:
  - name: postgres-storage
    persistentVolumeClaim:
      claimName: postgres-pvc  # No emptyDir!
```

---

## 🏗️ Errores de Build

### Error: failed to solve with frontend dockerfile.v0

**Causa:** Error de sintaxis en Dockerfile o archivo faltante

**Diagnóstico:**
```powershell
# Ver Dockerfile
cat backend\Dockerfile
```

**Soluciones comunes:**

**A. Archivo package.json no existe:**
```dockerfile
# ❌ Incorrecto
COPY package*.json ./

# ✅ Correcto (verificar que existe)
COPY package.json package-lock.json ./
```

**B. Ruta incorrecta:**
```powershell
# Verificar contexto de build
docker build -t arresto-backend:latest backend  # Correcto
docker build -t arresto-backend:latest .        # Incorrecto si estás en raíz
```

---

### Error: python: not found

**Causa:** Imagen base sin Python

**Solución en `backend/Dockerfile`:
```dockerfile
# ✅ Usar imagen con Python
FROM node:18-bullseye  # Debian con apt-get

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
```

---

## ⚡ Performance y Recursos

### Backend usa demasiada memoria (>5GB)

**Causa:** TensorFlow carga modelos pesados

**Solución A - Usar CPU version:**

Verificar `requirements.txt`:
```txt
tensorflow-cpu==2.20.0  # No tensorflow (GPU)
```

**Solución B - Limitar recursos:**

En `k8s/05-backend.yaml`:
```yaml
resources:
  limits:
    memory: "6Gi"
    cpu: "2000m"
  requests:
    memory: "3Gi"
    cpu: "1000m"
```

**Solución C - Lazy loading:**

Modificar `deepface_service.py` para cargar modelo solo cuando se use.

---

### Pods tardan mucho en estar Ready

**Diagnóstico:**
```powershell
kubectl get pods -n arresto-system -w
kubectl describe pod <pod-name> -n arresto-system
```

**Causas comunes:**

**A. Descarga de imágenes:**
- Primera vez puede tardar 5-10 minutos
- Solución: Esperar pacientemente

**B. Inicialización de PostgreSQL:**
- initdb puede tardar 1-2 minutos
- Solución: Normal, esperar

**C. Inicio de DeepFace:**
- Cargar TensorFlow tarda ~30 segundos
- Solución: Normal, esperar

**D. Recursos insuficientes:**
```powershell
kubectl top nodes
# Si >90% usar, cerrar otras apps
```

---

## 📊 Logs y Debugging Avanzado

### Habilitar debug logs en backend

Editar `backend/app.js`:
```javascript
// Agregar al inicio
if (process.env.DEBUG === 'true') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
}
```

Activar en `k8s/02-configmaps.yaml`:
```yaml
data:
  DEBUG: "true"
```

---

### Capturar tráfico de red

```powershell
# Dentro del pod
kubectl exec <backend-pod> -n arresto-system -- tcpdump -i any -w /tmp/capture.pcap

# Copiar archivo
kubectl cp arresto-system/<backend-pod>:/tmp/capture.pcap ./capture.pcap

# Analizar con Wireshark
```

---

## 🆘 Último Recurso

### Reinicio Completo del Sistema

```powershell
# 1. Detener port-forwards
Get-Job | Stop-Job
Get-Job | Remove-Job

# 2. Eliminar namespace
kubectl delete namespace arresto-system

# 3. Eliminar PVs
kubectl delete pv postgres-pv backend-uploads-pv

# 4. Limpiar datos locales
Remove-Item -Path C:\tmp\k8s-postgres-data -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path C:\tmp\k8s-backend-uploads -Recurse -Force -ErrorAction SilentlyContinue

# 5. Limpiar Docker
docker system prune -a --volumes -f

# 6. Esperar 30 segundos
Start-Sleep -Seconds 30

# 7. Volver a desplegar
cd k8s
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmaps.yaml
kubectl apply -f 03-pvcs-local.yaml
kubectl apply -f 04-postgres.yaml -f 05-backend.yaml -f 06-frontend.yaml

# 8. Esperar a que estén listos
kubectl get pods -n arresto-system -w

# 9. Crear tablas
# (Ejecutar script de creación de tablas)

# 10. Iniciar port-forwards
.\port-forward.ps1
```

---

**Última actualización:** 23 de Octubre de 2025  
**Versión:** 2.0
