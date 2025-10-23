#!/bin/bash

# Script de despliegue automatizado para Kubernetes
# Uso: ./deploy.sh [build|apply|delete|restart|logs|status]

set -e

NAMESPACE="arresto-system"
REGISTRY="your-registry"  # CAMBIAR: docker.io/tu-usuario, gcr.io/proyecto, etc.
VERSION="${VERSION:-latest}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

function log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

function log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

function check_prerequisites() {
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
        exit 1
    fi
    
    log_info "Todos los prerequisitos están cumplidos ✓"
}

function build_images() {
    log_info "Construyendo imágenes Docker..."
    
    # Build frontend
    log_info "Construyendo frontend..."
    cd frontend
    docker build -t ${REGISTRY}/arresto-frontend:${VERSION} .
    cd ..
    
    # Build backend
    log_info "Construyendo backend..."
    cd backend
    docker build -t ${REGISTRY}/arresto-backend:${VERSION} .
    cd ..
    
    log_info "Imágenes construidas exitosamente ✓"
}

function push_images() {
    log_info "Subiendo imágenes al registry..."
    
    docker push ${REGISTRY}/arresto-frontend:${VERSION}
    docker push ${REGISTRY}/arresto-backend:${VERSION}
    
    log_info "Imágenes subidas exitosamente ✓"
}

function create_namespace() {
    log_info "Creando namespace ${NAMESPACE}..."
    kubectl apply -f k8s/00-namespace.yaml
}

function apply_secrets() {
    log_info "Aplicando secrets..."
    log_warn "IMPORTANTE: Revisa y cambia las contraseñas en k8s/01-secrets.yaml antes de producción"
    kubectl apply -f k8s/01-secrets.yaml
}

function apply_configs() {
    log_info "Aplicando ConfigMaps..."
    kubectl apply -f k8s/02-configmaps.yaml
}

function apply_storage() {
    log_info "Creando volúmenes persistentes..."
    kubectl apply -f k8s/03-pvcs.yaml
}

function deploy_database() {
    log_info "Desplegando PostgreSQL..."
    kubectl apply -f k8s/04-postgres.yaml
    
    log_info "Esperando a que PostgreSQL esté listo..."
    kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s
}

function deploy_backend() {
    log_info "Desplegando backend..."
    
    # Actualizar imagen en el deployment
    kubectl set image deployment/backend backend=${REGISTRY}/arresto-backend:${VERSION} -n ${NAMESPACE} || \
        kubectl apply -f k8s/05-backend.yaml
    
    log_info "Esperando a que backend esté listo..."
    kubectl wait --for=condition=ready pod -l app=backend -n ${NAMESPACE} --timeout=300s
}

function deploy_frontend() {
    log_info "Desplegando frontend..."
    
    # Actualizar imagen en el deployment
    kubectl set image deployment/frontend frontend=${REGISTRY}/arresto-frontend:${VERSION} -n ${NAMESPACE} || \
        kubectl apply -f k8s/06-frontend.yaml
    
    log_info "Esperando a que frontend esté listo..."
    kubectl wait --for=condition=ready pod -l app=frontend -n ${NAMESPACE} --timeout=300s
}

function deploy_ingress() {
    log_info "Configurando Ingress..."
    log_warn "Revisa el dominio en k8s/07-ingress.yaml antes de aplicar"
    kubectl apply -f k8s/07-ingress.yaml
}

function full_deploy() {
    check_prerequisites
    build_images
    push_images
    create_namespace
    apply_secrets
    apply_configs
    apply_storage
    deploy_database
    deploy_backend
    deploy_frontend
    deploy_ingress
    
    log_info "Despliegue completado exitosamente! 🎉"
    show_status
}

function delete_all() {
    log_warn "¿Estás seguro de eliminar TODOS los recursos? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Eliminando todos los recursos..."
        kubectl delete namespace ${NAMESPACE}
        log_info "Recursos eliminados ✓"
    else
        log_info "Operación cancelada"
    fi
}

function restart_pods() {
    log_info "Reiniciando pods..."
    kubectl rollout restart deployment -n ${NAMESPACE}
    log_info "Pods reiniciados ✓"
}

function show_logs() {
    log_info "Mostrando logs..."
    echo ""
    echo "Selecciona el componente:"
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

function show_status() {
    log_info "Estado del sistema:"
    echo ""
    kubectl get all -n ${NAMESPACE}
    echo ""
    log_info "URLs de acceso:"
    kubectl get svc frontend-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null && echo " (LoadBalancer)" || \
    kubectl get svc frontend-service -n ${NAMESPACE} -o jsonpath='{.spec.clusterIP}' && echo " (ClusterIP)"
}

function init_database() {
    log_info "Inicializando esquema de base de datos..."
    
    # Obtener el pod de PostgreSQL
    POSTGRES_POD=$(kubectl get pod -l app=postgres -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$POSTGRES_POD" ]; then
        log_error "No se encontró el pod de PostgreSQL"
        exit 1
    fi
    
    log_info "Copiando schema.sql al pod..."
    kubectl cp estructura\ basede\ datos.txt ${NAMESPACE}/${POSTGRES_POD}:/tmp/schema.sql
    
    log_info "Ejecutando schema..."
    kubectl exec -it ${POSTGRES_POD} -n ${NAMESPACE} -- psql -U admin -d arrest_registry -f /tmp/schema.sql
    
    log_info "Base de datos inicializada ✓"
}

# Menu principal
case "$1" in
    build)
        check_prerequisites
        build_images
        ;;
    push)
        push_images
        ;;
    deploy)
        full_deploy
        ;;
    apply)
        create_namespace
        apply_secrets
        apply_configs
        apply_storage
        deploy_database
        deploy_backend
        deploy_frontend
        deploy_ingress
        ;;
    delete)
        delete_all
        ;;
    restart)
        restart_pods
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    init-db)
        init_database
        ;;
    *)
        echo "Uso: $0 {build|push|deploy|apply|delete|restart|logs|status|init-db}"
        echo ""
        echo "Comandos:"
        echo "  build    - Construir imágenes Docker"
        echo "  push     - Subir imágenes al registry"
        echo "  deploy   - Despliegue completo (build + push + apply)"
        echo "  apply    - Aplicar manifiestos a Kubernetes"
        echo "  delete   - Eliminar todos los recursos"
        echo "  restart  - Reiniciar pods"
        echo "  logs     - Ver logs de componentes"
        echo "  status   - Ver estado del sistema"
        echo "  init-db  - Inicializar esquema de base de datos"
        exit 1
        ;;
esac
