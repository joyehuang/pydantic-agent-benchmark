from typing import Annotated, Any, Literal, Optional, Union

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


class ToolSelection(BaseModel):
    tool_name: str
    query: str
    filters: dict[str, Any] = Field(default_factory=dict)
    source_preferences: list[str] = Field(default_factory=list)
    sort_preference: Optional[str] = None
    limit: int
    reasoning_summary: str


class ConstraintSummary(BaseModel):
    objective: str
    constraints: list[str] = Field(default_factory=list)
    priorities: list[str] = Field(default_factory=list)
    deliverables: list[str] = Field(default_factory=list)
    next_action: str


class SearchDocsArgs(BaseModel):
    query: str


class LookupWeatherArgs(BaseModel):
    city: str
    date: str


class LookupCalendarArgs(BaseModel):
    date: str


class FinalAnswerArgs(BaseModel):
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)


class SearchDocsStep(BaseModel):
    thought: str
    action: Literal['search_docs']
    args: SearchDocsArgs
    done: Literal[False] = False


class LookupWeatherStep(BaseModel):
    thought: str
    action: Literal['lookup_weather']
    args: LookupWeatherArgs
    done: Literal[False] = False


class LookupCalendarStep(BaseModel):
    thought: str
    action: Literal['lookup_calendar']
    args: LookupCalendarArgs
    done: Literal[False] = False


class FinalAnswerStep(BaseModel):
    thought: str
    action: Literal['final_answer']
    args: FinalAnswerArgs
    done: Literal[True] = True


AgentStep = Annotated[
    Union[SearchDocsStep, LookupWeatherStep, LookupCalendarStep, FinalAnswerStep],
    Field(discriminator='action'),
]
