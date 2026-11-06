# Helpers for the canary demo. Load with:  . .\scripts\canary-demo.ps1
$ErrorActionPreference = "Continue"

$P = "motorcycle-workshop-v3"
$R = "us-central1"
$S = "workshop-v3-api"
$URL = "https://workshop-v3-api-xy265jzv4a-uc.a.run.app"
if (-not $KEY) { $KEY = Read-Host "API key" }

function Show-Traffic {
    gcloud run services describe $S --region $R --project $P --format="value(status.traffic)"
}

# Set-Traffic -Canary 25  -> canary 25 / stable 75.   0 = all stable.   100 = all canary.
function Set-Traffic {
    param([int]$Canary)
    if ($Canary -le 0) { $spec = "stable=100" }
    elseif ($Canary -ge 100) { $spec = "canary=100" }
    else { $spec = "canary=$Canary,stable=$(100 - $Canary)" }
    gcloud run services update-traffic $S --region $R --project $P "--to-tags=$spec"
}

function Invoke-Rollback { Set-Traffic -Canary 0 }

function Send-Load {
    param([int]$Count = 300)
    $h = @{ "x-api-key" = $KEY }
    1..$Count | ForEach-Object {
        try { Invoke-WebRequest -Uri "$URL/api/v2/drivers" -Headers $h -UseBasicParsing | Out-Null } catch { }
    }
}

function Measure-Traffic {
    param([int]$Count = 100)
    1..$Count | ForEach-Object {
        try { (Invoke-WebRequest -Uri "$URL/api/v2/drivers" -Headers @{ "x-api-key" = $KEY } -UseBasicParsing).Headers["X-App-Track"] }
        catch { "error" }
    } | Group-Object | Select-Object Name, Count
}

# Re-deploys the current canary image as a new revision with the given fault settings (0 = healthy)
function Deploy-Canary {
    param([double]$ErrorRate = 0, [int]$LatencyMs = 0)
    $rate = $ErrorRate.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    gcloud run services update $S --region $R --project $P `
        --update-env-vars "FAULT_ERROR_RATE=$rate,FAULT_LATENCY_MS=$LatencyMs" `
        --no-traffic --tag canary
}

# One stage: set traffic, warm up, send load, run the gate. On ABORT it rolls back by itself.
function Invoke-CanaryStage {
    param([int]$Canary, [int]$Requests = 300)

    Set-Traffic -Canary $Canary
    Write-Host "Warming up..." -ForegroundColor Cyan
    Send-Load -Count 30
    $since = Get-Date
    Write-Host "Sending $Requests requests..." -ForegroundColor Cyan
    Send-Load -Count $Requests
    Start-Sleep -Seconds 15

    & "$PSScriptRoot\canary-gate.ps1" -Since $since
    $code = $LASTEXITCODE

    if ($code -eq 0) { Write-Host "-> PROMOTE: move to the next stage" -ForegroundColor Green }
    elseif ($code -eq 10) { Write-Host "-> PAUSE: run this stage again with more requests" -ForegroundColor Yellow }
    elseif ($code -eq 20) {
        Write-Host "-> ABORT: rolling back to 100% stable" -ForegroundColor Red
        Set-Traffic -Canary 0
    }
}

# Sends requests to the MAIN url and shows which version answered each one,
# next to the split the service is configured with.
function Show-Distribution {
    param([int]$Count = 100)

    # 1. What the service is configured to do right now
    $svc = gcloud run services describe $S --region $R --project $P --format=json | ConvertFrom-Json
    $stableRev = ($svc.status.traffic | Where-Object { $_.tag -eq "stable" } | Select-Object -First 1).revisionName
    $canaryRev = ($svc.status.traffic | Where-Object { $_.tag -eq "canary" } | Select-Object -First 1).revisionName
    $pct = @{}
    foreach ($t in $svc.status.traffic) {
        if ($t.percent) { $pct[$t.revisionName] = [int]$pct[$t.revisionName] + [int]$t.percent }
    }
    $configured = @{ stable = [int]$pct[$stableRev]; canary = [int]$pct[$canaryRev] }

    Write-Host ("Configured split -> stable {0} % / canary {1} %" -f $configured.stable, $configured.canary) -ForegroundColor Cyan
    Write-Host "Each letter is one request: S = stable, C = canary, E = error" -ForegroundColor Cyan

    # 2. Send the requests and note who answered each one
    $h = @{ "x-api-key" = $KEY }
    $n = 0
    $results = 1..$Count | ForEach-Object {
        $track = "error"; $version = "-"
        try {
            $resp = Invoke-WebRequest -Uri "$URL/api/v2/drivers" -Headers $h -UseBasicParsing
            $track = "$($resp.Headers['X-App-Track'])"
            $version = "$($resp.Headers['X-App-Version'])"
        } catch { }

        if ($track -eq "stable") { Write-Host "S" -NoNewline -ForegroundColor Green }
        elseif ($track -eq "canary") { Write-Host "C" -NoNewline -ForegroundColor Yellow }
        else { Write-Host "E" -NoNewline -ForegroundColor Red }
        $n++
        if ($n % 50 -eq 0) { Write-Host "" }

        [pscustomobject]@{ Track = $track; Version = $version }
    }
    Write-Host ""

    # 3. Compare what happened with what was configured
    $results | Group-Object Track | ForEach-Object {
        [pscustomobject]@{
            Track      = $_.Name
            Version    = ($_.Group | Select-Object -First 1).Version
            Requests   = $_.Count
            Observed   = "{0:N0} %" -f (100 * $_.Count / $Count)
            Configured = "$([int]$configured[$_.Name]) %"
            Bar        = "#" * [math]::Round(40 * $_.Count / $Count)
        }
    } | Format-Table -AutoSize
}