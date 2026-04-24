# Project Handoff

## Project Summary

Portfolio Terminal is an interactive command-line style portfolio interface, built as a frontend SPA with React + TypeScript + Vite.

## Current Delivery Scope

- Terminal UI shell with command history and keyboard navigation.
- Theme switching and locale switching at runtime.
- Remote content loading from `portfolio-content` (SSOT) using GitHub Raw.
- Typed parsing layer for markdown and JSON content.
- Documentation and governance baseline at repository root.

## Technical Ownership Areas

- `src/features/terminal/components`: terminal shell rendering and interaction.
- `src/features/terminal/lib`: command execution and markdown normalization.
- `src/services`: external content fetch and normalization layer.
- `src/types`: shared contracts for content models.
- `src/styles`: terminal visual system and responsive behavior.

## Runbook

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Client-Facing Checklist

- [ ] Raw SSOT URL configured for target environment.
- [ ] Final project links validated (`open <id>` flow).
- [ ] SEO metadata reviewed in `index.html`.
- [ ] Accessibility pass completed (keyboard, contrast, labels).
- [ ] Hosting and domain configured.

## Recommended Next Actions

1. Add automated tests for command parser and terminal flows.
2. Define integration contract with `portfolio-os` (embed/external launch).
3. Add CI pipeline for lint/build checks on pull requests.
