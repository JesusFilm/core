# Quickstart Guide: Vertical Video Crop Tool

**Date**: 2025-09-19 | **Version**: 1.0.0

## Overview
This guide provides quick validation steps to confirm the Vertical Video Crop Tool implementation meets acceptance criteria.

## Prerequisites
- Node.js 18+
- pnpm package manager
- Modern browser with WebAssembly support (Chrome 91+, Firefox 90+, Safari 15+)
- Test video available in video platform with known slug

## Setup
```bash
# Clone and setup monorepo
git clone <repository-url>
cd core
pnpm install

# Start the cropper app
pnpm dlx nx run cropper:serve

# In another terminal, start video API (if using local)
pnpm dlx nx run api-videos:serve
```

## Test Scenarios

### Scenario 1: Video Search and Selection
**Acceptance Criteria**: FR-001, FR-002, FR-003

**Steps**:
1. Open browser to `http://localhost:3000` (cropper app)
2. Click "Search Videos" or focus search input
3. Type a partial video slug (e.g., "test-video")
4. Verify debounced search shows results list
5. Click on a video result or paste full slug
6. Verify video loads with metadata display:
   - Duration shown
   - Dimensions displayed
   - Thumbnail visible
   - Video preview playable

**Expected Results**:
- Search input debounces (no request spam)
- Results show within 500ms
- Video metadata loads within 2 seconds
- Preview video plays smoothly

### Scenario 2: Crop Workspace Setup
**Acceptance Criteria**: FR-004, FR-005, FR-008

**Steps**:
1. With video loaded from Scenario 1
2. Verify 9:16 aspect ratio overlay visible on video
3. Click and drag crop box to reposition
4. Verify crop box stays within video bounds
5. Toggle grid overlay on/off
6. Verify snap-to-grid functionality

**Expected Results**:
- 9:16 frame overlays video correctly
- Crop box draggable and resizable
- Grid and safe margins toggle properly
- All controls keyboard accessible (Tab, Space, arrow keys)

### Scenario 3: Timeline and Keyframes
**Acceptance Criteria**: FR-006, FR-007, FR-015

**Steps**:
1. With video loaded and crop box positioned
2. Click timeline scrubber and drag to different time
3. Verify video seeks to correct timestamp
4. Right-click timeline to "Add Keyframe" at current time
5. Move playhead to different time and adjust crop box
6. Add another keyframe
7. Scrub timeline and verify smooth interpolation

**Expected Results**:
- Timeline shows thumbnails at intervals
- Scrubbing updates video position accurately
- Keyframes appear as markers on timeline
- Interpolation creates smooth crop animation
- Keyboard shortcuts work (J/K/L for playback, Space for pause)

### Scenario 4: Person Detection and Auto-Tracking
**Acceptance Criteria**: FR-009, FR-010, FR-011, FR-012

**Steps**:
1. With video containing visible person
2. Click "Enable Auto-Track" button
3. Wait for detection progress indicator
4. Verify detection results appear as suggested keyframes
5. Toggle between "Auto", "Auto + Offset", "Manual" modes
6. Adjust detection smoothing parameters if available
7. Review low-confidence segments flagged for manual adjustment

**Expected Results**:
- Detection runs in background without blocking UI
- Smooth tracking of person movement
- Confidence scores displayed for transparency
- Manual override possible for any keyframe
- Fallback to manual mode when detection fails

### Scenario 5: Export Workflow
**Acceptance Criteria**: FR-013, FR-014, FR-016

**Steps**:
1. With crop path defined (manual or auto-tracked)
2. Select export preset (1080×1920 or 720×1280)
3. Click "Export Video"
4. Monitor progress indicator
5. Wait for completion and download result
6. Verify exported video:
   - Correct 9:16 aspect ratio
   - Smooth crop animation
   - Acceptable quality and file size

**Expected Results**:
- Export starts immediately with progress feedback
- Browser remains responsive during processing
- Download link provided when complete
- Exported video matches specifications

## Performance Validation

### UI Responsiveness
- **Target**: 60fps interaction during video scrubbing and crop adjustment
- **Test**: Use browser dev tools performance tab while interacting
- **Pass Criteria**: No dropped frames, smooth 60fps animation

### Detection Performance
- **Target**: Detection at 8-12fps without UI blocking
- **Test**: Monitor main thread usage during auto-track
- **Pass Criteria**: UI remains interactive, detection progress visible

### Export Performance
- **Target**: <30 seconds for 1-minute 1080p video
- **Test**: Time complete export workflow
- **Pass Criteria**: Reasonable wait time with progress feedback

## Accessibility Validation

### Keyboard Navigation
- **Test**: Navigate entire interface using Tab, Space, Enter, arrow keys
- **Pass Criteria**: All interactive elements reachable and operable

### Screen Reader Support
- **Test**: Use NVDA/JAWS/VoiceOver to navigate interface
- **Pass Criteria**: State changes announced, meaningful labels present

### Color Contrast
- **Test**: Use WAVE or axe DevTools extension
- **Pass Criteria**: No contrast violations, focus indicators visible

## Browser Compatibility

### Supported Browsers
- Chrome 91+
- Firefox 90+
- Safari 15+
- Edge 91+

### Fallback Behavior
- **WebAssembly unavailable**: Show clear error message with fallback instructions
- **Large video files**: Graceful handling with size warnings
- **Network issues**: Retry logic for API calls, offline indicators

## Troubleshooting

### Common Issues

**Video won't load**
- Check video API is running
- Verify slug exists in system
- Check network connectivity

**Detection not working**
- Ensure video contains clear person/face
- Check browser console for Web Worker errors
- Verify MediaPipe model loading

**Export fails**
- Check browser has sufficient memory (>2GB free)
- Verify ffmpeg.wasm loaded correctly
- Check export settings are valid

**Performance issues**
- Close other browser tabs
- Ensure hardware acceleration enabled
- Check for conflicting browser extensions

## Success Criteria Summary

✅ **All scenarios pass** with expected results
✅ **Performance targets met** across all operations
✅ **Accessibility requirements satisfied**
✅ **Cross-browser compatibility confirmed**
✅ **Error handling graceful** with user guidance
✅ **Code quality standards maintained**

When all criteria are met, the Vertical Video Crop Tool is ready for production deployment.
