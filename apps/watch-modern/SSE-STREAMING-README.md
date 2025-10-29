# SSE Streaming for AI Responses in Watch-Modern

This document describes the Server-Sent Events (SSE) implementation for streaming AI responses in the watch-modern app.

## Overview

The streaming implementation allows AI responses to be displayed progressively as tokens arrive, rather than waiting for the complete response. This provides a better user experience with immediate feedback.

## Architecture

### Server Side

#### API Endpoints

1. **POST `/api/ai/stream`** - Create streaming session
   - Accepts the same payload as `/api/ai/respond`
   - Returns `{ id: string }` with session ID
   - Validates request and stores session data

2. **GET `/api/ai/stream?id={sessionId}`** - Start SSE stream
   - Streams AI response using Server-Sent Events
   - Sends `text/event-stream` content type
   - Handles both OpenRouter and Apologist providers

#### Session Storage

- In-memory Map (consider Redis for multi-instance deployments)
- Stores request parameters, messages, and options
- Session deleted after streaming starts for security

### Client Side

#### Hooks

1. **`useEventSource`** - Generic SSE consumer
   - Handles EventSource lifecycle
   - Manages reconnection and error handling
   - Dispatches typed events to handlers

2. **`useAiStream`** - AI-specific streaming orchestrator
   - Manages session creation via POST
   - Consumes SSE stream
   - Accumulates text and provides streaming state

#### UI Integration

- **Streaming Toggle**: Zap icon button in MainPromptBlock
- **Progressive Rendering**: Text appears token-by-token during streaming
- **Fallback**: Non-streaming mode remains available
- **State Management**: Seamlessly switches between streaming and regular responses

## SSE Protocol

### Event Types

- **`open`**: `{"id": "session-id"}` - Connection established
- **`delta`**: `{"text": "token"}` - Individual text token/chunk
- **`usage`**: `{"input_tokens": 12, "output_tokens": 34, "total_tokens": 46}` - Token usage
- **`message`**: Full message object (same as `/api/ai/respond` response)
- **`error`**: `{"message": "error description"}` - Error occurred
- **`done`**: `{}` - Stream completed successfully

### Heartbeat

- Server sends `:keep-alive` comments every 15 seconds
- Prevents connection timeouts
- Client ignores comment events

## Usage

### Basic Streaming

```typescript
import { useAiStream } from '../hooks/useAiStream'

function MyComponent() {
  const { startStream, text, isStreaming, error } = useAiStream()

  const handleSubmit = async () => {
    await startStream({
      messages: [{ role: 'user', content: 'Hello!' }],
      provider: 'openrouter'
    })
  }

  return (
    <div>
      <button onClick={handleSubmit} disabled={isStreaming}>
        {isStreaming ? 'Streaming...' : 'Send'}
      </button>
      {error && <div>Error: {error}</div>}
      <div>{text}</div>
    </div>
  )
}
```

### Advanced Usage with Custom Handlers

```typescript
const { startStream, chunks, usage, cancel } = useAiStream()

// Start stream
await startStream({ /* options */ })

// Access individual chunks for fine-grained control
chunks.forEach(chunk => {
  console.log('Received chunk:', chunk.text, 'at', chunk.timestamp)
})

// Cancel if needed
cancel()
```

## Provider Support

### OpenRouter
- Uses `@ai-sdk/openai` with `streamText()`
- Maps streaming deltas to SSE `delta` events
- Fully supported with token usage tracking

### Apologist
- Attempts streaming if server supports `text/event-stream`
- Falls back to single-shot response if streaming unavailable
- Documented fallback behavior

## Error Handling

### Network Errors
- Automatic fallback to non-streaming mode
- Error messages displayed to user
- Graceful degradation maintains functionality

### Streaming Errors
- SSE `error` events trigger fallback
- Connection issues handled with retry logic (in useEventSource)
- Server-side errors propagated to client

## Configuration

### Environment Variables
- `OPENROUTER_API_KEY` - Required for OpenRouter streaming
- `APOLOGIST_AGENT_DOMAIN` - Required for Apologist streaming
- `APOLOGIST_API_KEY` - Required for Apologist streaming

### Feature Flags
- Streaming enabled via toggle in UI
- Default state: disabled (for compatibility)
- Can be controlled via local storage or env vars

## Testing

### Manual Testing
1. Enable streaming toggle (Zap icon)
2. Submit a prompt
3. Observe progressive text rendering
4. Verify completion and token counting

### Unit Testing
- Mock EventSource for `useEventSource` tests
- Test event parsing and state management
- Verify error handling and reconnection logic

### Integration Testing
- End-to-end streaming with mock server
- Verify session lifecycle
- Test provider fallbacks

## Performance Considerations

### Memory Usage
- Session data stored in memory (consider Redis for production)
- Automatic cleanup on stream completion/error
- Client-side text accumulation (consider virtual scrolling for very long responses)

### Connection Management
- Single SSE connection per streaming request
- Automatic cleanup on component unmount
- Heartbeat prevents timeout issues

## Future Enhancements

### Planned Features
- Streaming for image analysis results
- Real-time progress indicators
- Streaming cancellation with immediate feedback
- Advanced retry logic with exponential backoff

### Potential Optimizations
- Compression for large payloads
- Binary streaming for non-text content
- Connection pooling for multiple concurrent streams
- Caching layer for repeated requests

## Troubleshooting

### Common Issues

**Streaming doesn't start**
- Check browser EventSource support
- Verify API keys and provider configuration
- Check network/firewall allows SSE connections

**Text appears slowly**
- Network latency affects token arrival
- Large prompts may have initial processing delay
- Consider chunking strategy optimization

**Connection drops**
- Check heartbeat configuration
- Verify server keep-alive settings
- Consider CDN/proxy SSE support

**Fallback not working**
- Ensure non-streaming `/api/ai/respond` still functional
- Check error handling in streaming logic
- Verify graceful degradation implementation

## Related Files

- `pages/api/ai/stream.ts` - SSE API endpoints
- `hooks/useEventSource.ts` - Generic SSE consumer
- `hooks/useAiStream.ts` - AI streaming orchestrator
- `components/newPage/MainPromptBlock.tsx` - UI with streaming toggle
- `pages/new.tsx` - Main integration point
