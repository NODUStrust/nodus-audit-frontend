$files = @(
  "..\nodus-audit-dashboard\package.json",
  "..\nodus-audit-dashboard\package-lock.json",
  "..\nodus-audit-dashboard\postcss.config.cjs",
  "..\nodus-audit-dashboard\vite.config.js",
  "..\nodus-audit-dashboard\tailwind.config.cjs"
)

foreach ($f in $files) {
  $path = Join-Path $PSScriptRoot $f
  if (-not (Test-Path $path)) { Write-Output "Not found: $path"; continue }
  $bytes = [System.IO.File]::ReadAllBytes($path)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $new = $bytes[3..($bytes.Length-1)]
    [System.IO.File]::WriteAllBytes($path, $new)
    Write-Output "Removed BOM from: $path"
  } else {
    Write-Output "No BOM: $path"
  }
}
