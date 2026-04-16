Add-Type -AssemblyName System.Drawing

$src = "assets\logo-white.png"
$outWhite = "assets\logo-white.png"
$outBlack = "assets\logo-black.png"

$img = [System.Drawing.Image]::FromFile((Resolve-Path $src).Path)
$w = $img.Width
$h = $img.Height

$bmpSrc = New-Object System.Drawing.Bitmap $img
$img.Dispose()

$bmpWhite = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bmpBlack = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for speed
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$dataSrc = $bmpSrc.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dataWhite = $bmpWhite.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dataBlack = $bmpBlack.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$stride = $dataSrc.Stride
$bytes = $stride * $h
$src = New-Object byte[] $bytes
$whiteArr = New-Object byte[] $bytes
$blackArr = New-Object byte[] $bytes

[System.Runtime.InteropServices.Marshal]::Copy($dataSrc.Scan0, $src, 0, $bytes)

# Format32bppArgb is B, G, R, A in memory (little-endian ARGB)
for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = $src[$i]
    $g = $src[$i + 1]
    $r = $src[$i + 2]
    # Brightness = luminance approximation
    $lum = [int](($r * 0.299) + ($g * 0.587) + ($b * 0.114))
    if ($lum -gt 255) { $lum = 255 }
    $alpha = [byte]$lum

    # White logo: white pixel with alpha = luminance
    $whiteArr[$i]     = 255
    $whiteArr[$i + 1] = 255
    $whiteArr[$i + 2] = 255
    $whiteArr[$i + 3] = $alpha

    # Black logo: black pixel with same alpha mask
    $blackArr[$i]     = 0
    $blackArr[$i + 1] = 0
    $blackArr[$i + 2] = 0
    $blackArr[$i + 3] = $alpha
}

[System.Runtime.InteropServices.Marshal]::Copy($whiteArr, 0, $dataWhite.Scan0, $bytes)
[System.Runtime.InteropServices.Marshal]::Copy($blackArr, 0, $dataBlack.Scan0, $bytes)

$bmpSrc.UnlockBits($dataSrc)
$bmpWhite.UnlockBits($dataWhite)
$bmpBlack.UnlockBits($dataBlack)

$bmpWhite.Save((Join-Path (Get-Location) $outWhite), [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBlack.Save((Join-Path (Get-Location) $outBlack), [System.Drawing.Imaging.ImageFormat]::Png)

$bmpSrc.Dispose()
$bmpWhite.Dispose()
$bmpBlack.Dispose()

Write-Host "Wrote $outWhite and $outBlack ($w x $h)"
