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

### Watch proxy diagnostics

For Watch GET documents (`Accept: text/html`) and RSC requests (`RSC: 1` or
`Accept: text/x-component`), the worker emits JSON console records with
`event: "watch_proxy.fetch"`. RSC requests with `Next-Router-Prefetch: 1` are
classified as `prefetch`; other RSC requests are classified as `rsc`.
`/watch/api`, `/watch/_next`, other paths, and other methods are excluded.

Each fetch emits `outcome: "started"` **before** calling fetch, followed by
`response` or `error` if it settles. `stage` distinguishes the primary `upstream`
from the legacy `fallback`. `elapsed_ms` measures that stage's fetch-to-response
headers time; `status_code` is present only on a response. Response bodies remain
streamed and are not timed or read by the diagnostics. A completed request emits
two records, or four if it uses the fallback. There are no timers, retries, new
headers, or changes to deadlines, routing, caching, or fallback behavior.

`createWatchProxyFetch` returns a named fetch function; creating it does not
start a request. The proxy invokes that function for each upstream/fallback
fetch. Completion logging records timing, status, and a validated request ID;
returning the original response separately lets the proxy stream its body.
The logging helper receives only response metadata, never the response itself.

The only request-specific values in these records are validated correlation IDs:
`ray_id` (16 hex characters from the incoming `CF-Ray`, without its datacenter
suffix) and, when available on a response, `railway_request_id` (up to 64
alphanumeric, underscore, or hyphen characters). The existing proxy continues
forwarding the incoming headers, including `CF-Ray`. These IDs are for log joins,
not metric dimensions. URLs, paths, queries, cookies, authorization, bodies, and
exception messages are not included in these new records.

For a slow or canceled invocation, correlate its Cloudflare Ray ID and
`EventTimestampMs` with these records. A last `upstream/started` record without a
completion identifies the outstanding primary fetch; an `upstream/response` with
500 followed by `fallback/started` identifies a fallback wait. Check invocation
outcome and log delivery before inferring a cancellation from missing records.
Neither a start record nor low Worker CPU proves that Railway accepted the
request, and a response record does not measure body delivery. Use the returned
Railway ID to seek origin/ingress evidence when available.

This is diagnostic instrumentation, not a loading-time fix. It becomes active
only after the change is reviewed and deployed through the normal process.
Assess document/RSC log volume and delivery in the target environment after
activation; asset and media traffic do not produce these records.

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
cd workers/jf-proxy
pnpm exec vitest run --config vitest.config.mts
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
