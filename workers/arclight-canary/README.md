# Arclight Canary Worker

A Cloudflare worker that implements canary routing between core and arclight endpoints. This worker allows for gradual traffic migration and A/B testing between services.

## How It Works

The worker sits in front of two endpoints (core and arclight) and routes incoming requests based on three rules:

1. **Path-Based Core Routing**: Requests to `/_next/*` paths are always routed to the core endpoint
2. **Path-Based Arclight Routing**: Requests to `/build/v1harness/images/primary.png` are always routed to the arclight endpoint
3. **Weight-Based Routing**: All other requests are randomly routed based on a configurable weight percentage

### Request Flow

1. Request comes in to the worker
2. Worker checks if the path matches any fixed routing rules
3. If no fixed rules match, applies weight-based routing
4. Forwards the request to the chosen endpoint
5. Returns the response with an `x-routed-to` header indicating which endpoint was used

## Configuration

The worker is configured through environment variables:

```toml
# Required
ENDPOINT_CORE="https://core.example.com"      # Base URL for core endpoint
ENDPOINT_ARCLIGHT="https://api.example.com"   # Base URL for arclight endpoint
ENDPOINT_ARCLIGHT_WEIGHT="90"                 # Percentage of requests to route to arclight (0-100)

# Optional
TIMEOUT="30000"                               # Request timeout in milliseconds (default: 30000)
```

### Environment-Specific Configuration

The worker supports different configurations for development, staging, and production environments. Each environment can specify:

- Custom routes and domains
- Different endpoint URLs
- Different weight percentages
- Environment-specific timeouts

## Development

### Prerequisites

- Node.js
- nx CLI
- Wrangler CLI (Cloudflare Workers)

### Local Development

1. Start the worker locally:

   ```bash
   nx serve workers/arclight-canary
   ```

2. Run tests:
   ```bash
   nx test workers/arclight-canary
   ```

### Adding New Routes

To add new path-based routing rules:

1. Update the constants in `src/index.ts`:

   ```typescript
   // For core-only paths (uses startsWith)
   const CORE_ONLY_PATHS = ['/_next/']

   // For arclight-only paths (uses exact match)
   const ARCLIGHT_ONLY_PATHS = ['/build/v1harness/images/primary.png']
   ```

2. Add corresponding tests in `src/index.spec.ts`

### Error Handling

The worker handles several types of errors:

- **Weight Validation** (400): Invalid weight configuration
- **Request Timeout** (503): Request exceeded timeout
- **Network Errors** (503): Connection or DNS issues
- **Missing Configuration** (500): Required environment variables not set
- **Unexpected Errors** (500): All other errors

### Deployment

The worker is automatically deployed using GitHub Actions:

- **Staging Environment**:

  - Triggered by: Pushes to the `stage` branch
  - Deploys to: `canary-stage.arclight.org`
  - Configuration: Uses staging environment variables

- **Production Environment**:
  - Triggered by: Pushes to the `main` branch
  - Deploys to: `canary.arclight.org`
  - Configuration: Uses production environment variables

The GitHub Actions workflow:

1. Runs tests
2. Builds the worker
3. Deploys to the appropriate environment

## Monitoring

The worker adds an `x-routed-to` header to all responses with either:

- `core`: Request was routed to the core endpoint
- `arclight`: Request was routed to the arclight endpoint

This header can be used for monitoring and debugging routing decisions.

## Testing

The test suite covers:

- Weight-based routing
- Path-based routing rules
- Request/response preservation
- Error handling
- Timeout handling

Run the tests with:

```bash
nx test workers/arclight-canary
```
