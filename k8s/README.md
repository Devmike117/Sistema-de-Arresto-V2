# 🚀 Despliegue en Kubernetes

Este directorio contiene todos los manifiestos y scripts necesarios para desplegar el Sistema de Arresto en Kubernetes.

## 📋 Prerequisitos

- **Kubernetes cluster** (1.20+)
  - Minikube (desarrollo local)
  - GKE, EKS, AKS (producción)
  - K3s, MicroK8s (edge/on-premise)
- **kubectl** instalado y configurado
- **Docker** para construir imágenes
- **Registry** de imágenes (Docker Hub, GCR, ECR, etc.)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│              Kubernetes Cluster                      │
│                                                      │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   Frontend   │◄─────┤   Ingress    │            │
│  │  (2 replicas)│      │  (nginx)     │            │
│  └──────┬───────┘      └──────────────┘            │
│         │                                            │
│         ▼                                            │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   Backend    │◄────►│  PostgreSQL  │            │
│  │  (2 replicas)│      │  (StatefulSet│            │
│  └──────┬───────┘      └──────────────┘            │
│         │                                            │
│         ▼                                            │
│  ┌──────────────┐                                   │
│  │   DeepFace   │ (Railway - externo)              │
│  │  Microservice│                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
k8s/
├── 00-namespace.yaml      # Namespace: arresto-system
├── 01-secrets.yaml        # Credenciales (DB, JWT)
├── 02-configmaps.yaml     # Configuración (URLs, puertos)
├── 03-pvcs.yaml           # Volúmenes persistentes
├── 04-postgres.yaml       # Base de datos PostgreSQL
├── 05-backend.yaml        # API Node.js + Express
├── 06-frontend.yaml       # React + Nginx
├── 07-ingress.yaml        # Ingress Controller (opcional)
├── deploy.sh              # Script de despliegue (Linux/Mac)
├── deploy.ps1             # Script de despliegue (Windows)
└── README.md              # Esta documentación
```

## 🚀 Despliegue Rápido

### Opción 1: Script Automatizado (Linux/Mac)

```bash
# 1. Hacer ejecutable el script
chmod +x k8s/deploy.sh

# 2. Configurar registry
export REGISTRY="docker.io/tu-usuario"  # o gcr.io/proyecto, etc.

# 3. Despliegue completo
./k8s/deploy.sh deploy
```

### Opción 2: Script Automatizado (Windows)

```powershell
# 1. Configurar registry
$env:REGISTRY = "docker.io/tu-usuario"

# 2. Despliegue completo
.\k8s\deploy.ps1 deploy
```

### Opción 3: Manual Paso a Paso

```bash
# 1. Construir imágenes Docker
cd frontend
docker build -t your-registry/arresto-frontend:latest .
cd ../backend
docker build -t your-registry/arresto-backend:latest .

# 2. Subir al registry
docker push your-registry/arresto-frontend:latest
docker push your-registry/arresto-backend:latest

# 3. Actualizar manifiestos
# Editar k8s/05-backend.yaml y k8s/06-frontend.yaml
# Cambiar "your-registry" por tu registry real

# 4. Aplicar manifiestos
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-configmaps.yaml
kubectl apply -f k8s/03-pvcs.yaml
kubectl apply -f k8s/04-postgres.yaml
kubectl apply -f k8s/05-backend.yaml
kubectl apply -f k8s/06-frontend.yaml
kubectl apply -f k8s/07-ingress.yaml

# 5. Verificar estado
kubectl get all -n arresto-system
```

## ⚙️ Configuración Importante

### 1. Secrets (01-secrets.yaml)

⚠️ **CAMBIAR EN PRODUCCIÓN**

```yaml
POSTGRES_PASSWORD: "YourSecurePassword123!"  # Cambiar
JWT_SECRET: "your-super-secret-jwt-key..."   # Cambiar
```

### 2. Registry de Imágenes

En `05-backend.yaml` y `06-frontend.yaml`:

```yaml
image: your-registry/arresto-backend:latest  # Cambiar
```

Ejemplos:
- Docker Hub: `docker.io/usuario/arresto-backend:latest`
- Google GCR: `gcr.io/proyecto-id/arresto-backend:latest`
- AWS ECR: `123456789.dkr.ecr.us-east-1.amazonaws.com/arresto-backend:latest`

### 3. Ingress (opcional)

Si quieres usar un dominio personalizado, edita `07-ingress.yaml`:

```yaml
host: arresto.tudominio.com  # Tu dominio
```

### 4. StorageClass

Verifica que tu cluster tenga un StorageClass disponible:

```bash
kubectl get storageclass
```

Si no es `standard`, edita `03-pvcs.yaml`:

```yaml
storageClassName: gp2  # o el nombre de tu StorageClass
```

## 🔍 Comandos Útiles

### Ver estado del sistema

```bash
kubectl get all -n arresto-system
```

### Ver logs

```bash
# Backend
kubectl logs -f deployment/backend -n arresto-system

# Frontend
kubectl logs -f deployment/frontend -n arresto-system

# PostgreSQL
kubectl logs -f deployment/postgres -n arresto-system
```

### Conectarse a un pod

```bash
# Backend
kubectl exec -it deployment/backend -n arresto-system -- /bin/sh

# PostgreSQL
kubectl exec -it deployment/postgres -n arresto-system -- psql -U admin -d arrest_registry
```

### Ver detalles de un pod

```bash
kubectl describe pod <pod-name> -n arresto-system
```

### Reiniciar deployments

```bash
kubectl rollout restart deployment -n arresto-system
```

### Escalar replicas

```bash
kubectl scale deployment backend --replicas=3 -n arresto-system
kubectl scale deployment frontend --replicas=3 -n arresto-system
```

## 🌐 Acceder a la Aplicación

### LoadBalancer (GKE, EKS, AKS)

```bash
kubectl get svc frontend-service -n arresto-system
```

Obtendrás una IP externa:
```
NAME               TYPE           EXTERNAL-IP      PORT(S)
frontend-service   LoadBalancer   34.123.45.67     80:30080/TCP
```

Accede a: `http://34.123.45.67`

### NodePort (Minikube, clusters sin LoadBalancer)

```bash
kubectl get svc frontend-service -n arresto-system
```

Obtendrás:
```
NAME               TYPE       PORT(S)
frontend-service   NodePort   80:30080/TCP
```

Accede a: `http://<node-ip>:30080`

En Minikube:
```bash
minikube service frontend-service -n arresto-system
```

### Ingress (con dominio)

Si configuraste Ingress, accede a:
```
https://arresto.tudominio.com
```

## 📊 Inicializar Base de Datos

```bash
# Copiar schema al pod de PostgreSQL
kubectl cp estructura\ basede\ datos.txt arresto-system/$(kubectl get pod -l app=postgres -n arresto-system -o jsonpath='{.items[0].metadata.name}'):/tmp/schema.sql

# Ejecutar schema
kubectl exec -it $(kubectl get pod -l app=postgres -n arresto-system -o jsonpath='{.items[0].metadata.name}') -n arresto-system -- psql -U admin -d arrest_registry -f /tmp/schema.sql
```

O usa el script:
```bash
./k8s/deploy.sh init-db
```

## 🔧 Solución de Problemas

### Pods no inician

```bash
# Ver eventos
kubectl get events -n arresto-system --sort-by='.lastTimestamp'

# Ver logs
kubectl logs <pod-name> -n arresto-system

# Describir pod
kubectl describe pod <pod-name> -n arresto-system
```

### ImagePullBackOff

- Verifica que el registry sea correcto
- Verifica credenciales (si es registry privado)
- Asegúrate de haber hecho `docker push`

### CrashLoopBackOff

- Revisa logs del pod
- Verifica variables de entorno
- Asegúrate de que PostgreSQL esté listo antes del backend

### Base de datos no conecta

```bash
# Verificar que PostgreSQL esté corriendo
kubectl get pod -l app=postgres -n arresto-system

# Probar conexión desde backend
kubectl exec -it deployment/backend -n arresto-system -- nc -zv postgres-service 5432
```

## 🗑️ Eliminar Todo

```bash
# Con script
./k8s/deploy.sh delete

# Manual
kubectl delete namespace arresto-system
```

## 📈 Monitoreo y Observabilidad

### Prometheus + Grafana (recomendado)

```bash
# Instalar Prometheus Operator
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

# Configurar ServiceMonitor para tus apps
```

### Logs centralizados (EFK Stack)

- Elasticsearch
- Fluentd
- Kibana

## 🔐 Seguridad

- [ ] Cambiar todas las contraseñas en secrets
- [ ] Usar HTTPS con certificados válidos
- [ ] Configurar Network Policies
- [ ] Limitar recursos (CPU/Memory)
- [ ] Escanear imágenes con Trivy/Snyk
- [ ] Habilitar RBAC
- [ ] Usar Pod Security Policies

## 📝 Actualizaciones

```bash
# Nueva versión
export VERSION="v1.1.0"
./k8s/deploy.sh build
./k8s/deploy.sh push

# Rolling update automático
kubectl set image deployment/backend backend=your-registry/arresto-backend:v1.1.0 -n arresto-system
kubectl set image deployment/frontend frontend=your-registry/arresto-frontend:v1.1.0 -n arresto-system
```

## 🆘 Soporte

Para issues o preguntas:
- GitHub: https://github.com/Devmike117/Sistema-de-Arresto-V2/issues
- Documentación: [README.md principal](../README.md)

---

**Desarrollado con ❤️ por Devmike117 & Nextefer**
