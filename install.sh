#!/usr/bin/env bash
set -euo pipefail

REPO="achintya-7/paruz"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
BINARY="paruz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}==>${NC} $*"; }
warn()    { echo -e "${YELLOW}==> WARNING:${NC} $*"; }
error()   { echo -e "${RED}==> ERROR:${NC} $*" >&2; exit 1; }

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)
    [[ "$ARCH" == "x86_64" ]] || error "On Linux, paruz supports x86_64 only. Got: $ARCH"
    TARGET="linux-x86_64"
    # Check for AUR helper
    if ! command -v paru &>/dev/null && ! command -v yay &>/dev/null; then
      warn "Neither paru nor yay found. paruz requires an AUR helper to search and install packages."
      warn "Install paru: https://github.com/morganamilo/paru"
    fi
    ;;
  Darwin)
    case "$ARCH" in
      arm64)  TARGET="darwin-arm64" ;;
      x86_64) TARGET="darwin-x86_64" ;;
      *)      error "On macOS, paruz supports arm64 and x86_64 only. Got: $ARCH" ;;
    esac
    # Check for Homebrew
    if ! command -v brew &>/dev/null; then
      warn "Homebrew not found. paruz uses brew to search and install packages on macOS."
      warn "Install Homebrew: https://brew.sh"
    fi
    ;;
  *)
    error "paruz supports Linux and macOS only. Got: $OS"
    ;;
esac

# Fetch latest release tag
info "Fetching latest release..."
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
  | grep '"tag_name"' \
  | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')

[[ -n "$LATEST" ]] || error "Could not determine latest release. Check https://github.com/${REPO}/releases"

info "Latest version: $LATEST"

# Download
ARCHIVE="paruz-${TARGET}.tar.gz"
URL="https://github.com/${REPO}/releases/download/${LATEST}/${ARCHIVE}"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

info "Downloading $ARCHIVE..."
curl -fsSL "$URL" -o "$TMP/$ARCHIVE"

# Verify checksum if available
SHA_URL="${URL}.sha256"
if curl -fsSL "$SHA_URL" -o "$TMP/${ARCHIVE}.sha256" 2>/dev/null; then
  info "Verifying checksum..."
  if command -v sha256sum &>/dev/null; then
    (cd "$TMP" && sha256sum -c "${ARCHIVE}.sha256") || error "Checksum verification failed"
  else
    # macOS ships shasum instead of sha256sum
    (cd "$TMP" && shasum -a 256 -c "${ARCHIVE}.sha256") || error "Checksum verification failed"
  fi
fi

# Extract
info "Extracting..."
tar -xzf "$TMP/$ARCHIVE" -C "$TMP"

# Install
mkdir -p "$INSTALL_DIR"
install -m 755 "$TMP/$BINARY" "$INSTALL_DIR/$BINARY"

# Check PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  warn "$INSTALL_DIR is not in your PATH."
  warn "Add the following to your shell config (~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish):"
  echo
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo
fi

info "paruz ${LATEST} installed to ${INSTALL_DIR}/${BINARY}"
info "Run: paruz"
