# R2 Download Proxy Worker

A Cloudflare Worker that proxies downloads from Cloudflare R2 storage with proper CORS headers.

## Purpose

This worker solves CORS issues when downloading files from Cloudflare R2 storage by:

- Adding proper CORS headers for allowed origins
- Proxying requests to R2 storage
- Supporting range requests for large files
- Adding content-disposition headers for proper downloads

## Usage

### Development

```bash
nx run r2-download-proxy:dev
```

### Deployment

```bash
# Deploy to development
nx run r2-download-proxy:deploy:dev

# Deploy to staging
nx run r2-download-proxy:deploy:stage

# Deploy to production
nx run r2-download-proxy:deploy:prod
```

## URL Format

To download a file through the proxy, use:

```
https://r2-proxy.jesusfilm.org/{R2_URL_WITHOUT_HTTPS}
```

Example:

```
Original R2 URL: https://pub-123.r2.dev/videos/video.mp4
Proxy URL: https://r2-proxy.jesusfilm.org/pub-123.r2.dev/videos/video.mp4
```

## Environment Configuration

The worker is configured with different allowed origins for each environment:

- **Development**: `http://localhost:4300,http://localhost:4500`
- **Staging**: `https://develop.jesusfilm.org,https://watch-stage.jesusfilm.org`
- **Production**: `https://www.jesusfilm.org,https://watch.jesusfilm.org`

## Features

- ✅ CORS support for specified origins
- ✅ Range request support for large files
- ✅ Proper content-disposition headers
- ✅ Error handling and logging
- ✅ URL validation for security
