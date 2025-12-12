@echo off
echo ========================================
echo MKF 데이터베이스 복원 스크립트
echo ========================================
echo.

rem PostgreSQL bin 디렉토리로 이동
d:
cd d:\PostgreSQL\17\bin

rem 비밀번호 설정
set PGPASSWORD=mkfpartners

echo [1/4] PostgreSQL 서버 연결 확인 중...
echo postgres 사용자 비밀번호를 입력하세요 (없으면 Enter):
set /p POSTGRES_PWD=
if not "%POSTGRES_PWD%"=="" set PGPASSWORD=%POSTGRES_PWD%

.\psql -U postgres -h localhost -p 5432 -c "SELECT version();" >nul 2>&1
if errorlevel 1 (
    echo 오류: PostgreSQL 서버에 연결할 수 없습니다.
    echo PostgreSQL 서버가 실행 중인지 확인하세요.
    pause
    exit /b 1
)
echo PostgreSQL 서버 연결 성공!
echo.

echo [2/4] mkf 사용자 생성/확인 중...
.\psql -U postgres -h localhost -p 5432 -c "SELECT 1 FROM pg_roles WHERE rolname='mkf';" | findstr /C:"1" >nul 2>&1
if errorlevel 1 (
    echo mkf 사용자가 존재하지 않습니다. 생성 중...
    .\psql -U postgres -h localhost -p 5432 -c "CREATE USER mkf WITH PASSWORD 'mkfpartners';"
    if errorlevel 1 (
        echo 경고: mkf 사용자 생성 실패 (이미 존재할 수 있음)
    ) else (
        echo mkf 사용자 생성 완료!
    )
) else (
    echo mkf 사용자가 이미 존재합니다.
    echo mkf 사용자 비밀번호 업데이트 중...
    .\psql -U postgres -h localhost -p 5432 -c "ALTER USER mkf WITH PASSWORD 'mkfpartners';" >nul 2>&1
)
echo.

echo [3/4] 데이터베이스 'mkf' 존재 여부 확인 중...
.\psql -U postgres -h localhost -p 5432 -lqt | findstr /C:"mkf" >nul 2>&1
if errorlevel 1 (
    echo 데이터베이스 'mkf'가 존재하지 않습니다. 생성 중...
    .\psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE mkf OWNER mkf;"
    if errorlevel 1 (
        echo 오류: 데이터베이스 생성 실패
        pause
        exit /b 1
    )
    echo 데이터베이스 'mkf' 생성 완료!
) else (
    echo 데이터베이스 'mkf'가 이미 존재합니다.
    echo 기존 데이터베이스를 덮어쓰시겠습니까? (Y/N)
    set /p confirm=
    if /i not "%confirm%"=="Y" (
        echo 복원이 취소되었습니다.
        pause
        exit /b 0
    )
    echo 기존 데이터베이스 연결 종료 중...
    .\psql -U postgres -h localhost -p 5432 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mkf' AND pid <> pg_backend_pid();" >nul 2>&1
    echo 기존 데이터베이스 삭제 중...
    .\psql -U postgres -h localhost -p 5432 -c "DROP DATABASE IF EXISTS mkf;"
    echo 새 데이터베이스 생성 중...
    .\psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE mkf OWNER mkf;"
)
echo.

echo [4/4] 백업 파일로 데이터베이스 복원 중...
echo 백업 파일: d:\backup\mkf_backup-251123.dump
set PGPASSWORD=mkfpartners
.\pg_restore -U mkf -h localhost -p 5432 -d mkf -v "d:\backup\mkf_backup-251123.dump"

if errorlevel 1 (
    echo.
    echo 오류: 데이터베이스 복원 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo 데이터베이스 복원 완료!
echo ========================================
echo.
pause

