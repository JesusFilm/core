# AI Agents API Documentation

The Studio app supports dual AI providers: **OpenRouter** (existing) and **Apologist** (new RAG-enabled provider). This document explains how to use the unified API endpoint to interact with both providers.

## Table of Contents

- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [API Endpoint](#api-endpoint)
- [Provider Selection](#provider-selection)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Caching](#caching)
- [Usage Examples](#usage-examples)
- [Provider Comparison](#provider-comparison)

## Overview

The `/api/ai/respond` endpoint provides a unified interface to both AI providers:

- **OpenRouter**: Broad model access via multiple providers (OpenAI, Anthropic, etc.)
- **Apologist**: Specialized Christian theology RAG system with biblical knowledge integration

The API maintains identical request/response schemas regardless of provider, ensuring frontend compatibility.

## Environment Setup

### Required Environment Variables

```bash
# OpenRouter (existing)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_APP_TITLE="JF Studio"

# Apologist (new)
APOLOGIST_AGENT_DOMAIN=your-agent-domain.gospel.bot
APOLOGIST_API_KEY=your_apologist_api_key

# Optional
APOLOGIST_DEFAULT_MODEL=openai/gpt-4o  # Defaults to openai/gpt-4o
```

## API Endpoint

```
POST /api/ai/respond
```

### Headers

```json
{
  "Content-Type": "application/json"
}
```

## Provider Selection

Specify the provider using the `provider` field in the request body:

```json
{
  "provider": "openrouter",  // Default: uses OpenRouter
  "provider": "apologist"    // Uses Apologist RAG system
}
```

If `provider` is omitted or invalid, defaults to `"openrouter"`.

## Request Format

### Basic Chat Request

```json
{
  "provider": "apologist",
  "messages": [
    {
      "role": "user",
      "content": "How can a good God allow evil?"
    }
  ]
}
```

### Advanced Request with All Options

```json
{
  "provider": "apologist",
  "model": "openai/gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful Christian theology assistant."
    },
    {
      "role": "user",
      "content": "Explain the concept of atonement."
    }
  ],
  "temperature": 0.7,
  "top_p": 0.9,
  "max_output_tokens": 1024,
  "cache_ttl": 300,
  "metadata": {
    "anonymous": false,
    "language": "en",
    "translation": "esv"
  },
  "response_format": {
    "type": "json"
  }
}
```

### Legacy Input Format (Still Supported)

```json
{
  "provider": "apologist",
  "input": "How can a good God allow evil?",
  "model": "openai/gpt-4o",
  "temperature": 0.7
}
```

## Request Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `provider` | string | `"openrouter"` or `"apologist"` | `"openrouter"` |
| `messages` | array | OpenAI-style message array | Required (or `input`) |
| `input` | string | Simple text prompt (legacy) | Optional |
| `model` | string | Model identifier | Provider default |
| `temperature` | number | Sampling temperature (0.0-1.0) | Provider default |
| `top_p` | number | Nucleus sampling (0.0-1.0) | Provider default |
| `max_output_tokens` | number | Max tokens to generate | Provider default |
| `max_tokens` | number | Alias for `max_output_tokens` | Provider default |
| `cache_ttl` | number | Cache TTL in seconds | No caching |
| `metadata` | object | Provider-specific metadata | Optional |
| `response_format` | object | Response format specification | Optional |

### Apologist-Specific Metadata

```json
{
  "metadata": {
    "anonymous": false,
    "session": "sess_123",
    "conversation": "thread_1",
    "language": "en",
    "translation": "esv",
    "max_memories": 5
  }
}
```

## Response Format

### Success Response

```json
{
  "id": "ap-1699123456789",
  "model": "openai/gpt-4o",
  "created": 1699123456,
  "provider": "apologist",
  "finish_reason": "stop",
  "warnings": [],
  "usage": {
    "input_tokens": 25,
    "output_tokens": 150,
    "total_tokens": 175
  },
  "output_text": "The question of how a good God can allow evil...",
  "output": [
    {
      "id": "ap-1699123456789-msg-0",
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "The question of how a good God can allow evil..."
        }
      ]
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique response identifier |
| `model` | string | Model used for generation |
| `created` | number | Unix timestamp |
| `provider` | string | `"openrouter"` or `"apologist"` |
| `finish_reason` | string | Completion reason (`"stop"`, `"length"`, etc.) |
| `warnings` | array | Any warnings from the provider |
| `usage` | object | Token usage statistics |
| `output_text` | string | Raw generated text |
| `output` | array | Structured output array |

## Error Handling

### Provider Errors

```json
{
  "error": "Apologist request failed",
  "details": "Invalid API key"
}
```

### Validation Errors

```json
{
  "error": "Request body must include messages or input."
}
```

### Configuration Errors

```json
{
  "error": "APOLOGIST_AGENT_DOMAIN is not configured on the server."
}
```

### Common HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `405`: Method Not Allowed (not POST)
- `500`: Server Error (configuration or provider issues)

## Caching

### Cache TTL Options

You can enable response caching in three ways:

1. **Request Body**: `"cache_ttl": 300`
2. **Query Parameter**: `?cache_ttl=300`
3. **Header**: `x-cache-ttl: 300`

```bash
# Example with curl
curl -X POST /api/ai/respond \
  -H "Content-Type: application/json" \
  -H "x-cache-ttl: 300" \
  -d '{"provider": "apologist", "messages": [...]}'
```

### Cache Behavior

- Cached responses are only returned if they're fresher than the specified TTL
- No manual cache invalidation needed
- Improves performance for repeated similar queries
- Particularly useful for Apologist's RAG system

## Usage Examples

### JavaScript/TypeScript

```javascript
// Basic usage
const response = await fetch('/api/ai/respond', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'apologist',
    messages: [
      { role: 'user', content: 'What is grace?' }
    ]
  })
});

const data = await response.json();
console.log(data.output_text);
```

### Using with Existing Hook

```javascript
// In your component
const { processContentWithAI } = useAiContent({
  // ... existing options
});

// This will use OpenRouter by default
await processContentWithAI('Explain the Trinity');

// To use Apologist, modify the hook call or add provider to request
await fetch('/api/ai/respond', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'apologist',
    messages: [
      { role: 'user', content: 'Explain the Trinity' }
    ]
  })
});
```

### cURL Examples

```bash
# Apologist chat
curl -X POST http://localhost:3000/api/ai/respond \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "apologist",
    "messages": [{"role": "user", "content": "How can a good God allow evil?"}]
  }'

# OpenRouter chat (default)
curl -X POST http://localhost:3000/api/ai/respond \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello world"}]
  }'

# With caching
curl -X POST http://localhost:3000/api/ai/respond \
  -H "Content-Type: application/json" \
  -H "x-cache-ttl: 300" \
  -d '{
    "provider": "apologist",
    "messages": [{"role": "user", "content": "What is faith?"}]
  }'
```

## Provider Comparison

| Feature | OpenRouter | Apologist |
|---------|------------|----------|
| **Models** | 100+ models from multiple providers | OpenAI GPT models |
| **Specialization** | General AI | Christian theology RAG |
| **Knowledge Base** | Training data | Biblical texts + theology resources |
| **Cost** | Variable by model | Fixed pricing |
| **Streaming** | ✅ Supported | ❌ Not yet implemented |
| **Caching** | ❌ Not supported | ✅ TTL-based caching |
| **Metadata** | Basic | Rich theology-specific |
| **Response Format** | Text/JSON | Text/JSON |

## Best Practices

1. **Provider Selection**: Use Apologist for theology questions, OpenRouter for general AI tasks
2. **Caching**: Enable for repeated queries, especially with Apologist's RAG system
3. **Error Handling**: Always check response status and handle provider-specific errors
4. **Rate Limiting**: Be mindful of API rate limits for both providers
5. **Metadata**: Leverage Apologist's rich metadata for better context

## Future Enhancements

- **Streaming Support**: Add streaming responses for both providers
- **Search API**: Expose Apologist's `/api/v1/search` endpoint for RAG queries
- **Provider Auto-selection**: Automatic provider routing based on content analysis
- **Response Caching**: Built-in caching layer for frequently asked questions

## Troubleshooting

### Common Issues

1. **"Provider not configured"**: Check environment variables are set
2. **"Invalid messages"**: Ensure messages array follows OpenAI format
3. **"Network timeout"**: Provider may be experiencing issues
4. **"Rate limited"**: Too many requests, implement backoff

### Debug Mode

Enable detailed logging by checking server console output for:
- Provider selection
- Request parameters
- Response details
- Token usage statistics

---

For questions or issues, refer to the provider documentation:
- [OpenRouter API](https://openrouter.ai/docs)
- [Apologist API](https://apologist.ai/docs) (internal documentation)
