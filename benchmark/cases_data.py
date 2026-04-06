PHASE2_CASES = [
    {
        "id": "P2-A-1",
        "schema": "intent_extraction",
        "input": "帮我查一下 Melbourne 这周五到周日的天气，如果周六下雨提醒我带伞。",
    },
    {
        "id": "P2-A-2",
        "schema": "intent_extraction",
        "input": "我想看看 Sydney 明天早上适不适合跑步，顺便告诉我温度范围。",
    },
    {
        "id": "P2-A-3",
        "schema": "intent_extraction",
        "input": "下周一帮我查 Brisbane 的天气，如果最高温超过 30 度就提醒我穿轻薄一点。",
    },
    {
        "id": "P2-A-4",
        "schema": "intent_extraction",
        "input": "这个周末 Gold Coast 会不会下雨？如果会，回答里顺便提醒我别安排户外活动。",
    },
    {
        "id": "P2-A-5",
        "schema": "intent_extraction",
        "input": "帮我看一下 Adelaide 周三的天气，重点告诉我风大不大。",
    },
    {
        "id": "P2-B-1",
        "schema": "tool_selection",
        "input": "给我找三家 Melbourne CBD 评分高于 4.5、适合商务晚餐的日料店。",
    },
    {
        "id": "P2-B-2",
        "schema": "tool_selection",
        "input": "帮我查 2024 年之后发布的、关于 multi-agent systems 的论文，最好偏工程实践。",
    },
    {
        "id": "P2-B-3",
        "schema": "tool_selection",
        "input": "找一些适合初学者看的 Pydantic 教程，优先英文官方或高质量博客。",
    },
    {
        "id": "P2-B-4",
        "schema": "tool_selection",
        "input": "给我搜一下澳洲最近关于 AI regulation 的新闻，先给我 5 条。",
    },
    {
        "id": "P2-B-5",
        "schema": "tool_selection",
        "input": "帮我查东京下个月适合看樱花的时间窗口。",
    },
    {
        "id": "P2-C-1",
        "schema": "constraint_summary",
        "input": "我们要做一个 agent benchmark，目标是比较不同 structured output 方法在速度和成功率上的差异。要求先做一个小规模实验，不接真实工具，优先 mock tools，可复现，最后输出成表格。",
    },
    {
        "id": "P2-C-2",
        "schema": "constraint_summary",
        "input": "我想搭一个轻量的研究 demo，预算有限，先在本地跑通，后面再接 API。不要太多工程封装，但日志要清楚，方便复现实验。",
    },
    {
        "id": "P2-C-3",
        "schema": "constraint_summary",
        "input": "这个测试别做太重，不需要大规模 benchmark。重点是看在 agent loop 里面，用 schema 和 pydantic 后成功率有没有提升，以及速度损失大不大。",
    },
    {
        "id": "P2-C-4",
        "schema": "constraint_summary",
        "input": "我需要一个可以快速扩展的基准项目，先支持 Kimi，后面可能加 OpenAI 或 Claude。现在先别做太多 provider 抽象，先把 case 和结果格式统一。",
    },
    {
        "id": "P2-C-5",
        "schema": "constraint_summary",
        "input": "我们希望最后看到每组方法的平均耗时、任务成功率、重试次数，还有按 case 类型拆开的结果。",
    },
]

PHASE3_TASKS = [
    {"id": "P3-A-1", "input": "告诉我 Melbourne 2026-04-10 的天气。", "reference_date": "2026-04-10"},
    {"id": "P3-A-2", "input": "帮我看一下 2026-04-11 我有没有安排。", "reference_date": "2026-04-11"},
    {"id": "P3-B-1", "input": "如果我 2026-04-10 下午有外出安排，而且天气下雨，就提醒我带伞。", "reference_date": "2026-04-10"},
    {"id": "P3-B-2", "input": "看看我 2026-04-11 有没有日程，如果有并且天气温度低于 15 度，就提醒我穿外套。", "reference_date": "2026-04-11"},
    {"id": "P3-B-3", "input": "如果我周五没有安排，就只告诉我天气；如果有安排，就同时告诉我天气和出门建议。", "reference_date": "2026-04-10"},
    {"id": "P3-C-1", "input": "根据产品文档，告诉我 API rate limit 是多少，并总结超限后的处理方式。", "reference_date": "2026-04-10"},
    {"id": "P3-C-2", "input": "根据文档说明，告诉我 structured output 和 function calling 的区别。", "reference_date": "2026-04-10"},
    {"id": "P3-C-3", "input": "从文档里找出 retry policy 的建议，并给我一个一句话总结。", "reference_date": "2026-04-10"},
    {"id": "P3-D-1", "input": "看看那天要不要带伞，顺便说下我有没有安排。", "reference_date": "2026-04-10"},
    {"id": "P3-D-2", "input": "帮我判断明天适不适合出门，如果不适合，告诉我是因为天气还是行程。", "reference_date": "2026-04-11"},
]
