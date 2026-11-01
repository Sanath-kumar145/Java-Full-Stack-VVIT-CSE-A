@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL EnableDelayedExpansion EnableExtensions

@REM Ensure JAVA_HOME is set to Java 17 LTS if not currently defined
IF "%JAVA_HOME%" == "" (
    IF EXIST "C:\Program Files\Java\jdk-17" (
        SET "JAVA_HOME=C:\Program Files\Java\jdk-17"
    )
)

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

@REM Locate already cached Maven 3.9.12 distribution if available
SET "CACHED_MAVEN="
FOR /D %%H IN ("%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.12-bin\*") DO (
    IF EXIST "%%H\apache-maven-3.9.12\bin\mvn.cmd" (
        SET "CACHED_MAVEN=%%H\apache-maven-3.9.12\bin\mvn.cmd"
    )
)

IF NOT "%CACHED_MAVEN%" == "" (
    "%CACHED_MAVEN%" %*
    EXIT /B %ERRORLEVEL%
)

@REM If not pre-cached, fallback to powershell-based Maven invocation
WHERE mvn >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    mvn %*
    EXIT /B %ERRORLEVEL%
)

ECHO Error: Maven wrapper could not locate a Maven installation.
EXIT /B 1
