# GraphQL Subscriptions over Server-Sent Events (SSE)

This document explains how to implement GraphQL subscriptions using Server-Sent Events (SSE) instead of WebSockets in the journeys-admin application.

## Why SSE over WebSockets?

### Advantages of SSE:

- **Simpler Infrastructure**: No need for WebSocket servers or special proxy configurations
- **Better Firewall/Proxy Support**: SSE uses standard HTTP, works through corporate firewalls
- **Automatic Reconnection**: Built-in browser reconnection logic
- **HTTP/2 Multiplexing**: Better performance with HTTP/2
- **Easier Authentication**: Uses standard HTTP headers
- **Stateless**: Each request is independent, easier to scale

### Disadvantages:

- **Unidirectional**: Only server-to-client communication (fine for subscriptions)
- **Browser Limits**: Limited concurrent connections per domain (usually 6)

## Implementation Options

### Option 1: Apollo Client Built-in Multipart HTTP (Recommended)

Apollo Client 3.7.11+ supports multipart HTTP subscriptions out of the box. This is the simplest approach and requires minimal changes.

**Current Implementation** (in `apolloClient.ts`):

```typescript
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
  // Enable multipart subscriptions over HTTP (SSE)
  fetchOptions: {
    // This enables text streaming for multipart responses
    reactNative: { textStreaming: true }
  }
})

const authLink = setContext(async (_, { headers }) => {
  return {
    headers: {
      ...headers,
      // Accept multipart responses for subscriptions
      Accept: 'multipart/mixed; boundary="graphql"; subscriptionSpec=1.0, application/json'
    }
  }
})
```

**Benefits:**

- No additional dependencies
- Works with existing Apollo Client setup
- Automatic fallback to regular HTTP for non-subscription operations
- Built-in error handling and reconnection

### Option 2: Explicit SSE with `graphql-sse` Library

For more control over the SSE connection, you can use the `graphql-sse` library.

**Installation:**

```bash
npm install graphql-sse
```

**Implementation** (see `apolloClientSSE.ts`):

```typescript
import { createClient } from 'graphql-sse'
import { split } from '@apollo/client'

// Create SSE client
const sseClient = createClient({
  url: 'http://localhost:4000/graphql/stream',
  headers: () => ({
    Authorization: `Bearer ${token}`
  })
})

// Split link: SSE for subscriptions, HTTP for queries/mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  sseLink,
  httpLink
)
```

**Benefits:**

- More explicit control over SSE connection
- Custom headers and connection options
- Better debugging capabilities
- Can handle custom SSE protocols

### Option 3: Custom EventSource Implementation

For maximum control, you can implement a custom SSE link using the browser's EventSource API.

```typescript
import { ApolloLink, Observable } from '@apollo/client'

const sseLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/subscriptions`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      observer.next(data)
    }

    eventSource.onerror = (error) => {
      observer.error(error)
    }

    return () => eventSource.close()
  })
})
```

## Server-Side Requirements

Your GraphQL server needs to support SSE subscriptions. Popular options include:

### 1. GraphQL Yoga with SSE

```typescript
import { createYoga } from 'graphql-yoga'

const yoga = createYoga({
  schema,
  // Enable SSE subscriptions
  subscriptions: {
    protocol: 'SSE'
  }
})
```

### 2. Apollo Server with SSE Plugin

```typescript
import { ApolloServer } from '@apollo/server'
import { makeExecutableSchema } from '@graphql-tools/schema'

const server = new ApolloServer({
  schema: makeExecutableSchema({ typeDefs, resolvers }),
  plugins: [
    // Add SSE subscription plugin
    require('apollo-server-plugin-sse')()
  ]
})
```

### 3. Custom Express SSE Endpoint

```typescript
app.get('/graphql/subscriptions', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  // Handle GraphQL subscription
  const subscription = subscribe({
    schema,
    document: parse(req.query.query),
    variableValues: JSON.parse(req.query.variables || '{}')
  })

  subscription.then((asyncIterator) => {
    for await (const result of asyncIterator) {
      res.write(`data: ${JSON.stringify(result)}\n\n`)
    }
  })
})
```

## Current Subscription Usage

The `journeyAiTranslateCreate` subscription is currently implemented as:

```typescript
const { data, error } = useJourneyAiTranslateSubscription({
  variables: translationVariables,
  skip: !translationVariables,
  onData: ({ data }) => {
    if (data.data?.journeyAiTranslateCreate) {
      // Handle translation completion
    }
  }
})
```

This will work seamlessly with SSE once the Apollo Client is configured properly.

## Testing SSE Subscriptions

### 1. Browser DevTools

- Open Network tab
- Look for requests with `text/event-stream` content type
- Monitor the EventStream tab for real-time data

### 2. curl Testing

```bash
curl -N -H "Accept: text/event-stream" \
  "http://localhost:4000/graphql/subscriptions?query=subscription{...}"
```

### 3. Browser EventSource Testing

```javascript
const eventSource = new EventSource('/graphql/subscriptions')
eventSource.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data))
}
```

## Migration Steps

1. **Update Apollo Client** (already done in `apolloClient.ts`)
2. **Verify Server Support** - Ensure your GraphQL server supports multipart HTTP or SSE
3. **Test Subscriptions** - Verify existing subscriptions work with new configuration
4. **Monitor Performance** - Check for any performance differences
5. **Fallback Strategy** - Keep WebSocket configuration as backup if needed

## Troubleshooting

### Common Issues:

1. **CORS Problems**: Ensure server allows SSE requests
2. **Proxy Issues**: Configure proxies to handle streaming responses
3. **Connection Limits**: Browser limits concurrent SSE connections
4. **Reconnection**: Implement proper error handling and reconnection logic

### Debug Commands:

```bash
# Check if server supports SSE
curl -H "Accept: text/event-stream" http://localhost:4000/graphql

# Monitor network traffic
# Use browser DevTools Network tab with "EventStream" filter
```

## Performance Considerations

- **Connection Pooling**: SSE connections are persistent, monitor resource usage
- **Reconnection Strategy**: Implement exponential backoff for failed connections
- **Memory Management**: Ensure proper cleanup of event listeners
- **Scaling**: Consider server-side connection limits and load balancing

## Conclusion

The current implementation uses Apollo Client's built-in multipart HTTP support, which provides SSE-like functionality with minimal configuration changes. This approach is recommended for most use cases as it's well-tested, maintained by the Apollo team, and provides good performance characteristics.

For more advanced use cases requiring custom SSE protocols or specific connection handling, the `graphql-sse` library or custom EventSource implementations can be used.
