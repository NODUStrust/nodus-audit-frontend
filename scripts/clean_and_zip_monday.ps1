param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [Parameter(Mandatory = $true)]
    [string]$DestRoot
)

function Normalize-Name($name) {
    # replace spaces with hyphens, remove characters Windows dislikes
    $n = $name -replace '\s+','-' -replace '[\\/:*?"<>|]',''
    return $n
}

if (-not (Test-Path $SourcePath)) {
    Write-Error "SourcePath '$SourcePath' does not exist."
    exit 1
}

$dest = Resolve-Path -Path $DestRoot
if (-not $dest) {
    New-Item -ItemType Directory -Path $DestRoot -Force | Out-Null
}

$dest = (Resolve-Path -Path $DestRoot).ProviderPath

Write-Host "Scanning source: $SourcePath"

# Prepare destination subfolders
$cssDir = Join-Path $dest 'css'
$imgDir = Join-Path $dest 'images'
$htmlDir = Join-Path $dest 'html'
$otherDir = Join-Path $dest 'other'
foreach ($d in @($cssDir,$imgDir,$htmlDir,$otherDir)) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null } }

$hashStore = @{}
$changelog = @()

Get-ChildItem -Path $SourcePath -Recurse -File | ForEach-Object {
    $file = $_
    $ext = $file.Extension.ToLower()
    switch ($ext) {
        '.css' { $sub = $cssDir }
        '.jpg' { $sub = $imgDir }
        '.jpeg' { $sub = $imgDir }
        '.png' { $sub = $imgDir }
        '.svg' { $sub = $imgDir }
        '.ico' { $sub = $imgDir }
        '.html' { $sub = $htmlDir }
        default { $sub = $otherDir }
    }

    $normName = Normalize-Name($file.Name)
    $destPath = Join-Path $sub $normName

    # compute sha256
    try {
        $sha = Get-FileHash -Path $file.FullName -Algorithm SHA256
        $h = $sha.Hash
    } catch {
        Write-Warning "Failed to hash $($file.FullName): $_"
        $h = [guid]::NewGuid().ToString()
    }

    if ($hashStore.ContainsKey($h)) {
        # duplicate detected
        $changelog += "DUPLICATE: $($file.FullName) -> kept: $($hashStore[$h])"
    } else {
        $hashStore[$h] = $destPath
        Copy-Item -Path $file.FullName -Destination $destPath -Force
    }
}

$changelogPath = Join-Path $dest 'CHANGELOG_CLEANUP.md'
$changelog | Out-File -FilePath $changelogPath -Encoding utf8

$date = Get-Date -Format yyyyMMdd
$zipName = "monday-tailwind-scaffold-$date.zip"
$zipPath = Join-Path (Resolve-Path .).ProviderPath $zipName

Write-Host "Creating zip: $zipPath"
if (Test-Path $zipPath) { Remove-Item $zipPath }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($dest, $zipPath)

Write-Host "Done. Cleaned scaffold is at: $dest";
Write-Host "Zip created: $zipPath";
