# Pydantic Agent Benchmark

A small benchmark project for testing how schema-constrained outputs affect agent-like workloads.

## Stack

- Frontend: Next.js + React
- Benchmark layer: Python + Pydantic
- Deployment target: Vercel

## Current scope

- Phase 2: single-turn structured output benchmark
- Phase 3: multi-step mocked agent loop benchmark
- Metrics: speed, success rate, retries, rounds

## Project layout

- `cases.md` — benchmark case definitions
- `schema_definitions.md` — schema design notes
- `benchmark/` — Python benchmark package
- `app/` — React UI for result visualization

## Local dev

### Frontend

```bash
npm install
npm run dev
```

### Python

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Next steps

1. Add benchmark runner
2. Add result JSON format
3. Render result summaries and charts in the UI
4. Add Vercel deployment config
