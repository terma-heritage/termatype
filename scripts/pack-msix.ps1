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

# Copy the Store tile/logo images referenced by Package.appxmanifest
# (Assets\StoreLogo.png, MedTile.png, AppList.png, WideTile.png).
Copy-Item "src-tauri\Assets" "$distDir\Assets" -Recurse

# Copy WebView2Loader if present
if (Test-Path "$releaseDir\WebView2Loader.dll") {
    Copy-Item "$releaseDir\WebView2Loader.dll" "$distDir\"
}

# Copy the package manifest into the staging folder and stamp it with the
# current version (from package.json) so the MSIX version never goes stale.
# MSIX Identity needs 4 parts (a.b.c.0).
$version = (node -p "require('./package.json').version").Trim()
$msixVersion = "$version.0"
$manifest = Get-Content "src-tauri\Package.appxmanifest" -Raw
# Case-sensitive (-creplace) so we only touch the Identity's capital-V Version
# and never the XML declaration's lowercase version="1.0".
$manifest = $manifest -creplace '(?<![A-Za-z])Version="[\d.]+"', "Version=`"$msixVersion`""
$manifestOut = Join-Path (Get-Location) "$distDir\Package.appxmanifest"
[System.IO.File]::WriteAllText($manifestOut, $manifest, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "MSIX manifest version: $msixVersion" -ForegroundColor Cyan

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

if ($LASTEXITCODE -ne 0) {
    Write-Error "winapp pack failed (exit $LASTEXITCODE)."
    exit 1
}

Write-Host "Done! MSIX package created." -ForegroundColor Green
