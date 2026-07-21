#!/usr/bin/env bash
# Package the Fly with Ram project as a clean tarball for download.
set -euo pipefail

PROJECT_DIR="/home/z/my-project"
OUT_DIR="/home/z/my-project/download"
ARCHIVE_NAME="fly-with-ram.tar.gz"
STAGING_DIR="/tmp/fly-with-ram-staging"
INNER_DIR="fly-with-ram"

echo "[1/5] Cleaning staging directory..."
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR/$INNER_DIR"

echo "[2/5] Copying project files..."
cd "$PROJECT_DIR"

rsync -a \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.git/' \
  --exclude='dev.log' \
  --exclude='server.log' \
  --exclude='download/' \
  --exclude='.zscripts/' \
  --exclude='skills/' \
  --exclude='examples/' \
  --exclude='mini-services/' \
  --exclude='upload/' \
  --exclude='db/' \
  --exclude='.claude/' \
  --exclude='.z-ai-config/' \
  --exclude='.vercel/' \
  --exclude='*.tsbuildinfo' \
  --exclude='next-env.d.ts' \
  --exclude='.DS_Store' \
  ./ "$STAGING_DIR/$INNER_DIR/"

# Verify critical files
for f in .env.example .gitignore README.md package.json next.config.ts tsconfig.json; do
  if [ ! -f "$STAGING_DIR/$INNER_DIR/$f" ]; then
    echo "ERROR: $f missing from staging"
    exit 1
  fi
done

# Remove the existing .env file
rm -f "$STAGING_DIR/$INNER_DIR/.env"

# Drop the scaffold's git history
rm -rf "$STAGING_DIR/$INNER_DIR/.git"

# Drop the rebrand scripts (one-time use)
rm -f "$STAGING_DIR/$INNER_DIR/scripts/rebrand-to-cyram.sh"
rm -f "$STAGING_DIR/$INNER_DIR/scripts/rebrand-to-flyram.sh"
rm -f "$STAGING_DIR/$INNER_DIR/scripts/package-project.sh"
rm -f "$STAGING_DIR/$INNER_DIR/scripts/package-cyram.sh"

echo "[3/5] Staging complete"

echo "[4/5] Creating tarball..."
cd "$STAGING_DIR"
tar -czf "$OUT_DIR/$ARCHIVE_NAME" "$INNER_DIR"

echo "[5/5] Verifying..."
echo ""
echo "Archive: $OUT_DIR/$ARCHIVE_NAME"
ls -lh "$OUT_DIR/$ARCHIVE_NAME"
echo ""
echo "Contents (top level):"
tar -tzf "$OUT_DIR/$ARCHIVE_NAME" | head -20
echo "..."
echo ""
echo "Total files in archive:"
tar -tzf "$OUT_DIR/$ARCHIVE_NAME" | wc -l

echo ""
echo "[DONE] Tarball ready at: $OUT_DIR/$ARCHIVE_NAME"
