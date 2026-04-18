Add-Type -AssemblyName System.Drawing

# Renders the logo onto a 512x512 black canvas, sized to fill the
# 384x384 keyline (Google Play attribute keylines).
# Auto-crops transparent border from the source logo so the visible
# artwork fills the keyline, not the PNG bounding box.

$srcPath = $args[0]
$outPath = $args[1]

$canvasSize = 512
$keylineSize = 384
$alphaThreshold = 16

$srcImg = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath).Path)
$srcBmp = New-Object System.Drawing.Bitmap $srcImg
$srcImg.Dispose()

$w = $srcBmp.Width
$h = $srcBmp.Height

$bmpData = $srcBmp.LockBits(
    (New-Object System.Drawing.Rectangle 0, 0, $w, $h),
    [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$stride = $bmpData.Stride
$totalBytes = $stride * $h
$pixels = New-Object byte[] $totalBytes
[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $pixels, 0, $totalBytes)
$srcBmp.UnlockBits($bmpData)

$minX = $w; $minY = $h; $maxX = -1; $maxY = -1
for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    for ($x = 0; $x -lt $w; $x++) {
        $a = $pixels[$row + $x * 4 + 3]
        if ($a -gt $alphaThreshold) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

if ($maxX -lt 0) {
    Write-Host "Source looks empty; falling back to full image." -ForegroundColor Yellow
    $cropX = 0; $cropY = 0; $cropW = $w; $cropH = $h
} else {
    $cropX = $minX
    $cropY = $minY
    $cropW = $maxX - $minX + 1
    $cropH = $maxY - $minY + 1
}

$scale = [Math]::Min($keylineSize / $cropW, $keylineSize / $cropH)
$drawW = [int]($cropW * $scale)
$drawH = [int]($cropH * $scale)
$offsetX = [int](($canvasSize - $drawW) / 2)
$offsetY = [int](($canvasSize - $drawH) / 2)

$bmp = New-Object System.Drawing.Bitmap $canvasSize, $canvasSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g.Clear([System.Drawing.Color]::Black)

$srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
$dstRect = New-Object System.Drawing.Rectangle $offsetX, $offsetY, $drawW, $drawH
$g.DrawImage($srcBmp, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$srcBmp.Dispose()

$bmp.Save((Join-Path (Get-Location) $outPath), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Host "Wrote $outPath ($canvasSize x $canvasSize), cropped logo ${cropW}x${cropH} -> ${drawW}x${drawH} centered at ${offsetX},${offsetY}"
