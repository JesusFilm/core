# JF Proxy Worker

A Cloudflare worker that acts as a proxy server for the Jesus Film website, handling requests and managing its legacy Error Fallback.

## How It Works

The worker sits in front of the Jesus Film website and:

1. Forwards incoming requests to the configured destination based on the path
2. Routes `/watch` paths to `WATCH_PROXY_DEST`
3. Routes `/journeys`, `/resources`, and other worker-owned paths to `RESOURCES_PROXY_DEST`
4. Preserves Watch 404 responses and serves the legacy custom error page for
   non-Watch GET 404s plus all GET 500s
5. Preserves request properties (method, headers, body)
6. Sanitizes response headers

### Request Flow

1. Request comes in to the worker
2. Worker checks if the path starts with `/watch`
3. Worker modifies the hostname to the appropriate destination:
   - `WATCH_PROXY_DEST` for `/watch` paths
   - `RESOURCES_PROXY_DEST` for all other paths
4. Worker forwards the request with all original properties
5. If a Watch response is a 404, returns it unchanged
6. If a non-Watch GET response is a 404 or any GET response is a 500:
   - Attempts to serve `/not-found.html`
   - Falls back to a basic error message if that fetch fails
7. Returns the response with sanitized headers

### Path Routing

The worker routes requests by path:

- **Watch Paths**: Routes `/watch` and its subpaths to `WATCH_PROXY_DEST`
- **Resources Paths**: Routes `/journeys` and its subpaths, plus the exact `/resources` and `/resources/` paths, to `RESOURCES_PROXY_DEST`
- **Other Worker Paths**: Routes other non-`/watch` paths claimed by this worker to `RESOURCES_PROXY_DEST`

## Configuration

The worker is configured through environment variables:

```toml
# Required
RESOURCES_PROXY_DEST="www.example.com"  # The default destination hostname to proxy requests to

WATCH_PROXY_DEST="watch.example.com"  # Destination for /watch paths
```

### Routing Examples

| Path               | Destination            |
| ------------------ | ---------------------- |
| `/watch`           | `WATCH_PROXY_DEST`     |
| `/watch/video/123` | `WATCH_PROXY_DEST`     |
| `/journeys/123`    | `RESOURCES_PROXY_DEST` |
| `/resources`       | `RESOURCES_PROXY_DEST` |
| `/api/test`        | `RESOURCES_PROXY_DEST` |

### Environment-Specific Configuration

The worker supports different configurations for development, staging, and production environments. Each environment can specify:

- Custom routes and domains
- Different proxy destinations
- Environment-specific settings

The worker handles routing for various website sections including:

- Watch pages
- Journeys
- Calendar
- Products
- Resources
- Binary files
- API endpoints
- Next.js assets

## Development

### Prerequisites

- Node.js
- nx CLI
- Wrangler CLI (Cloudflare Workers)

### Local Development

1. Start the worker locally:

   ```bash
   nx serve workers/jf-proxy
   ```

2. Run tests:
   ```bash
   nx test workers/jf-proxy
   ```

### Error Handling

The worker handles several types of errors:

- **Watch 404 Not Found**: Returns the Watch destination response unchanged
- **Non-Watch GET 404 Not Found**: Attempts to serve `/not-found.html`
- **GET 500 Server Error**: Attempts to serve `/not-found.html`
- **Network Errors**: Returns 503 Service Unavailable
- **Not Found Page Errors**: Returns basic 404 message

### Deployment

The worker is automatically deployed using GitHub Actions:

- **Staging Environment**:
  - Triggered by: Pushes to the `stage` branch
  - Deploys to: `develop.jesusfilm.org`
  - Configuration: Uses staging environment variables

- **Production Environment**:
  - Triggered by: Pushes to the `main` branch
  - Deploys to: `www.jesusfilm.org`
  - Configuration: Uses production environment variables

The GitHub Actions workflow:

1. Runs tests
2. Builds the worker
3. Deploys to the appropriate environment

## Testing

The test suite covers:

- Basic request proxying
- Path-based routing for `/watch`, `/journeys`, and `/resources`
- Error handling (404, 500)
- Network error handling
- Missing configuration handling
- Header sanitization

Run the tests with:

```bash
pnpm exec vitest run --config workers/jf-proxy/vitest.config.ts workers/jf-proxy/src --coverage=false
```

### Test Cases

The test suite includes verification for:

- Successful proxying of requests
- `/watch` paths route to `WATCH_PROXY_DEST` regardless of cookies
- `/journeys` and `/resources` paths route to `RESOURCES_PROXY_DEST`
- Other non-`/watch` paths route to `RESOURCES_PROXY_DEST`
- Passing through Watch 404 responses
- Handling non-Watch 404 responses with the legacy custom error page
- Handling of 500 responses with custom error page
- Network errors during main request
- Network errors during error page fetch
- Missing configuration handling
