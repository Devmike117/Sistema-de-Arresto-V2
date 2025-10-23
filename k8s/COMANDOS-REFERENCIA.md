# 📖 Referencia Rápida de Comandos - Kubernetes Local

## 🚀 Inicio Rápido

### Despliegue Completo (Primera vez)

```powershell
# 1. Construir imágenes
cd backend
docker build -t arresto-backend:latest .

cd ..\frontend  
docker build -t arresto-frontend:latest .

# 2. Aplicar configuraciones
cd ..\k8s
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmaps.yaml
kubectl apply -f 03-pvcs-local.yaml

# 3. Desplegar servicios
kubectl apply -f 04-postgres.yaml -f 05-backend.yaml -f 06-frontend.yaml

# 4. Esperar a que estén listos
kubectl get pods -n arresto-system -w

# 5. Iniciar port-forwards
.\port-forward.ps1
```

### Acceso Rápido

```powershell
# Frontend
http://localhost:3000

# Backend API
http://localhost:5001

# Health Check
http://localhost:5001/health
```

---

## 📊 Monitoreo

### Ver Estado General

```powershell
# Todo en el namespace
kubectl get all -n arresto-system

# Solo pods
kubectl get pods -n arresto-system

# Con más detalles
kubectl get pods -n arresto-system -o wide

# Ver en tiempo real
kubectl get pods -n arresto-system -w
```

### Ver Logs

```powershell
# Backend (últimas 50 líneas)
kubectl logs -l app=backend -n arresto-system --tail=50

# Backend (tiempo real)
kubectl logs -f -l app=backend -n arresto-system

# PostgreSQL
kubectl logs -l app=postgres -n arresto-system --tail=50

# Frontend
kubectl logs -l app=frontend -n arresto-system --tail=50

# Buscar errores en backend
kubectl logs -l app=backend -n arresto-system | Select-String "error|Error|ERROR"
```

### Ver Eventos

```powershell
# Eventos recientes ordenados
kubectl get events -n arresto-system --sort-by='.lastTimestamp'

# Solo últimos 10
kubectl get events -n arresto-system --sort-by='.lastTimestamp' | Select-Object -Last 10
```

---

## 🔧 Actualización de Código

### Actualizar Backend

```powershell
# 1. Reconstruir imagen
cd backend
docker build -t arresto-backend:latest .

# 2. Reiniciar pods
kubectl delete pods -l app=backend -n arresto-system

# 3. Verificar
kubectl get pods -n arresto-system -w
```

### Actualizar Frontend

```powershell
# 1. Reconstruir imagen
cd frontend
docker build -t arresto-frontend:latest .

# 2. Reiniciar pods
kubectl delete pods -l app=frontend -n arresto-system

# 3. Verificar
kubectl get pods -n arresto-system -w
```

### Actualizar Configuración (ConfigMap/Secret)

```powershell
# 1. Aplicar cambios
kubectl apply -f k8s/02-configmaps.yaml

# 2. Reiniciar deployment afectado
kubectl rollout restart deployment backend -n arresto-system
kubectl rollout restart deployment frontend -n arresto-system
```

---

## 🗄️ Base de Datos

### Conectar a PostgreSQL

```powershell
# Shell interactivo
kubectl exec -it <postgres-pod-name> -n arresto-system -- psql -U admin -d arrest_registry

# Ejecutar comando SQL
kubectl exec <postgres-pod-name> -n arresto-system -- psql -U admin -d arrest_registry -c "SELECT * FROM persons;"
```

### Comandos SQL Útiles

```sql
-- Listar tablas
\dt

-- Ver estructura de tabla
\d persons

-- Contar registros
SELECT COUNT(*) FROM persons;

-- Ver últimas 10 personas registradas
SELECT id, first_name, last_name, created_at FROM persons ORDER BY created_at DESC LIMIT 10;

-- Ver arrestos del día
SELECT * FROM arrests WHERE arrest_date::date = CURRENT_DATE;
```

### Backup y Restore

```powershell
# Backup completo
kubectl exec <postgres-pod-name> -n arresto-system -- pg_dump -U admin arrest_registry > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Backup solo estructura
kubectl exec <postgres-pod-name> -n arresto-system -- pg_dump -U admin arrest_registry --schema-only > schema_backup.sql

# Restore
kubectl exec -i <postgres-pod-name> -n arresto-system -- psql -U admin arrest_registry < backup.sql

# Vaciar base de datos
kubectl exec <postgres-pod-name> -n arresto-system -- psql -U admin arrest_registry -c "
TRUNCATE TABLE fingerprints, facialdata, arrests, persons RESTART IDENTITY CASCADE;
"
```

---

## 🔍 Debugging

### Inspeccionar Pod

```powershell
# Descripción completa
kubectl describe pod <pod-name> -n arresto-system

# Shell interactivo
kubectl exec -it <pod-name> -n arresto-system -- /bin/sh

# Ver variables de entorno
kubectl exec <pod-name> -n arresto-system -- env

# Ver procesos
kubectl exec <pod-name> -n arresto-system -- ps aux
```

### Verificar DeepFace

```powershell
# Ver si el proceso está corriendo
kubectl exec <backend-pod-name> -n arresto-system -- ps aux | grep python

# Ver logs de DeepFace
kubectl logs <backend-pod-name> -n arresto-system | Select-String "DeepFace|8001|embedding"

# Probar endpoint (desde dentro del pod)
kubectl exec <backend-pod-name> -n arresto-system -- curl http://127.0.0.1:8001/health
```

### Verificar Conectividad

```powershell
# Desde backend a PostgreSQL
kubectl exec <backend-pod-name> -n arresto-system -- nc -zv postgres-service 5432

# DNS resolution
kubectl exec <backend-pod-name> -n arresto-system -- nslookup postgres-service

# Ver endpoints del servicio
kubectl get endpoints -n arresto-system
```

---

## 🧹 Limpieza

### Reiniciar Pods Específicos

```powershell
# Reiniciar backend
kubectl delete pods -l app=backend -n arresto-system

# Reiniciar frontend
kubectl delete pods -l app=frontend -n arresto-system

# Reiniciar PostgreSQL (⚠️ puede causar pérdida de datos temporales)
kubectl delete pods -l app=postgres -n arresto-system
```

### Limpieza Parcial

```powershell
# Eliminar solo deployments (mantiene PVCs)
kubectl delete deployment --all -n arresto-system

# Eliminar servicios
kubectl delete svc --all -n arresto-system

# Re-aplicar
kubectl apply -f 04-postgres.yaml -f 05-backend.yaml -f 06-frontend.yaml
```

### Limpieza Completa

```powershell
# ⚠️ ELIMINA TODO EL NAMESPACE Y DATOS
kubectl delete namespace arresto-system

# Eliminar PVs
kubectl delete pv postgres-pv backend-uploads-pv

# Limpiar directorios locales
Remove-Item -Path C:\tmp\k8s-postgres-data -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path C:\tmp\k8s-backend-uploads -Recurse -Force -ErrorAction SilentlyContinue
```

### Limpiar Docker

```powershell
# Ver espacio usado
docker system df

# Limpiar contenedores e imágenes sin usar
docker system prune -a -f

# Limpiar volúmenes
docker volume prune -f

# Limpiar todo
docker system prune -a --volumes -f
```

---

## 🌐 Port-Forward

### Iniciar Port-Forwards

```powershell
# Script automático (recomendado)
.\port-forward.ps1

# Manual - Frontend
kubectl port-forward -n arresto-system svc/frontend-service 3000:80

# Manual - Backend
kubectl port-forward -n arresto-system svc/backend-service 5001:5000
```

### Gestionar Port-Forwards

```powershell
# Ver jobs activos
Get-Job

# Ver solo port-forwards
Get-Job | Where-Object { $_.Name -like "*-pf" }

# Detener todos
Get-Job | Stop-Job
Get-Job | Remove-Job

# Detener uno específico
Stop-Job -Name "frontend-pf"
Remove-Job -Name "frontend-pf"
```

---

## 📦 Gestión de Recursos

### Escalar Servicios

```powershell
# Aumentar replicas del backend
kubectl scale deployment backend -n arresto-system --replicas=3

# Reducir replicas del frontend
kubectl scale deployment frontend -n arresto-system --replicas=1

# Verificar
kubectl get deployment -n arresto-system
```

### Ver Uso de Recursos

```powershell
# Uso de recursos por pod
kubectl top pods -n arresto-system

# Uso de recursos por nodo
kubectl top nodes

# Detalles de un pod específico
kubectl describe pod <pod-name> -n arresto-system | Select-String "CPU|Memory"
```

### Verificar PVCs

```powershell
# Ver PVCs
kubectl get pvc -n arresto-system

# Ver PVs
kubectl get pv

# Detalles de un PVC
kubectl describe pvc postgres-pvc -n arresto-system

# Ver espacio usado (aproximado)
kubectl exec <postgres-pod-name> -n arresto-system -- df -h /var/lib/postgresql/data
```

---

## 🔄 Rollout

### Gestión de Deployments

```powershell
# Ver estado del rollout
kubectl rollout status deployment/backend -n arresto-system

# Ver historial
kubectl rollout history deployment/backend -n arresto-system

# Reiniciar deployment
kubectl rollout restart deployment/backend -n arresto-system

# Deshacer último cambio
kubectl rollout undo deployment/backend -n arresto-system

# Deshacer a versión específica
kubectl rollout undo deployment/backend -n arresto-system --to-revision=2
```

---

## 🧪 Testing

### Health Checks

```powershell
# Backend health
curl http://localhost:5001/health

# O con PowerShell
Invoke-WebRequest http://localhost:5001/health | Select-Object StatusCode,Content

# Frontend
curl http://localhost:3000

# DeepFace (desde dentro del pod backend)
kubectl exec <backend-pod-name> -n arresto-system -- curl http://127.0.0.1:8001/health
```

### Probar API

```powershell
# GET - Listar personas
Invoke-RestMethod http://localhost:5001/api/persons

# POST - Validar rostro (necesita imagen)
$form = @{
    file = Get-Item -Path "C:\ruta\a\imagen.jpg"
}
Invoke-RestMethod -Uri http://localhost:5001/api/deepface/validate -Method POST -Form $form
```

---

## 🔐 Secrets y ConfigMaps

### Ver Secrets

```powershell
# Listar secrets
kubectl get secrets -n arresto-system

# Ver secret decodificado
kubectl get secret postgres-secret -n arresto-system -o jsonpath="{.data.POSTGRES_USER}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

# Ver todo el secret
kubectl get secret postgres-secret -n arresto-system -o yaml
```

### Ver ConfigMaps

```powershell
# Listar configmaps
kubectl get configmap -n arresto-system

# Ver contenido
kubectl get configmap backend-config -n arresto-system -o yaml

# Editar configmap
kubectl edit configmap backend-config -n arresto-system
```

---

## 📋 Información del Sistema

### Versiones

```powershell
# Versión de kubectl
kubectl version --short

# Versión de Kubernetes
kubectl version

# Información del cluster
kubectl cluster-info

# Ver nodos
kubectl get nodes -o wide
```

### Contexto

```powershell
# Ver contexto actual
kubectl config current-context

# Listar contextos
kubectl config get-contexts

# Cambiar contexto
kubectl config use-context docker-desktop
```

---

## 🎯 Atajos Útiles

### Alias de PowerShell (agregar a $PROFILE)

```powershell
# Namespace por defecto
function k { kubectl -n arresto-system $args }

# Pods
function kp { kubectl get pods -n arresto-system }

# Logs del backend
function klb { kubectl logs -l app=backend -n arresto-system --tail=50 }

# Logs del frontend
function klf { kubectl logs -l app=frontend -n arresto-system --tail=50 }

# Describir pod
function kdp { kubectl describe pod $args -n arresto-system }

# Ejecutar en pod
function kex { kubectl exec -it $args -n arresto-system -- /bin/sh }
```

**Uso después de cargar aliases:**
```powershell
kp          # Ver pods
klb         # Logs backend
kex <pod>   # Shell en pod
```

---

## 🆘 Solución Rápida de Problemas

### Pod en CrashLoopBackOff

```powershell
kubectl logs <pod-name> -n arresto-system --previous
kubectl describe pod <pod-name> -n arresto-system
kubectl delete pod <pod-name> -n arresto-system
```

### PVC en Pending

```powershell
kubectl get pv
kubectl describe pvc <pvc-name> -n arresto-system
kubectl apply -f k8s/03-pvcs-local.yaml
```

### Port-forward no funciona

```powershell
Get-Job | Stop-Job
Get-Job | Remove-Job
.\port-forward.ps1
```

### Error 503 DeepFace

```powershell
kubectl logs <backend-pod> -n arresto-system | Select-String "DeepFace|8001"
kubectl exec <backend-pod> -n arresto-system -- ps aux | grep python
kubectl delete pods -l app=backend -n arresto-system
```

### Base de datos vacía

```powershell
# Verificar tablas
kubectl exec <postgres-pod> -n arresto-system -- psql -U admin -d arrest_registry -c "\dt"

# Si no existen, crear desde init-db.sql
kubectl exec -i <postgres-pod> -n arresto-system -- psql -U admin -d arrest_registry < ..\init-db.sql
```

---

## 📚 Recursos Adicionales

- **Documentación completa:** `GUIA-DESPLIEGUE-LOCAL.md`
- **Arquitectura:** `README.md`
- **Kubernetes docs:** https://kubernetes.io/docs/
- **kubectl cheatsheet:** https://kubernetes.io/docs/reference/kubectl/cheatsheet/

---

**Última actualización:** 23 de Octubre de 2025  
**Versión:** 2.0
