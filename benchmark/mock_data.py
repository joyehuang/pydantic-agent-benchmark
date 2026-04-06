WEATHER_DATA = {
    ('Melbourne', '2026-04-10'): {'condition': 'Rain', 'temp_low': 12, 'temp_high': 18},
    ('Melbourne', '2026-04-11'): {'condition': 'Cloudy', 'temp_low': 11, 'temp_high': 16},
    ('Sydney', '2026-04-10'): {'condition': 'Sunny', 'temp_low': 18, 'temp_high': 25},
}

CALENDAR_DATA = {
    '2026-04-10': [
        {'title': 'Client meeting', 'time': '14:00', 'type': 'outdoor'},
        {'title': 'Team sync', 'time': '16:30', 'type': 'indoor'},
    ],
    '2026-04-11': [
        {'title': 'Brunch', 'time': '10:00', 'type': 'outdoor'},
    ],
}

DOC_SNIPPETS = {
    'api rate limit': [
        'API rate limit: 60 requests per minute per API key.',
        'If the limit is exceeded, return 429 and back off exponentially.',
    ],
    'structured output and function calling': [
        'Structured output constrains the response shape directly.',
        'Function calling asks the model to emit tool arguments for a named callable.',
    ],
    'retry policy': [
        'Retry only on transient failures.',
        'Use capped exponential backoff and log all retries.',
    ],
}
