# Watch App Notes

## Background Video Inserts (MUX)

Background inserts let editors feature looping ambience videos between standard video cards.

### 1. Upload and copy a Playback ID

1. Upload or locate the desired asset in [mux.com](https://mux.com/).
2. Open the asset and create a **Public Playback ID** if one does not already exist.
3. Copy the alphanumeric playback ID (e.g. `J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI`).

### 2. Add an insert to `apps/watch/config/video-inserts.mux.json`

Each insert entry includes overlay copy, the trigger, and one or more playback IDs. Example:

```json
{
  "id": "welcome-start",
  "enabled": true,
  "source": "mux",
  "playbackIds": ["J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI"],
  "overlay": {
    "label": "Today’s Pick",
    "title": "Morning Nature Background",
    "collection": "Daily Inspirations",
    "description": "A calm intro before your playlist."
  },
  "trigger": { "type": "sequence-start" }
}
```

Supported trigger types:

- `sequence-start` &mdash; render before the first carousel video.
- `after-count` &mdash; render after N standard videos (use `"count": 3`).

### 3. Optional poster overrides

If MUX thumbnails are unsuitable you can add `"posterOverride": "https://example.com/poster.jpg"`. Posters should be 16:9 JPG or PNG.

### 4. Validation and testing

The JSON file is validated at build time; invalid inserts fail CI. Run the relevant Jest suite locally:

```bash
pnpm nx test watch
```

### Behaviour notes

- Playback IDs are chosen uniformly at random per session and cached in `sessionStorage`.
- `prefers-reduced-motion` visitors see a poster with a manual play control.
- If the video fails to load a static fallback card displays the overlay content.
