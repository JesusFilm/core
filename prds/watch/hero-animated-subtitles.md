# Animated Hero Subtitles

## Goal

Deliver an accessible, branded subtitle experience on the hero video that matches the new watch page look & feel and remains usable when the player autoplays muted.

## Context

- Feature lives in the new hero experience (`apps/watch/src/components/NewVideoContentPage/VideoContentHero/HeroVideo/HeroSubtitleOverlay/HeroSubtitleOverlay.tsx`).
- The hero video autoplays muted. We need subtitles to show by default when sound is muted or user preference enables captions.
- Video.js already renders native `<track>` captions. We replace that presentation layer with custom styling and animation.

## Behaviour

### When the overlay shows

- `HeroVideo` passes the player ref, subtitle language preference, and `visible` flag (true when the hero is muted or captions are toggled on).
- Overlay mounts, hides native video.js captions by adding `hero-hide-native-subtitles` to the player root element.
- We listen to `cuechange`, `texttrackchange`, and `addtrack` to stay in sync with active cues.

### What renders

- Active cues are normalized into clean text lines.
- Each cue line is split into ~6-word chunks to keep one line per frame.
- Chunks become `SubtitleSegment`s with IDs and an estimated per-segment duration (based on cue timing with sensible min/max guardrails).
- We render one chunk at a time; timer advances to next chunk until current cue finishes.

### Animation

- CSS keyframe `heroSubtitleFadeIn` fades + slides each chunk in.
- Staggering ensures sequential segments animate smoothly (only one chunk on screen at a time with ~280 ms ease-out).

### When it hides/cleans up

- Overlay unmount or visibility false resets segments state and removes the native caption suppression class.
- Clean up listeners on text tracks and player events; abort timers.

## Edge Cases & Notes

- If no active cues or overlay hidden, nothing renders, keeping layout clear.
- Subtitle language defaults to track from `WatchContext` or video’s language when user preference missing.
- Supports remote text track updates (e.g., when subtitles load asynchronously).
- Works alongside muted autoplay + carousel Mux inserts.
- If cue timings are missing, we default to ~2s per chunk so subtitles still rotate.

## Files & Ownership

- `HeroSubtitleOverlay.tsx` (primary logic)
- `HeroVideo.tsx` (drives visibility & language fallback)

## QA Checklist

- Mute hero video ⇒ overlay appears, native captions hidden, custom animation visible.
- Toggle captions on/off ⇒ overlay responds instantly.
- Long subtitle (>6 words) ⇒ splits into multiple sequential chunks without overlap.
- Player switches source (e.g., carousel slide) ⇒ overlay resets and rebuilds segments.

## Follow Up Ideas

- Persist user subtitle preference from the overlay UI.
- Extend animation timing logic using cue metadata when available.
- Add unit tests for `extractSegmentsFromCue` chunk sizing and duration bounds.
