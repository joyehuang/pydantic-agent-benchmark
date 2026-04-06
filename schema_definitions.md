# Pydantic Agent Benchmark — Schema Definitions

This file defines the schemas for benchmark execution.

Target comparison:
- prompt-only JSON
- schema-constrained JSON
- schema + Pydantic validation + retry

---

# 1. Phase 2 schemas

Phase 2 evaluates single-turn structured outputs.

## 1.1 Intent extraction schema

Used for P2-A cases.

### Fields
- `intent: str`
- `location: str`
- `target_date: str | null`
- `start_date: str | null`
- `end_date: str | null`
- `target_time_range: str | null`
- `activity: str | null`
- `requested_attributes: list[str]`
- `conditional_rule: str | null`
- `threshold_rule: str | null`
- `followup_instruction: str | null`
- `condition_type: str | null`
- `confidence: float`

### Pydantic sketch

```python
from typing import Optional
from pydantic import BaseModel, Field

class IntentExtraction(BaseModel):
    intent: str
    location: str
    target_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    target_time_range: Optional[str] = None
    activity: Optional[str] = None
    requested_attributes: list[str] = Field(default_factory=list)
    conditional_rule: Optional[str] = None
    threshold_rule: Optional[str] = None
    followup_instruction: Optional[str] = None
    condition_type: Optional[str] = None
    confidence: float
```

---

## 1.2 Tool selection schema

Used for P2-B cases.

### Fields
- `tool_name: str`
- `query: str`
- `filters: dict`
- `source_preferences: list[str]`
- `sort_preference: str | null`
- `limit: int`
- `reasoning_summary: str`

### Pydantic sketch

```python
from typing import Optional, Any
from pydantic import BaseModel, Field

class ToolSelection(BaseModel):
    tool_name: str
    query: str
    filters: dict[str, Any] = Field(default_factory=dict)
    source_preferences: list[str] = Field(default_factory=list)
    sort_preference: Optional[str] = None
    limit: int
    reasoning_summary: str
```

---

## 1.3 Constraint summary schema

Used for P2-C cases.

### Fields
- `objective: str`
- `constraints: list[str]`
- `priorities: list[str]`
- `deliverables: list[str]`
- `next_action: str`

### Pydantic sketch

```python
from pydantic import BaseModel, Field

class ConstraintSummary(BaseModel):
    objective: str
    constraints: list[str] = Field(default_factory=list)
    priorities: list[str] = Field(default_factory=list)
    deliverables: list[str] = Field(default_factory=list)
    next_action: str
```

---

# 2. Phase 3 agent loop schema

Phase 3 evaluates simplified agent loop behavior.

We use a single action envelope with action-specific argument shapes.

---

## 2.1 Action types

Allowed actions:
- `search_docs`
- `lookup_weather`
- `lookup_calendar`
- `final_answer`

---

## 2.2 Action argument schemas

### `search_docs`

Fields:
- `query: str`

```python
from typing import Literal
from pydantic import BaseModel

class SearchDocsArgs(BaseModel):
    query: str
```

---

### `lookup_weather`

Fields:
- `city: str`
- `date: str`

```python
class LookupWeatherArgs(BaseModel):
    city: str
    date: str
```

---

### `lookup_calendar`

Fields:
- `date: str`

```python
class LookupCalendarArgs(BaseModel):
    date: str
```

---

### `final_answer`

Fields:
- `answer: str`
- `confidence: float`

```python
class FinalAnswerArgs(BaseModel):
    answer: str
    confidence: float
```

---

## 2.3 Action envelope schema

### Required fields
- `thought: str`
- `action: Literal[...]`
- `args: object`
- `done: bool`

### Recommended validation rules
- If `action == "final_answer"`, then `done` should be `True`
- If `action != "final_answer"`, then `done` should be `False`
- `thought` should be short, single sentence, non-empty
- `confidence` should be in `[0, 1]`

---

## 2.4 Preferred Pydantic implementation

Recommended approach: discriminated union on `action`.

```python
from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field

class SearchDocsStep(BaseModel):
    thought: str
    action: Literal["search_docs"]
    args: SearchDocsArgs
    done: Literal[False] = False

class LookupWeatherStep(BaseModel):
    thought: str
    action: Literal["lookup_weather"]
    args: LookupWeatherArgs
    done: Literal[False] = False

class LookupCalendarStep(BaseModel):
    thought: str
    action: Literal["lookup_calendar"]
    args: LookupCalendarArgs
    done: Literal[False] = False

class FinalAnswerStep(BaseModel):
    thought: str
    action: Literal["final_answer"]
    args: FinalAnswerArgs
    done: Literal[True] = True

AgentStep = Annotated[
    Union[
        SearchDocsStep,
        LookupWeatherStep,
        LookupCalendarStep,
        FinalAnswerStep,
    ],
    Field(discriminator="action"),
]
```

This gives us:
- strict action validation
- strict args validation
- realistic agent-loop schema constraints
- useful failure modes for retry testing

---

# 3. JSON schema behavior by benchmark group

## Group A — Prompt-only JSON
- Model gets plain prompt instructions describing desired JSON structure.
- No formal schema is passed to model.
- Local parsing may still attempt `json.loads`.
- For fairness, post-hoc schema validation may still be recorded as a metric.

## Group B — Schema-constrained output
- Model receives explicit schema or provider-level structured output definition.
- Local validation is still recorded.
- No retry loop in Phase 2.

## Group C — Schema + Pydantic + retry
- Same schema as Group B.
- Local Pydantic validation is mandatory.
- On validation failure, retry with a corrective message.
- Used mainly in Phase 3 and optionally in Phase 2.

---

# 4. Failure categories to record

When validation fails, record the failure category.

## Suggested categories
- `not_json`
- `json_parse_error`
- `missing_field`
- `wrong_type`
- `invalid_enum`
- `invalid_done_flag`
- `invalid_args_shape`
- `extra_unexpected_structure`
- `empty_output`
- `other_validation_error`

This will help explain whether schema constraints improve success because they reduce a particular error type.

---

# 5. Recommended future extension

If the first benchmark shows meaningful differences, extend the schema complexity in a second round:

- nested filtering objects
- optional lists of sub-steps
- tool-call IDs
- observation summarization schemas
- multi-action planning schemas

For the first round, keep the current schemas fixed to reduce variance.
