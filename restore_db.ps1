# MKF 데이터베이스 복원 스크립트
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MKF 데이터베이스 복원 스크립트" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pgBin = "d:\PostgreSQL\17\bin"
$backupFile = "d:\backup\mkf_backup-251123.dump"
$dbName = "mkf"
$dbUser = "mkf"
$dbPassword = "mkfpartners"

# PostgreSQL bin 디렉토리로 이동
Set-Location $pgBin

Write-Host "[1/4] PostgreSQL 서버 연결 확인 중..." -ForegroundColor Yellow
Write-Host "postgres 사용자 비밀번호를 입력하세요 (없으면 Enter): " -NoNewline
$postgresPassword = Read-Host

if ($postgresPassword) {
    $env:PGPASSWORD = $postgresPassword
} else {
    # 비밀번호 없이 시도
    $env:PGPASSWORD = ""
}

$testConnection = & .\psql.exe -U postgres -h localhost -p 5432 -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "오류: PostgreSQL 서버에 연결할 수 없습니다." -ForegroundColor Red
    Write-Host "PostgreSQL 서버가 실행 중인지 확인하세요." -ForegroundColor Red
    Write-Host "또는 postgres 사용자 비밀번호를 확인하세요." -ForegroundColor Red
    pause
    exit 1
}
Write-Host "PostgreSQL 서버 연결 성공!" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] mkf 사용자 생성/확인 중..." -ForegroundColor Yellow
$userExists = & .\psql.exe -U postgres -h localhost -p 5432 -t -c "SELECT 1 FROM pg_roles WHERE rolname='mkf';" 2>&1
if ($userExists -match "1") {
    Write-Host "mkf 사용자가 이미 존재합니다." -ForegroundColor Green
    Write-Host "mkf 사용자 비밀번호 업데이트 중..." -ForegroundColor Yellow
    & .\psql.exe -U postgres -h localhost -p 5432 -c "ALTER USER mkf WITH PASSWORD 'mkfpartners';" 2>&1 | Out-Null
} else {
    Write-Host "mkf 사용자가 존재하지 않습니다. 생성 중..." -ForegroundColor Yellow
    & .\psql.exe -U postgres -h localhost -p 5432 -c "CREATE USER mkf WITH PASSWORD 'mkfpartners';" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "mkf 사용자 생성 완료!" -ForegroundColor Green
    } else {
        Write-Host "경고: mkf 사용자 생성 실패 (이미 존재할 수 있음)" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "[3/4] 데이터베이스 'mkf' 존재 여부 확인 중..." -ForegroundColor Yellow
$dbExists = & .\psql.exe -U postgres -h localhost -p 5432 -lqt 2>&1 | Select-String "mkf"
if (-not $dbExists) {
    Write-Host "데이터베이스 'mkf'가 존재하지 않습니다. 생성 중..." -ForegroundColor Yellow
    & .\psql.exe -U postgres -h localhost -p 5432 -c "CREATE DATABASE mkf OWNER mkf;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "오류: 데이터베이스 생성 실패" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "데이터베이스 'mkf' 생성 완료!" -ForegroundColor Green
} else {
    Write-Host "데이터베이스 'mkf'가 이미 존재합니다." -ForegroundColor Yellow
    $confirm = Read-Host "기존 데이터베이스를 덮어쓰시겠습니까? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "복원이 취소되었습니다." -ForegroundColor Yellow
        pause
        exit 0
    }
    Write-Host "기존 데이터베이스 연결 종료 중..." -ForegroundColor Yellow
    & .\psql.exe -U postgres -h localhost -p 5432 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mkf' AND pid <> pg_backend_pid();" 2>&1 | Out-Null
    Write-Host "기존 데이터베이스 삭제 중..." -ForegroundColor Yellow
    & .\psql.exe -U postgres -h localhost -p 5432 -c "DROP DATABASE IF EXISTS mkf;" 2>&1 | Out-Null
    Write-Host "새 데이터베이스 생성 중..." -ForegroundColor Yellow
    & .\psql.exe -U postgres -h localhost -p 5432 -c "CREATE DATABASE mkf OWNER mkf;" 2>&1 | Out-Null
}
Write-Host ""

Write-Host "[4/4] 백업 파일로 데이터베이스 복원 중..." -ForegroundColor Yellow
Write-Host "백업 파일: $backupFile" -ForegroundColor Cyan
$env:PGPASSWORD = $dbPassword
& .\pg_restore.exe -U $dbUser -h localhost -p 5432 -d $dbName -v $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "오류: 데이터베이스 복원 실패" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "데이터베이스 복원 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
pause

