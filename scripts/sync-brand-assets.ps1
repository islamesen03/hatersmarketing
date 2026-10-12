# Copies the web-relevant parts of the HATERS MARKETING brand kit into public/.
# Original filenames are preserved. Run from the website/ folder:
#   powershell -ExecutionPolicy Bypass -File scripts/sync-brand-assets.ps1 [-Kit <path-to-brandkit>]
param([string]$Kit = (Resolve-Path "$PSScriptRoot\..\..").Path)

$pub = (Resolve-Path "$PSScriptRoot\..\public").Path
$folders = [ordered]@{
  '01-logo\svg'                     = 'brand\01-logo\svg'
  '02-wordmark\svg'                 = 'brand\02-wordmark\svg'
  '03-icon\square\svg'              = 'brand\03-icon\square\svg'
  '03-icon\rounded\svg'             = 'brand\03-icon\rounded\svg'
  '03-icon\circle\svg'              = 'brand\03-icon\circle\svg'
  '03-icon\stacked-transparent\svg' = 'brand\03-icon\stacked-transparent\svg'
  '04-favicon'                      = 'brand\04-favicon'
  '06-social-media'                 = 'brand\06-social-media'
  '07-colors'                       = 'brand\07-colors'
}

foreach ($src in $folders.Keys) {
  $from = Join-Path $Kit $src
  $to = Join-Path $pub $folders[$src]
  New-Item -ItemType Directory -Force $to | Out-Null
  Get-ChildItem -LiteralPath $from -File | Copy-Item -Destination $to -Force
}

# The favicon set lives at the site root, as 04-favicon/paste-into-website-head.html expects.
Get-ChildItem -LiteralPath (Join-Path $Kit '04-favicon') -File |
  Where-Object { $_.Name -ne 'paste-into-website-head.html' } |
  Copy-Item -Destination $pub -Force

Write-Output "Brand assets synced from $Kit"
