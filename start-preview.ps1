param([switch]$WaitForServer)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$previewUrl = 'http://127.0.0.1:8787/'

function Test-Preview {
    try {
        $response = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -eq 200 -and $response.Content.Contains('Muse 邀请码分享站'))
    } catch { return $false }
}

if ($WaitForServer) {
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if (Test-Preview) { Start-Process $previewUrl; exit 0 }
        Start-Sleep -Seconds 1
    }
    exit 1
}

try {
    if (Test-Preview) {
        Write-Host '测试网站已在运行，正在打开浏览器。' -ForegroundColor Green
        Start-Process $previewUrl
        exit 0
    }
    if (Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue) {
        throw '8787 端口被其他程序占用，请关闭占用程序后重试。'
    }
    if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        throw '请先安装 Node.js 22 或更新版本，再双击此文件。'
    }
    $env:XDG_CONFIG_HOME = Join-Path $PSScriptRoot '.wrangler/config'
    $env:WRANGLER_LOG_PATH = Join-Path $PSScriptRoot '.wrangler/logs'
    $env:WRANGLER_SEND_METRICS = 'false'
    $env:NODE_USE_SYSTEM_CA = '1'
    if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules/wrangler/bin/wrangler.js'))) {
        Write-Host '首次启动，正在安装依赖，请稍候…'
        & npm.cmd ci --cache (Join-Path $PSScriptRoot '.wrangler/npm-cache')
        if ($LASTEXITCODE -ne 0) { throw '依赖安装失败，请检查网络后重试。' }
    }
    Write-Host '正在准备本地测试数据库…'
    & npm.cmd run db:local
    if ($LASTEXITCODE -ne 0) { throw '本地数据库初始化失败。' }
    Write-Host ''
    Write-Host "测试地址：$previewUrl" -ForegroundColor Green
    Write-Host '启动成功后会自动打开浏览器。关闭本窗口或按 Ctrl+C 可停止测试。'
    Write-Host '这里只使用本地测试数据，不会部署到 GitHub 或 Cloudflare。'
    $helperArguments = '-NoLogo -NoProfile -ExecutionPolicy Bypass -File "' + $PSCommandPath + '" -WaitForServer'
    Start-Process -FilePath 'powershell.exe' -ArgumentList $helperArguments -WindowStyle Hidden
    & npm.cmd run dev -- --port 8787
    if ($LASTEXITCODE -ne 0) { throw '测试服务已停止或未能启动，请查看上面的提示。' }
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
