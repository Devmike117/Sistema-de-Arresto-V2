# Script para acceder a los servicios via port-forward
# Solución para cuando NodePort no funciona en Docker Desktop Windows

Write-Host "🚀 Iniciando port-forward para acceder a los servicios..." -ForegroundColor Green
Write-Host ""

# Detener jobs anteriores si existen
Get-Job | Where-Object { $_.Command -like "*port-forward*" } | Stop-Job
Get-Job | Where-Object { $_.Command -like "*port-forward*" } | Remove-Job

Write-Host "✅ Frontend estará disponible en: http://localhost:3000" -ForegroundColor Cyan
Write-Host "✅ Backend estará disponible en:  http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Mantén esta ventana abierta mientras uses la aplicación" -ForegroundColor Yellow
Write-Host "   Presiona CTRL+C para detener los port-forwards" -ForegroundColor Yellow
Write-Host ""

# URLs de acceso:
Write-Host "URLs de acceso:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:5001" -ForegroundColor Green
Write-Host "   Health:   http://localhost:5001/health" -ForegroundColor Green


# Iniciar port-forwards en paralelo
Start-Job -Name "frontend-pf" -ScriptBlock { 
    kubectl port-forward -n arresto-system svc/frontend-service 3000:80 
} | Out-Null

Start-Job -Name "backend-pf" -ScriptBlock { 
    kubectl port-forward -n arresto-system svc/backend-service 5001:5000 
} | Out-Null

# Esperar a que se inicien
Start-Sleep -Seconds 3

# Verificar que están corriendo
$jobs = Get-Job | Where-Object { $_.Name -like "*-pf" }
if ($jobs.Count -eq 2) {
    Write-Host "✅ Port-forwards activos:" -ForegroundColor Green
    Get-Job | Where-Object { $_.Name -like "*-pf" } | Format-Table Name, State
    Write-Host ""
    Write-Host "🌐 Abre tu navegador en: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    
    # Mantener el script corriendo y mostrar logs
    Write-Host "📋 Logs (presiona CTRL+C para salir):" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    
    try {
        while ($true) {
            Start-Sleep -Seconds 5
            # Verificar que los jobs sigan corriendo
            $runningJobs = Get-Job | Where-Object { $_.Name -like "*-pf" -and $_.State -eq "Running" }
            if ($runningJobs.Count -lt 2) {
                Write-Host "⚠️  Algún port-forward se detuvo. Reiniciando..." -ForegroundColor Yellow
                & $PSCommandPath
                exit
            }
        }
    }
    finally {
        Write-Host ""
        Write-Host "🛑 Deteniendo port-forwards..." -ForegroundColor Yellow
        Get-Job | Where-Object { $_.Name -like "*-pf" } | Stop-Job
        Get-Job | Where-Object { $_.Name -like "*-pf" } | Remove-Job
        Write-Host "✅ Port-forwards detenidos" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Error al iniciar los port-forwards" -ForegroundColor Red
    Get-Job | Format-Table
}
