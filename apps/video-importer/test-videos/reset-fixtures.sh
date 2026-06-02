#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

SOURCE_MP4="${1:-Big_Buck_Bunny_1080_10s_5MB.mp4}"
SUBTITLE_FILE="0_JesusVisionJohn---base---3934.srt"

restore_completed() {
  local completed="$1.completed"
  local target="$1"

  if [[ -f "$completed" ]]; then
    mv "$completed" "$target"
    echo "restored $target"
    return 0
  fi

  if [[ -f "$target" ]]; then
    echo "ready $target"
    return 0
  fi

  return 1
}

ensure_video_fixture() {
  local target="$1"

  if restore_completed "$target"; then
    return 0
  fi

  if [[ ! -f "$SOURCE_MP4" ]]; then
    echo "missing $target and source MP4 $SOURCE_MP4" >&2
    echo "Place a small local MP4 at $SOURCE_MP4 or pass a source path as the first argument." >&2
    return 1
  fi

  cp "$SOURCE_MP4" "$target"
  echo "created $target from $SOURCE_MP4"
}

ensure_subtitle_fixture() {
  if restore_completed "$SUBTITLE_FILE"; then
    return 0
  fi

  cat > "$SUBTITLE_FILE" <<'EOF'
1
00:00:00,000 --> 00:00:02,000
Test subtitle fixture.
EOF
  echo "created $SUBTITLE_FILE"
}

ensure_video_fixture "0_JesusVisionJohn---base---3934---1.mp4"
ensure_video_fixture "0_JesusVisionJohn---base---3934---1---496---2.mp4"
ensure_video_fixture "0_JesusVisionJohn---base---   ---1.mp4"
ensure_video_fixture "missing_0_JesusVisionJohn---base---3934---1.mp4"
ensure_subtitle_fixture

cat > "0_JesusVisionJohn---base---3934---999.mp4" <<'EOF'
This is intentionally not an MP4 file. It has a valid importer filename so ffprobe should fail before any R2 asset is created.
EOF

echo "ready 0_JesusVisionJohn---base---3934---999.mp4"
