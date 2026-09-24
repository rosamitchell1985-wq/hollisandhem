Add-Type -AssemblyName System.Drawing
# Renders the PNG app icon that matches assets/images/favicon.svg
$size = 180
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "AntiAlias"
$plum = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#7A2E4A"))
$cream = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#FBF8F4")), 14
$cream.StartCap = "Round"; $cream.EndCap = "Round"
$gold = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#C9A96E"))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 40
$path.AddArc(0,0,$r,$r,180,90); $path.AddArc($size-$r,0,$r,$r,270,90)
$path.AddArc($size-$r,$size-$r,$r,$r,0,90); $path.AddArc(0,$size-$r,$r,$r,90,90)
$path.CloseFigure()
$g.FillPath($plum, $path)
$g.DrawLine($cream, 51, 48, 51, 132)
$g.DrawLine($cream, 129, 48, 129, 132)
$g.DrawLine($cream, 51, 90, 129, 90)
$g.FillEllipse($gold, 80, 80, 20, 20)
$g.Dispose()
$bmp.Save((Join-Path (Get-Location) "assets/images/favicon-180.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "wrote assets/images/favicon-180.png"
