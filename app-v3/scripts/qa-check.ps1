# scripts/qa-check.ps1
#
# Phase 13 - Automated QA sweep.
# Uses curl.exe because PowerShell 5.1 cannot follow 308 redirects.
# Non-destructive. Read-only.

param(
    [string]$BaseUrl = "https://peopleandyouth.org"
)

$ErrorActionPreference = "Continue"

$script:pass = 0
$script:fail = 0
$script:errors = @()

function Get-HttpStatus {
    param([string]$Url)

    try {
        $out = & curl.exe -s -L -o NUL -w "%{http_code}" --max-redirs 10 --max-time 25 --connect-timeout 10 $Url 2>$null
    } catch {
        return -1
    }

    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 47) {
        return -1
    }

    if ($out -match '^\d{3}$') {
        return [int]$out
    }

    return -1
}

function Test-Route {
    param(
        [string]$Path,
        [int[]]$ExpectedCodes,
        [string]$Note = ""
    )

    $url = "$BaseUrl$Path"
    $code = Get-HttpStatus -Url $url

    $ok = $ExpectedCodes -contains $code
    $status = "PASS"
    $color = "Green"
    if (-not $ok) {
        $status = "FAIL"
        $color = "Red"
    }

    $line = "[" + $status + "] " + $Path.PadRight(58) + " expected " + ($ExpectedCodes -join "/") + ", got " + $code + "  " + $Note
    Write-Host $line -ForegroundColor $color

    if ($ok) {
        $script:pass++
    } else {
        $script:fail++
        $script:errors += "$Path => expected $($ExpectedCodes -join '/'), got $code"
    }
}

Write-Host ""
Write-Host "=== Connectivity diagnostic ===" -ForegroundColor Cyan
$rootCode = Get-HttpStatus -Url $BaseUrl
if ($rootCode -eq 200) {
    Write-Host "  [OK]  $BaseUrl reachable (200 after redirects)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] $BaseUrl returned $rootCode" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  PEOPLE & YOUTH - PHASE 13 AUTOMATED QA SWEEP" -ForegroundColor Cyan
Write-Host "  Target: $BaseUrl" -ForegroundColor Cyan
Write-Host "  Date:   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "13A - Public Investor Routes" -ForegroundColor Yellow
Test-Route -Path "/investors"           -ExpectedCodes @(200)
Test-Route -Path "/investor-portal"     -ExpectedCodes @(200)
Test-Route -Path "/"                    -ExpectedCodes @(200)
Test-Route -Path "/about"               -ExpectedCodes @(200)
Test-Route -Path "/privacy"             -ExpectedCodes @(200)
Test-Route -Path "/terms"               -ExpectedCodes @(200)

Write-Host ""
Write-Host "13C - Admin Routes (unauthenticated requests)" -ForegroundColor Yellow
Test-Route -Path "/admin/command-centre"                  -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-crm"                    -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-pipeline"               -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-operations"             -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-intelligence"           -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-relationship"           -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-executive"              -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-analytics"              -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-reports"                -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-audit"                  -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-documents"              -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-events"                 -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-governance"             -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-automation"             -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-automation/scans"       -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-communications"         -ExpectedCodes @(200, 307, 308)
Test-Route -Path "/admin/investor-communications/actions" -ExpectedCodes @(200, 307, 308)

Write-Host ""
Write-Host "13D - Security QA: API routes without auth" -ForegroundColor Yellow
Test-Route -Path "/api/admin/investor-crm"                    -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-crm/activities"         -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-intelligence"           -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-intelligence/context"   -ExpectedCodes @(400, 401, 403)
Test-Route -Path "/api/admin/investor-intelligence/actions"   -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-audit"                  -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-audit/integrity"        -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-documents"              -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-governance"             -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-automation/scans"       -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-communications"         -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-communications/actions" -ExpectedCodes @(401, 403)
Test-Route -Path "/api/admin/investor-automation/scan"        -ExpectedCodes @(401, 403, 503)

Write-Host ""
Write-Host "13E - Regression: existing public site" -ForegroundColor Yellow
Test-Route -Path "/journals"             -ExpectedCodes @(200)
Test-Route -Path "/knowledge"            -ExpectedCodes @(200)
Test-Route -Path "/passport"             -ExpectedCodes @(200)
Test-Route -Path "/careers"              -ExpectedCodes @(200)
Test-Route -Path "/dissent-dias"         -ExpectedCodes @(200)
Test-Route -Path "/research-institute"   -ExpectedCodes @(200)
Test-Route -Path "/caves"                -ExpectedCodes @(200)
Test-Route -Path "/essays"               -ExpectedCodes @(200)
Test-Route -Path "/signin"               -ExpectedCodes @(200)
Test-Route -Path "/admin/login"          -ExpectedCodes @(200)
Test-Route -Path "/admin/reset-password" -ExpectedCodes @(200)

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "  Passed:  $script:pass" -ForegroundColor Green
$failColor = "Green"
if ($script:fail -gt 0) { $failColor = "Red" }
Write-Host "  Failed:  $script:fail" -ForegroundColor $failColor
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

if ($script:fail -eq 0) {
    Write-Host "  ALL CHECKS PASSED" -ForegroundColor Green
} else {
    Write-Host "  $script:fail CHECK(S) FAILED" -ForegroundColor Red
    if ($script:errors.Count -gt 0) {
        Write-Host ""
        Write-Host "  Failed routes:" -ForegroundColor Yellow
        $script:errors | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkYellow }
    }
}

Write-Host ""