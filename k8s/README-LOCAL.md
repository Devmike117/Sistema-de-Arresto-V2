# 🏠 Despliegue Local con Kubernetes

Guía rápida para desplegar el Sistema de Arresto en tu máquina local usando **Docker Desktop** o **Minikube**.

## 🌐 URLs de Acceso Rápido

Una vez desplegado, accede al sistema en:

- **🖥️ Frontend:** http://localhost:30103
- **🔌 Backend API:** http://localhost:30525
- **📊 Health Check:** http://localhost:30525/health

> 💡 Estos puertos son **fijos** y no cambiarán al reiniciar Kubernetes.

---

## 🎯 Opción 1: Docker Desktop (Recomendado para Windows/Mac)

### Paso 1: Habilitar Kubernetes en Docker Desktop

1. Abre **Docker Desktop**
2. Ve a **Settings** (⚙️) → **Kubernetes**
3. Marca ✅ **Enable Kubernetes**
4. Clic en **Apply & Restart**
5. Espera a que aparezca "Kubernetes is running" (🟢)

### Paso 2: Verificar instalación

```bash
kubectl version --client
kubectl cluster-info
```

Deberías ver algo como:
```
Kubernetes control plane is running at https://kubernetes.docker.internal:6443
```

### Paso 3: Desplegar

**Windows:**
```cmd
cd k8s
deploy-local.bat
```

**Mac/Linux:**
```bash
cd k8s
chmod +x deploy-local.sh
./deploy-local.sh
```

Selecciona las opciones:
1. **Build** - Construir imágenes (primera vez)
2. **Deploy** - Desplegar todo
3. **URL** - Ver cómo acceder

---

## 🎯 Opción 2: Minikube (Multiplataforma)

### Paso 1: Instalar Minikube

**Windows (Chocolatey):**
```powershell
choco install minikube
```

**Windows (descarga directa):**
```powershell
# Descargar de https://minikube.sigs.k8s.io/docs/start/
# Agregar al PATH
```

**Mac:**
```bash
brew install minikube
```

**Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Paso 2: Iniciar Minikube

```bash
minikube start --cpus=4 --memory=8192 --disk-size=20g
```

Parámetros recomendados:
- **4 CPUs** (mínimo 2)
- **8GB RAM** (mínimo 4GB)
- **20GB disco**

### Paso 3: Configurar Docker para usar Minikube

```bash
eval $(minikube docker-env)
# En Windows PowerShell:
# & minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

Esto hace que Docker use el daemon interno de Minikube (sin necesidad de registry).

### Paso 4: Desplegar

```bash
cd k8s
./deploy-local.sh build    # Construir imágenes
./deploy-local.sh deploy   # Desplegar
```

### Paso 5: Acceder

```bash
minikube service frontend-service -n arresto-system
```

Esto abrirá automáticamente tu navegador en la URL correcta.

---

## 📋 Guía de Uso del Script

### Menu Interactivo

```bash
# Windows
deploy-local.bat

# Linux/Mac
./deploy-local.sh
```

**Opciones disponibles:**

| Opción | Comando | Descripción |
|--------|---------|-------------|
| 1 | Build | Construir imágenes Docker locales |
| 2 | Deploy | Desplegar todo en Kubernetes |
| 3 | Status | Ver pods, servicios, volumenes |
| 4 | Logs | Ver logs de backend/frontend/DB |
| 5 | URL | Obtener URLs de acceso |
| 6 | Stop | Detener pods (mantiene datos) |
| 7 | Restart | Reiniciar pods |
| 8 | Clean | Eliminar TODO |
| 9 | Exit | Salir |

### Modo Comando Directo

```bash
# Linux/Mac
./deploy-local.sh build
./deploy-local.sh deploy
./deploy-local.sh status
./deploy-local.sh logs
./deploy-local.sh url
./deploy-local.sh clean
```

---

## 🚀 Despliegue Paso a Paso

### 1. Construir Imágenes (primera vez)

```bash
./deploy-local.sh build
```

Esto crea:
- `arresto-frontend:latest`
- `arresto-backend:latest`

### 2. Desplegar en Kubernetes

```bash
./deploy-local.sh deploy
```

Esto crea:
- ✅ Namespace `arresto-system`
- ✅ PostgreSQL con volumen persistente (10GB)
- ✅ Backend (2 replicas)
- ✅ Frontend (2 replicas)
- ✅ Volumen para uploads (20GB)

### 3. Verificar Estado

```bash
kubectl get pods -n arresto-system
```

Deberías ver:
```
NAME                        READY   STATUS    RESTARTS
backend-xxx-yyy             1/1     Running   0
backend-xxx-zzz             1/1     Running   0
frontend-xxx-yyy            1/1     Running   0
frontend-xxx-zzz            1/1     Running   0
postgres-xxx-yyy            1/1     Running   0
```

### 4. Obtener URL de Acceso

**Puertos Fijos Configurados:**

✅ **Frontend:** `http://localhost:30103`  
✅ **Backend API:** `http://localhost:30525`

Estos puertos son fijos y no cambiarán al reiniciar Kubernetes.

**Verificar servicios:**
```bash
kubectl get svc -n arresto-system
```

**Minikube:**
```bash
minikube service frontend-service -n arresto-system
# Se abre automáticamente en el navegador
```

---

## 🔍 Comandos Útiles

### Ver Logs en Tiempo Real

```bash
# Backend
kubectl logs -f deployment/backend -n arresto-system

# Frontend
kubectl logs -f deployment/frontend -n arresto-system

# PostgreSQL
kubectl logs -f deployment/postgres -n arresto-system
```

### Acceder a un Pod

```bash
# Backend
kubectl exec -it deployment/backend -n arresto-system -- /bin/sh

# PostgreSQL
kubectl exec -it deployment/postgres -n arresto-system -- psql -U admin -d arrest_registry
```

### Ver Recursos

```bash
kubectl get all -n arresto-system
kubectl get pvc -n arresto-system  # Volúmenes
kubectl describe pod <pod-name> -n arresto-system
```

### Port Forward (acceso directo)

```bash
# Frontend en puerto 8080 local
kubectl port-forward svc/frontend-service 8080:80 -n arresto-system

# Backend en puerto 5000 local
kubectl port-forward svc/backend-service 5000:5000 -n arresto-system
```

---

## 🗄️ Inicializar Base de Datos

### Opción 1: Desde un archivo SQL

```bash
# Copiar schema al pod
kubectl cp estructura\ basede\ datos.txt arresto-system/$(kubectl get pod -l app=postgres -n arresto-system -o jsonpath='{.items[0].metadata.name}'):/tmp/schema.sql

# Ejecutar
kubectl exec deployment/postgres -n arresto-system -- psql -U admin -d arrest_registry -f /tmp/schema.sql
```

### Opción 2: Interactivo

```bash
kubectl exec -it deployment/postgres -n arresto-system -- psql -U admin -d arrest_registry

# Dentro de psql:
\dt                    # Ver tablas
\d persons            # Ver estructura de tabla
SELECT * FROM persons LIMIT 5;
```

---

## 🛠️ Solución de Problemas

### Pods en estado `ImagePullBackOff`

**Problema:** Kubernetes intenta descargar la imagen de un registry.

**Solución:** Verifica que los manifiestos tengan:
```yaml
imagePullPolicy: Never  # No intentar descargar
```

### Pods en `CrashLoopBackOff`

```bash
# Ver logs del pod
kubectl logs <pod-name> -n arresto-system

# Ver eventos
kubectl describe pod <pod-name> -n arresto-system
```

### PostgreSQL no inicia

```bash
# Ver logs
kubectl logs deployment/postgres -n arresto-system

# Ver eventos del PVC
kubectl describe pvc postgres-pvc -n arresto-system
```

### No puedo acceder desde el navegador

**Docker Desktop:**
- NodePort siempre es accesible en `localhost:<puerto>`
- **Frontend:** `http://localhost:30103`
- **Backend:** `http://localhost:30525`

**Minikube:**
- Usa `minikube service <nombre> -n arresto-system`
- O `minikube tunnel` (requiere permisos admin)

### Rebuild después de cambios en el código

```bash
# 1. Rebuild imágenes
./deploy-local.sh build

# 2. Reiniciar pods
kubectl rollout restart deployment -n arresto-system

# O elimina los pods manualmente para forzar recreación
kubectl delete pod -l app=backend -n arresto-system
kubectl delete pod -l app=frontend -n arresto-system
```

---

## 🧹 Limpieza

### Detener (mantiene datos)

```bash
kubectl scale deployment --all --replicas=0 -n arresto-system
```

### Eliminar TODO

```bash
kubectl delete namespace arresto-system
```

### Limpiar imágenes Docker

```bash
docker rmi arresto-frontend:latest arresto-backend:latest
```

### Detener Minikube

```bash
minikube stop
minikube delete  # Elimina el cluster completo
```

---

## 📊 Recursos del Sistema

Configuración por defecto:

| Componente | CPU Request | CPU Limit | Memory Request | Memory Limit |
|------------|-------------|-----------|----------------|--------------|
| Backend | 500m | 2000m | 512Mi | 2Gi |
| Frontend | 100m | 500m | 128Mi | 256Mi |
| PostgreSQL | 250m | 1000m | 256Mi | 1Gi |

**Total requerido:**
- CPU: ~2 cores
- RAM: ~4GB
- Disco: ~30GB (10GB DB + 20GB uploads)

---

## 🎯 Siguiente Paso: Prueba el Sistema

### Acceso al Sistema

**Frontend (Interfaz de Usuario):**
```
http://localhost:30103
```

**Backend API (Endpoints REST):**
```
http://localhost:30525
```

**Health Check:**
```
http://localhost:30525/health
```

### Pasos de Prueba

1. Abre el navegador en `http://localhost:30103`
2. Registra una nueva persona con foto
3. Verifica que se guarde en la base de datos
4. Prueba la búsqueda facial

### Ver logs mientras pruebas

```bash
# Ver logs del backend mientras pruebas
kubectl logs -f deployment/backend -n arresto-system
```

---

## 📚 Recursos Adicionales

- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

---

**¿Problemas?** Abre un issue en: https://github.com/Devmike117/Sistema-de-Arresto-V2/issues




# ver puertos:  kubectl get pods -n arresto-system -o wide