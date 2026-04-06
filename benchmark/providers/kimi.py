from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass
class ProviderResponse:
    text: str
    latency_ms: float
    raw: dict[str, Any]
    input_tokens: int | None = None
    output_tokens: int | None = None


class KimiProvider:
    def __init__(self, model: str = 'kimi-k2-0711-preview') -> None:
        api_key = os.getenv('KIMI_API_KEY')
        if not api_key:
            raise RuntimeError('KIMI_API_KEY is not set')

        base_url = os.getenv('KIMI_BASE_URL', 'https://api.moonshot.cn/v1').rstrip('/')
        self.model = model
        self._client = httpx.Client(
            base_url=base_url,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            timeout=120.0,
        )

    def chat_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        response_format: dict[str, Any] | None = None,
        temperature: float = 0.0,
    ) -> ProviderResponse:
        payload: dict[str, Any] = {
            'model': self.model,
            'temperature': temperature,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
        }
        if response_format is not None:
            payload['response_format'] = response_format

        start = time.perf_counter()
        response = self._client.post('/chat/completions', json=payload)
        response.raise_for_status()
        latency_ms = (time.perf_counter() - start) * 1000
        body = response.json()

        text = body['choices'][0]['message']['content']
        usage = body.get('usage', {})
        return ProviderResponse(
            text=text,
            latency_ms=latency_ms,
            raw=body,
            input_tokens=usage.get('prompt_tokens'),
            output_tokens=usage.get('completion_tokens'),
        )

    def close(self) -> None:
        self._client.close()


def safe_json_loads(text: str) -> tuple[dict[str, Any] | None, str | None]:
    try:
        return json.loads(text), None
    except json.JSONDecodeError as exc:
        return None, str(exc)
