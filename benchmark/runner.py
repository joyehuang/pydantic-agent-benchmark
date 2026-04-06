from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from statistics import mean
from typing import Any

from pydantic import TypeAdapter, ValidationError

import httpx

from benchmark.cases_data import PHASE2_CASES, PHASE3_TASKS
from benchmark.mock_data import CALENDAR_DATA, DOC_SNIPPETS, WEATHER_DATA
from benchmark.providers.kimi import KimiProvider, safe_json_loads
from benchmark.results import utc_now_iso, write_result_json
from benchmark.schemas import (
    AgentStep,
    ConstraintSummary,
    IntentExtraction,
    ToolSelection,
)

GROUPS = ['prompt_only', 'schema_constrained', 'schema_pydantic_retry']
TRANSIENT_PROVIDER_ERRORS = (httpx.TimeoutException, httpx.HTTPError)
SCHEMA_MODELS = {
    'intent_extraction': IntentExtraction,
    'tool_selection': ToolSelection,
    'constraint_summary': ConstraintSummary,
}


@dataclass
class SingleRunResult:
    case_id: str
    group: str
    latency_ms: float
    json_success: bool
    schema_success: bool
    failure_type: str | None
    retries: int
    input_tokens: int | None
    output_tokens: int | None


@dataclass
class TaskRunResult:
    task_id: str
    group: str
    task_success: bool
    total_latency_ms: float
    model_calls: int
    retries: int
    rounds: int
    failure_type: str | None
    last_action: str | None


def build_phase2_prompts(schema_name: str, user_input: str, group: str) -> tuple[str, str, dict[str, Any] | None]:
    schema_hints = {
        'intent_extraction': {
            'type': 'object',
            'properties': {
                'intent': {'type': 'string'},
                'location': {'type': 'string'},
                'target_date': {'type': ['string', 'null']},
                'start_date': {'type': ['string', 'null']},
                'end_date': {'type': ['string', 'null']},
                'target_time_range': {'type': ['string', 'null']},
                'activity': {'type': ['string', 'null']},
                'requested_attributes': {'type': 'array', 'items': {'type': 'string'}},
                'conditional_rule': {'type': ['string', 'null']},
                'threshold_rule': {'type': ['string', 'null']},
                'followup_instruction': {'type': ['string', 'null']},
                'condition_type': {'type': ['string', 'null']},
                'confidence': {'type': 'number'},
            },
            'required': ['intent', 'location', 'requested_attributes', 'confidence'],
        },
        'tool_selection': {
            'type': 'object',
            'properties': {
                'tool_name': {'type': 'string'},
                'query': {'type': 'string'},
                'filters': {'type': 'object'},
                'source_preferences': {'type': 'array', 'items': {'type': 'string'}},
                'sort_preference': {'type': ['string', 'null']},
                'limit': {'type': 'integer'},
                'reasoning_summary': {'type': 'string'},
            },
            'required': ['tool_name', 'query', 'filters', 'source_preferences', 'limit', 'reasoning_summary'],
        },
        'constraint_summary': {
            'type': 'object',
            'properties': {
                'objective': {'type': 'string'},
                'constraints': {'type': 'array', 'items': {'type': 'string'}},
                'priorities': {'type': 'array', 'items': {'type': 'string'}},
                'deliverables': {'type': 'array', 'items': {'type': 'string'}},
                'next_action': {'type': 'string'},
            },
            'required': ['objective', 'constraints', 'priorities', 'deliverables', 'next_action'],
        },
    }
    schema = schema_hints[schema_name]
    base_system = 'You are a strict information extraction engine. Return JSON only.'
    if group == 'prompt_only':
        system = base_system
        user = f'Extract the requested structure from the following input and reply with JSON only. Expected shape: {json.dumps(schema, ensure_ascii=False)}\n\nInput: {user_input}'
        return system, user, None

    system = base_system + ' Follow the provided JSON schema strictly.'
    user = f'Input: {user_input}'
    response_format = {
        'type': 'json_schema',
        'json_schema': {
            'name': schema_name,
            'schema': schema,
        },
    }
    return system, user, response_format


def classify_phase2_failure(parsed: dict[str, Any] | None, error: str | None, validation_error: ValidationError | None) -> str | None:
    if parsed is None and error:
        return 'json_parse_error'
    if validation_error is None:
        return None
    first = validation_error.errors()[0]
    return first.get('type', 'validation_error')


def run_phase2(provider: KimiProvider, repeats: int) -> dict[str, Any]:
    rows: list[SingleRunResult] = []
    for group in GROUPS:
        for case in PHASE2_CASES:
            model = SCHEMA_MODELS[case['schema']]
            for _ in range(repeats):
                retries = 0
                while True:
                    system_prompt, user_prompt, response_format = build_phase2_prompts(case['schema'], case['input'], group)
                    try:
                        response = provider.chat_json(
                            system_prompt=system_prompt,
                            user_prompt=user_prompt,
                            response_format=response_format,
                            temperature=0.0,
                        )
                    except TRANSIENT_PROVIDER_ERRORS as exc:
                        rows.append(
                            SingleRunResult(
                                case_id=case['id'],
                                group=group,
                                latency_ms=0.0,
                                json_success=False,
                                schema_success=False,
                                failure_type=exc.__class__.__name__,
                                retries=retries,
                                input_tokens=None,
                                output_tokens=None,
                            )
                        )
                        break
                    parsed, parse_error = safe_json_loads(response.text)
                    validation_error = None
                    schema_success = False
                    if parsed is not None:
                        try:
                            model.model_validate(parsed)
                            schema_success = True
                        except ValidationError as exc:
                            validation_error = exc
                    json_success = parsed is not None
                    failure_type = classify_phase2_failure(parsed, parse_error, validation_error)
                    rows.append(
                        SingleRunResult(
                            case_id=case['id'],
                            group=group,
                            latency_ms=response.latency_ms,
                            json_success=json_success,
                            schema_success=schema_success,
                            failure_type=failure_type,
                            retries=retries,
                            input_tokens=response.input_tokens,
                            output_tokens=response.output_tokens,
                        )
                    )
                    if group != 'schema_pydantic_retry' or schema_success or retries >= 1:
                        break
                    retries += 1

    summary = []
    for group in GROUPS:
        group_rows = [row for row in rows if row.group == group]
        summary.append(
            {
                'group': group,
                'avg_latency_ms': round(mean(r.latency_ms for r in group_rows), 2),
                'json_success_rate': round(sum(r.json_success for r in group_rows) / len(group_rows), 4),
                'schema_success_rate': round(sum(r.schema_success for r in group_rows) / len(group_rows), 4),
                'avg_retries': round(mean(r.retries for r in group_rows), 4),
            }
        )

    return {
        'generated_at': utc_now_iso(),
        'phase': 'phase2',
        'rows': [asdict(row) for row in rows],
        'summary': summary,
    }


def same_tool_call_seen(scratchpad: list[dict[str, Any]], action: str, args: dict[str, Any]) -> bool:
    for item in scratchpad:
        if 'assistant_step' not in item:
            continue
        step = item['assistant_step']
        if step.get('action') == action and step.get('args') == args:
            return True
    return False


def tool_result(action: str, args: dict[str, Any]) -> dict[str, Any]:
    if action == 'lookup_weather':
        return WEATHER_DATA.get((args['city'], args['date']), {'condition': 'Unknown', 'temp_low': None, 'temp_high': None})
    if action == 'lookup_calendar':
        return {'entries': CALENDAR_DATA.get(args['date'], [])}
    if action == 'search_docs':
        query = args['query'].lower()
        for key, snippets in DOC_SNIPPETS.items():
            if key in query:
                return {'snippets': snippets}
        return {'snippets': []}
    return {'ok': True}


AGENT_ACTION_SCHEMA = {
    'type': 'object',
    'properties': {
        'thought': {'type': 'string'},
        'action': {'type': 'string', 'enum': ['search_docs', 'lookup_weather', 'lookup_calendar', 'final_answer']},
        'args': {'type': 'object'},
        'done': {'type': 'boolean'},
    },
    'required': ['thought', 'action', 'args', 'done'],
}


def compact_scratchpad(scratchpad: list[dict[str, Any]]) -> list[dict[str, Any]]:
    compact: list[dict[str, Any]] = []
    for item in scratchpad[-6:]:
        if 'assistant_step' in item:
            step = item['assistant_step']
            compact.append(
                {
                    'assistant_step': {
                        'action': step.get('action'),
                        'done': step.get('done'),
                        'args': step.get('args'),
                    }
                }
            )
        elif 'tool_result' in item:
            compact.append({'tool_result': item['tool_result']})
    return compact


def previous_actions(scratchpad: list[dict[str, Any]]) -> list[str]:
    return [item['assistant_step']['action'] for item in scratchpad if 'assistant_step' in item]


def build_agent_prompt(task_input: str, scratchpad: list[dict[str, Any]], reference_date: str) -> tuple[str, str]:
    actions = previous_actions(scratchpad)
    system = (
        'You are an agent loop controller. Return exactly one JSON object and nothing else. '
        'Allowed actions: search_docs, lookup_weather, lookup_calendar, final_answer. '
        'Use the minimum required tool calls. Never repeat the same tool call with the same arguments. '
        'If the needed tool results are already in context, return final_answer instead of calling tools again. '
        'Keep thought under 12 words.'
    )
    user = (
        f'Reference date: {reference_date}\n'
        f'Task: {task_input}\n'
        f'Previous actions: {json.dumps(actions, ensure_ascii=False)}\n'
        f'Context: {json.dumps(compact_scratchpad(scratchpad), ensure_ascii=False)}\n'
        'If weather is needed, lookup_weather args must be {city, date}. '
        'If calendar is needed, lookup_calendar args must be {date}. '
        'If docs are needed, search_docs args must be {query}. '
        'If done, final_answer args must be {answer, confidence}. '
        'Do not call lookup_calendar twice in a row for the same date. '
        'Do not call lookup_weather twice in a row for the same city/date.\n'
        'Return the next step now.'
    )
    return system, user


def run_phase3(provider: KimiProvider, repeats: int, max_rounds: int = 4, tasks: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    adapter = TypeAdapter(AgentStep)
    rows: list[TaskRunResult] = []

    phase3_tasks = tasks or PHASE3_TASKS

    for group in GROUPS:
        for task in phase3_tasks:
            for _ in range(repeats):
                scratchpad: list[dict[str, Any]] = []
                total_latency = 0.0
                model_calls = 0
                retries = 0
                task_success = False
                failure_type = None
                last_action = None

                for round_index in range(1, max_rounds + 1):
                    attempt = 0
                    while True:
                        system_prompt, user_prompt = build_agent_prompt(task['input'], scratchpad, task['reference_date'])
                        response_format = None if group == 'prompt_only' else {
                            'type': 'json_schema',
                            'json_schema': {'name': 'agent_step', 'schema': AGENT_ACTION_SCHEMA},
                        }
                        try:
                            response = provider.chat_json(
                                system_prompt=system_prompt,
                                user_prompt=user_prompt,
                                response_format=response_format,
                                temperature=0.0,
                            )
                        except TRANSIENT_PROVIDER_ERRORS as exc:
                            failure_type = exc.__class__.__name__
                            if group == 'schema_pydantic_retry' and attempt < 1:
                                retries += 1
                                attempt += 1
                                continue
                            break
                        total_latency += response.latency_ms
                        model_calls += 1
                        parsed, parse_error = safe_json_loads(response.text)
                        if parsed is None:
                            failure_type = 'json_parse_error'
                            if group == 'schema_pydantic_retry' and attempt < 1:
                                retries += 1
                                attempt += 1
                                continue
                            break

                        try:
                            step = adapter.validate_python(parsed)
                        except ValidationError as exc:
                            failure_type = exc.errors()[0].get('type', 'validation_error')
                            if group == 'schema_pydantic_retry' and attempt < 1:
                                retries += 1
                                attempt += 1
                                continue
                            break

                        step_data = step.model_dump()
                        last_action = step_data['action']

                        if step_data['action'] != 'final_answer' and same_tool_call_seen(scratchpad, step_data['action'], step_data['args']):
                            failure_type = 'repeated_tool_call'
                            if group == 'schema_pydantic_retry' and attempt < 1:
                                retries += 1
                                attempt += 1
                                continue
                            break

                        scratchpad.append({'assistant_step': step_data})
                        if step_data['action'] == 'final_answer':
                            task_success = True
                            failure_type = None
                            break

                        result = tool_result(step_data['action'], step_data['args'])
                        scratchpad.append({'tool_result': result})
                        failure_type = None
                        break

                    if task_success or failure_type in {'json_parse_error', 'validation_error'} and group != 'schema_pydantic_retry':
                        if task_success:
                            break
                    if task_success:
                        break
                    if failure_type and group != 'schema_pydantic_retry':
                        break

                rounds = len([item for item in scratchpad if 'assistant_step' in item])
                if not task_success and failure_type is None:
                    failure_type = 'max_rounds_exceeded'

                rows.append(
                    TaskRunResult(
                        task_id=task['id'],
                        group=group,
                        task_success=task_success,
                        total_latency_ms=total_latency,
                        model_calls=model_calls,
                        retries=retries,
                        rounds=rounds,
                        failure_type=failure_type,
                        last_action=last_action,
                    )
                )

    summary = []
    failure_summary = []
    for group in GROUPS:
        group_rows = [row for row in rows if row.group == group]
        summary.append(
            {
                'group': group,
                'task_success_rate': round(sum(r.task_success for r in group_rows) / len(group_rows), 4),
                'avg_total_latency_ms': round(mean(r.total_latency_ms for r in group_rows), 2),
                'avg_model_calls': round(mean(r.model_calls for r in group_rows), 2),
                'avg_retries': round(mean(r.retries for r in group_rows), 2),
                'avg_rounds': round(mean(r.rounds for r in group_rows), 2),
            }
        )
        counts: dict[str, int] = {}
        for row in group_rows:
            key = row.failure_type or 'success'
            counts[key] = counts.get(key, 0) + 1
        failure_summary.append({'group': group, **counts})

    return {
        'generated_at': utc_now_iso(),
        'phase': 'phase3',
        'rows': [asdict(row) for row in rows],
        'summary': summary,
        'failure_summary': failure_summary,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description='Run pydantic agent benchmark')
    parser.add_argument('--phase', choices=['phase2', 'phase3', 'all'], default='all')
    parser.add_argument('--repeats', type=int, default=2)
    parser.add_argument('--model', default='kimi-k2-0711-preview')
    parser.add_argument('--limit', type=int, default=0, help='Optional limit for quick local runs')
    args = parser.parse_args()

    provider = KimiProvider(model=args.model)
    try:
        if args.phase in {'phase2', 'all'}:
            phase2_result = run_phase2(provider, repeats=args.repeats)
            write_result_json('phase2.latest.json', phase2_result)
            print('Wrote results/phase2.latest.json')

        if args.phase in {'phase3', 'all'}:
            selected_tasks = PHASE3_TASKS[: args.limit] if args.limit else PHASE3_TASKS
            phase3_result = run_phase3(provider, repeats=args.repeats, tasks=selected_tasks)
            write_result_json('phase3.latest.json', phase3_result)
            print('Wrote results/phase3.latest.json')
    finally:
        provider.close()


if __name__ == '__main__':
    main()
