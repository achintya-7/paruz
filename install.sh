#!/usr/bin/env bash
set -euo pipefail

REPO="achintya-7/paruz"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/lib/paruz}"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"
BINARY="paruz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}==>${NC} $*"; }
warn()    { echo -e "${YELLOW}==> WARNING:${NC} $*"; }
error()   { echo -e "${RED}==> ERROR:${NC} $*" >&2; exit 1; }

# Check OS
[[ "$(uname -s)" == "Linux" ]] || error "paruz only supports Linux"

# Check arch
ARCH="$(uname -m)"
[[ "$ARCH" == "x86_64" ]] || error "paruz only supports x86_64. Got: $ARCH"

# Check for bun
if ! command -v bun &>/dev/null; then
  info "Bun not found. Installing bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  command -v bun &>/dev/null || error "Failed to install bun. Install manually: https://bun.sh"
  info "Bun installed successfully."
fi

# Check for AUR helper
if ! command -v paru &>/dev/null && ! command -v yay &>/dev/null; then
  warn "Neither paru nor yay found. paruz requires an AUR helper to search and install packages."
  warn "Install paru: https://github.com/morganamilo/paru"
fi

# Fetch latest release tag
info "Fetching latest release..."
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
  | grep '"tag_name"' \
  | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')

[[ -n "$LATEST" ]] || error "Could not determine latest release. Check https://github.com/${REPO}/releases"

info "Latest version: $LATEST"

# Download
ARCHIVE="paruz-linux-x86_64.tar.gz"
URL="https://github.com/${REPO}/releases/download/${LATEST}/${ARCHIVE}"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

info "Downloading $ARCHIVE..."
curl -fsSL "$URL" -o "$TMP/$ARCHIVE"

# Extract
info "Extracting..."
tar -xzf "$TMP/$ARCHIVE" -C "$TMP"

# Install
rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cp -a "$TMP/dist/"* "$INSTALL_DIR/"

mkdir -p "$BIN_DIR"
ln -sf "$INSTALL_DIR/$BINARY" "$BIN_DIR/$BINARY"

# Check PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  warn "$BIN_DIR is not in your PATH."
  warn "Add the following to your shell config (~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish):"
  echo
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo
fi

info "paruz ${LATEST} installed to ${INSTALL_DIR}"
info "Run: paruz"
