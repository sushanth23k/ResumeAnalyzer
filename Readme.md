# Resume Analyzer

## Delete the extra files

find . -name "._*" -type f -delete

## Create a temp directory on your SSD

mkdir -p "/Volumes/SushanthSSD/Git_Projects/ResumeAnalyzer/Backend/.tmp"

## Set it as the temp directory for this session

export TMPDIR="/Volumes/SushanthSSD/Git_Projects/ResumeAnalyzer/Backend/.tmp"

## Code Push

git add . && git commit -a -m "[Modifications]" && git push
