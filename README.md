# exem-sencha-inspector

Chrome DevTools extension scaffold for Sencha Inspector.

## Stack

- WXT (React starter 기반)
- React + TypeScript (`strict`)
- Biome
- GitHub Actions CI/Release (artifact-only release)

## Prerequisites

- Node.js 22 LTS
- pnpm 10+

## Install

```bash
nvm use
pnpm install
```

## Development

```bash
pnpm dev
```

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm check
```

## Build & Zip

```bash
pnpm build
pnpm zip
```

ZIP artifacts are generated under `.output/`.

## Load In Chrome

1. Run `pnpm build`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click **Load unpacked**.
5. Select `.output/chrome-mv3/`.
6. Open DevTools and find the `Sencha` panel.

## Current Scope (Issue #1)

- DevTools extension baseline setup (MV3)
- `devtools`, `background`, `content`, `injected` entrypoints
- Shared runtime message contracts
- Monitoring adapter interface + noop placeholder
- CI and artifact release workflows

## Out of Scope

- UI system setup (Issue #2: shadcn/Tailwind)
- Actual Sencha detection and DevTools panel feature logic (Issue #3+)
