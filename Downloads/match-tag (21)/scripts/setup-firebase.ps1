# Script de PowerShell para configurar Firebase Service Account
# Ejecutar con: .\scripts\setup-firebase.ps1

Write-Host "🚀 Configurando Firebase Service Account..." -ForegroundColor Green
Write-Host ""

# Verificar si existe el archivo service-account-key.json
$serviceAccountPath = "service-account-key.json"

if (Test-Path $serviceAccountPath) {
    Write-Host "✅ Archivo service-account-key.json encontrado" -ForegroundColor Green
    
    try {
        $serviceAccount = Get-Content $serviceAccountPath | ConvertFrom-Json
        Write-Host "📋 Project ID: $($serviceAccount.project_id)" -ForegroundColor Cyan
        Write-Host "📧 Client Email: $($serviceAccount.client_email)" -ForegroundColor Cyan
        
        # Leer el contenido del archivo como string
        $jsonContent = Get-Content $serviceAccountPath -Raw
        
        Write-Host ""
        Write-Host "🔧 Configurando variable de entorno en Vercel..." -ForegroundColor Yellow
        
        # Intentar configurar en Vercel
        try {
            $jsonContent | vercel env add FIREBASE_SERVICE_ACCOUNT production
            Write-Host "✅ Variable de entorno configurada en Production" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Error configurando en Production, intentando con Preview..." -ForegroundColor Yellow
            try {
                $jsonContent | vercel env add FIREBASE_SERVICE_ACCOUNT preview
                Write-Host "✅ Variable de entorno configurada en Preview" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Error configurando en Preview, intentando con Development..." -ForegroundColor Yellow
                try {
                    $jsonContent | vercel env add FIREBASE_SERVICE_ACCOUNT development
                    Write-Host "✅ Variable de entorno configurada en Development" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Error configurando variable de entorno automáticamente" -ForegroundColor Red
                    Write-Host ""
                    Write-Host "📝 Configuración manual requerida:" -ForegroundColor Yellow
                    Write-Host "1. Ve a https://vercel.com/dashboard" -ForegroundColor White
                    Write-Host "2. Selecciona tu proyecto" -ForegroundColor White
                    Write-Host "3. Ve a Settings → Environment Variables" -ForegroundColor White
                    Write-Host "4. Agrega FIREBASE_SERVICE_ACCOUNT con el siguiente valor:" -ForegroundColor White
                    Write-Host $jsonContent -ForegroundColor Gray
                }
            }
        }
        
        Write-Host ""
        Write-Host "🎉 Configuración completada!" -ForegroundColor Green
        Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
        Write-Host "1. Redeploy tu aplicación en Vercel" -ForegroundColor White
        Write-Host "2. Prueba el botón 'Probar API' en el panel de inventario" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Error leyendo archivo service-account-key.json: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Archivo service-account-key.json no encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Para crear el archivo:" -ForegroundColor Yellow
    Write-Host "1. Ve a https://console.firebase.google.com/project/match-tag-v0/settings/serviceaccounts/adminsdk" -ForegroundColor White
    Write-Host "2. Haz clic en 'Generate new private key'" -ForegroundColor White
    Write-Host "3. Descarga el archivo JSON" -ForegroundColor White
    Write-Host "4. Renómbralo a 'service-account-key.json'" -ForegroundColor White
    Write-Host "5. Colócalo en la raíz del proyecto" -ForegroundColor White
    Write-Host "6. Ejecuta este script nuevamente" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 También puedes usar el archivo de ejemplo:" -ForegroundColor Cyan
    Write-Host "   Copia 'service-account-key.example.json' a 'service-account-key.json'" -ForegroundColor White
    Write-Host "   y reemplaza los valores con los reales de Firebase Console" -ForegroundColor White
}