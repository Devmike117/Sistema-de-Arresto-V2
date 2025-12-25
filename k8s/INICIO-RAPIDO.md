# 🚀 INICIO RÁPIDO - Despliegue Local en 5 Minutos

## ✅ Prerequisitos (solo primera vez)

### Opción A: Docker Desktop (Más fácil para Windows)
1. Instala Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Abre Docker Desktop
3. Settings → Kubernetes → ✅ Enable Kubernetes
4. Apply & Restart

### Opción B: Minikube
```bash
# Windows (con Chocolatey)
choco install minikube

# Mac
brew install minikube

# Iniciar
minikube start --cpus=4 --memory=8192
```

---

## 🎬 Despliegue en 3 Pasos

### Windows:

```cmd
cd k8s
deploy-local.bat
```

**Selecciona en el menú:**
1. Opción `1` - Build (primera vez, toma 5-10 min)
2. Opción `2` - Deploy (toma 2-3 min)
3. Opción `5` - URL para ver dónde acceder

**Acceder:** `http://localhost:30XXX` (el script te da el puerto exacto)

---

### Linux/Mac:

```bash
cd k8s
chmod +x deploy-local.sh
./deploy-local.sh
```

**Selecciona en el menú:**
1. Opción `1` - Build
2. Opción `2` - Deploy
3. Opción `5` - URL

---

## 🌐 Acceso Rápido

### Docker Desktop:
```bash
kubectl get svc frontend-service -n arresto-system
# Busca el NodePort (ejemplo: 80:30080/TCP)
# Abre: http://localhost:30103
```

### Minikube:
```bash
minikube service frontend-service -n arresto-system
# Se abre automáticamente en el navegador
```

---

## 📊 Verificar Estado

```bash
kubectl get pods -n arresto-system
```

**Debes ver 5 pods en Running:**
- backend (2 replicas)
- frontend (2 replicas)
- postgres (1 replica)

---

## 📝 Logs en Vivo

```bash
# Backend
kubectl logs -f deployment/backend -n arresto-system

# Frontend
kubectl logs -f deployment/frontend -n arresto-system
```

---

## 🛑 Detener Todo

```bash
kubectl delete namespace arresto-system
```

---

## 🔄 Rebuild después de cambios en código

```bash
# 1. Rebuild
cd k8s
deploy-local.bat  # o .sh
# Opción 1 (Build)

# 2. Restart pods
kubectl rollout restart deployment -n arresto-system
```

---

## ❓ Problemas Comunes

### "kubectl: command not found"
- Docker Desktop: Verifica que Kubernetes esté habilitado
- Minikube: Ejecuta `minikube start`

### "No se puede conectar al cluster"
```bash
# Docker Desktop
kubectl config use-context docker-desktop

# Minikube
kubectl config use-context minikube
```

### "Pods en CrashLoopBackOff"
```bash
kubectl logs <pod-name> -n arresto-system
kubectl describe pod <pod-name> -n arresto-system
```

### "No puedo acceder desde el navegador"
```bash
# Port forward manual
kubectl port-forward svc/frontend-service 8080:80 -n arresto-system
# Ahora accede a: http://localhost:8080
```

---

## 📚 Documentación Completa

Lee `k8s/README-LOCAL.md` para:
- Configuración avanzada
- Comandos útiles
- Troubleshooting detallado
- Inicialización de base de datos

---

## 🎯 ¡Listo!

Tu sistema de arrestos está corriendo localmente en Kubernetes. 

**Próximo paso:** Accede a la URL y registra una persona con foto facial.

---

**Soporte:** https://github.com/Devmike117/Sistema-de-Arresto-V2/issues
