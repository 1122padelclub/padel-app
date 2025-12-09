# Script simple para configurar Firebase Service Account
Write-Host "🚀 Configurando Firebase Service Account..." -ForegroundColor Green
Write-Host ""

# Verificar si existe el archivo service-account-key.json
if (Test-Path "service-account-key.json") {
    Write-Host "✅ Archivo service-account-key.json encontrado" -ForegroundColor Green
    
    # Leer el contenido del archivo
    $jsonContent = Get-Content "service-account-key.json" -Raw
    
    Write-Host "🔧 Configurando variable de entorno en Vercel..." -ForegroundColor Yellow
    
    # Configurar en Vercel
    try {
        $jsonContent | vercel env add FIREBASE_SERVICE_ACCOUNT production
        Write-Host "✅ Variable de entorno configurada en Production" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Error configurando en Production" -ForegroundColor Yellow
        Write-Host "📝 Configuración manual requerida:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Selecciona tu proyecto" -ForegroundColor White
        Write-Host "3. Ve a Settings → Environment Variables" -ForegroundColor White
        Write-Host "4. Agrega FIREBASE_SERVICE_ACCOUNT con el siguiente valor:" -ForegroundColor White
        Write-Host $jsonContent -ForegroundColor Gray
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
}
