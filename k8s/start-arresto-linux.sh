#!/bin/bash

# Script de inicio rápido para Sistema de Arresto en Linux
# Autor: Sistema de Arresto V2
# Fecha: 23 de octubre de 2025

echo "🚀 Iniciando Sistema de Arresto..."
echo ""

# Verificar si Minikube está instalado
if ! command -v minikube &> /dev/null; then
    echo "❌ Error: Minikube no está instalado"
    echo "Instálalo con: curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube"
    exit 1
fi

# Verificar si kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: kubectl no está instalado"
    echo "Instálalo siguiendo: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/"
    exit 1
fi

# Iniciar Minikube si no está corriendo
echo "📦 Verificando estado de Minikube..."
if [ "$(minikube status -f '{{.Host}}')" != "Running" ]; then
    echo "🔄 Iniciando Minikube (esto puede tomar 1-2 minutos)..."
    minikube start
    if [ $? -ne 0 ]; then
        echo "❌ Error al iniciar Minikube"
        exit 1
    fi
else
    echo "✅ Minikube ya está corriendo"
fi

echo ""
echo "✅ Verificando pods del sistema..."
kubectl get pods -n arresto-system

echo ""
echo "🔌 Configurando port-forwards..."

# Detener port-forwards anteriores si existen
pkill -f "kubectl port-forward.*arresto-system" 2>/dev/null

# Esperar un momento
sleep 1

# Iniciar port-forwards en background
kubectl port-forward -n arresto-system svc/frontend-service 3000:80 > /dev/null 2>&1 &
FRONTEND_PID=$!

kubectl port-forward -n arresto-system svc/backend-service 5001:5000 > /dev/null 2>&1 &
BACKEND_PID=$!

kubectl port-forward -n arresto-system svc/postgres-service 5432:5432 > /dev/null 2>&1 &
POSTGRES_PID=$!

# Esperar a que se establezcan las conexiones
sleep 3

# Verificar que los port-forwards estén activos
if ps -p $FRONTEND_PID > /dev/null && ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Port-forwards configurados exitosamente"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 URLs del Sistema:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:5001"
    echo "   PostgreSQL: localhost:5432"
    echo ""
    echo "💡 Para acceso desde otros dispositivos en tu red:"
    echo "   IP local: $(hostname -I | awk '{print $1}')"
    echo "   Frontend:  http://$(hostname -I | awk '{print $1}'):3000"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Sistema listo para usar!"
    echo ""
    echo "📝 Comandos útiles:"
    echo "   Ver logs backend:  kubectl logs -f deployment/backend -n arresto-system"
    echo "   Ver logs frontend: kubectl logs -f deployment/frontend -n arresto-system"
    echo "   Ver todos los pods: kubectl get pods -n arresto-system"
    echo "   Detener port-forwards: pkill -f 'kubectl port-forward'"
    echo "   Detener Minikube: minikube stop"
    echo ""
else
    echo "⚠️  Advertencia: Algunos port-forwards pueden no haberse iniciado correctamente"
    echo "Verifica con: ps aux | grep 'kubectl port-forward'"
fi
