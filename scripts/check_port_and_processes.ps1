# Helper to capture node processes and netstat output to files to avoid PSReadLine render issues
$outDir = Join-Path $PSScriptRoot '..\nodus-audit-dashboard'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$taskFile = Join-Path $outDir 'tasklist.txt'
$netFile = Join-Path $outDir 'netstat_3000.txt'

cmd.exe /c "tasklist /FI \"IMAGENAME eq node.exe\"" > $taskFile 2>&1
cmd.exe /c "netstat -ano | findstr ":3000"" > $netFile 2>&1

Write-Output "Wrote $taskFile and $netFile"