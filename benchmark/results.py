from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import json

RESULTS_DIR = Path(__file__).resolve().parent.parent / 'results'


def ensure_results_dir() -> Path:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    return RESULTS_DIR


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_result_json(filename: str, payload: dict[str, Any]) -> Path:
    ensure_results_dir()
    output_path = RESULTS_DIR / filename
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    return output_path
