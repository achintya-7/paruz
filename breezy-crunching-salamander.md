# Paruz — OpenTUI React Rewrite

## Context

Your friend ([Vyogami/paruz](https://github.com/Vyogami/paruz)) built a TUI package manager frontend for Arch Linux using Go + Bubble Tea. You want to build your own version under `achintya-7/paruz` with better UI/UX, using **OpenTUI + React** (TypeScript, Bun).

OpenTUI provides: `Box`, `Text`, `Input`, `Select`, `TabSelect`, `ScrollBox`, `ScrollBar`, `Markdown`, `Diff`, `Code`, plus React hooks (`useKeyboard`, `useOnResize`, `useTerminalDimensions`, `useTimeline`). Layout is flexbox-based. It runs on Bun with `@opentui/react`.

The backend logic (searching packages, calling paru/yay, managing mirrors) will use Bun's `child_process` / `Bun.spawn` to shell out.

---

## Roadmap

### Checkpoint 0 — Project Scaffold
**Goal:** Empty app renders in the terminal.

- `bun create tui --template react`
- Set up project structure:
  ```
  paruz/
  ├── src/
  │   ├── index.tsx            # entry point, renderer setup
  │   ├── app.tsx              # root App component, view router
  │   ├── components/          # reusable UI pieces
  │   ├── views/               # full-screen views (Search, Settings, etc.)
  │   ├── hooks/               # custom hooks (usePackages, useConfig, etc.)
  │   ├── lib/                 # backend logic (search, install, config)
  │   └── themes/              # theme definitions
  ├── package.json
  ├── tsconfig.json
  └── bunfig.toml
  ```
- Render a basic Box + Text with "paruz" title
- Verify `bun run src/index.tsx` starts and exits cleanly with Ctrl+C

**Done when:** App shows a styled title bar and exits on Ctrl+C.

---

### Checkpoint 1 — Config System
**Goal:** Read/write TOML config, compatible with friend's format.

- `src/lib/config.ts`
- Read `~/.config/paruz/config.toml` (create with defaults if missing)
- Config shape: `{ aur_helper: "paru" | "yay", mirror_helper: "rate-mirrors" | "reflector", theme: "ayu-dark" }`
- Read custom themes from `~/.config/paruz/themes.toml`
- Use `smol-toml` (or similar) for TOML parsing — no native TOML in Bun
- Export a `useConfig()` hook that loads config into React state

**Done when:** Config loads on startup, defaults are created if missing.

---

### Checkpoint 2 — Package Search Backend
**Goal:** Search packages via paru/yay CLI and parse results.

- `src/lib/search.ts`
- Run `paru -Ss <query>` (or `yay -Ss`) via `Bun.spawn`, parse stdout
- Parse output into `Package[]`: `{ name, version, description, repo, installed }`
- Also support listing installed packages: `pacman -Q`
- Build a local search cache (JSON file in `~/.cache/paruz/`) for fast fuzzy filtering
- `src/lib/info.ts` — run `paru -Si <pkg>` to get detailed package info
- Export `usePackageSearch(query)` hook with loading/error states

**Done when:** `searchPackages("firefox")` returns parsed package list from CLI.

---

### Checkpoint 3 — Search View (Core UI)
**Goal:** Working search + package list, the main screen.

- `src/views/SearchView.tsx` — the primary view
- Layout (flexbox row):
  ```
  ┌─────────────────────────────────────────────┐
  │  Search: [_______________]                  │
  ├──────────────────┬──────────────────────────┤
  │  Package List    │  Package Details         │
  │  (ScrollBox)     │  (ScrollBox)             │
  │                  │                          │
  │  > firefox  [i]  │  Name: firefox           │
  │    chromium      │  Version: 128.0-1        │
  │    vivaldi       │  Repo: extra             │
  │                  │  Description: ...        │
  │                  │  Dependencies: ...       │
  ├──────────────────┴──────────────────────────┤
  │  Status: Ready ✓  [enter] Install  [q] Quit│
  └─────────────────────────────────────────────┘
  ```
- Components to build:
  - `SearchBar` — wraps OpenTUI `Input`, shows placeholder, spinner when loading
  - `PackageList` — vertical list inside `ScrollBox`, highlight current item, show `[installed]` badge
  - `PackageDetail` — right pane, shows parsed info with colored labels
  - `StatusBar` — bottom bar with status + keybinding hints
- Keyboard (use `useKeyboard` hook):
  - `/` or `s` → focus search input
  - `j`/`k` or arrows → navigate list
  - `Enter` → install selected package
  - `q` → quit
  - `Esc` → blur search / go back
- Search triggers on each keystroke (debounced ~300ms)
- Detail pane updates when list selection changes

**Done when:** Can search, browse results with vim keys, see package details.

---

### Checkpoint 4 — Package Install
**Goal:** Install packages through the TUI.

- `src/lib/install.ts`
- On Enter, suspend the TUI and run `paru -S <pkg>` in the foreground terminal
  - This is needed because paru prompts for sudo password and confirmations
  - Use `Bun.spawn` with `stdio: "inherit"` to hand over the terminal
- After install completes, resume the TUI
- Show success/error in status bar on return
- Refresh the package list to update installed status

**Done when:** Can select a package and install it, returning to the TUI after.

---

### Checkpoint 5 — Theming
**Goal:** Switchable color themes.

- `src/themes/index.ts` — theme type definition + built-in themes
- Built-in themes: `ayu-dark`, `dracula`, `nord`, `catppuccin`, `gruvbox`
- Theme shape: `{ titleBg, titleFg, border, accent, error, statusBar, text, textDim }`
- Load custom themes from `~/.config/paruz/themes.toml` and merge
- Create a `ThemeContext` (React context) so all components can access colors
- Apply theme colors to all components via props (`fg`, `bg`, `borderColor`, etc.)

**Done when:** Changing theme in config changes all UI colors on next launch.

---

### Checkpoint 6 — Settings View
**Goal:** In-app settings screen.

- `src/views/SettingsView.tsx`
- Press `,` from search view to open settings
- Three settings with `Select` or toggle:
  - AUR Helper: paru / yay
  - Mirror Helper: rate-mirrors / reflector
  - Theme: cycle through available themes (live preview)
- Vim-like navigation (j/k to move, space/enter to toggle)
- On exit (`Esc`/`q`): if changes were made, show confirm dialog (save? y/n)
- Save changes to config.toml

**Done when:** Can change settings in-app and they persist.

---

### Checkpoint 7 — Mirror Update
**Goal:** Update pacman mirrorlist from the TUI.

- `src/lib/mirrors.ts`
- Press `u` from search view
- Run `rate-mirrors` or `reflector` (based on config) in foreground (same suspend pattern as install)
- Show result in status bar on return

**Done when:** Mirror update works end-to-end from the TUI.

---

### Checkpoint 8 — Cache & Performance
**Goal:** Fast startup with local package cache.

- `src/lib/cache.ts`
- On first run, build a local cache: `pacman -Sl` + `paru -Sl` → JSON in `~/.cache/paruz/`
- Use cache for instant fuzzy filtering (search as you type)
- Background refresh on startup (non-blocking)
- `r` key to force refresh
- Show "Refreshing cache..." in status bar with spinner during refresh

**Done when:** App starts fast, search is instant against cache, background refresh works.

---

### Checkpoint 9 — Bootstrap / Dependency Check
**Goal:** First-run experience that checks for required tools.

- `src/views/BootstrapView.tsx`
- On startup, check if `paru`/`yay`, `rate-mirrors`/`reflector` are installed
- If missing, show a checklist with toggles (like friend's version)
- Space to toggle, Enter to install selected, q to skip
- After install, proceed to main search view

**Done when:** Fresh system gets guided through installing dependencies.

---

### Checkpoint 10 — Polish & UX Improvements
**Goal:** The "better than friend's version" touches.

- Fuzzy search highlighting (highlight matched chars in results)
- Smooth scroll behavior in lists
- Loading animations (spinner in search bar while fetching)
- Error states (network down, paru not found, etc.) with helpful messages
- Responsive layout — adjust split ratio based on terminal width
- `[installed]` badges with color
- Package count in title bar ("paruz (42 results)")

**Done when:** App feels polished and responsive.

---

## Future Enhancements (Post-v1)
These are noted for later, not part of the initial build:
- Tab-based navigation (Search / Installed / Updates)
- Multi-select batch install
- Dependency tree visualization
- Live preview of what will be installed
- Animated transitions between views
- Sorting options (by name, popularity, date)
- Update checker (show outdated packages)

---

## Tech Stack Summary
| Layer | Choice |
|-------|--------|
| Runtime | Bun |
| UI Framework | OpenTUI + @opentui/react |
| Language | TypeScript + TSX |
| Config | TOML (smol-toml) |
| Backend | Bun.spawn → paru/yay/pacman CLI |
| Package manager | bun |

## Verification
After each checkpoint:
1. `bun run src/index.tsx` — app starts without errors
2. Test the specific feature added in that checkpoint
3. Ctrl+C exits cleanly
4. No regressions in previous checkpoints
