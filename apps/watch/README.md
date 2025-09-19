# Watch application

## Streaming chat API

The Watch app exposes a streaming chat endpoint at `/api/chat`. The handler
mirrors the Journeys application API and streams Apologist responses formatted
for the Vercel AI SDK UI helpers. Requests should include the following JSON
shape:

```json
{
  "messages": [
    {
      "parts": [
        { "type": "text", "text": "Hello" }
      ]
    }
  ],
  "contextText": "Optional additional context rendered in the system prompt",
  "sessionId": "Identifier used for Langfuse traces",
  "journeyId": "Optional metadata identifier",
  "userId": "User identifier passed through to Langfuse"
}
```

The response is streamed using `text/event-stream` semantics so the Watch
front-end receives incremental updates while `streamText` is running.

## Required environment variables

Add the following variables to the Watch runtime (e.g., Doppler, Vercel, or a
local `.env` file) before invoking `/api/chat`:

| Variable | Description |
| --- | --- |
| `APOLOGIST_API_KEY` | API key for the Apologist OpenAI-compatible endpoint. |
| `APOLOGIST_API_URL` | Base URL for the Apologist service. |
| `LANGFUSE_SECRET_KEY` | Secret key used by `@langfuse/client`. |
| `LANGFUSE_PUBLIC_KEY` | Public key used by Langfuse tracing dashboards. |
| `LANGFUSE_HOST` | Langfuse host (e.g., `https://cloud.langfuse.com`). |

The instrumentation bootstrap automatically populates
`LANGFUSE_TRACING_ENVIRONMENT` based on the deployment environment, matching the
Journeys application behaviour. Ensure these variables are available in any
hosting environment before deploying the chat route.

## Local development

1. Ensure the environment variables above are defined.
2. Start the Watch dev server:

   ```bash
   pnpm dlx nx run watch:serve
   ```

3. Send a test request to `/api/chat` with a valid payload to verify streaming
   behaviour. A simple example using `curl` (replace tokens as needed):

   ```bash
   curl -N -X POST http://localhost:4300/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [{"parts": [{"type": "text", "text": "Hello"}]}],
       "sessionId": "local-dev",
       "userId": "tester"
     }'
   ```

The command streams the Apologist completion in the terminal and confirms that
Langfuse spans are flushed when the request completes.
