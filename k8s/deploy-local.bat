@echo off
REM Script de despliegue local para Windows
REM Prerequisito: Docker Desktop con Kubernetes habilitado o Minikube

echo ========================================
echo   Despliegue Local - Sistema de Arresto
echo ========================================
echo.

REM Verificar si kubectl esta disponible
kubectl version --client >nul 2>&1
if errorlevel 1 (
    echo [ERROR] kubectl no esta instalado o no esta en el PATH
    echo Instala Docker Desktop con Kubernetes o Minikube
    pause
    exit /b 1
)

echo [INFO] kubectl detectado correctamente
echo.

REM Verificar si Docker esta corriendo
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no esta corriendo
    echo Inicia Docker Desktop
    pause
    exit /b 1
)

echo [INFO] Docker esta corriendo
echo.

REM Menu de opciones
:menu
echo Selecciona una opcion:
echo.
echo 1. Build - Construir imagenes locales
echo 2. Deploy - Desplegar en Kubernetes local
echo 3. Status - Ver estado del sistema
echo 4. Logs - Ver logs de componentes
echo 5. URL - Obtener URL de acceso
echo 6. Stop - Detener todo
echo 7. Clean - Eliminar todo
echo 8. Restart - Reiniciar pods
echo 9. Salir
echo.
set /p option="Opcion (1-9): "

if "%option%"=="1" goto build
if "%option%"=="2" goto deploy
if "%option%"=="3" goto status
if "%option%"=="4" goto logs
if "%option%"=="5" goto url
if "%option%"=="6" goto stop
if "%option%"=="7" goto clean
if "%option%"=="8" goto restart
if "%option%"=="9" exit /b 0
goto menu

:build
echo.
echo [1/2] Construyendo imagen del Frontend...
cd ..\frontend
docker build -t arresto-frontend:latest .
if errorlevel 1 (
    echo [ERROR] Fallo al construir frontend
    cd ..\k8s
    pause
    goto menu
)

echo.
echo [2/2] Construyendo imagen del Backend...
cd ..\backend
docker build -t arresto-backend:latest .
if errorlevel 1 (
    echo [ERROR] Fallo al construir backend
    cd ..\k8s
    pause
    goto menu
)

cd ..\k8s
echo.
echo [OK] Imagenes construidas exitosamente!
echo - arresto-frontend:latest
echo - arresto-backend:latest
echo.
pause
goto menu

:deploy
echo.
echo [INFO] Desplegando en Kubernetes...
echo.
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-configmaps.yaml
kubectl apply -f 03-pvcs.yaml
echo.
echo Esperando creacion de volumenes...
timeout /t 5 /nobreak >nul
echo.
kubectl apply -f 04-postgres.yaml
echo.
echo Esperando a que PostgreSQL este listo (puede tomar 1-2 minutos)...
kubectl wait --for=condition=ready pod -l app=postgres -n arresto-system --timeout=300s
if errorlevel 1 (
    echo [WARN] PostgreSQL tardo mas de lo esperado, verifica el estado
)
echo.
kubectl apply -f 05-backend.yaml
kubectl apply -f 06-frontend.yaml
echo.
echo [OK] Despliegue completado!
echo.
echo Esperando a que los pods esten listos...
timeout /t 10 /nobreak >nul
kubectl get pods -n arresto-system
echo.
pause
goto menu

:status
echo.
echo ========== Estado del Sistema ==========
kubectl get all -n arresto-system
echo.
echo ========== Volumenes ==========
kubectl get pvc -n arresto-system
echo.
pause
goto menu

:logs
echo.
echo Selecciona componente:
echo 1. Backend
echo 2. Frontend
echo 3. PostgreSQL
echo.
set /p log_option="Opcion (1-3): "

if "%log_option%"=="1" (
    echo.
    echo === Logs del Backend ===
    kubectl logs -l app=backend -n arresto-system --tail=50
)
if "%log_option%"=="2" (
    echo.
    echo === Logs del Frontend ===
    kubectl logs -l app=frontend -n arresto-system --tail=50
)
if "%log_option%"=="3" (
    echo.
    echo === Logs de PostgreSQL ===
    kubectl logs -l app=postgres -n arresto-system --tail=50
)
echo.
pause
goto menu

:url
echo.
echo Obteniendo URLs de acceso...
echo.
echo === Frontend ===
kubectl get svc frontend-service -n arresto-system
echo.
echo === Backend ===
kubectl get svc backend-service -n arresto-system
echo.
echo Para acceder usa:
echo   Frontend: http://localhost:[NODE_PORT]
echo   Backend:  http://localhost:[NODE_PORT]
echo.
echo Para obtener el NodePort exacto, revisa el output arriba (ejemplo: 80:30080/TCP)
echo.
pause
goto menu

:stop
echo.
echo [INFO] Deteniendo todos los deployments...
kubectl scale deployment --all --replicas=0 -n arresto-system
echo [OK] Deployments detenidos
echo.
pause
goto menu

:restart
echo.
echo [INFO] Reiniciando pods...
kubectl rollout restart deployment -n arresto-system
echo [OK] Pods reiniciados
echo.
pause
goto menu

:clean
echo.
echo [WARN] Esto eliminara TODOS los recursos del namespace arresto-system
set /p confirm="Estas seguro? (S/N): "
if /i "%confirm%"=="S" (
    echo.
    echo Eliminando namespace...
    kubectl delete namespace arresto-system
    echo [OK] Recursos eliminados
) else (
    echo Operacion cancelada
)
echo.
pause
goto menu
