<div align="center">

# 📚⚔️ ReadLoot

**A vocabulary RPG that turns reading into a game.**

Collect words from books, review with spaced repetition, earn XP, level up, and unlock achievements.
Web app + CLI.

[![CI](https://github.com/sandeepdanda/readloot/actions/workflows/ci.yml/badge.svg)](https://github.com/sandeepdanda/readloot/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

</div>

---

## What it does

🧠 Spaced repetition (mastery levels 0-5) · ⚔️ XP, streaks, 6 reader levels · 🏆 10 achievements · ✨ Word of the Day · 🔍 Full-text search · 📚 Organized by book and chapter · 🌙 Dark/light theme · 📱 PWA

## Quick Start

```bash
git clone https://github.com/sandeepdanda/readloot.git
cd readloot

# Backend
pip install -e . && pip install -r backend/requirements.txt
cd backend && uvicorn app.main:app --reload    # http://localhost:8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev       # http://localhost:3000
```

Or use the CLI standalone:

```bash
pip install -e .
vault add "ephemeral" --book "Sapiens" --chapter "Ch 1" --meaning "lasting a short time"
vault review          # spaced repetition quiz
vault stats           # XP, level, streak
```

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind, shadcn/ui, TanStack Query, Framer Motion
**Backend:** FastAPI, JWT auth, per-user SQLite vaults
**CLI:** Python, Click, Rich

## What's Next

Auto-vocabulary extraction from books, word rarity tiers, word evolution visuals, FSRS algorithm, boss battles, and more. See [ROADMAP.md](ROADMAP.md).

## Docs

- [PROJECT.md](PROJECT.md) - Architecture, API endpoints, database schema, gamification details
- [ROADMAP.md](ROADMAP.md) - Feature plan with 6 phases

## License

MIT - Originally written at MIT in 1987. It fits in a tweet: "Do whatever you want with this, just keep the copyright notice, and don't blame me if it breaks." ([Full text](LICENSE))
