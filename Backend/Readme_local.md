# Resume Analyzer Backend

## Create virtual environment

python -m venv venv

## Activate virtual environment

source venv/bin/activate

## Install dependencies

pip install -r requirements.txt

## Start the Server

python manage.py runserver

## Delete the extra files

find . -name "._*" -type f -delete

## Change the temp directory to the local Storage

## Create a temp directory on your SSD

mkdir -p "/Volumes/SushanthSSD/Git_Projects/ResumeAnalyzer/Backend/.tmp"

## Set it as the temp directory for this session

export TMPDIR="/Volumes/SushanthSSD/Git_Projects/ResumeAnalyzer/Backend/.tmp"

## Verify the Default Temp Dir

echo $TMPDIR
