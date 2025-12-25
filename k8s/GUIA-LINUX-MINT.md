# 🐧 Guía de Despliegue en Linux Mint

## 📋 Requisitos Previos

### Recursos del Sistema
- **RAM:** 8 GB mínimo (12 GB recomendado)
- **CPU:** 4 cores
- **Disco:** 20 GB libres (30 GB recomendado)
- **SO:** Linux Mint 20.x o superior

---

## 🔧 Instalación de Componentes

### 1. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Docker

```bash
# Eliminar versiones antiguas si existen
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependencias
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Agregar la clave GPG oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Configurar el repositorio (Linux Mint está basado en Ubuntu)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Si el comando anterior falla, usa la versión de Ubuntu base:
# Para Linux Mint 21.x (basado en Ubuntu 22.04 Jammy):
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalación
sudo docker run hello-world

# Agregar tu usuario al grupo docker (para no usar sudo)
sudo usermod -aG docker $USER

# Cerrar sesión y volver a iniciar para aplicar cambios del grupo
# O ejecuta: newgrp docker
```

### 3. Instalar Minikube (Kubernetes para Linux)

```bash
# Descargar Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Instalar Minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verificar instalación
minikube version
```

### 4. Instalar kubectl

```bash
# Descargar kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Instalar kubectl
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verificar instalación
kubectl version --client
```

### 5. Instalar Git (si no está instalado)

```bash
sudo apt install -y git

# Verificar
git --version
```

---

## 🚀 Iniciar Kubernetes con Minikube

### Configurar e Iniciar Minikube

```bash
# Iniciar Minikube con Docker como driver
minikube start --driver=docker --cpus=4 --memory=6144 --disk-size=20g

# Verificar estado
minikube status

# Habilitar addons útiles
minikube addons enable ingress
minikube addons enable metrics-server

# Verificar que kubectl funcione
kubectl cluster-info
kubectl get nodes
```

---

## 📦 Desplegar el Sistema de Arresto

### 1. Clonar el Repositorio

```bash
cd ~
git clone https://github.com/Devmike117/Sistema-de-Arresto-V2.git
cd Sistema-de-Arresto-V2
git checkout deploykubernetes
```

### 2. Construir Imágenes Docker

```bash
# Backend (5-8 minutos)
docker build -t arresto-backend:latest backend

# Frontend (3-5 minutos)
docker build -t arresto-frontend:latest frontend

# Cargar imágenes en Minikube
minikube image load arresto-backend:latest
minikube image load arresto-frontend:latest

# Verificar que las imágenes estén en Minikube
minikube ssh docker images | grep arresto
```

### 3. Desplegar en Kubernetes

```bash
cd k8s

# Aplicar manifiestos en orden
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmaps.yaml
kubectl apply -f 03-pvcs-local.yaml
kubectl apply -f 04-postgres.yaml
kubectl apply -f 05-backend.yaml
kubectl apply -f 06-frontend.yaml

# Esperar a que todos los pods estén Running (2-3 minutos)
kubectl get pods -n arresto-system -w
# Presiona Ctrl+C cuando todos muestren "1/1 Running"
```

### 4. Crear Tablas de Base de Datos (SOLO PRIMERA VEZ)

```bash
# Volver al directorio raíz del proyecto
cd ~/Sistema-de-Arresto-V2

# Obtener nombre del pod de PostgreSQL
POSTGRES_POD=$(kubectl get pods -n arresto-system -l app=postgres -o jsonpath="{.items[0].metadata.name}")

# Copiar script SQL al pod
kubectl cp init-db.sql arresto-system/$POSTGRES_POD:/tmp/init-db.sql

# Ejecutar script para crear tablas
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -f /tmp/init-db.sql

# Verificar que las tablas se crearon
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -c "\dt"
```

### 5. Configurar Acceso al Sistema

#### Opción A: Port-Forward (Recomendado para desarrollo)

```bash
# En terminales separadas, o usando & para background:

# Frontend (Terminal 1)
kubectl port-forward -n arresto-system svc/frontend-service 3000:80 &

# Backend (Terminal 2)
kubectl port-forward -n arresto-system svc/backend-service 5001:5000 &

# PostgreSQL (Terminal 3)
kubectl port-forward -n arresto-system svc/postgres-service 5432:5432 &

# Acceder en navegador:
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
```

#### Opción B: NodePort (Acceso desde cualquier dispositivo en la red)

```bash
# Obtener la IP de Minikube
minikube ip
# Ejemplo: 192.168.49.2

# Obtener los NodePorts
kubectl get svc -n arresto-system

# Acceder desde cualquier navegador en la red local:
# Frontend: http://192.168.49.2:30103
# Backend: http://192.168.49.2:30525
```

#### Opción C: Minikube Service (Más fácil)

```bash
# Abrir el frontend automáticamente en el navegador
minikube service frontend-service -n arresto-system

# Ver todas las URLs disponibles
minikube service list -n arresto-system
```

---

## 📱 Probar el Sistema

1. **Abre el navegador:** http://localhost:3000 (o la URL de Minikube)
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

## ⚡ Comandos de Uso Diario

### Iniciar el Sistema

```bash
# 1. Iniciar Minikube (si está detenido)
minikube start

# 2. Verificar pods
kubectl get pods -n arresto-system

# 3. Port-forwards (si usas esta opción)
kubectl port-forward -n arresto-system svc/frontend-service 3000:80 &
kubectl port-forward -n arresto-system svc/backend-service 5001:5000 &

# O usar Minikube service
minikube service frontend-service -n arresto-system
```

### Detener el Sistema

```bash
# Detener port-forwards (si los usaste)
pkill -f "kubectl port-forward"

# Pausar Minikube (libera recursos)
minikube pause

# O detener completamente
minikube stop
```

### Ver Estado del Sistema

```bash
# Estado de Minikube
minikube status

# Pods
kubectl get pods -n arresto-system

# Servicios
kubectl get svc -n arresto-system

# Todo junto
kubectl get all -n arresto-system
```

### Ver Logs

```bash
# Backend
kubectl logs -f deployment/backend -n arresto-system

# Frontend
kubectl logs -f deployment/frontend -n arresto-system

# PostgreSQL
kubectl logs -f deployment/postgres -n arresto-system
```

---

## 🔧 Troubleshooting

### Minikube no inicia

```bash
# Eliminar y recrear cluster
minikube delete
minikube start --driver=docker --cpus=4 --memory=6144

# Si Docker da problemas de permisos
sudo usermod -aG docker $USER
newgrp docker
```

### Imágenes no se encuentran

```bash
# Verificar imágenes en Docker local
docker images | grep arresto

# Cargar nuevamente en Minikube
minikube image load arresto-backend:latest
minikube image load arresto-frontend:latest

# Reiniciar pods
kubectl delete pods -n arresto-system -l app=backend
kubectl delete pods -n arresto-system -l app=frontend
```

### Backend no conecta a PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
kubectl get pods -n arresto-system -l app=postgres

# Ver logs de PostgreSQL
kubectl logs -f deployment/postgres -n arresto-system

# Probar conexión desde backend
kubectl exec deployment/backend -n arresto-system -- nc -zv postgres-service 5432
```

### Error "relation persons does not exist"

```bash
cd ~/Sistema-de-Arresto-V2
POSTGRES_POD=$(kubectl get pods -n arresto-system -l app=postgres -o jsonpath="{.items[0].metadata.name}")
kubectl cp init-db.sql arresto-system/$POSTGRES_POD:/tmp/init-db.sql
kubectl exec $POSTGRES_POD -n arresto-system -- psql -U admin -d arrest_registry -f /tmp/init-db.sql
```

### Reconstruir Imágenes

```bash
cd ~/Sistema-de-Arresto-V2

# Backend
docker build -t arresto-backend:latest backend
minikube image load arresto-backend:latest
kubectl delete pods -n arresto-system -l app=backend

# Frontend
docker build -t arresto-frontend:latest frontend
minikube image load arresto-frontend:latest
kubectl delete pods -n arresto-system -l app=frontend
```

### Acceder a la Base de Datos

```bash
# Port-forward a PostgreSQL
kubectl port-forward -n arresto-system svc/postgres-service 5432:5432 &

# Conectar con psql (necesitas instalar postgresql-client)
sudo apt install -y postgresql-client
psql -h localhost -p 5432 -U admin -d arrest_registry

# O usar DBeaver, pgAdmin, etc.
# Host: localhost
# Port: 5432
# Database: arrest_registry
# User: admin
# Password: YourSecurePassword123!
```

---

## 🔐 Credenciales

### PostgreSQL
- **Usuario:** `admin`
- **Password:** `YourSecurePassword123!`
- **Base de datos:** `arrest_registry`
- **Puerto:** `5432`

---

## 🧹 Limpiar Todo

```bash
# Eliminar namespace completo
kubectl delete namespace arresto-system

# Detener Minikube
minikube stop

# Eliminar cluster completo (borra todo)
minikube delete

# Eliminar imágenes Docker
docker rmi arresto-backend:latest arresto-frontend:latest
```

---

## 📊 Script de Inicio Rápido

Crea un script para facilitar el inicio diario:

```bash
# Crear archivo
nano ~/start-arresto.sh
```

Contenido del script:

```bash
#!/bin/bash

echo "🚀 Iniciando Sistema de Arresto..."

# Iniciar Minikube si está parado
if [ "$(minikube status -f '{{.Host}}')" != "Running" ]; then
    echo "📦 Iniciando Minikube..."
    minikube start
fi

# Verificar pods
echo "✅ Verificando pods..."
kubectl get pods -n arresto-system

# Iniciar port-forwards en background
echo "🔌 Configurando port-forwards..."
kubectl port-forward -n arresto-system svc/frontend-service 3000:80 > /dev/null 2>&1 &
kubectl port-forward -n arresto-system svc/backend-service 5001:5000 > /dev/null 2>&1 &
kubectl port-forward -n arresto-system svc/postgres-service 5432:5432 > /dev/null 2>&1 &

sleep 2

echo "✅ Sistema listo!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Para detener los port-forwards: pkill -f 'kubectl port-forward'"
```

Dar permisos de ejecución:

```bash
chmod +x ~/start-arresto.sh
```

Usar el script:

```bash
~/start-arresto.sh
```

---

## 🔄 Actualizar desde GitHub

```bash
cd ~/Sistema-de-Arresto-V2
git pull origin deploykubernetes

# Reconstruir imágenes
docker build -t arresto-backend:latest backend
docker build -t arresto-frontend:latest frontend

# Cargar en Minikube
minikube image load arresto-backend:latest
minikube image load arresto-frontend:latest

# Reiniciar pods
kubectl delete pods -n arresto-system -l app=backend
kubectl delete pods -n arresto-system -l app=frontend
```

---

## 🌐 Acceso desde Otros Dispositivos en la Red

### Obtener la IP de tu máquina Linux

```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# O más simple:
hostname -I
```

### Opción 1: Port-forward con acceso externo

```bash
# Frontend
kubectl port-forward --address=0.0.0.0 -n arresto-system svc/frontend-service 3000:80 &

# Backend
kubectl port-forward --address=0.0.0.0 -n arresto-system svc/backend-service 5001:5000 &
```

Acceder desde otro dispositivo:
- `http://<TU_IP>:3000` - Frontend
- `http://<TU_IP>:5001` - Backend

### Opción 2: Usar Minikube tunnel

```bash
# En una terminal aparte (requiere sudo)
minikube tunnel

# Esto expone los servicios LoadBalancer en tu red local
```

---

## 📚 Referencias

- **Docker:** https://docs.docker.com/engine/install/ubuntu/
- **Minikube:** https://minikube.sigs.k8s.io/docs/start/
- **kubectl:** https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/

---

**Última actualización:** 23 de octubre de 2025
