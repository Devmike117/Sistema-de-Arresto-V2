# 🚀 Guía Completa de Despliegue Local - Sistema de Arresto

## 📋 Tabla de Contenidos
- [Requisitos Previos](#requisitos-previos)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Preparación del Entorno](#preparación-del-entorno)
- [Despliegue Paso a Paso](#despliegue-paso-a-paso)
- [Acceso al Sistema](#acceso-al-sistema)
- [Solución de Problemas](#solución-de-problemas)
- [Mantenimiento](#mantenimiento)
- [Comandos Útiles](#comandos-útiles)

---

## 📌 Requisitos Previos

### Software Necesario
- **Docker Desktop** (con Kubernetes habilitado)
  - Versión: 4.0 o superior
  - Kubernetes: 1.34+
  - Memoria asignada: Mínimo 8 GB (recomendado 12 GB)
  - CPU: Mínimo 4 cores

- **kubectl** (incluido con Docker Desktop)
  ```powershell
  kubectl version --client
  ```

- **Git** (para clonar el repositorio)

### Espacio en Disco
- **Mínimo:** 15 GB libres
- **Recomendado:** 25 GB libres

### Sistema Operativo
- Windows 10/11 Pro o Enterprise (con WSL2)
- macOS 10.15 o superior
- Linux (Ubuntu 20.04+, Debian 11+)

---

## 🏗️ Arquitectura del Sistema

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                        │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   Frontend   │   │   Backend    │   │  PostgreSQL  │   │
│  │   (nginx)    │   │  (Node.js)   │   │   (15-alpine)│   │
│  │   2 replicas │   │   2 replicas │   │   1 replica  │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                   │                   │           │
│  ┌──────▼───────┐   ┌──────▼───────┐   ┌──────▼───────┐   │
│  │ Service:80   │   │Service:5000  │   │Service:5432  │   │
│  │NodePort:30103│   │NodePort:30525│   │  ClusterIP   │   │
│  └──────────────┘   └──────┬───────┘   └──────────────┘   │
│                             │                               │
│                      ┌──────▼───────┐                      │
│                      │  DeepFace    │                      │
│                      │  (Python)    │                      │
│                      │  Port: 8001  │                      │
│                      └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Port-Forward    │
                    │  (Desarrollo)     │
                    │  Frontend: 3000   │
                    │  Backend:  5001   │
                    └───────────────────┘
```

### Stack Tecnológico

**Frontend:**
- React 18
- Material UI / Custom Components
- nginx (producción)

**Backend:**
- Node.js 18 (Bullseye)
- Express.js
- Python 3.9 (para DeepFace)
- TensorFlow CPU 2.20.0
- DeepFace (reconocimiento facial)

**Base de Datos:**
- PostgreSQL 15 Alpine
- Tablas: Persons, Arrests, FacialData, Fingerprints

**Almacenamiento:**
- PersistentVolumes con hostPath
- Postgres: 10 GB
- Uploads: 20 GB

---

## 🛠️ Preparación del Entorno

### 1. Habilitar Kubernetes en Docker Desktop

1. Abre **Docker Desktop**
2. Ve a **Settings** → **Kubernetes**
3. Marca **Enable Kubernetes**
4. Clic en **Apply & Restart**
5. Espera a que el indicador de Kubernetes esté en verde

### 2. Verificar Configuración

```powershell
# Verificar kubectl
kubectl version --short

# Verificar contexto
kubectl config current-context
# Debe mostrar: docker-desktop

# Verificar nodos
kubectl get nodes
```

### 3. Clonar el Repositorio

```powershell
git clone https://github.com/Devmike117/Sistema-de-Arresto-V2.git
cd Sistema-de-Arresto-V2
```

---

## 🚀 Despliegue Paso a Paso

### Paso 1: Construir Imágenes Docker

#### Backend
```powershell
cd backend
docker build -t arresto-backend:latest .
```

**Componentes del Backend:**
- Node.js Express server (puerto 5000)
- Python DeepFace service (puerto 8001)
- Dependencias: TensorFlow CPU 2.20, tf-keras, deepface

**Tiempo estimado:** 5-8 minutos

#### Frontend
```powershell
cd ..\frontend
docker build -t arresto-frontend:latest .
```

**Proceso de build:**
1. npm ci (instalar dependencias)
2. npm run build (crear build de producción)
3. Copiar a nginx

**Tiempo estimado:** 1-2 minutos

### Paso 2: Crear Namespace y Configuraciones

```powershell
cd ..\k8s

# Aplicar configuraciones base
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmaps.yaml
kubectl apply -f 03-pvcs-local.yaml
```

**Recursos creados:**
- Namespace: `arresto-system`
- Secrets: credenciales de PostgreSQL y backend
- ConfigMaps: configuración de backend y frontend
- PersistentVolumes y PersistentVolumeClaims

### Paso 3: Verificar PVCs

```powershell
kubectl get pv,pvc -n arresto-system
```

**Salida esperada:**
```
NAME                                 CAPACITY   STATUS   CLAIM
persistentvolume/postgres-pv         10Gi       Bound    arresto-system/postgres-pvc
persistentvolume/backend-uploads-pv  20Gi       Bound    arresto-system/backend-uploads-pvc
```

### Paso 4: Desplegar Servicios

```powershell
# Desplegar todos los servicios
kubectl apply -f 04-postgres.yaml -f 05-backend.yaml -f 06-frontend.yaml
```

**Orden de despliegue:**
1. PostgreSQL (con initContainer para preparar datos)
2. Backend (espera a que PostgreSQL esté listo)
3. Frontend

### Paso 5: Monitorear Despliegue

```powershell
# Ver estado de los pods
kubectl get pods -n arresto-system -w
```

**Espera hasta ver:**
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxx-xxxxx     1/1     Running   0          2m
backend-xxxxxxxxx-xxxxx     1/1     Running   0          2m
frontend-xxxxxxxxx-xxxxx    1/1     Running   0          2m
frontend-xxxxxxxxx-xxxxx    1/1     Running   0          2m
postgres-xxxxxxxxx-xxxxx    1/1     Running   0          3m
```

**Tiempo total:** 3-5 minutos

### Paso 6: Inicializar Base de Datos

**⚠️ IMPORTANTE:** Este paso es necesario solo en el primer despliegue.

```powershell
# Crear tablas en PostgreSQL
kubectl exec postgres-xxxxxxxxx-xxxxx -n arresto-system -- psql -U admin -d arrest_registry -c "
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

CREATE TABLE IF NOT EXISTS FacialData (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    embedding FLOAT8[],
    image_path VARCHAR(255),
    capture_date TIMESTAMP DEFAULT NOW(),
    camera_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Fingerprints (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    template BYTEA,
    scan_date TIMESTAMP DEFAULT NOW(),
    finger VARCHAR(20)
);
"
```

**Verificar tablas creadas:**
```powershell
kubectl exec postgres-xxxxxxxxx-xxxxx -n arresto-system -- psql -U admin -d arrest_registry -c "\dt"
```

### Paso 7: Configurar Port-Forwards

**⚠️ NodePort puede no funcionar en Docker Desktop Windows.**  
**Solución:** Usar port-forward.

#### Opción A: Script Automático
```powershell
.\port-forward.ps1
```

#### Opción B: Manual
```powershell
# Terminal 1 - Frontend
kubectl port-forward -n arresto-system svc/frontend-service 3000:80

# Terminal 2 - Backend
kubectl port-forward -n arresto-system svc/backend-service 5001:5000
```

---

## 🌐 Acceso al Sistema

### URLs de Desarrollo (Port-Forward)

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interfaz web principal |
| **Backend API** | http://localhost:5001 | REST API |
| **Health Check** | http://localhost:5001/health | Estado del backend |

### URLs de Producción Local (NodePort)

⚠️ **Solo funcionan si NodePort está habilitado correctamente en tu sistema.**

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend** | http://localhost:30103 | 30103 |
| **Backend API** | http://localhost:30525 | 30525 |

### IPs Internas del Cluster

| Servicio | ClusterIP | Puerto | Uso |
|----------|-----------|--------|-----|
| **Backend** | 10.97.29.130 | 5000 | Comunicación interna |
| **Frontend** | 10.98.185.189 | 80 | Comunicación interna |
| **PostgreSQL** | 10.101.155.39 | 5432 | Base de datos |

---

## 🔧 Solución de Problemas

### Problema 1: Pods en CrashLoopBackOff

**Síntoma:**
```
backend-xxx   0/1   CrashLoopBackOff
```

**Soluciones:**

1. **Ver logs:**
```powershell
kubectl logs <pod-name> -n arresto-system
```

2. **Verificar eventos:**
```powershell
kubectl describe pod <pod-name> -n arresto-system
```

3. **Errores comunes:**
   - **"No module named 'tensorflow.keras'"**
     - Solución: Reconstruir imagen con `tensorflow-cpu==2.20.0` y `tf-keras`
   
   - **"relation 'persons' does not exist"**
     - Solución: Ejecutar script de inicialización de base de datos (Paso 6)
   
   - **"ECONNREFUSED ::1:8001"**
     - Solución: Usar `127.0.0.1` en lugar de `localhost` en código

### Problema 2: PVCs en Pending

**Síntoma:**
```
postgres-pvc   Pending
```

**Solución:**

1. **Verificar PVs:**
```powershell
kubectl get pv
```

2. **Si no existen, aplicar:**
```powershell
kubectl apply -f 03-pvcs-local.yaml
```

3. **Verificar binding:**
```powershell
kubectl get pvc -n arresto-system
# STATUS debe ser "Bound"
```

### Problema 3: Port-Forward se Cierra

**Síntoma:**
Port-forward se detiene inesperadamente.

**Solución:**

1. **Verificar jobs:**
```powershell
Get-Job | Where-Object { $_.Name -like "*-pf" }
```

2. **Reiniciar port-forwards:**
```powershell
.\port-forward.ps1
```

3. **Mantener terminal abierta:**
   - No cerrar la ventana de PowerShell
   - Si se cierra, volver a ejecutar el script

### Problema 4: Error 503 en /api/deepface/validate

**Síntoma:**
```
Failed to load resource: 503 (Service Unavailable)
```

**Solución:**

1. **Verificar proceso DeepFace:**
```powershell
kubectl exec <backend-pod> -n arresto-system -- ps aux | grep python
```

2. **Ver logs DeepFace:**
```powershell
kubectl logs <backend-pod> -n arresto-system | Select-String "DeepFace"
```

3. **Si no está corriendo:**
   - Reconstruir imagen backend
   - Eliminar pods: `kubectl delete pods -l app=backend -n arresto-system`

### Problema 5: Frontend muestra Error de Conexión

**Síntoma:**
```
TypeError: Failed to fetch
```

**Soluciones:**

1. **Verificar API_BASE_URL:**
   - Debe ser `http://localhost:5001` (con port-forward)
   - O `http://localhost:30525` (con NodePort)

2. **Limpiar caché del navegador:**
   - Presionar `Ctrl+Shift+R` (Windows/Linux)
   - O `Cmd+Shift+R` (macOS)

3. **Verificar port-forwards:**
```powershell
Get-Job | Where-Object { $_.State -eq "Running" }
```

---

## 🔄 Mantenimiento

### Actualizar Código

#### Backend
```powershell
# 1. Modificar código
# 2. Reconstruir imagen
docker build -t arresto-backend:latest backend

# 3. Eliminar pods (se recrean automáticamente)
kubectl delete pods -l app=backend -n arresto-system

# 4. Verificar
kubectl get pods -n arresto-system
```

#### Frontend
```powershell
# 1. Modificar código
# 2. Reconstruir imagen
docker build -t arresto-frontend:latest frontend

# 3. Eliminar pods
kubectl delete pods -l app=frontend -n arresto-system

# 4. Verificar
kubectl get pods -n arresto-system
```

### Limpiar Datos

**⚠️ CUIDADO: Esto eliminará todos los datos.**

```powershell
# Eliminar namespace completo
kubectl delete namespace arresto-system

# Eliminar PVs
kubectl delete pv postgres-pv backend-uploads-pv

# Limpiar directorios locales (Windows)
Remove-Item -Path C:\tmp\k8s-postgres-data -Recurse -Force
Remove-Item -Path C:\tmp\k8s-backend-uploads -Recurse -Force
```

### Backup de Base de Datos

```powershell
# Exportar datos
kubectl exec postgres-xxx -n arresto-system -- pg_dump -U admin arrest_registry > backup.sql

# Restaurar datos
kubectl exec -i postgres-xxx -n arresto-system -- psql -U admin arrest_registry < backup.sql
```

### Escalar Servicios

```powershell
# Aumentar replicas del backend
kubectl scale deployment backend -n arresto-system --replicas=3

# Verificar
kubectl get pods -n arresto-system
```

---

## 📚 Comandos Útiles

### Información General

```powershell
# Ver todo en el namespace
kubectl get all -n arresto-system

# Ver estado de los pods
kubectl get pods -n arresto-system

# Ver servicios
kubectl get svc -n arresto-system

# Ver PVCs
kubectl get pvc -n arresto-system
```

### Logs

```powershell
# Ver logs de un pod
kubectl logs <pod-name> -n arresto-system

# Ver logs en tiempo real
kubectl logs -f <pod-name> -n arresto-system

# Ver logs de un deployment
kubectl logs deployment/<deployment-name> -n arresto-system

# Ver últimas 50 líneas
kubectl logs <pod-name> -n arresto-system --tail=50
```

### Debugging

```powershell
# Describir pod (ver eventos)
kubectl describe pod <pod-name> -n arresto-system

# Ejecutar comando en pod
kubectl exec <pod-name> -n arresto-system -- <comando>

# Shell interactivo
kubectl exec -it <pod-name> -n arresto-system -- /bin/sh

# Ver configuración de un servicio
kubectl get svc <service-name> -n arresto-system -o yaml
```

### Gestión de Recursos

```powershell
# Reiniciar deployment
kubectl rollout restart deployment/<deployment-name> -n arresto-system

# Ver historial de rollout
kubectl rollout history deployment/<deployment-name> -n arresto-system

# Eliminar pod específico
kubectl delete pod <pod-name> -n arresto-system

# Eliminar todos los pods de una app
kubectl delete pods -l app=<app-name> -n arresto-system
```

---

## 🎯 Resumen de URLs y Puertos

### Desarrollo (Recomendado)
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health

### Producción Local (si NodePort funciona)
- **Frontend:** http://localhost:30103
- **Backend API:** http://localhost:30525

### Servicios Internos
- **DeepFace:** http://127.0.0.1:8001 (dentro del pod backend)
- **PostgreSQL:** postgresql://admin@postgres-service:5432/arrest_registry

---

## 📝 Notas Importantes

1. **Port-Forwards:**
   - Son necesarios en Windows/macOS con Docker Desktop
   - Se deben mantener activos mientras uses la aplicación
   - Si se cierran, ejecutar `.\port-forward.ps1` de nuevo

2. **Imágenes Docker:**
   - Las imágenes se construyen localmente
   - Tag: `latest`
   - No se suben a registry

3. **Datos Persistentes:**
   - PostgreSQL: `/tmp/k8s-postgres-data` (hostPath)
   - Uploads: `/tmp/k8s-backend-uploads` (hostPath)
   - Los datos persisten entre reinicios de pods

4. **Recursos:**
   - Backend puede usar hasta 6 GB RAM (con TensorFlow)
   - Frontend: ~100 MB RAM
   - PostgreSQL: ~200 MB RAM

5. **Seguridad:**
   - Credenciales en Secrets (base64)
   - Para producción real, usar soluciones más seguras
   - Cambiar contraseñas por defecto

---

## 🆘 Soporte

### Logs de Errores Comunes

```powershell
# Ver errores del backend
kubectl logs -l app=backend -n arresto-system | Select-String "error|Error|ERROR"

# Ver errores de PostgreSQL
kubectl logs -l app=postgres -n arresto-system | Select-String "error|Error|ERROR"

# Ver eventos del namespace
kubectl get events -n arresto-system --sort-by='.lastTimestamp'
```

### Reinicio Completo

Si todo falla, reinicio completo:

```powershell
# 1. Eliminar namespace
kubectl delete namespace arresto-system

# 2. Esperar 30 segundos
Start-Sleep -Seconds 30

# 3. Volver al Paso 2 del despliegue
kubectl apply -f 00-namespace.yaml
# ... continuar con el resto
```

---

## ✅ Checklist de Verificación

Después del despliegue, verifica:

- [ ] Todos los pods están en estado `Running`
- [ ] Los PVCs están en estado `Bound`
- [ ] El health check responde: http://localhost:5001/health
- [ ] El frontend carga: http://localhost:3000
- [ ] Las tablas de la base de datos existen
- [ ] DeepFace está corriendo en el puerto 8001
- [ ] Port-forwards están activos

---

**Última actualización:** 23 de Octubre de 2025  
**Versión del sistema:** 2.0  
**Autor:** Sistema de Arresto V2 Team
