#!/bin/bash
set -e

# Node.js version to use for cross-platform builds
NODE_VERSION="v22.16.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$PROJECT_DIR/../../dist/apps/video-importer-executable"

echo "Cross-platform build for video-importer"
echo "Node.js version: $NODE_VERSION"
echo "Project dir: $PROJECT_DIR"

# Generate the blob first
cd "$PROJECT_DIR"
echo "Generating SEA blob..."
node --experimental-sea-config sea-config.json

# Create output directory
mkdir -p "$DIST_DIR"

# Function to download Node.js binary if not exists
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

# Build for Linux x64
echo "Building for Linux x64..."
linux_binary=$(download_node_binary "linux" "x64")
cp "$linux_binary" "$DIST_DIR/video-importer-linux"
npx postject "$DIST_DIR/video-importer-linux" NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 2>/dev/null && echo "✓ Linux binary injection completed"
chmod +x "$DIST_DIR/video-importer-linux"
echo "✅ Linux executable created"

# Build for macOS x64
echo "Building for macOS x64..."
macos_binary=$(download_node_binary "darwin" "x64")
cp "$macos_binary" "$DIST_DIR/video-importer-macos"
npx postject "$DIST_DIR/video-importer-macos" NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA 2>/dev/null && echo "✓ macOS binary injection completed"
chmod +x "$DIST_DIR/video-importer-macos"
echo "✅ macOS executable created"

# Build for Windows x64
echo "Building for Windows x64..."
windows_binary=$(download_node_binary "win" "x64")
cp "$windows_binary" "$DIST_DIR/video-importer.exe"
npx postject "$DIST_DIR/video-importer.exe" NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 2>/dev/null && echo "✓ Windows binary injection completed"
echo "✅ Windows executable created"

echo ""
echo "🎉 Cross-platform build complete!"
echo "Executables created:"
echo "  Linux:   $DIST_DIR/video-importer-linux"
echo "  macOS:   $DIST_DIR/video-importer-macos" 
echo "  Windows: $DIST_DIR/video-importer.exe"
echo ""
echo "Note: macOS and Windows binaries are unsigned."
echo "For distribution, sign them on their respective platforms." 