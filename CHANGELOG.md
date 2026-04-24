# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Initial React + TypeScript + Vite setup for `portfolio-terminal`.
- Terminal-first UI with theme variants (`matrix`, `amber`, `ice`).
- Command engine for content navigation (`about`, `bio`, `skills`, `projects`, `project <id>`).
- Runtime controls for locale and theme switching.
- Remote SSOT integration via `portfolio-content` raw endpoints.
- Project governance files: `LICENSE`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`.
- Handoff guide for continuity and onboarding.
- CI workflow (`.github/workflows/ci.yml`) for install, type-check, and build on push/PR.
- CD workflow (`.github/workflows/cd.yml`) for automatic GitHub Pages deploy on push to `main`.
- Fullscreen command support (`fullscreen`, `fs`, `windowed`, `exit fullscreen`).
- Embedded mode support for iframe consumption via querystring (`?embed=1`) and iframe auto-detection.
- Boot and `help` rendering in ASCII table format (desktop) with compact mobile variants.

### Changed

- Standardized project documentation structure to match `portfolio-os` governance baseline.
- Refined terminal visual system with centered window shell, non-functional window controls, and simplified terminal appearance.
- Increased default terminal window size and improved line spacing/readability while keeping a 12px base font.
- Updated Vite config to support deploy base path through `VITE_BASE_PATH`.
- Updated README and environment documentation for CI/CD, GitHub Pages deployment, and existing MIT license.

### Fixed

- Prevented terminal page growth by constraining layout to viewport and enforcing internal scroll behavior.
- Fixed mobile line-wrap breakage in initial table output and `help` command output.
- Ensured `help` output follows active locale (`pt`/`en`) consistently.
