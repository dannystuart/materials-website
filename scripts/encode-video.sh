#!/usr/bin/env bash
set -euo pipefail

SRC="assets-source/Materials-Hero.mp4"
OUT="public/videos"
mkdir -p "$OUT"

# Desktop H.264 — keyframe every 6 frames for smooth backward scrub
# Downscaled to 1080p (square source -> 1080x1080) so the browser decoder isn't
# crushed by 16 MP/frame during GSAP scrub. CRF 24 to recover quality once the
# 1080p downscale dropped the file well below the 8 MB floor at CRF 26.
ffmpeg -y -i "$SRC" \
  -vf "scale=-2:1080" \
  -vcodec libx264 -crf 24 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  "$OUT/materials-hero.mp4"

# Desktop VP9 fallback
# Same 1080p downscale as the H.264 desktop encode for the same decoder reasons.
ffmpeg -y -i "$SRC" \
  -vf "scale=-2:1080" \
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
