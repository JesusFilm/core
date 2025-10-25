# Video Unmute Bug Fix

## Problem

When unmuting a video in the watch app, the video picture would disappear but the audio would continue playing. This created a confusing user experience where users could hear the video but not see it.

## Root Cause Analysis

The issue had two parts:

### 1. Boolean Logic Bug in Overlay Logic

The `shouldShowOverlay` variable was calculated as:
```typescript
const shouldShowOverlay = playerReady && (mute || subtitleOn)
```

When `subtitleOn` was `undefined` (its default state), the expression `mute || subtitleOn` would evaluate to `undefined` instead of `false` in JavaScript. This caused `shouldShowOverlay` to be `undefined` rather than `false`, potentially causing inconsistent overlay behavior.

### 2. Player Recreation on Mute Changes

The main issue was that the videojs player was being completely disposed and recreated every time the mute state changed. This happened because `mute` was included in the useEffect dependencies for player initialization:

```typescript
useEffect(() => {
  // Player initialization code...
}, [currentMuxInsert?.id, variant?.hls, title, variant?.id, currentMuxInsert, isPreview, mute])
```

Every mute/unmute action would:
1. Dispose the existing videojs player
2. Attempt to create a new player on the same DOM element
3. Cause DOM state inconsistencies, resulting in "element not included in the DOM" errors
4. Lead to video visibility issues

## Solution

### 1. Fixed Boolean Logic

Changed the overlay logic to properly handle undefined values:
```typescript
const shouldShowOverlay = playerReady && (mute || Boolean(subtitleOn))
```

### 2. Separated Mute State Management

- Removed `mute` from the player initialization useEffect dependencies
- Added a separate useEffect to handle mute changes dynamically:
```typescript
useEffect(() => {
  if (playerRef.current) {
    playerRef.current.muted(mute)
  }
}, [mute])
```
- Initialize the player with `muted: false` and let the useEffect set the correct state

## Files Modified

- `apps/watch/src/components/NewVideoContentPage/VideoContentHero/HeroVideo/HeroVideo.tsx`

## Testing

The fix ensures that:
- Videos remain visible when unmuting
- No console errors about DOM elements
- Mute/unmute operations are performant (no player recreation)
- Overlay logic works correctly with undefined subtitle states

## Impact

This fix resolves a critical UX issue that was affecting video playback functionality in the watch application.
