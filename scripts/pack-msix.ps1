$ErrorActionPreference = "Stop"

Write-Host "Building Tauri app (no bundle, MSIX packaged separately)..." -ForegroundColor Cyan
npm run tauri -- build --no-bundle

$releaseDir = "src-tauri\target\release"
$distDir = "msix-dist"

Write-Host "Staging files for MSIX packaging..." -ForegroundColor Cyan
if (Test-Path $distDir) { Remove-Item $distDir -Recurse -Force }
New-Item -ItemType Directory -Path $distDir | Out-Null
New-Item -ItemType Directory -Path "$distDir\resources" | Out-Null

Copy-Item "$releaseDir\termatype.exe" "$distDir\"
Copy-Item "src-tauri\resources\terma-dictionary.db" "$distDir\resources\"

# Copy WebView2Loader if present
if (Test-Path "$releaseDir\WebView2Loader.dll") {
    Copy-Item "$releaseDir\WebView2Loader.dll" "$distDir\"
}

Write-Host "Creating MSIX package..." -ForegroundColor Cyan
if (Test-Path ".\devcert.pfx") {
    winapp pack $distDir --cert .\devcert.pfx
} else {
    Write-Host "No devcert.pfx found. For local testing, generate one with:" -ForegroundColor Yellow
    Write-Host "  winapp cert generate --if-exists skip" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For Microsoft Store submission, no signing needed - just run:" -ForegroundColor Yellow
    Write-Host "  winapp pack $distDir" -ForegroundColor Yellow
    winapp pack $distDir
}

Write-Host "Done! MSIX package created." -ForegroundColor Green
