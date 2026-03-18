#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$PROJECT_DIR/../../dist/apps/video-importer-executable"

echo "Cross-platform build for video-importer"
echo "Project dir: $PROJECT_DIR"

# Create output directory
mkdir -p "$DIST_DIR"

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

if ! command -v bun >/dev/null 2>&1; then
  echo "❌ Bun is required to build the standalone executables. Please install Bun and retry." >&2
  echo "   Install: https://bun.sh" >&2
  exit 1
fi

ENTRYPOINT="$PROJECT_DIR/src/video-importer.ts"

if [ ! -f "$ENTRYPOINT" ]; then
  echo "❌ Entrypoint not found: $ENTRYPOINT" >&2
  exit 1
fi

# Build for Linux x64
echo "Building for Linux x64..."
bun build --compile "$ENTRYPOINT" --target=bun-linux-x64 --outfile="$DIST_DIR/video-importer-linux"
chmod +x "$DIST_DIR/video-importer-linux"
echo "✅ Linux executable created"

# Build for macOS x64
echo "Building for macOS x64..."
bun build --compile "$ENTRYPOINT" --target=bun-darwin-x64 --outfile="$DIST_DIR/video-importer-macos"
chmod +x "$DIST_DIR/video-importer-macos"
echo "✅ macOS executable created"

# Build for Windows x64
echo "Building for Windows x64..."
bun build --compile "$ENTRYPOINT" --target=bun-windows-x64 --outfile="$DIST_DIR/video-importer.exe"
echo "✅ Windows executable created"

echo ""
echo "🎉 Cross-platform build complete!"
echo "Executables created:"
echo "  Linux:   $DIST_DIR/video-importer-linux"
echo "  macOS:   $DIST_DIR/video-importer-macos" 
echo "  Windows: $DIST_DIR/video-importer.exe"
echo ""
echo "Note: macOS and Windows binaries may be unsigned."
echo "For distribution, sign them on their respective platforms."