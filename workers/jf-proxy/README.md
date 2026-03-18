# JF Proxy Worker

A Cloudflare worker that acts as a proxy server for the Jesus Film website, handling requests and managing failover to error pages.

## How It Works

The worker sits in front of the Jesus Film website and:

1. Forwards incoming requests to the configured destination based on path and cookie matching
2. Routes `/watch` paths with `EXPERIMENTAL` cookie to `WATCH_PROXY_DEST`
3. Routes all other paths to `RESOURCES_PROXY_DEST`
4. Handles error cases (404, 500) by serving a custom error page
5. Preserves request properties (method, headers, body)
6. Sanitizes response headers

### Request Flow

1. Request comes in to the worker
2. Worker checks if the path starts with `/watch` and if the request has an `EXPERIMENTAL` cookie
3. Worker modifies the hostname to the appropriate destination:
   - `WATCH_PROXY_DEST` for `/watch` paths with `EXPERIMENTAL` cookie
   - `RESOURCES_PROXY_DEST` for all other paths
4. Worker forwards the request with all original properties
5. If the response is a 404 or 500:
   - Attempts to serve `/not-found.html`
   - Falls back to a basic error message if that fails
6. Returns the response with sanitized headers

### Path Routing

The worker supports cookie-based routing for watch paths:

- **Watch Paths with EXPERIMENTAL Cookie**: Routes `/watch/*` paths with `EXPERIMENTAL` cookie to `WATCH_PROXY_DEST`
- **Watch Paths without EXPERIMENTAL Cookie**: Routes `/watch/*` paths without the cookie to `RESOURCES_PROXY_DEST`
- **All Other Paths**: Routes all non-`/watch` paths to `RESOURCES_PROXY_DEST` regardless of cookies

## Configuration

The worker is configured through environment variables:

```toml
# Required
RESOURCES_PROXY_DEST="www.example.com"  # The default destination hostname to proxy requests to

# Optional - for cookie-based watch routing
WATCH_PROXY_DEST="watch.example.com"  # Destination for /watch paths with EXPERIMENTAL cookie
```

### Routing Examples

| Path               | Cookie              | Destination            |
| ------------------ | ------------------- | ---------------------- |
| `/watch`           | `EXPERIMENTAL=true` | `WATCH_PROXY_DEST`     |
| `/watch`           | (none)              | `RESOURCES_PROXY_DEST` |
| `/watch/video/123` | `EXPERIMENTAL=true` | `WATCH_PROXY_DEST`     |
| `/watch/video/123` | `other=value`       | `RESOURCES_PROXY_DEST` |
| `/api/test`        | `EXPERIMENTAL=true` | `RESOURCES_PROXY_DEST` |
| `/resources`       | (any)               | `RESOURCES_PROXY_DEST` |

### Environment-Specific Configuration

The worker supports different configurations for development, staging, and production environments. Each environment can specify:

- Custom routes and domains
- Different proxy destinations
- Environment-specific settings

The worker handles routing for various website sections including:

- Watch pages (with cookie-based routing)
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

- **404 Not Found**: Attempts to serve `/not-found.html`
- **500 Server Error**: Attempts to serve `/not-found.html`
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
- Cookie-based routing for `/watch` paths
- Error handling (404, 500)
- Network error handling
- Missing configuration handling
- Header sanitization

Run the tests with:

```bash
nx test workers/jf-proxy
```

### Test Cases

The test suite includes verification for:

- Successful proxying of requests
- Cookie-based routing: `/watch` paths with `EXPERIMENTAL` cookie route to `WATCH_PROXY_DEST`
- Cookie-based routing: `/watch` paths without cookie route to `RESOURCES_PROXY_DEST`
- Non-`/watch` paths always route to `RESOURCES_PROXY_DEST` regardless of cookies
- Handling of 404 responses with custom error page
- Handling of 500 responses with custom error page
- Network errors during main request
- Network errors during error page fetch
- Missing configuration handling
