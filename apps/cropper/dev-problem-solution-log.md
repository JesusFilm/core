# Cropper Dev Problem Log

## 2025-09-19 — Video element tearing down
- **Problem:** React re-renders replaced the inline `<video>` ref each frame; React then called the old ref with `null`, triggering `bindVideo(null)` and disposing Video.js, so the player never stayed mounted.
- **Solution:** Hoisted the ref into a memoized `handleVideoElementRef`. The ref identity now stays stable, the element stops churning, and the Video.js init loop completes. Also switched playback to use the selected video’s URLs, keeping the debug stream only as an env-driven fallback.

## 2025-09-19 — Crop mask blur inverted
- **Problem:** The 9:16 crop window was blurred while the area outside stayed sharp, reversing the intended visual emphasis.
- **Solution:** Replaced the single blurred crop div with four backdrop-blurred panels that cover everything outside the crop bounds while keeping the crop frame itself clear and outlined.

## 2025-09-19 — Slider thumbs invisible
- **Problem:** Timeline and keyframe sliders lacked visible thumb handles, making it impossible to see or grab the current position.
- **Solution:** Expanded the slider styling to draw a high-contrast thumb with borders, focus/hover scaling, and disabled-state coloring across WebKit and Firefox engines.
