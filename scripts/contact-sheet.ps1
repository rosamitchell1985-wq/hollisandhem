# contact-sheet.ps1
# ------------------------------------------------------------------
# Development helper (NOT part of the shipped site).
# Builds labelled contact sheets so the downloaded photography can be
# reviewed at a glance before it is wired into the catalog.
#
#   powershell -File scripts/contact-sheet.ps1
#
Add-Type -AssemblyName System.Drawing

function New-ContactSheet {
    param(
        [string[]]$Files,
        [string]$OutFile,
        [int]$Cols = 5,
        [int]$Cell = 260
    )
    $rows = [Math]::Ceiling($Files.Count / $Cols)
    $label = 34
    $bmp = New-Object System.Drawing.Bitmap(($Cols * $Cell), ($rows * ($Cell + $label)))
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $brush = [System.Drawing.Brushes]::Black

    for ($i = 0; $i -lt $Files.Count; $i++) {
        $col = $i % $Cols
        $row = [Math]::Floor($i / $Cols)
        $x = $col * $Cell
        $y = $row * ($Cell + $label)
        try {
            $img = [System.Drawing.Image]::FromFile((Resolve-Path $Files[$i]))
            $scale = [Math]::Min($Cell / $img.Width, $Cell / $img.Height)
            $w = [int]($img.Width * $scale)
            $h = [int]($img.Height * $scale)
            $g.DrawImage($img, ($x + ($Cell - $w) / 2), ($y + ($Cell - $h) / 2), $w, $h)
            $img.Dispose()
        } catch {
            $g.DrawString("missing", $font, $brush, ($x + 10), ($y + 10))
        }
        $name = [System.IO.Path]::GetFileNameWithoutExtension($Files[$i])
        $g.DrawString("$i  $name", $font, $brush, ($x + 4), ($y + $Cell + 6))
    }
    $g.Dispose()
    $bmp.Save((Join-Path (Get-Location) $OutFile), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "wrote $OutFile ($($Files.Count) images)"
}

$primaries = Get-ChildItem assets/images/products -Filter *-1.jpg | Sort-Object Name | ForEach-Object { $_.FullName }
New-ContactSheet -Files ($primaries[0..14])  -OutFile "scripts/_sheet-products-a.png"
New-ContactSheet -Files ($primaries[15..($primaries.Count - 1)]) -OutFile "scripts/_sheet-products-b.png"

$others = @()
$others += Get-ChildItem assets/images/hero       -Filter *.jpg | Sort-Object Name | ForEach-Object { $_.FullName }
$others += Get-ChildItem assets/images/categories -Filter *.jpg | Sort-Object Name | ForEach-Object { $_.FullName }
$others += Get-ChildItem assets/images/lifestyle  -Filter *.jpg | Sort-Object Name | ForEach-Object { $_.FullName }
$others += Get-ChildItem assets/images/about      -Filter *.jpg | Sort-Object Name | ForEach-Object { $_.FullName }
New-ContactSheet -Files $others -OutFile "scripts/_sheet-other.png"
