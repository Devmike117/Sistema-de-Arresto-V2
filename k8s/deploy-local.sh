#!/bin/bash
# Script de despliegue local para Linux/Mac
# Prerequisito: Minikube o Docker Desktop con Kubernetes

set -e

NAMESPACE="arresto-system"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

function log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

function check_requirements() {
    log_info "Verificando prerequisitos..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl no está instalado"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "docker no está instalado"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "No hay conexión al cluster de Kubernetes"
        log_info "Inicia Minikube con: minikube start"
        log_info "O habilita Kubernetes en Docker Desktop"
        exit 1
    fi
    
    log_info "Prerequisitos OK ✓"
}

function use_minikube_docker() {
    if command -v minikube &> /dev/null; then
        log_info "Configurando Docker para usar el daemon de Minikube..."
        eval $(minikube docker-env)
        log_info "Ahora Docker usa el daemon de Minikube ✓"
    fi
}

function build_images() {
    log_info "Construyendo imágenes Docker locales..."
    
    log_info "[1/2] Construyendo frontend..."
    cd ../frontend
    docker build -t arresto-frontend:latest .
    
    log_info "[2/2] Construyendo backend..."
    cd ../backend
    docker build -t arresto-backend:latest .
    
    cd ../k8s
    log_info "Imágenes construidas exitosamente ✓"
}

function deploy_all() {
    log_info "Desplegando en Kubernetes local..."
    
    kubectl apply -f 00-namespace.yaml
    kubectl apply -f 01-secrets.yaml
    kubectl apply -f 02-configmaps.yaml
    kubectl apply -f 03-pvcs.yaml
    
    log_info "Esperando creación de volúmenes..."
    sleep 5
    
    kubectl apply -f 04-postgres.yaml
    
    log_info "Esperando a que PostgreSQL esté listo..."
    kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s || \
        log_warn "PostgreSQL tardó más de lo esperado"
    
    kubectl apply -f 05-backend.yaml
    kubectl apply -f 06-frontend.yaml
    
    log_info "Despliegue completado ✓"
    
    log_info "Esperando a que los pods estén listos..."
    sleep 10
    kubectl get pods -n ${NAMESPACE}
}

function show_status() {
    log_info "Estado del sistema:"
    echo ""
    kubectl get all -n ${NAMESPACE}
    echo ""
    log_info "Volúmenes persistentes:"
    kubectl get pvc -n ${NAMESPACE}
}

function show_logs() {
    echo "Selecciona componente:"
    echo "1) Backend"
    echo "2) Frontend"
    echo "3) PostgreSQL"
    read -p "Opción: " option
    
    case $option in
        1) kubectl logs -f -l app=backend -n ${NAMESPACE} --tail=100 ;;
        2) kubectl logs -f -l app=frontend -n ${NAMESPACE} --tail=100 ;;
        3) kubectl logs -f -l app=postgres -n ${NAMESPACE} --tail=100 ;;
        *) log_error "Opción inválida" ;;
    esac
}

function get_urls() {
    log_info "URLs de acceso:"
    echo ""
    
    if command -v minikube &> /dev/null && minikube status &> /dev/null; then
        log_info "Usando Minikube:"
        echo "Frontend: $(minikube service frontend-service -n ${NAMESPACE} --url)"
        echo "Backend:  $(minikube service backend-service -n ${NAMESPACE} --url)"
    else
        log_info "NodePort Services:"
        kubectl get svc -n ${NAMESPACE}
        echo ""
        log_info "Accede con: http://localhost:[NODE_PORT]"
    fi
}

function stop_all() {
    log_info "Deteniendo deployments..."
    kubectl scale deployment --all --replicas=0 -n ${NAMESPACE}
    log_info "Deployments detenidos ✓"
}

function restart_all() {
    log_info "Reiniciando pods..."
    kubectl rollout restart deployment -n ${NAMESPACE}
    log_info "Pods reiniciados ✓"
}

function clean_all() {
    log_warn "Esto eliminará TODOS los recursos"
    read -p "¿Estás seguro? (y/n): " confirm
    if [[ $confirm == [yY] ]]; then
        log_info "Eliminando namespace..."
        kubectl delete namespace ${NAMESPACE}
        log_info "Recursos eliminados ✓"
    else
        log_info "Operación cancelada"
    fi
}

function show_menu() {
    echo ""
    echo "=========================================="
    echo "  Despliegue Local - Sistema de Arresto"
    echo "=========================================="
    echo ""
    echo "1. Build     - Construir imágenes locales"
    echo "2. Deploy    - Desplegar en Kubernetes"
    echo "3. Status    - Ver estado del sistema"
    echo "4. Logs      - Ver logs de componentes"
    echo "5. URL       - Obtener URLs de acceso"
    echo "6. Stop      - Detener deployments"
    echo "7. Restart   - Reiniciar pods"
    echo "8. Clean     - Eliminar todo"
    echo "9. Exit      - Salir"
    echo ""
}

# Main
if [ "$1" != "" ]; then
    # Modo comando directo
    case "$1" in
        build)
            check_requirements
            use_minikube_docker
            build_images
            ;;
        deploy)
            check_requirements
            deploy_all
            get_urls
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        url)
            get_urls
            ;;
        stop)
            stop_all
            ;;
        restart)
            restart_all
            ;;
        clean)
            clean_all
            ;;
        *)
            echo "Uso: $0 {build|deploy|status|logs|url|stop|restart|clean}"
            exit 1
            ;;
    esac
else
    # Modo interactivo
    check_requirements
    
    while true; do
        show_menu
        read -p "Selecciona opción (1-9): " option
        
        case $option in
            1)
                use_minikube_docker
                build_images
                ;;
            2)
                deploy_all
                get_urls
                ;;
            3)
                show_status
                ;;
            4)
                show_logs
                ;;
            5)
                get_urls
                ;;
            6)
                stop_all
                ;;
            7)
                restart_all
                ;;
            8)
                clean_all
                ;;
            9)
                log_info "Saliendo..."
                exit 0
                ;;
            *)
                log_error "Opción inválida"
                ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
fi
