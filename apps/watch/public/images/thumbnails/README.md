# Thumbnail Override System

This directory contains manually processed thumbnail images that override the default Cloudflare-served thumbnails in the Jesus Film Project watch app.

## Purpose

The thumbnail override system allows for fine-grained control over video thumbnails based on context-specific requirements. Instead of relying solely on automatically generated thumbnails from Cloudflare, you can provide custom thumbnails that are optimized for specific use cases, orientations, languages, or contexts.

## How It Works

When a video card needs to display a thumbnail, the system checks for local thumbnail files in this directory using a hierarchical fallback system. If a matching local file is found, it's served from the Next.js public directory. If no match is found, it falls back to the original Cloudflare image URL.

## File Naming Convention

Thumbnails use a hierarchical naming system with the format:

```
{contentId}-{orientation}-{containerSlug}-{variantSlug}-{languageId}.{extension}
```

### Parameters

- **`contentId`**: The video content identifier (e.g., `1_jf-0-0`)
- **`orientation`**: Display orientation (`horizontal` or `vertical`)
- **`containerSlug`**: The container/page context (e.g., `watch`, `collections`)
- **`variantSlug`**: The video variant slug (e.g., `jesus-film-english`)
- **`languageId`**: The language identifier (e.g., `529` for English)
- **`.extension`**: Image format (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)

### Fallback Hierarchy

The system searches for thumbnails in this order (most specific first):

1. **`{contentId}-{orientation}-{containerSlug}-{variantSlug}-{languageId}.{ext}`**
   - Most specific: matches all parameters
   - Example: `1_jf-0-0-vertical-watch-jesus-film-english-529.jpg`

2. **`{contentId}-{orientation}-{containerSlug}-{variantSlug}.{ext}`**
   - Language-agnostic
   - Example: `1_jf-0-0-vertical-watch-jesus-film-english.jpg`

3. **`{contentId}-{orientation}-{containerSlug}.{ext}`**
   - Variant-agnostic
   - Example: `1_jf-0-0-vertical-watch.jpg`

4. **`{contentId}-{orientation}.{ext}`**
   - Context-agnostic
   - Example: `1_jf-0-0-vertical.jpg`

5. **`{contentId}.{ext}`**
   - Basic fallback (original system)
   - Example: `1_jf-0-0.jpg`

6. **Cloudflare URL**
   - Final fallback to original thumbnail

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

The system automatically checks all supported extensions for each naming pattern.

## Real-World Examples

### Scenario: English Jesus Film in vertical watch context
```
1_jf-0-0-vertical-watch-jesus-film-english-529.jpg  ← Used first
1_jf-0-0-vertical-watch-jesus-film-english.jpg      ← Fallback 1
1_jf-0-0-vertical-watch.jpg                         ← Fallback 2
1_jf-0-0-vertical.jpg                               ← Fallback 3
1_jf-0-0.jpg                                        ← Fallback 4
[Cloudflare URL]                                     ← Final fallback
```

### Scenario: Same video in horizontal collections context
```
1_jf-0-0-horizontal-collections-jesus-film-english-529.jpg  ← Used first
1_jf-0-0-horizontal-collections-jesus-film-english.jpg      ← Fallback 1
1_jf-0-0-horizontal-collections.jpg                         ← Fallback 2
1_jf-0-0-horizontal.jpg                                     ← Fallback 3
1_jf-0-0.jpg                                                ← Fallback 4
[Cloudflare URL]                                             ← Final fallback
```

## Best Practices

### 1. Use Appropriate Specificity
- **Most specific** for unique branding/marketing thumbnails
- **Medium specificity** for general language/context combinations
- **Least specific** for universal overrides

### 2. Image Optimization
- Use WebP format for better compression when possible
- Optimize image sizes for the target display context
- Consider responsive images for different screen sizes

### 3. Naming Consistency
- Follow the established slug patterns from the CMS
- Use consistent casing (typically lowercase with hyphens)
- Test your naming against actual video contexts

### 4. Organization
- Group related thumbnails by contentId
- Document special cases in comments
- Keep the directory clean by removing unused files

## Technical Implementation

### API Endpoint
- **Route**: `/api/thumbnail`
- **Parameters**: `contentId`, `originalUrl`, `orientation`, `containerSlug`, `variantSlug`, `languageId`
- **Response**: `{ url: string }`

### Cache Busting
The system includes intelligent cache busting to ensure users see updated thumbnails:

- **Local thumbnails**: URLs include `?v={fileModificationTime}` based on file modification time
- **Cloudflare fallbacks**: URLs include `?cb={timestamp}` to ensure fresh fetches
- **Error fallbacks**: URLs include `?err={timestamp}` for debugging

This ensures that when thumbnails are updated, users immediately see the new versions without cache issues.

### Blurhash Integration
When local thumbnails are used, blurhash placeholders are automatically generated from the local thumbnail images rather than the original Cloudflare images:

- **Smart Detection**: System detects when `thumbnailUrl !== imageSrc` to identify local thumbnails
- **Accurate Placeholders**: Blurhash matches the actual image that will be displayed
- **Performance**: Local thumbnails load faster for blurhash processing via direct file system access
- **Security**: Local thumbnails bypass network requests and use direct file reading
- **Cache Handling**: Query parameters are stripped from thumbnail URLs before blurhash generation
- **RGBA Processing**: Proper handling of RGBA image data for accurate dominant color extraction
- **Fallback**: If blurhash generation fails for local thumbnails, falls back to original image blurhash

### React Hook
```typescript
const { thumbnailUrl } = useThumbnailUrl(videoId, originalUrl, {
  orientation: 'vertical',
  containerSlug: 'watch',
  variantSlug: 'jesus-film-english',
  languageId: '529'
})
```

### File Resolution Logic
1. Build filename patterns from most specific to least specific
2. Check each pattern with all supported extensions
3. Return first matching file path or fallback to original URL

## Testing

To test thumbnail overrides:

1. Place a thumbnail file in this directory following the naming convention
2. Navigate to a video card that matches the parameters
3. Verify the custom thumbnail appears instead of the Cloudflare image
4. Check browser network tab to confirm local file serving
5. Test fallback by temporarily renaming/removing files

## Troubleshooting

### Thumbnail Not Appearing
- Check naming convention matches exactly
- Verify file extension is supported
- Confirm parameters match the video context
- Check browser cache (thumbnails are cached)

### Unexpected Fallback
- Review the fallback hierarchy order
- Ensure more specific files don't exist
- Check parameter values in component usage

## Future Considerations

- Automated thumbnail generation for missing variants
- Responsive image support with srcset
- Integration with CMS for automatic thumbnail management
- Analytics tracking for thumbnail effectiveness

---

**Note**: This system provides powerful control over thumbnail presentation while maintaining backward compatibility with existing implementations.
