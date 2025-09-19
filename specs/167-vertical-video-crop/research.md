# Research Findings: Vertical Video Crop Tool

**Date**: 2025-09-19 | **Feature**: Vertical Video Crop Tool

## WebAssembly ffmpeg.wasm Integration Patterns

**Decision**: Use ffmpeg.wasm v0.13+ with SharedArrayBuffer support for video processing
- **Rationale**: Provides complete FFmpeg functionality in browser, supports crop filter chains, multiple output formats (WebM/H.264), and reasonable performance for <5min videos
- **Alternatives considered**: Native Web APIs (limited codec support), WebCodecs API (not widely supported), server-side processing (increases complexity)

**Integration Pattern**:
- Load ffmpeg.wasm in Web Worker to avoid blocking main thread
- Use MEMFS for file I/O operations
- Implement progress callbacks for export status
- Fallback to WebM if H.264 encoding fails

**Performance Expectations**:
- 1-2x realtime encoding on modern hardware
- Memory usage: ~500MB for 1080p video processing
- Browser compatibility: Chrome 91+, Firefox 90+, Safari 15+

## MediaPipe Tasks Vision Person/Face Detection

**Decision**: Use MediaPipe Tasks Vision v0.10+ FaceDetector or ObjectDetector for person tracking
- **Rationale**: Lightweight models (2-5MB), runs efficiently in Web Workers, provides bounding boxes with confidence scores, supports real-time processing at 8-12fps
- **Alternatives considered**: TensorFlow.js with COCO-SSD (larger model, slower), OpenCV.js (heavier, more complex), custom ML models (development overhead)

**Worker Integration Pattern**:
- Initialize detector in dedicated Web Worker
- Process video frames at reduced fps (8-12fps) to balance accuracy/performance
- Return bounding box coordinates with confidence scores
- Implement exponential moving average for box smoothing
- Graceful fallback when confidence drops below threshold

**Performance Expectations**:
- Detection: 50-100ms per frame on modern hardware
- Memory: ~50MB for model + processing
- Accuracy: 85-95% for clear person detection in good lighting

## Browser Video Processing Limitations & Optimizations

**Decision**: Use HTML5 Video API with Canvas2D/WebGL for frame processing, avoid WebCodecs due to limited browser support
- **Rationale**: Universal browser support, good performance for cropping operations, WebCodecs still experimental in most browsers
- **Alternatives considered**: WebCodecs API (limited support), native video editing APIs (non-existent), server-side processing (latency issues)

**Optimization Strategies**:
- Process frames at display resolution, not source resolution
- Use requestVideoFrameCallback for efficient frame timing
- Implement object pooling for canvas contexts
- Limit concurrent operations to prevent memory pressure
- Use OffscreenCanvas in workers for background processing

**Known Limitations**:
- No direct video codec access (must use ffmpeg.wasm)
- Memory constraints for large videos (>2GB)
- Single-threaded frame processing (worker isolation needed)
- Browser security restrictions on file access

## Keyframe Interpolation Algorithms

**Decision**: Use cubic Bézier curves with linear interpolation fallback for crop path animation
- **Rationale**: Smooth curves prevent jarring motion changes, linear fallback ensures predictable behavior, computationally efficient for real-time preview
- **Alternatives considered**: Linear interpolation only (jagged motion), spline interpolation (over-smoothing), easing functions (limited control)

**Implementation Pattern**:
- Store keyframes as {time, x, y, width, height}
- Interpolate between keyframes using cubic Bézier with automatic control points
- Clamp interpolated values to video bounds and safe margins
- Support manual keyframe insertion at any timestamp
- Calculate interpolated values on-demand for timeline scrubbing

**Performance Expectations**:
- <1ms per interpolation calculation
- Memory efficient (store only keyframes)
- Real-time preview updates at 60fps

## Video Metadata Extraction & Thumbnail Generation

**Decision**: Use HTML5 Video API for metadata, Canvas2D for thumbnail generation at specified intervals
- **Rationale**: Native browser APIs provide reliable metadata access, canvas rendering ensures consistent thumbnail quality, no external dependencies needed
- **Alternatives considered**: ffmpeg.wasm for everything (slower startup), server-side pre-generation (additional API complexity)

**Implementation Pattern**:
- Load video and wait for 'loadedmetadata' event
- Extract duration, dimensions, frame rate
- Seek to timestamp intervals and capture frames via canvas
- Generate thumbnails at 10-30 second intervals based on video length
- Cache thumbnails in memory with LRU eviction

**Performance Expectations**:
- Metadata extraction: <100ms
- Thumbnail generation: 50-200ms per thumbnail
- Memory usage: ~5MB for 20 thumbnails
- Quality: 160x90px thumbnails at 80% JPEG quality

## Integration Architecture Recommendations

**Browser Compatibility Baseline**: Chrome 91+, Firefox 90+, Safari 15+ (SharedArrayBuffer support)
**Performance Baseline**: M1/M2 Mac or equivalent Intel i5, 16GB RAM, stable 60fps UI
**Fallback Strategy**: Graceful degradation - disable features if WebAssembly unavailable
**Security Considerations**: Process videos client-side only, no server upload unless explicitly requested
**Scalability Limits**: 1080p source videos up to 10 minutes, 720p up to 30 minutes

## Risk Mitigation

**High Risk**: ffmpeg.wasm bundle size (15MB) and loading time
- **Mitigation**: Lazy load ffmpeg only when export starts, show progress indicator

**Medium Risk**: Person detection accuracy in variable lighting/angles
- **Mitigation**: User can toggle auto-track on/off, manual override always available

**Low Risk**: Browser memory limits for large videos
- **Mitigation**: Process in chunks if needed, clear resources immediately after use

**Implementation Confidence**: High - All selected technologies have mature browser support and active maintenance
