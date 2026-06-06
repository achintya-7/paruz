# paruz

[![AUR](https://img.shields.io/aur/version/paruz-bin?label=paruz-bin&logo=archlinux)](https://aur.archlinux.org/packages/paruz-bin)

A terminal UI package manager frontend for Arch Linux, built with [OpenTUI](https://github.com/nicholasgasior/opentui) + React and Bun.

<img width="2873" height="1728" alt="image" src="https://github.com/user-attachments/assets/0fe4180f-7353-4c10-be6b-60ee2460d7b9" />

## Features

- Fuzzy search against a local package cache — instant results as you type
- Full package details (version, repo, license, dependencies, description) fetched on demand
- Install packages via `paru` or `yay` with full terminal handoff (sudo prompts work)
- Update mirrorlist via `rate-mirrors` or `reflector`
- Switchable themes: `ayu-dark`, `dracula`, `nord`, `catppuccin`, `gruvbox` + custom themes
- In-app settings — change AUR helper, mirror helper, and theme without editing config files
- Always-on search input — type to search, `↑↓` to navigate simultaneously

## Requirements

### AUR Helper (at least one required)

paruz needs an AUR helper to search and install packages. It auto-detects whichever is installed and prefers `paru` over `yay`.

| Helper | Install |
|--------|---------|
| **paru** (recommended) | `sudo pacman -S --needed base-devel git && git clone https://aur.archlinux.org/paru.git /tmp/paru && cd /tmp/paru && makepkg -si` |
| **yay** | `sudo pacman -S --needed base-devel git && git clone https://aur.archlinux.org/yay.git /tmp/yay && cd /tmp/yay && makepkg -si` |

> **Note:** There is no fallback to raw `pacman`. AUR helpers are required because they wrap pacman and also handle AUR packages. If neither `paru` nor `yay` is installed, paruz will fail to search or install packages.

### Mirror Helper (optional)

Only needed if you use the `Ctrl+U` mirror update feature.

| Helper | Install |
|--------|---------|
| **rate-mirrors** (recommended) | `paru -S rate-mirrors` |
| **reflector** | `sudo pacman -S reflector` |

## Installation

### AUR

```bash
paru -S paruz-bin
```

### One-liner (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/achintya-7/paruz/main/install.sh | bash
```

This downloads the latest binary from GitHub releases, installs it to `~/.local/bin/paruz`, and verifies the checksum. After install, just run:

```bash
paruz
```

By default the binary is placed in `~/.local/bin`. To install elsewhere:

```bash
INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/achintya-7/paruz/main/install.sh | bash
```

### From source

Requires [Bun](https://bun.sh) v1.0+.

```bash
git clone https://github.com/achintya-7/paruz.git
cd paruz
bun install
bun run src/index.tsx
```

### Build binary locally

```bash
bun run build   # produces ./paruz binary
./paruz
```

## Configuration

Config is stored at `~/.config/paruz/config.toml` and is created automatically on first run with sensible defaults:

```toml
aur_helper = "paru"          # or "yay"
mirror_helper = "rate-mirrors" # or "reflector"
theme = "ayu-dark"
```

You can also change settings from within the app by pressing `,`.

### Custom Themes

Add custom themes to `~/.config/paruz/themes.toml`:

```toml
[my-theme]
titleBg  = "#1a1b26"
titleFg  = "#7aa2f7"
border   = "#3b4261"
accent   = "#7aa2f7"
error    = "#f7768e"
statusBar = "#16161e"
text     = "#c0caf5"
textDim  = "#565f89"
```

Then set `theme = "my-theme"` in `config.toml` or change it in the settings view.

## Keybindings

| Key | Action |
|-----|--------|
| Type anything | Search packages |
| `↑` / `↓` | Navigate package list |
| `Enter` | Install selected package |
| `Esc` | Clear search |
| `Ctrl+R` | Force refresh local package cache |
| `Ctrl+U` | Update mirrorlist |
| `,` | Open settings |
| `q` | Quit |

### Settings view

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move between settings |
| `←` / `→` | Cycle option values |
| `Enter` | Save and return |
| `Esc` | Cancel |

## Package Cache

On first run paruz builds a local cache from `pacman -Slq` (official repos) and the AUR package list. This makes search instant. The cache lives at `~/.cache/paruz/packages.txt` and is refreshed automatically every 24 hours, or manually with `Ctrl+R`.

Full package details (version, description, dependencies, etc.) are fetched live from `paru -Si` when you select a package, with results cached in memory for the session.

## Built With

| Layer | Choice |
|-------|--------|
| Runtime | [Bun](https://bun.sh) |
| UI | [OpenTUI](https://github.com/nicholasgasior/opentui) + `@opentui/react` |
| Language | TypeScript + TSX |
| Config | TOML via `smol-toml` |
| Backend | `Bun.spawn` → `paru`/`yay`/`pacman` CLI |
