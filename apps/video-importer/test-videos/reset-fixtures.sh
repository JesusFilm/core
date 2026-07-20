#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

SOURCE_MP4="${1:-6672301-uhd_3840_2160_24fps.mp4}"
SUBTITLE_SRT="0_JesusVisionJohn---base---3934.srt"
SUBTITLE_VTT="0_JesusVisionJohn---base---3934.vtt"
AUDIO_PREVIEW="3934.aac"

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

ensure_srt_fixture() {
  if restore_completed "$SUBTITLE_SRT"; then
    return 0
  fi

  cat > "$SUBTITLE_SRT" <<'EOF'
1
00:00:00,000 --> 00:00:02,000
Test subtitle fixture.

2
00:00:02,500 --> 00:00:04,000
Second caption for update-path tests.
EOF
  echo "created $SUBTITLE_SRT"
}

ensure_vtt_fixture() {
  if restore_completed "$SUBTITLE_VTT"; then
    return 0
  fi

  cat > "$SUBTITLE_VTT" <<'EOF'
WEBVTT

00:00:00.000 --> 00:00:02.000
Test subtitle fixture.

00:00:02.500 --> 00:00:04.000
Second caption for update-path tests.
EOF
  echo "created $SUBTITLE_VTT"
}

ensure_audio_preview_fixture() {
  if restore_completed "$AUDIO_PREVIEW"; then
    return 0
  fi

  if [[ ! -f "$SOURCE_MP4" ]]; then
    echo "missing $AUDIO_PREVIEW and source MP4 $SOURCE_MP4" >&2
    echo "Place a small local MP4 at $SOURCE_MP4 or pass a source path as the first argument." >&2
    return 1
  fi

  if ffmpeg -y -loglevel error -i "$SOURCE_MP4" -vn -t 4 -c:a aac -b:a 96k "$AUDIO_PREVIEW"; then
    echo "created $AUDIO_PREVIEW from $SOURCE_MP4"
    return 0
  fi

  ffmpeg -y -loglevel error -f lavfi -i sine=frequency=1000:duration=4 -c:a aac -b:a 96k "$AUDIO_PREVIEW"
  echo "created $AUDIO_PREVIEW from generated sine audio because $SOURCE_MP4 has no audio stream"
}

ensure_video_fixture "0_JesusVisionJohn---base---3934---1.mp4"
ensure_video_fixture "0_JesusVisionJohn---base---3934---1---496---2.mp4"
ensure_video_fixture "0_JesusVisionJohn---base---   ---1.mp4"
ensure_video_fixture "missing_0_JesusVisionJohn---base---3934---1.mp4"
ensure_srt_fixture
ensure_vtt_fixture
ensure_audio_preview_fixture

cat > "0_JesusVisionJohn---base---3934---999.mp4" <<'EOF'
This is intentionally not an MP4 file. It has a valid importer filename so ffprobe should fail before any R2 asset is created.
EOF

echo "ready 0_JesusVisionJohn---base---3934---999.mp4"
