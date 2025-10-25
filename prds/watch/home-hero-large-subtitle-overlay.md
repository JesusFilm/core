# Home Hero Large Subtitle Overlay Plan

## Goal
Display large-format subtitles over the autoplaying hero video on the Watch homepage whenever the experience is muted (default state) or the viewer explicitly enables subtitles, mimicking short-form video subtitle styling.

## Task List
- [x] Audit the existing hero video + carousel implementation to identify how subtitle text tracks are loaded and when mute state changes trigger subtitle updates.
- [x] Design and implement a reusable subtitle overlay component that listens to the active Video.js text track cues and renders bold, high-contrast captions styled for large-screen readability.
- [x] Integrate the overlay into the hero video container so it appears whenever subtitles are active (mute enabled or subtitles toggled on), updating dynamically with cue changes and hiding when subtitles are disabled.
- [x] Validate that the overlay works for both regular videos and Mux insert slides, covering responsive behavior and ensuring no regressions to playback controls.
