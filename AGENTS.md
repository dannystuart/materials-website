<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Assets: source masters vs shipped files

Two homes, no overlap:

- **`assets-source/`** — every source master (full-res video masters, Figma
  exports, original PNG/JPG, screenshots) plus `retired-from-public/` for files
  that once shipped but are no longer referenced. Gitignored **and** vercelignored
  — never committed, never deployed. This is the only place masters live.
- **`public/`** — only the optimized files the running site requests by path
  (re-encoded `.mp4`/`.webm` + posters, compressed PNG/JPG). Everything here ships.

Never copy a master into `public/` (it bloats the repo and the deploy), and never
leave a shipped output as the only copy of something — the master belongs in
`assets-source/`. Re-encode masters with `scripts/encode-video.sh`; compress
shipped PNGs in place with ImageOptim (lossless). Fuller notes:
`assets-source/README.md` (local-only, lives with the masters).
