<!-- d73deef6-64d9-4395-adb3-c5dd9db09736 57e2e283-952e-4b73-8ce0-ab50ad5cd183 -->
# Thumbnail Local Asset Check Implementation

## Overview

Create an API endpoint that checks for locally processed thumbnails in `apps/watch/public/assets/thumbnails/` before returning the original Cloudflare image URL. This allows manually processed images to override the default thumbnails.

## Implementation Steps

### 1. Create API Route

**File:** `apps/watch/pages/api/thumbnail.ts`

- Accept GET requests with query params: `contentId` (required) and `originalUrl` (optional)
- Check for local file in `apps/watch/public/assets/thumbnails/{contentId}.{ext}` where ext can be any image format (jpg, png, webp, etc.)
- Use Node.js `fs` to check file existence (check multiple extensions)
- If local file exists, return JSON: `{ url: "/assets/thumbnails/{contentId}.{ext}" }`
- If not found, return JSON: `{ url: originalUrl }` (fallback to original)
- Handle errors gracefully with proper HTTP status codes
- Add validation for contentId parameter

### 2. Create Utility Function

**File:** `apps/watch/src/libs/thumbnail/getThumbnailUrl.ts`

- Function signature: `getThumbnailUrl(contentId: string, originalUrl: string | null | undefined): Promise<string>`
- Call `/api/thumbnail?contentId={contentId}&originalUrl={encodeURIComponent(originalUrl)}`
- Return the URL from the API response
- Handle errors by returning the originalUrl as fallback
- Follow the same pattern as `generateBlurhashFromUrl` in `apps/watch/src/libs/blurhash/generateBlurhash.ts`

### 3. Create React Hook (Optional but Recommended)

**File:** `apps/watch/src/libs/thumbnail/useThumbnailUrl.ts`

- Hook signature: `useThumbnailUrl(contentId: string | undefined, originalUrl: string | null | undefined)`
- Use `useState` and `useEffect` to call `getThumbnailUrl` when contentId or originalUrl changes
- Return the processed URL (or originalUrl if contentId is missing)
- Handle loading states if needed

### 4. Update VideoCard Component

**File:** `apps/watch/src/components/VideoCard/VideoCard.tsx`

- Import and use `useThumbnailUrl` hook
- Pass `video?.id` as contentId and `imageSrc` as originalUrl
- Use the returned URL instead of `imageSrc` directly
- Ensure it works with the existing blurhash logic

### 5. Update CarouselVideoCard Component

**File:** `apps/watch/src/components/CarouselVideoCard/VideoCard.tsx`

- Apply the same changes as VideoCard
- Update the `imageSrc` usage in the CardContent component

### 6. Create Thumbnails Directory

**Action:** Ensure `apps/watch/public/assets/thumbnails/` directory exists (or create `.gitkeep` if empty)

## Technical Details

- **File checking:** Use `fs.existsSync()` or `fs.access()` to check for file existence
- **Supported extensions:** Check for `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` (in that order or all)
- **Path resolution:** Use `path.join(process.cwd(), 'public', 'assets', 'thumbnails', ...)` for server-side file checking
- **Public URL:** Return `/assets/thumbnails/{filename}` for local files (Next.js serves public folder at root)
- **Error handling:** Always fallback to originalUrl on any error
- **Cache busting:** Implemented intelligent cache busting using file modification times for local thumbnails and timestamps for fallbacks
- **Caching:** Added cache headers (1 hour for local thumbnails, 5 minutes for fallbacks) with cache-busting query parameters

## Cache Busting Implementation

**Added intelligent cache busting to ensure users see updated thumbnails:**

- **Local thumbnails**: Use file modification time as version parameter (`?v={mtime}`)
- **Cloudflare fallbacks**: Use current timestamp for cache busting (`?cb={timestamp}`)
- **Error fallbacks**: Use timestamp with error prefix (`?err={timestamp}`)
- **Performance**: Maintains cache headers while ensuring cache invalidation when needed

## Blurhash Enhancement

**Implemented smart blurhash generation from local thumbnails:**

- **Dynamic Source Selection**: Blurhash generated from local thumbnail when available, original image otherwise
- **Accurate Placeholders**: Loading placeholders now match the actual displayed image
- **Performance Benefits**: Local thumbnails load faster for blurhash processing
- **Backward Compatibility**: Falls back to original image blurhash if local thumbnail processing fails
- **Smart Detection**: Uses `thumbnailUrl !== imageSrc` to identify when local thumbnails are active
- **Local File Support**: Blurhash API enhanced to handle local thumbnail files via direct file system access
- **Query Parameter Handling**: Cache-busting parameters stripped from thumbnail URLs before blurhash generation

## Testing Considerations

- Test with existing local thumbnail files
- Test with missing files (should fallback)
- Test with invalid contentId
- Test with missing originalUrl
- Verify VideoCard still renders correctly with the new logic
- Verify cache busting works (URLs should include version/timestamp parameters)
- Test that modified thumbnail files get new cache-busting parameters
- **Blurhash Enhancement**: Verify blurhash placeholders match local thumbnails when available
- Test blurhash generation from local thumbnails vs. original images
- Confirm blurhash fallback to original image when local thumbnail blurhash fails
- **Blurhash API**: Test that `/api/blurhash` works for both local thumbnail URLs and remote image URLs
- **Query Parameter Handling**: Verify that cache-busting parameters are stripped before blurhash generation
- **Dominant Color Accuracy**: Ensure dominant colors match actual image content (RGBA processing fix)

### To-dos

- [x] Create /api/thumbnail endpoint that checks for local thumbnail files and returns appropriate URL
- [x] Create getThumbnailUrl utility function to call the API route
- [x] Create useThumbnailUrl React hook for component integration
- [x] Update VideoCard component to use useThumbnailUrl hook
- [x] Update CarouselVideoCard component to use useThumbnailUrl hook
- [x] Ensure thumbnails directory exists in public/assets/