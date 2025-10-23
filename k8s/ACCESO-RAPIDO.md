# 🚀 Acceso Rápido - Sistema de Arresto

## � Inicio Rápido según tu Situación

### 🆕 Primera Vez o Nueva PC (Despliegue Completo)

```powershell
# 1. Clonar repositorio
git clone https://github.com/Devmike117/Sistema-de-Arresto-V2.git
cd Sistema-de-Arresto-V2

# 2. Construir imágenes Docker (5-8 minutos)
docker build -t arresto-backend:latest backend
docker build -t arresto-frontend:latest frontend

# 3. Desplegar en Kubernetes
cd k8s
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmaps.yaml
kubectl apply -f 03-pvcs-local.yaml
kubectl apply -f 04-postgres.yaml
kubectl apply -f 05-backend.yaml
kubectl apply -f 06-frontend.yaml

# 4. Esperar a que pods estén Running (2-3 minutos)
kubectl get pods -n arresto-system -w
# Cuando veas todos "1/1 Running", presiona Ctrl+C

# 5. Crear tablas de base de datos (SOLO PRIMERA VEZ)
cd ..
$POSTGRES_POD = kubectl get pods -n arresto-system -l app=postgres -o jsonpath="{.items[0].metadata.name}"
kubectl cp init-db.sql arresto-system/$POSTGRES_POD:/tmp/init-db.sql
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -f /tmp/init-db.sql
cd k8s

# 6. Iniciar port-forwards
.\port-forward.ps1

# 7. Acceder al sistema
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
```

**Tiempo total:** ~10-15 minutos

---

### ⚡ Uso Diario (Sistema ya desplegado)

```powershell
# Solo necesitas iniciar port-forwards
cd k8s
.\port-forward.ps1
```

**Tiempo total:** ~3 segundos ✅

---

### 🔄 Después de Reiniciar PC

```powershell
# 1. Abrir Docker Desktop (esperar 1-2 minutos)

# 2. Verificar que pods estén corriendo
kubectl get pods -n arresto-system

# 3. Si están "Running", solo ejecuta:
cd k8s
.\port-forward.ps1
```

**Tiempo total:** ~2 minutos

---

## 📋 Requisitos Previos (Solo Primera Vez)

### Software Necesario

1. **Docker Desktop** (con Kubernetes habilitado)
   - Descargar: https://www.docker.com/products/docker-desktop
   - En Settings → Kubernetes → ✅ Enable Kubernetes

2. **Git** (para clonar el repositorio)
   - Descargar: https://git-scm.com/download/win

3. **PowerShell** (ya incluido en Windows)

### Verificar Instalación

```powershell
# Verificar Docker
docker --version

# Verificar Kubernetes
kubectl version --short

# Verificar Git
git --version
```

### Recursos Mínimos

- **RAM:** 8 GB (recomendado 12 GB)
- **CPU:** 4 cores
- **Disco:** 15 GB libres (25 GB recomendado)
- **SO:** Windows 10/11 Pro o Enterprise

---

## � URLs del Sistema

### 🔧 Acceso Recomendado (Port-Forward)

> ⚠️ **Importante**: En Docker Desktop Windows, los NodePorts pueden no funcionar correctamente.  
> **Usa el script de port-forward para acceso garantizado:**

```powershell
cd k8s
.\port-forward.ps1
```

| Servicio | URL (Port-Forward) | Descripción |
|----------|-------------------|-------------|
| **Frontend** | http://localhost:3000 | Interfaz web principal |
| **Backend API** | http://localhost:5001 | REST API |
| **Health Check** | http://localhost:5001/health | Estado del backend |

### Producción Local (NodePort - puede no funcionar en Windows)

| Servicio | URL | Puerto | Descripción |
|----------|-----|--------|-------------|
| **Frontend** | http://localhost:30103 | 30103 | Interfaz web principal |
| **Backend API** | http://localhost:30525 | 30525 | REST API |
| **Health Check** | http://localhost:30525/health | 30525 | Estado del backend |

### IPs Internas del Cluster

| Servicio | ClusterIP | Puerto | Uso |
|----------|-----------|--------|-----|
| **Backend** | 10.97.29.130 | 5000 | Comunicación interna |
| **Frontend** | 10.98.185.189 | 80 | Comunicación interna |
| **PostgreSQL** | 10.101.155.39 | 5432 | Base de datos |

> 💡 **Nota:** Las ClusterIP solo son accesibles desde dentro del cluster de Kubernetes.

---

## ⚡ Comandos Más Usados

### Ver Estado del Sistema
```bash
# Ver todos los pods
kubectl get pods -n arresto-system

# Ver todos los servicios con puertos
kubectl get svc -n arresto-system

# Ver todo (pods, services, deployments)
kubectl get all -n arresto-system
```

### Ver Logs en Tiempo Real
```bash
# Backend
kubectl logs -f deployment/backend -n arresto-system

# Frontend
kubectl logs -f deployment/frontend -n arresto-system

# PostgreSQL
kubectl logs -f deployment/postgres -n arresto-system
```

### Reiniciar Servicios
```bash
# Reiniciar backend
kubectl rollout restart deployment backend -n arresto-system

# Reiniciar frontend
kubectl rollout restart deployment frontend -n arresto-system

# Reiniciar todo
kubectl rollout restart deployment -n arresto-system
```

### Acceder a Contenedores
```bash
# Shell en backend
kubectl exec -it deployment/backend -n arresto-system -- /bin/sh

# Shell en PostgreSQL
kubectl exec -it deployment/postgres -n arresto-system -- /bin/bash

# Conectar a la base de datos
kubectl exec -it deployment/postgres -n arresto-system -- psql -U admin -d arrest_registry
```

### Port Forwarding Manual (Si el script no funciona)

> ⚠️ **Nota:** Si `.\port-forward.ps1` da error de firma digital, usa estos comandos:

```powershell
# Frontend en puerto local 3000
Start-Job -Name "frontend-pf" -ScriptBlock { kubectl port-forward -n arresto-system svc/frontend-service 3000:80 }

# Backend en puerto local 5001
Start-Job -Name "backend-pf" -ScriptBlock { kubectl port-forward -n arresto-system svc/backend-service 5001:5000 }

# PostgreSQL en puerto local 5432
Start-Job -Name "postgres-pf" -ScriptBlock { kubectl port-forward -n arresto-system svc/postgres-service 5432:5432 }

# Ver estado de los jobs
Get-Job
```

### Port Forwarding Individual (Alternativa)
```bash
# Frontend en puerto local 8080
kubectl port-forward svc/frontend-service 8080:80 -n arresto-system

# Backend en puerto local 5000
kubectl port-forward svc/backend-service 5000:5000 -n arresto-system

# PostgreSQL en puerto local 5432
kubectl port-forward svc/postgres-service 5432:5432 -n arresto-system
```

---

## 🔧 Troubleshooting Rápido

### Backend no inicia
```bash
# Ver logs del backend
kubectl logs deployment/backend -n arresto-system --tail=100

# Ver eventos del pod
kubectl describe pod -l app=backend -n arresto-system
```

### Frontend no carga
```bash
# Verificar que el servicio esté corriendo
kubectl get svc frontend-service -n arresto-system

# Verificar configuración del API
kubectl get configmap frontend-config -n arresto-system -o yaml
```

### Base de datos no conecta
```bash
# Verificar que PostgreSQL esté corriendo
kubectl get pods -l app=postgres -n arresto-system

# Probar conexión
kubectl exec deployment/backend -n arresto-system -- nc -zv postgres-service 5432
```

### Error "relation persons does not exist" (Tablas no creadas)
```powershell
# Si ves errores de tablas faltantes, créalas manualmente:
cd C:\Users\mikea\Desktop\Sistema-de-Arresto-V2
$POSTGRES_POD = kubectl get pods -n arresto-system -l app=postgres -o jsonpath="{.items[0].metadata.name}"
kubectl cp init-db.sql arresto-system/${POSTGRES_POD}:/tmp/init-db.sql
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -f /tmp/init-db.sql

# Verificar que las tablas existan
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -c "\dt"
```

### Reconstruir Imágenes
```bash
# Backend
cd backend
docker build -t arresto-backend:latest .
kubectl delete pods -l app=backend -n arresto-system

# Frontend
cd frontend
docker build -t arresto-frontend:latest .
kubectl delete pods -l app=frontend -n arresto-system
```

---

## 📦 Despliegue Completo

### Despliegue Inicial
```bash
cd k8s
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmaps.yaml
kubectl apply -f 03-pvcs-local.yaml
kubectl apply -f 04-postgres.yaml
kubectl apply -f 05-backend.yaml
kubectl apply -f 06-frontend.yaml
```

### Verificar Despliegue
```bash
# Esperar a que todos los pods estén Running
kubectl get pods -n arresto-system -w

# Cuando todos estén 1/1 Running, presiona Ctrl+C
# Luego accede a: http://localhost:30103
```

### Limpiar Todo
```bash
# Eliminar namespace completo (borra todo)
kubectl delete namespace arresto-system

# Eliminar imágenes Docker
docker rmi arresto-backend:latest arresto-frontend:latest
```

---

## 🔐 Credenciales por Defecto

### PostgreSQL
- **Usuario:** `admin`
- **Password:** Ver en `k8s/01-secrets.yaml` (base64 encoded)
- **Base de datos:** `arrest_registry`
- **Puerto interno:** `5432`

### JWT Secret
Ver en `k8s/01-secrets.yaml` (base64 encoded)

---

## 📱 Probar el Sistema

1. **Abre el navegador:** http://localhost:30103
2. **Registra una persona:**
   - Completa el formulario
   - Sube una foto
   - Captura huella digital (opcional)
   - Firma digital (opcional)
3. **Busca personas:**
   - Por nombre, CURP, etc.
   - Búsqueda facial con foto
4. **Consulta dashboard:**
   - Estadísticas
   - Reportes
   - Historial de arrestos

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `kubectl logs -f deployment/backend -n arresto-system`
2. Verifica el estado: `kubectl get pods -n arresto-system`
3. Consulta el README completo: [`README-LOCAL.md`](./README-LOCAL.md)
4. Abre un issue: https://github.com/Devmike117/Sistema-de-Arresto-V2/issues

---

**Última actualización:** 23 de octubre de 2025
