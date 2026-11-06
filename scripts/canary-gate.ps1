<#
.SYNOPSIS
  Canary quality gate. Reads the Cloud Run request logs of the canary and stable
  revisions, applies the thresholds in canary/slo.json and prints a decision.
  Exit codes: 0 = PROMOTE, 10 = PAUSE, 20 = ABORT
#>
param(
    [string]$Project = "motorcycle-workshop-v3",
    [string]$Region = "us-central1",
    [string]$Service = "workshop-v3-api",
    [string]$ConfigPath = (Join-Path $PSScriptRoot "../canary/slo.json"),
    [datetime]$Since
)

$ErrorActionPreference = "Stop"
$slo = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json

if (-not $PSBoundParameters.ContainsKey("Since")) {
    $Since = (Get-Date).AddMinutes(-1 * $slo.window_minutes)
}
$sinceUtc = $Since.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

# 1. Which revisions hold the 'canary' and 'stable' tags right now
$svc = gcloud run services describe $Service --region $Region --project $Project --format=json | ConvertFrom-Json
$canaryTraffic = $svc.status.traffic | Where-Object { $_.tag -eq "canary" } | Select-Object -First 1
$stableTraffic = $svc.status.traffic | Where-Object { $_.tag -eq "stable" } | Select-Object -First 1
if (-not $canaryTraffic -or -not $stableTraffic) {
    throw "The service needs both a 'canary' and a 'stable' tag."
}

# 2. Read the request logs of one revision and compute its numbers
$token = gcloud auth print-access-token

function Get-RevisionStats {
    param([string]$Role, [string]$Revision)

    $filter = 'resource.type="cloud_run_revision"' +
        ' AND logName="projects/' + $Project + '/logs/run.googleapis.com%2Frequests"' +
        ' AND resource.labels.revision_name="' + $Revision + '"' +
        ' AND httpRequest.requestUrl:"' + $slo.path_filter + '"' +
        ' AND timestamp>="' + $sinceUtc + '"'

    $entries = @()
    $pageToken = $null
    do {
        $payload = @{ resourceNames = @("projects/$Project"); filter = $filter; pageSize = 1000 }
        if ($pageToken) { $payload.pageToken = $pageToken }
        $resp = Invoke-RestMethod -Method Post -Uri "https://logging.googleapis.com/v2/entries:list" `
            -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" `
            -Body ($payload | ConvertTo-Json -Depth 5)
        if ($resp.entries) { $entries += $resp.entries }
        $pageToken = $resp.nextPageToken
    } while ($pageToken -and $entries.Count -lt $slo.max_log_entries)

    $total = $entries.Count
    $errors = @($entries | Where-Object { [int]$_.httpRequest.status -ge 500 }).Count
    $latencies = @($entries | Where-Object { $_.httpRequest.latency } |
        ForEach-Object { [double]($_.httpRequest.latency -replace "s$", "") * 1000 } | Sort-Object)

    $p95 = 0
    if ($latencies.Count -gt 0) { $p95 = $latencies[[math]::Ceiling(0.95 * $latencies.Count) - 1] }
    $rate = 0
    if ($total -gt 0) { $rate = $errors / $total }

    [pscustomobject]@{
        Role = $Role; Revision = $Revision; Total = $total
        Errors5xx = $errors; ErrorRate = $rate; P95Ms = [math]::Round($p95, 0)
    }
}

$c = Get-RevisionStats -Role "canary" -Revision $canaryTraffic.revisionName
$s = Get-RevisionStats -Role "stable" -Revision $stableTraffic.revisionName

# 3. Apply the rules from canary/slo.json
$decision = "PROMOTE"
$reasons = New-Object System.Collections.Generic.List[string]

if ($c.Total -lt $slo.min_canary_requests) {
    if ($c.Errors5xx -ge $slo.early_abort_5xx_count) {
        $decision = "ABORT"
        $reasons.Add("Early abort: $($c.Errors5xx) server errors already, with only $($c.Total) requests")
    }
    else {
        $decision = "PAUSE"
        $reasons.Add("Not enough canary requests to decide: $($c.Total) < $($slo.min_canary_requests)")
    }
}
else {
    if ($c.ErrorRate -ge $slo.max_5xx_rate) {
        $decision = "ABORT"
        $reasons.Add(("5xx rate {0:P1} >= limit {1:P1}" -f $c.ErrorRate, $slo.max_5xx_rate))
    }
    if ($c.P95Ms -gt $slo.max_p95_ms) {
        $decision = "ABORT"
        $reasons.Add("p95 $($c.P95Ms) ms > limit $($slo.max_p95_ms) ms")
    }
    if ($s.Total -ge $slo.min_stable_requests -and $c.P95Ms -gt $slo.latency_floor_ms -and
        $c.P95Ms -gt ($s.P95Ms * $slo.max_p95_ratio_vs_stable)) {
        $decision = "ABORT"
        $reasons.Add("p95 $($c.P95Ms) ms is more than $($slo.max_p95_ratio_vs_stable)x the stable p95 ($($s.P95Ms) ms)")
    }
    if ($decision -eq "PROMOTE") { $reasons.Add("All SLOs met with a sufficient sample") }
}

# 4. Show it and keep a record of why
Write-Host ""
Write-Host "Evaluated requests since $sinceUtc"
@($c, $s) | Format-Table Role, Revision, Total, Errors5xx,
    @{ Name = "ErrorRate"; Expression = { "{0:P1}" -f $_.ErrorRate } }, P95Ms -AutoSize

$color = @{ PROMOTE = "Green"; PAUSE = "Yellow"; ABORT = "Red" }[$decision]
Write-Host "DECISION: $decision" -ForegroundColor $color
$reasons | ForEach-Object { Write-Host " - $_" }

$record = [ordered]@{
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    decision  = $decision
    canary    = $c
    stable    = $s
    reasons   = $reasons
}
Add-Content -Path (Join-Path $PSScriptRoot "../canary/decisions.jsonl") -Value ($record | ConvertTo-Json -Compress -Depth 5)

switch ($decision) { "PROMOTE" { exit 0 } "PAUSE" { exit 10 } "ABORT" { exit 20 } }