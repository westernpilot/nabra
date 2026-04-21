Add-Type -AssemblyName System.Drawing
$srcPath = 'assets\SPECIFIC LOGO-02-01.jpg'
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))
$target = 512
$bmp = New-Object System.Drawing.Bitmap $target, $target
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$ratio = [Math]::Min($target / $src.Width, $target / $src.Height)
$w = [int]($src.Width * $ratio)
$h = [int]($src.Height * $ratio)
$x = [int](($target - $w) / 2)
$y = [int](($target - $h) / 2)
$g.DrawImage($src, $x, $y, $w, $h)

$bmp.Save('assets\icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save('assets\adaptive-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save('assets\splash-icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save('assets\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$src.Dispose()
Write-Host 'Icons generated from SPECIFIC LOGO-02-01.jpg'
