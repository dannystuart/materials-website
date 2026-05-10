#!/usr/bin/env bash
set -euo pipefail

SRC="assets-source/Materials-Hero.mp4"
OUT="public/videos"
mkdir -p "$OUT"

# Desktop H.264 — keyframe every 6 frames for smooth backward scrub
# CRF 26 (raised from 22) keeps the 4092x4092 60fps source under the 20 MB target
ffmpeg -y -i "$SRC" \
  -vcodec libx264 -crf 26 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  "$OUT/materials-hero.mp4"

# Desktop VP9 fallback
# CRF 40 (raised from 32) keeps the file under 20 MB; VP9 is more aggressive on this source
ffmpeg -y -i "$SRC" \
  -c:v libvpx-vp9 -crf 40 -b:v 0 \
  -g 6 -keyint_min 6 \
  -an \
  "$OUT/materials-hero.webm"

# Mobile 720p H.264
ffmpeg -y -i "$SRC" \
  -vf "scale=-2:720" \
  -vcodec libx264 -crf 24 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  "$OUT/materials-hero-720.mp4"

# Mobile 720p VP9
ffmpeg -y -i "$SRC" \
  -vf "scale=-2:720" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 \
  -g 6 -keyint_min 6 \
  -an \
  "$OUT/materials-hero-720.webm"

# Poster (first frame)
ffmpeg -y -i "$SRC" -vframes 1 -q:v 2 "$OUT/materials-hero-poster.jpg"

echo "Done. Output sizes:"
ls -lh "$OUT"
