@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE__=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0'; $env:__MVNW_CMD__=''; $env:__MVNW_ERROR__=''; &([scriptblock]::Create((Get-Content -Raw '%~f0'))) -Wrapped @args; return @{cmd=$env:__MVNW_CMD__; err=$env:__MVNW_ERROR__}}.GetEnumerator() | ForEach-Object { \"$($_.key)=$($_.value)\" }" %*`) DO @(
  IF "%%A"=="cmd" (SET __MVNW_CMD__=%%B) ELSE IF "%%A"=="err" (SET __MVNW_ERROR__=%%B)
)
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE__%
@IF NOT "%__MVNW_ERROR__%"=="" @(
  ECHO %__MVNW_ERROR__%
  EXIT /B 1
)
@IF "%__MVNW_CMD__%"=="" @(
  ECHO No maven wrapper script found in %~dp0
  EXIT /B 1
)
@CALL %__MVNW_CMD__% %*
@GOTO :EOF

<# :mvnw
#>

$ErrorActionPreference = "Stop"
if ($env:JAVA_HOME) {
  $java = "$env:JAVA_HOME\bin\java.exe"
} else {
  $java = "java.exe"
}

$distributionUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"
$wrapperJarPath = ".mvn\wrapper\maven-wrapper.jar"
$wrapperUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

$scriptDir = $PSScriptRoot
$mavenHome = "$env:USERPROFILE\.m2\wrapper\dists\apache-maven-3.9.6"
$mavenBin = "$mavenHome\apache-maven-3.9.6\bin\mvn.cmd"

if (-Not (Test-Path $mavenBin)) {
  Write-Host "Downloading Maven 3.9.6..."
  $zipPath = "$env:TEMP\apache-maven-3.9.6-bin.zip"
  
  if (-Not (Test-Path "$env:USERPROFILE\.m2\wrapper\dists")) {
    New-Item -ItemType Directory -Path "$env:USERPROFILE\.m2\wrapper\dists" -Force | Out-Null
  }
  
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $distributionUrl -OutFile $zipPath
  
  Write-Host "Extracting Maven..."
  Expand-Archive -Path $zipPath -DestinationPath $mavenHome -Force
  Remove-Item $zipPath
  Write-Host "Maven installed successfully."
}

$env:__MVNW_CMD__ = $mavenBin
