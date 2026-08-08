# Skill: Git & Team Language (shared)

Applies to **both** the backend and frontend repositories.

## Git workflow
- **Feature branch ALWAYS. Never commit to `main`.** If a local commit lands on
  `main`, preserve it on a feature branch and ask before rewriting or resetting
  `main`; do not discard working-tree changes.
  (Exception: the very first repo scaffold commit may be on `main`.)
- Finish a task → open an MR/PR. Team norm: merge the previous MR when moving to the
  next task, then branch fresh off `main`.

## Language
- Commit messages **and** code comments in **<!-- FILL: team language, e.g. Ukrainian -->**
  (keep conventional-commit prefixes: `feat(...)`, `fix(...)`, `chore(...)`, `docs(...)`).
