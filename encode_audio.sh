#!/bin/bash
JSON="audio.json"
find "audio" -name "*.wav" -o -name '*.WAV' -print0 | while read -d '' -r file;
do
    echo "$file"
    filenameNoExt="${file%.*}"
    outFile="$filenameNoExt".ogg
    outImageTmp="$filenameNoExt-tmp".png
    outImage="$filenameNoExt".png
    echo "$filenameNoExt"
    echo "$outFile"
    ffmpeg -i "$file" -y "$outFile" < /dev/null
    python analysis.py "$outFile" "$outImageTmp"
    convert "$outImageTmp" -shave 5x5 "$outImage"
    #rm "$outImageTmp"
done
OGGFILES=$(find "audio" -name "*.ogg" -print)
jq -n --arg v "$OGGFILES" '{"files": $v}'  > $JSON
