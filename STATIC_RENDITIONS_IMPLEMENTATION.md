# Static Renditions Implementation for Audio Languages

## Overview

When creating a new audio language in videos-admin, the system now automatically creates static renditions for multiple video qualities. This ensures that users have immediate access to different quality downloads without manual intervention.

## Implementation Details

### Renditions Created

The system automatically creates static renditions for the following qualities:

| Quality | Resolution | Dimensions | Quality Level |
| ------- | ---------- | ---------- | ------------- |
| Low     | 270p       | 480×270    | `low`         |
| SD      | 360p       | 640×360    | `sd`          |
| High    | 720p       | 1280×720   | `high`        |
| Highest | 1080p      | 1920×1080  | `highest`     |

### Files Modified

1. **`apps/videos-admin/src/app/_UploadVideoVariantProvider/UploadVideoVariantProvider.tsx`**

   - Added `CREATE_VIDEO_VARIANT_DOWNLOAD` mutation
   - Added `ENABLE_MUX_DOWNLOAD` mutation
   - Added `createStaticRenditions()` function
   - Modified `handleCreateVideoVariant()` to call static renditions creation after successful video variant creation

2. **`apps/videos-admin/src/app/_UploadVideoVariantProvider/UploadVideoVariantProvider.spec.tsx`**
   - Added test mocks for the new mutations
   - Updated existing test cases to include the new static renditions mocks

### How It Works

1. **Audio Language Upload**: User uploads a new audio language file via the videos-admin interface
2. **Mux Video Creation**: File is uploaded to R2 and a Mux video is created
3. **Video Variant Creation**: A video variant is created with the Mux video reference
4. **Static Renditions Generation**: After successful video variant creation:
   - Mux downloads are enabled for 270p, 360p, 720p, and 1080p resolutions
   - Video variant downloads are created for each quality level with the appropriate Mux stream URLs
5. **Background Processing**: The actual video files are processed by Mux in the background
6. **File Sizes Updated**: The download sizes are automatically updated when the Mux assets become available

### Error Handling

- Static renditions creation failures are handled gracefully
- If static renditions fail, a warning is shown but the overall audio language creation process continues
- Errors are logged to the console for debugging purposes

### URLs and Storage

Static renditions are stored as video variant downloads with:

- **URLs**: Mux stream URLs in the format `https://stream.mux.com/{playbackId}/{resolution}.mp4`
- **Quality mapping**: low (270p), sd (360p), high (720p), highest (1080p)
- **Database**: Stored in the `videovariantdownloads` table with the appropriate quality levels

### Benefits

1. **Immediate Availability**: Users can access different quality downloads as soon as an audio language is created
2. **Consistent Experience**: All audio languages automatically have the same set of quality options
3. **Reduced Manual Work**: No need for administrators to manually create each quality level
4. **Scalable**: Works automatically for all new audio language uploads

## Testing

The implementation includes comprehensive tests that verify:

- Static renditions are created after successful video variant creation
- All four quality levels are properly configured
- Error handling works correctly
- Existing functionality continues to work as expected
