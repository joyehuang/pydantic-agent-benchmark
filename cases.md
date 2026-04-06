# Pydantic Agent Benchmark — Case List

This file defines the benchmark cases for comparing:

- prompt-only JSON output
- schema-constrained JSON output
- schema + Pydantic validation + retry

Model target: **Kimi 2.5**  
Temperature: **0**

---

## Design principles

- Cases should be realistic for agent-style workloads.
- Cases should be small enough to run quickly.
- Cases should exercise structured output reliability.
- Phase 3 should reflect a simplified agent loop.
- Use mock tools for determinism.

---

# Phase 2 — Single-turn structured output

Goal:
- Measure single-call latency
- Measure valid JSON rate
- Measure schema pass rate
- Measure first-pass success

Each Phase 2 case should be tested under the same semantic task across all output modes.

## P2-A: Intent + parameter extraction

### P2-A-1
User input:
> 帮我查一下 Melbourne 这周五到周日的天气，如果周六下雨提醒我带伞。

Expected structured fields:
- intent
- location
- start_date
- end_date
- conditional_rule
- confidence

### P2-A-2
User input:
> 我想看看 Sydney 明天早上适不适合跑步，顺便告诉我温度范围。

Expected structured fields:
- intent
- location
- target_date
- target_time_range
- activity
- requested_attributes
- confidence

### P2-A-3
User input:
> 下周一帮我查 Brisbane 的天气，如果最高温超过 30 度就提醒我穿轻薄一点。

Expected structured fields:
- intent
- location
- target_date
- threshold_rule
- requested_attributes
- confidence

### P2-A-4
User input:
> 这个周末 Gold Coast 会不会下雨？如果会，回答里顺便提醒我别安排户外活动。

Expected structured fields:
- intent
- location
- date_range
- condition_type
- followup_instruction
- confidence

### P2-A-5
User input:
> 帮我看一下 Adelaide 周三的天气，重点告诉我风大不大。

Expected structured fields:
- intent
- location
- target_date
- requested_attributes
- confidence

---

## P2-B: Tool selection + argument generation

### P2-B-1
User input:
> 给我找三家 Melbourne CBD 评分高于 4.5、适合商务晚餐的日料店。

Expected structured fields:
- tool_name
- query
- filters
- limit
- reasoning_summary

### P2-B-2
User input:
> 帮我查 2024 年之后发布的、关于 multi-agent systems 的论文，最好偏工程实践。

Expected structured fields:
- tool_name
- query
- filters
- sort_preference
- limit
- reasoning_summary

### P2-B-3
User input:
> 找一些适合初学者看的 Pydantic 教程，优先英文官方或高质量博客。

Expected structured fields:
- tool_name
- query
- filters
- source_preferences
- limit
- reasoning_summary

### P2-B-4
User input:
> 给我搜一下澳洲最近关于 AI regulation 的新闻，先给我 5 条。

Expected structured fields:
- tool_name
- query
- filters
- limit
- reasoning_summary

### P2-B-5
User input:
> 帮我查东京下个月适合看樱花的时间窗口。

Expected structured fields:
- tool_name
- query
- filters
- limit
- reasoning_summary

---

## P2-C: Constraint summary extraction

### P2-C-1
User input:
> 我们要做一个 agent benchmark，目标是比较不同 structured output 方法在速度和成功率上的差异。要求先做一个小规模实验，不接真实工具，优先 mock tools，可复现，最后输出成表格。

Expected structured fields:
- objective
- constraints
- priorities
- deliverables
- next_action

### P2-C-2
User input:
> 我想搭一个轻量的研究 demo，预算有限，先在本地跑通，后面再接 API。不要太多工程封装，但日志要清楚，方便复现实验。

Expected structured fields:
- objective
- constraints
- priorities
- deliverables
- next_action

### P2-C-3
User input:
> 这个测试别做太重，不需要大规模 benchmark。重点是看在 agent loop 里面，用 schema 和 pydantic 后成功率有没有提升，以及速度损失大不大。

Expected structured fields:
- objective
- constraints
- priorities
- deliverables
- next_action

### P2-C-4
User input:
> 我需要一个可以快速扩展的基准项目，先支持 Kimi，后面可能加 OpenAI 或 Claude。现在先别做太多 provider 抽象，先把 case 和结果格式统一。

Expected structured fields:
- objective
- constraints
- priorities
- deliverables
- next_action

### P2-C-5
User input:
> 我们希望最后看到每组方法的平均耗时、任务成功率、重试次数，还有按 case 类型拆开的结果。

Expected structured fields:
- objective
- constraints
- priorities
- deliverables
- next_action

---

# Phase 3 — Agent loop benchmark

Goal:
- Measure end-to-end task latency
- Measure task success rate
- Measure retries and rounds
- Measure action schema reliability in multi-step execution

All tools are mocked for deterministic outputs.

---

## Mock tools

### Tool: `search_docs`
Args:
- query: string

Returns:
- matched snippets from a fixed local corpus

### Tool: `lookup_weather`
Args:
- city: string
- date: string

Returns:
- fixed weather record from local dataset

### Tool: `lookup_calendar`
Args:
- date: string

Returns:
- fixed calendar entries from local dataset

### Tool: `final_answer`
Args:
- answer: string
- confidence: float

Returns:
- terminates the task

---

## P3-A: Simple single-tool tasks

### P3-A-1
Task:
> 告诉我 Melbourne 2026-04-10 的天气。

Expected path:
- lookup_weather
- final_answer

### P3-A-2
Task:
> 帮我看一下 2026-04-11 我有没有安排。

Expected path:
- lookup_calendar
- final_answer

---

## P3-B: Two-tool conditional tasks

### P3-B-1
Task:
> 如果我 2026-04-10 下午有外出安排，而且天气下雨，就提醒我带伞。

Expected path:
- lookup_calendar
- lookup_weather
- final_answer

### P3-B-2
Task:
> 看看我 2026-04-11 有没有日程，如果有并且天气温度低于 15 度，就提醒我穿外套。

Expected path:
- lookup_calendar
- lookup_weather
- final_answer

### P3-B-3
Task:
> 如果我周五没有安排，就只告诉我天气；如果有安排，就同时告诉我天气和出门建议。

Expected path:
- lookup_calendar
- lookup_weather
- final_answer

---

## P3-C: Retrieval + synthesis tasks

### P3-C-1
Task:
> 根据产品文档，告诉我 API rate limit 是多少，并总结超限后的处理方式。

Expected path:
- search_docs
- final_answer

### P3-C-2
Task:
> 根据文档说明，告诉我 structured output 和 function calling 的区别。

Expected path:
- search_docs
- final_answer

### P3-C-3
Task:
> 从文档里找出 retry policy 的建议，并给我一个一句话总结。

Expected path:
- search_docs
- final_answer

---

## P3-D: Ambiguous or error-prone tasks

### P3-D-1
Task:
> 看看那天要不要带伞，顺便说下我有没有安排。

Benchmark note:
- The prompt wrapper will provide a fixed reference date in context.
- Purpose: test whether structured output reduces malformed or underspecified actions.

Expected path:
- lookup_calendar
- lookup_weather
- final_answer

### P3-D-2
Task:
> 帮我判断明天适不适合出门，如果不适合，告诉我是因为天气还是行程。

Expected path:
- lookup_calendar
- lookup_weather
- final_answer

---

# Evaluation notes

## Phase 2 metrics
- latency_ms
- json_parse_success
- schema_validation_success
- first_pass_success

## Phase 3 metrics
- task_success
- total_latency_ms
- model_calls
- retries
- rounds
- first_pass_task_success
- action_schema_success_rate

---

# Suggested initial run size

## Lightweight version

### Phase 2
- 15 cases
- 3 output modes
- 2 repeats

### Phase 3
- 10 tasks
- 3 output modes
- 2 repeats

This is enough to reveal directional differences before scaling up.
