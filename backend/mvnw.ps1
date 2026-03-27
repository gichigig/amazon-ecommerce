# Maven Wrapper Script for Windows PowerShell
$ErrorActionPreference = "Stop"

# Change to the script's directory (backend folder)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$mavenVersion = "3.9.6"
$distributionUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$mavenVersion/apache-maven-$mavenVersion-bin.zip"
$mavenHome = "$env:USERPROFILE\.m2\wrapper\dists\apache-maven-$mavenVersion"
$mavenBin = "$mavenHome\apache-maven-$mavenVersion\bin\mvn.cmd"

if (-Not (Test-Path $mavenBin)) {
    Write-Host "Maven not found. Downloading Maven $mavenVersion..." -ForegroundColor Yellow
    $zipPath = "$env:TEMP\apache-maven-$mavenVersion-bin.zip"
    
    if (-Not (Test-Path "$env:USERPROFILE\.m2\wrapper\dists")) {
        New-Item -ItemType Directory -Path "$env:USERPROFILE\.m2\wrapper\dists" -Force | Out-Null
    }
    
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Host "Downloading from $distributionUrl..."
    Invoke-WebRequest -Uri $distributionUrl -OutFile $zipPath
    
    Write-Host "Extracting Maven to $mavenHome..."
    Expand-Archive -Path $zipPath -DestinationPath $mavenHome -Force
    Remove-Item $zipPath
    Write-Host "Maven $mavenVersion installed successfully!" -ForegroundColor Green
}

# Set JAVA_HOME if not set
if (-Not $env:JAVA_HOME) {
    # Try to find Java
    $javaPath = Get-Command java -ErrorAction SilentlyContinue
    if ($javaPath) {
        $javaHome = (Get-Item $javaPath.Source).Directory.Parent.FullName
        $env:JAVA_HOME = $javaHome
        Write-Host "Using JAVA_HOME: $javaHome"
    }
}

# Run Maven with passed arguments
& $mavenBin $args
