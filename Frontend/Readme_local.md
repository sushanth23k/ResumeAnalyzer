# Resume Analyzer

## Delete the extra files

find . -name "._*" -type f -delete

## Change the temp directory to the local Storage

## Create a temp directory on your SSD

mkdir -p "/Volumes/SushanthSSD/Git_Projects/ResumeAnalyzer/Backend/.tmp"

## Set it as the temp directory for this session

export TMPDIR="/Volumes/SushanthSSD/Git_Projects/ResumeAnalyzer/Backend/.tmp"

## Verify the Default Temp Dir

echo $TMPDIR

## React Commands

## Install dependencies

npm install

## Run development server

npm run dev

## Build for production

npm run build

## Preview production build

npm run preview
