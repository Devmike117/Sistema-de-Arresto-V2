# Script de despliegue para Windows PowerShell
# Uso: .\deploy.ps1 [build|apply|delete|restart|logs|status]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('build','push','deploy','apply','delete','restart','logs','status','init-db')]
    [string]$Action
)

$NAMESPACE = "arresto-system"
$REGISTRY = "your-registry"  # CAMBIAR
$VERSION = if ($env:VERSION) { $env:VERSION } else { "latest" }

function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Log-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Check-Prerequisites {
    Log-Info "Verificando prerequisitos..."
    
    if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Log-Error "kubectl no está instalado"
        exit 1
    }
    
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Log-Error "docker no está instalado"
        exit 1
    }
    
    Log-Info "Prerequisitos OK"
}

function Build-Images {
    Log-Info "Construyendo imágenes Docker..."
    
    Push-Location frontend
    docker build -t "${REGISTRY}/arresto-frontend:${VERSION}" .
    Pop-Location
    
    Push-Location backend
    docker build -t "${REGISTRY}/arresto-backend:${VERSION}" .
    Pop-Location
    
    Log-Info "Imágenes construidas"
}

function Push-Images {
    Log-Info "Subiendo imágenes..."
    docker push "${REGISTRY}/arresto-frontend:${VERSION}"
    docker push "${REGISTRY}/arresto-backend:${VERSION}"
    Log-Info "Imágenes subidas"
}

function Apply-Manifests {
    Log-Info "Aplicando manifiestos..."
    kubectl apply -f k8s/00-namespace.yaml
    kubectl apply -f k8s/01-secrets.yaml
    kubectl apply -f k8s/02-configmaps.yaml
    kubectl apply -f k8s/03-pvcs.yaml
    kubectl apply -f k8s/04-postgres.yaml
    kubectl apply -f k8s/05-backend.yaml
    kubectl apply -f k8s/06-frontend.yaml
    kubectl apply -f k8s/07-ingress.yaml
    Log-Info "Manifiestos aplicados"
}

function Delete-All {
    $response = Read-Host "¿Eliminar todos los recursos? (y/n)"
    if ($response -eq 'y') {
        Log-Info "Eliminando..."
        kubectl delete namespace $NAMESPACE
    }
}

function Show-Status {
    Log-Info "Estado del sistema:"
    kubectl get all -n $NAMESPACE
}

function Show-Logs {
    Write-Host "Componente:"
    Write-Host "1) Backend"
    Write-Host "2) Frontend"
    Write-Host "3) PostgreSQL"
    $option = Read-Host "Opción"
    
    switch ($option) {
        1 { kubectl logs -f -l app=backend -n $NAMESPACE --tail=100 }
        2 { kubectl logs -f -l app=frontend -n $NAMESPACE --tail=100 }
        3 { kubectl logs -f -l app=postgres -n $NAMESPACE --tail=100 }
    }
}

# Ejecutar acción
switch ($Action) {
    'build' { 
        Check-Prerequisites
        Build-Images 
    }
    'push' { Push-Images }
    'deploy' {
        Check-Prerequisites
        Build-Images
        Push-Images
        Apply-Manifests
        Show-Status
    }
    'apply' { Apply-Manifests }
    'delete' { Delete-All }
    'restart' { kubectl rollout restart deployment -n $NAMESPACE }
    'logs' { Show-Logs }
    'status' { Show-Status }
}
