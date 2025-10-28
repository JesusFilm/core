# Extending Image Formats for Watch

## Overview

Research conducted to understand how images are handled in the Jesus Film Project video ecosystem, specifically focusing on the Watch app and supporting APIs.

## Video API Image Storage Analysis

### Database Schema (Media API)

- **CloudflareImage Model**:
  - `id`: UUID primary key
  - `uploadUrl`: Direct upload URL (nullable)
  - `userId`: Owner user ID
  - `createdAt/updatedAt`: Timestamps
  - `aspectRatio`: Enum (`hd` = 16:9, `banner` = 2.13:1)
  - `videoId`: Foreign key linking to Video table
  - `uploaded`: Boolean flag for completion status

- **Video.images Relation**: One-to-many relationship with CloudflareImage table

### GraphQL Schema Fields

- **Video.images(aspectRatio: ImageAspectRatio)**: Returns filtered CloudflareImage array
- **CloudflareImage Fields**:
  - Core: `id`, `uploadUrl`, `userId`, `createdAt`
  - Dynamic URLs: `url` (base), `mobileCinematicHigh/Low/VeryLow`, `thumbnail`, `videoStill`
  - `aspectRatio`: HD or banner format

### Image Linking Architecture

- `CloudflareImage.videoId` → `Video.id` foreign key relationship
- Images filtered by `aspectRatio` parameter
- URLs dynamically generated via Cloudflare Images transformations
- Storage in Cloudflare Images service (not Cloudflare R2, which handles video assets)

## Watch App Image Consumption

### No Upload Methods in Watch App

The Watch app **does not contain image upload functionality**. It is a consumer-facing application that displays existing videos and their associated images. Image upload operations are handled by separate admin interfaces or APIs outside the Watch app scope.

### Image Consumption Patterns in Watch App

The Watch app consumes images through GraphQL queries that access pre-uploaded images linked to videos:

**Video Images Query Path:**

```
apps/watch/src/libs/videoContext/videoContext.tsx
  → VideoContentFields (GraphQL generated types)
  → Video.images(aspectRatio: ImageAspectRatio)
  → CloudflareImage fields: url, thumbnail, videoStill, etc.
```

**Key Image Usage Locations:**

- **Hero Carousel**: `WatchHomePage` → `WatchHero` → dynamic image URLs
- **Video Thumbnails**: `VideoCard`, `VideoCarousel` components
- **Video Pages**: `NewVideoContentPage` → `VideoContentHero` background images
- **Search Results**: Algolia-powered image display in search components

## Current Image Usage Patterns in Watch App

1. **Video Posters**: HD aspect ratio images for video thumbnails (VideoCard, VideoCarousel)
2. **Hero Banners**: Banner aspect ratio images for promotional content (WatchHero)
3. **Video Backgrounds**: Images used as backgrounds in video content pages
4. **Search Results**: Images displayed in search overlays and results
5. **Language Maps**: Images used in geographic language selection interfaces

## Current Image Format Usage

### Cloudflare Images Formats

- **JPG**: Primary format for most variants (`mobileCinematicHigh`, `mobileCinematicLow`, `thumbnail`, `videoStill`)
- **WebP**: Used for `mobileCinematicVeryLow` variant (50% quality, better compression)

### Image Transformations (Cloudflare)

**Actively used transformation features:**

- **Format conversion**: `f=jpg`, `f=webp`
- **Dynamic resizing**: `w=1280,h=600`, `w=640,h=300`, `w=120,h=68`, `w=1920,h=1080`
- **Quality optimization**: `q=95` (high), `q=50` (WebP low quality)
- **Responsive variants**: Different sizes for mobile/desktop consumption

### External Service Formats

- **YouTube Thumbnails**: JPG format (standard YouTube thumbnail delivery)

## Potential Extension Points

- Add Support for additional aspect ratios beyond HD/banner
- WebP/AVIF format optimization for existing images
- Image variants for different device sizes and breakpoints
- Progressive loading and lazy loading optimizations
- Image CDN configuration for global distribution

## Recommendations for Image Format Extensions in Watch App

1. **GraphQL Schema**: Extend ImageAspectRatio enum and query filters
2. **Watch Components**: Update image display logic for new aspect ratios
3. **Performance**: Implement responsive image loading and format optimization
4. **Component Updates**: Modify VideoCard, VideoCarousel, WatchHero for new formats
5. **Testing**: Update component tests for new image format handling
