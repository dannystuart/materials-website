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

# ---------------------------------------------------------------------------
# §05 MacBook demo (scrub-then-play — recipe Pattern B)
#
# These encodes were once run ad-hoc in the terminal, which is how a 720p
# refresh silently lost the -g flags and shipped a GOP-250 file (one keyframe
# per ~4.17s — recipe Bug 9: scrub seeks decoded up to 250 frames each).
# Every shipped encode lives HERE, never in shell history.
#
# Verify keyframe cadence on every output before shipping (expect 0.0, 0.1, …):
#   ffprobe -v error -select_streams v:0 -skip_frame nokey \
#     -show_entries frame=pts_time -of csv=p=0 <file> | head
# ---------------------------------------------------------------------------

DEMO_SRC="assets-source/macbook-video-5.mov"

# Desktop 1080p H.264 — dense keyframes (every 6 frames = 0.1s @ 60fps) for
# the scroll scrub; -movflags +faststart so playback can begin mid-download.
ffmpeg -y -i "$DEMO_SRC" \
  -vf "scale=-2:1080" \
  -vcodec libx264 -crf 26 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  "$OUT/macbook-demo.mp4"

# Mobile 720p H.264 — same flags (THIS is the encode that lost -g 6 once)
ffmpeg -y -i "$DEMO_SRC" \
  -vf "scale=-2:720" \
  -vcodec libx264 -crf 26 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart -an \
  "$OUT/macbook-demo-720.mp4"

# Poster (first frame — the closed lid; the scrub rests on this)
ffmpeg -y -i "$DEMO_SRC" -vframes 1 -q:v 2 "$OUT/macbook-demo-poster.jpg"

echo "Done. Output sizes:"
ls -lh "$OUT"

echo "Keyframe cadence check (each should read 0.0 / 0.1 / 0.2):"
for f in "$OUT/materials-hero.mp4" "$OUT/macbook-demo.mp4" "$OUT/macbook-demo-720.mp4"; do
  printf '%s: ' "$f"
  ffprobe -v error -select_streams v:0 -skip_frame nokey \
    -show_entries frame=pts_time -of csv=p=0 "$f" 2>/dev/null | head -3 | tr '\n' ' '
  echo
done
