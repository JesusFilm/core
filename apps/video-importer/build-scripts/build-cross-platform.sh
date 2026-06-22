#!/bin/bash
set -euo pipefail

NODE_VERSION="v22.16.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$PROJECT_DIR/../.." && pwd)"
DIST_DIR="$REPO_ROOT/dist/apps/video-importer-executable"
BUNDLE_DIR="$REPO_ROOT/dist/apps/video-importer"
ENTRYPOINT="$PROJECT_DIR/src/video-importer.ts"
BUNDLE="$BUNDLE_DIR/video-importer-bundled.cjs"
SEA_BLOB="$PROJECT_DIR/sea-prep.blob"
SEA_CONFIG="$PROJECT_DIR/sea-config.json"
POSTJECT_SENTINEL="NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2"

echo "Node SEA cross-platform build for video-importer"
echo "Node.js runtime version: $NODE_VERSION"
echo "Project dir: $PROJECT_DIR"

mkdir -p "$DIST_DIR" "$BUNDLE_DIR"
rm -f "$DIST_DIR/video-importer" "$DIST_DIR/video-importer.cmd" "$DIST_DIR/video-importer.cjs"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to build the video-importer SEA executables." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required to build the video-importer SEA executables." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to download Node.js runtime binaries." >&2
  exit 1
fi

if ! command -v unzip >/dev/null 2>&1; then
  echo "unzip is required to extract Windows runtime archives." >&2
  exit 1
fi

if [ ! -f "$ENTRYPOINT" ]; then
  echo "Entrypoint not found: $ENTRYPOINT" >&2
  exit 1
fi

echo "Bundling Node CLI..."
(cd "$REPO_ROOT" && pnpm exec esbuild "$ENTRYPOINT" \
  --bundle \
  --platform=node \
  --target=node22 \
  --format=cjs \
  --outfile="$BUNDLE")

download_node_binary() (
  local platform=$1
  local arch=$2
  local filename="node-${NODE_VERSION}-${platform}-${arch}"
  local url="https://nodejs.org/dist/${NODE_VERSION}/${filename}.tar.gz"
  local binary_path="$DIST_DIR/${filename}/bin/node"

  if [ "$platform" = "win" ]; then
    url="https://nodejs.org/dist/${NODE_VERSION}/${filename}.zip"
    binary_path="$DIST_DIR/${filename}/node.exe"
  fi

  if [ ! -f "$binary_path" ]; then
    echo "Downloading Node.js for $platform-$arch..." >&2
    cd "$DIST_DIR"

    if [ "$platform" = "win" ]; then
      curl -s -L "$url" -o "${filename}.zip"
      unzip -q "${filename}.zip"
      rm "${filename}.zip"
    else
      curl -s -L "$url" -o "${filename}.tar.gz"
      tar -xzf "${filename}.tar.gz"
      rm "${filename}.tar.gz"
    fi
  fi

  echo "$binary_path"
)

inject_sea_blob() {
  local binary=$1
  shift

  pnpm exec postject "$binary" NODE_SEA_BLOB "$SEA_BLOB" \
    --sentinel-fuse "$POSTJECT_SENTINEL" \
    "$@"
}

host_os="$(uname -s)"
case "$host_os" in
  Linux*)
    host_platform="linux"
    ;;
  Darwin*)
    host_platform="darwin"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    host_platform="win"
    ;;
  *)
    echo "Unsupported host OS for SEA blob generation: $host_os" >&2
    exit 1
    ;;
esac

echo "Preparing Node.js ${host_platform}-x64 runtime for SEA blob generation..."
host_binary=$(download_node_binary "$host_platform" "x64")

echo "Generating SEA blob..."
(cd "$PROJECT_DIR" && "$host_binary" --experimental-sea-config "$SEA_CONFIG")

echo "Building Linux x64 executable..."
linux_binary=$(download_node_binary "linux" "x64")
cp "$linux_binary" "$DIST_DIR/video-importer-linux"
inject_sea_blob "$DIST_DIR/video-importer-linux"
chmod +x "$DIST_DIR/video-importer-linux"
echo "Linux executable created: $DIST_DIR/video-importer-linux"

echo "Building macOS x64 executable..."
macos_binary=$(download_node_binary "darwin" "x64")
cp "$macos_binary" "$DIST_DIR/video-importer-macos"
inject_sea_blob "$DIST_DIR/video-importer-macos" --macho-segment-name NODE_SEA
chmod +x "$DIST_DIR/video-importer-macos"
echo "macOS executable created: $DIST_DIR/video-importer-macos"

echo "Building Windows x64 executable..."
windows_binary=$(download_node_binary "win" "x64")
cp "$windows_binary" "$DIST_DIR/video-importer.exe"
inject_sea_blob "$DIST_DIR/video-importer.exe"
echo "Windows executable created: $DIST_DIR/video-importer.exe"

echo ""
echo "Node SEA build complete."
echo "Executables created:"
echo "  Linux:   $DIST_DIR/video-importer-linux"
echo "  macOS:   $DIST_DIR/video-importer-macos"
echo "  Windows: $DIST_DIR/video-importer.exe"
echo ""
echo "Note: macOS and Windows binaries are unsigned."
echo "For distribution, sign them on their respective platforms."
