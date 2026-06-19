# JF Proxy Worker

A Cloudflare worker that acts as a proxy server for the Jesus Film website, handling requests and managing failover to error pages.

## How It Works

The worker sits in front of the Jesus Film website and:

1. Forwards incoming requests to the configured destination based on path and cookie matching
2. Routes Forge Watch pages and generated assets to `FORGE_PROXY_DEST`
3. Keeps legacy Watch support paths on `WATCH_PROXY_DEST`
4. Handles error cases (404, 500) by serving a custom error page
5. Preserves request properties (method, headers, body)
6. Sanitizes response headers

### Request Flow

1. Request comes in to the worker
2. Worker checks for explicit Forge Watch and legacy Watch path ownership
3. Worker modifies the hostname to the appropriate destination:
   - `FORGE_PROXY_DEST` for `/forge-watch-static/*` and Forge Watch content pages
   - `WATCH_PROXY_DEST` for legacy Watch support paths and legacy experimental Watch routes
   - `RESOURCES_PROXY_DEST` for default resource and WordPress routes
4. Worker forwards the request with all original properties
5. If the response is a 404 or 500:
   - Attempts to serve `/not-found.html`
   - Falls back to a basic error message if that fails
6. Returns the response with sanitized headers

### Watch Path Routing

Forge public Watch pages live under `/watch/...`. Forge generated static assets live under `/forge-watch-static/_next/static/...`. Legacy Watch keeps `/watch/_next/*` and `/watch/images/*`. The split exists because both apps are Next.js apps and cannot safely share `/watch/_next/*`.

The worker supports explicit routing for shared Watch paths:

- **Forge Watch Static Assets**: Routes `/forge-watch-static/*` to `FORGE_PROXY_DEST`
- **Forge Watch Content Pages**: Routes single video/page/language URLs like `/watch/jesus.html/english.html` to `FORGE_PROXY_DEST`
- **Legacy Watch Support Paths**: Routes `/watch/_next/*` and `/watch/images/*` to `WATCH_PROXY_DEST`
- **Legacy Experimental Watch Paths**: Routes other `/watch/*` paths with the `EXPERIMENTAL` cookie to `WATCH_PROXY_DEST`
- **All Other Paths**: Routes to `RESOURCES_PROXY_DEST`

## Configuration

The worker is configured through environment variables:

```toml
# Required
RESOURCES_PROXY_DEST="www.example.com"  # The default destination hostname to proxy requests to

# Optional - for Forge Watch routing
FORGE_PROXY_DEST="forge.example.com"  # Destination for Forge Watch pages and /forge-watch-static assets

# Optional - for legacy watch routing
WATCH_PROXY_DEST="watch.example.com"  # Destination for legacy Watch support paths and experimental watch routes
```

If `FORGE_PROXY_DEST` is not configured, Forge Watch routes fall back to `RESOURCES_PROXY_DEST` and then to the original request hostname.

Current `wrangler.toml` Forge destination values are placeholders until the real Forge origin hostnames are assigned:

- Development: `localhost:4320`
- Stage: `9136815d-0dbe-4417-9dcd-5406c31ce723.jesusfilm.org`
- Production: `dd541ea7-e468-4159-af6c-25a59cba326c.jesusfilm.org`

### Routing Examples

| Path                                             | Cookie              | Destination            |
| ------------------------------------------------ | ------------------- | ---------------------- |
| `/forge-watch-static/_next/static/chunks/app.js` | (any)               | `FORGE_PROXY_DEST`     |
| `/watch/jesus.html/english.html`                 | (any)               | `FORGE_PROXY_DEST`     |
| `/watch/_next/static/chunks/legacy.js`           | (any)               | `WATCH_PROXY_DEST`     |
| `/watch/_next/image?url=/foo.jpg&w=828&q=75`     | (any)               | `WATCH_PROXY_DEST`     |
| `/watch/images/foo.jpg`                          | (any)               | `WATCH_PROXY_DEST`     |
| `/watch`                                         | `EXPERIMENTAL=true` | `WATCH_PROXY_DEST`     |
| `/watch`                                         | (none)              | `RESOURCES_PROXY_DEST` |
| `/watch/video/123`                               | `EXPERIMENTAL=true` | `WATCH_PROXY_DEST`     |
| `/watch/video/123`                               | `other=value`       | `RESOURCES_PROXY_DEST` |
| `/api/test`                                      | `EXPERIMENTAL=true` | `RESOURCES_PROXY_DEST` |
| `/resources`                                     | (any)               | `RESOURCES_PROXY_DEST` |

### Environment-Specific Configuration

The worker supports different configurations for development, staging, and production environments. Each environment can specify:

- Custom routes and domains
- Different proxy destinations
- Environment-specific settings

The worker handles routing for various website sections including:

- Watch pages, Forge Watch static assets, and legacy Watch support paths
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
- Forge Watch and legacy Watch routing
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
- Forge Watch static assets route to `FORGE_PROXY_DEST`
- Forge Watch content pages route to `FORGE_PROXY_DEST`
- Legacy Watch support paths route to `WATCH_PROXY_DEST`
- Legacy experimental `/watch` paths route to `WATCH_PROXY_DEST`
- Non-`/watch` paths always route to `RESOURCES_PROXY_DEST` regardless of cookies
- Handling of 404 responses with custom error page
- Handling of 500 responses with custom error page
- Network errors during main request
- Network errors during error page fetch
- Missing configuration handling
