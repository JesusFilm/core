# JF Proxy Worker

A Cloudflare worker that acts as a proxy server for the Jesus Film website, handling requests and managing failover to error pages.

## How It Works

The worker sits in front of the Jesus Film website and:

1. Forwards incoming requests to the configured destination based on path matching
2. Routes specific paths (like `/watch/modern`) to a different destination
3. Handles error cases (404, 500) by serving a custom error page
4. Preserves request properties (method, headers, body)
5. Sanitizes response headers

### Request Flow

1. Request comes in to the worker
2. Worker checks if the path matches any patterns in `WATCH_MODERN_PROXY_PATHS`
3. Worker modifies the hostname to the appropriate destination:
   - `WATCH_MODERN_PROXY_DEST` for matching paths
   - `WATCH_PROXY_DEST` for all other paths
4. Worker forwards the request with all original properties
5. If the response is a 404 or 500:
   - Attempts to serve `/not-found.html`
   - Falls back to a basic error message if that fails
6. Returns the response with sanitized headers

### Path Routing

The worker supports intelligent path-based routing:

- **Modern Paths**: Routes matching patterns in `WATCH_MODERN_PROXY_PATHS` go to `WATCH_MODERN_PROXY_DEST`
- **Default Paths**: All other paths go to `WATCH_PROXY_DEST`
- **Pattern Matching**: Uses regex patterns for flexible path matching
- **Subpath Support**: Uses two patterns: `^/watch/modern$` for exact match and `^/watch/modern/` for subpaths

## Configuration

The worker is configured through environment variables:

```toml
# Required
WATCH_PROXY_DEST="www.example.com"  # The default destination hostname to proxy requests to

# Optional - for modern path routing
WATCH_MODERN_PROXY_DEST="modern.example.com"  # Destination for modern paths
WATCH_MODERN_PROXY_PATHS=["^/watch/modern$", "^/watch/modern/"]  # Regex patterns for modern paths
```

### Path Matching Examples

The patterns `^/watch/modern$` and `^/watch/modern/` will match:

- ✅ `/watch/modern` (exact match)
- ✅ `/watch/modern/` (subpath)
- ✅ `/watch/modern/video/123` (subpath)
- ✅ `/watch/modern/episode/season-1` (subpath)

But will NOT match:

- ❌ `/watch/modern-test`
- ❌ `/watch/modern_legacy`
- ❌ `/watch/modern.old`
- ❌ `/watch/legacy`
- ❌ `/api/modern`

### Environment-Specific Configuration

The worker supports different configurations for development, staging, and production environments. Each environment can specify:

- Custom routes and domains
- Different proxy destinations
- Environment-specific settings
- Modern path patterns

The worker handles routing for various website sections including:

- Watch pages (legacy and modern)
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
- **Invalid Regex Patterns**: Logs error and falls back to default routing

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
- Modern path routing (`/watch/modern` and subpaths)
- Regex pattern matching
- Error handling (404, 500)
- Network error handling
- Missing configuration handling
- Header sanitization
- Invalid regex pattern handling

Run the tests with:

```bash
nx test workers/jf-proxy
```

### Test Cases

The test suite includes verification for:

- Successful proxying of requests
- Modern path routing to `WATCH_MODERN_PROXY_DEST`
- Subpath routing for modern paths
- Multiple regex pattern matching
- Legacy path routing to `WATCH_PROXY_DEST`
- Handling of 404 responses with custom error page
- Handling of 500 responses with custom error page
- Network errors during main request
- Network errors during error page fetch
- Missing configuration handling
- Invalid regex pattern handling
