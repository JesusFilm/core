# Data Model: Vertical Video Crop Tool

**Date**: 2025-09-19 | **Feature**: Vertical Video Crop Tool

## Core Entities

### Video Entity
Represents a source video available for cropping operations.

```typescript
interface Video {
  slug: string;                    // Unique identifier (e.g., "summer-vacation-2025")
  title?: string;                  // Optional display title
  duration: number;                // Duration in seconds
  width: number;                   // Source width in pixels
  height: number;                  // Source height in pixels
  thumbnailUrl?: string;           // Primary thumbnail URL
  thumbnailUrls?: string[];        // Multiple thumbnail URLs for timeline
  playableUrl: string;             // HLS/MP4 stream URL
  createdAt?: string;              // ISO date string
  updatedAt?: string;              // ISO date string
}
```

**Validation Rules**:
- slug: required, alphanumeric + hyphens, 3-100 chars
- duration: > 0, < 3600 (1 hour max)
- width/height: > 0, < 8192 (8K limit)
- playableUrl: valid HTTP/HTTPS URL

### Keyframe Entity
Represents a crop position at a specific timestamp in the video.

```typescript
interface CropKeyframe {
  id: string;                      // UUID for keyframe
  time: number;                    // Timestamp in seconds (0-based)
  x: number;                       // Crop box left edge (0-1 normalized)
  y: number;                       // Crop box top edge (0-1 normalized)
  width: number;                   // Crop box width (0-1 normalized)
  height: number;                  // Crop box height (0-1 normalized)
  easing?: 'linear' | 'cubic';     // Interpolation method
}
```

**Validation Rules**:
- time: >= 0, <= video.duration
- x, y: 0.0 - 1.0 (normalized coordinates)
- width, height: 0.1 - 1.0 (minimum 10% crop size)
- x + width <= 1.0, y + height <= 1.0 (stay within bounds)

### CropPath Entity
Represents the complete crop animation over time.

```typescript
interface CropPath {
  id: string;                      // UUID for crop path
  videoSlug: string;               // Reference to source video
  keyframes: CropKeyframe[];       // Ordered by time ascending
  smoothing: {                     // Detection smoothing parameters
    alpha: number;                 // EMA alpha (0.1-0.9)
    minConfidence: number;         // Minimum detection confidence (0.3-0.9)
  };
  mode: 'manual' | 'auto' | 'auto-with-offset';
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
}
```

**Validation Rules**:
- keyframes: minimum 1 keyframe, sorted by time ascending
- keyframes[0].time === 0 (must start at beginning)
- no duplicate times
- smoothing.alpha: 0.1 - 0.9
- smoothing.minConfidence: 0.3 - 0.9

### DetectionResult Entity
Represents a person/face detection result from AI processing.

```typescript
interface DetectionResult {
  time: number;                    // Timestamp in seconds
  bbox: {                          // Bounding box coordinates (0-1 normalized)
    x: number;                     // Left edge
    y: number;                     // Top edge
    width: number;                 // Box width
    height: number;                // Box height
  };
  score: number;                   // Confidence score (0-1)
  label: 'person' | 'face';        // Detection type
}
```

**Validation Rules**:
- time: >= 0
- bbox coordinates: 0.0 - 1.0
- score: 0.0 - 1.0
- bbox dimensions: > 0

### ExportPreset Entity
Defines target resolution and encoding settings for export.

```typescript
interface ExportPreset {
  id: string;                      // Preset identifier
  name: string;                    // Display name (e.g., "TikTok 1080p")
  width: number;                   // Target width in pixels
  height: number;                  // Target height in pixels
  fps: number;                     // Target frame rate
  format: 'webm' | 'mp4';          // Output container format
  codec: 'vp9' | 'h264';           // Video codec preference
  bitrate?: number;                // Target bitrate in kbps
}
```

**Validation Rules**:
- width/height: standard social media resolutions
- fps: 24, 30, or 60
- aspect ratio: must be 9:16 (height = width * 16/9)

## State Management Entities

### App State
Global application state for the cropper interface.

```typescript
interface CropperState {
  currentVideo: Video | null;
  cropPath: CropPath | null;
  currentTime: number;             // Playback position
  isPlaying: boolean;
  detectionResults: DetectionResult[];
  exportProgress: number | null;   // 0-100 or null
  selectedPreset: ExportPreset;
}
```

### UI State
Interface-specific state for components.

```typescript
interface TimelineState {
  zoom: number;                    // Timeline zoom level (0.1-10)
  thumbnails: Map<number, string>; // Time -> thumbnail URL
  selectedKeyframe: string | null; // Selected keyframe ID
}

interface CropWorkspaceState {
  showGrid: boolean;
  showSafeMargins: boolean;
  snapToGrid: boolean;
  dragMode: 'crop' | 'pan' | 'zoom';
}
```

## Relationships & Constraints

### Entity Relationships
- Video (1) → CropPath (0..*) : One video can have multiple crop paths
- CropPath (1) → CropKeyframe (1..*) : Each path has multiple keyframes
- Video (1) → DetectionResult (0..*) : Optional detection results per video
- ExportPreset (1) → ExportJob (0..*) : Presets used for multiple exports

### Business Rules
1. **Crop Path Continuity**: Keyframes must maintain 9:16 aspect ratio during interpolation
2. **Bounds Checking**: All crop coordinates must stay within video boundaries
3. **Temporal Ordering**: Keyframes are immutable once created (time cannot change)
4. **Detection Integration**: Detection results can be converted to keyframes but not auto-updated
5. **Export Consistency**: Once export starts, crop path becomes immutable

### Data Flow
1. User selects video → Load metadata and thumbnails
2. User creates initial keyframe → Validate coordinates and aspect ratio
3. Detection runs → Generate DetectionResult array
4. User refines keyframes → Update CropPath with manual adjustments
5. Export executes → Apply CropPath to video using ffmpeg.wasm

## Validation & Type Safety

All entities implement runtime validation using Zod schemas for API contracts and form validation. TypeScript interfaces provide compile-time safety for internal operations.

**Error Handling**:
- Invalid coordinates: Clamp to valid ranges with user notification
- Missing keyframes: Prevent export until minimum keyframes exist
- Detection failures: Graceful fallback to manual mode
- Export errors: Detailed error messages with recovery suggestions
