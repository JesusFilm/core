# Mux Video Inserts Configuration

This directory contains configuration for Mux video inserts that integrate with the Watch application's video player and carousel system.

## How Mux Inserts Work

Mux inserts are special video content that can be injected into the video playback experience. They work differently from regular video cards:

### Main Video Player (HeroVideo)
- Plays **both** regular videos AND Mux insert videos
- When a Mux insert is triggered, it plays the actual Mux video content in the main player
- Duration functionality controls how long the Mux insert plays in the main video player
- After duration expires, automatically moves to the next item

### Carousel Cards
- **Regular video cards**: Show static image + text (normal behavior)
- **Mux insert cards**: Show static image + text with the card title (e.g., "Today's Bible Moments. For You.")
- **Visual indicator**: White border outline indicates "this insert is currently playing"
- Cards act like a remote control/playlist for what plays in the main video player
- When a Mux insert is active, its carousel card shows the white border for the duration period
- After duration expires, focus moves to the next card

### Duration Flow
1. Mux insert starts playing in main video player
2. Mux insert card shows **white border outline** in carousel
3. After specified duration (e.g., 5 seconds), the insert stops
4. White border moves to the next card in the carousel
5. Next video starts playing in the main player

### Key Concepts
- **Main player** = screen that shows content
- **Carousel** = remote control/playlist that controls what's on screen
- **White border outline** = visual indicator of what's currently playing
- **Duration** affects both: video playback duration AND how long the white border stays on the card
- **Automatic progression** to next item after duration expires

## Configuration Files

### `video-inserts.mux.json`
Contains the configuration for Mux video inserts with the following structure:

```json
{
  "version": "1.0.0",
  "inserts": [
    {
      "id": "welcome-start",
      "enabled": true,
      "source": "mux",
      "playbackIds": [
        "D4p01ELXmdsDM00J3O00d00fArV9q1DTFVFFCaxyax2B2nc"
      ],
      "duration": 5,
      "overlay": {
        "label": "Daily Inspirations",
        "title": "Today's Bible Moments. For You.",
        "collection": "Daily Inspirations",
        "description": "A hand-picked playlist of inspiring videos, designed to encourage and uplift."
      },
      "trigger": { "type": "sequence-start" }
    }
  ]
}
```

### Fields Explanation

- **`id`**: Unique identifier for the insert
- **`enabled`**: Whether this insert is active
- **`source`**: Always "mux" for Mux inserts
- **`playbackIds`**: Array of Mux playback IDs (one will be randomly selected)
- **`duration`**: How long the insert plays (in seconds). Optional - if not specified, plays until end
- **`overlay`**: Text content displayed on the carousel card
  - **`label`**: Small accent text
  - **`title`**: Main headline
  - **`collection`**: Secondary line
  - **`description`**: Longer description text
- **`trigger`**: When the insert should appear
  - `"sequence-start"`: At the beginning of the playlist
  - `{"type": "after-count", "count": 3}`: After 3 videos have played

## Implementation Details

The system integrates Mux inserts at multiple levels:

1. **Configuration**: JSON schema validation ensures valid structure
2. **Data Flow**: Inserts are merged into the carousel data alongside regular videos
3. **Main Player**: HeroVideo component handles both regular videos and Mux inserts
4. **Carousel**: Cards show visual indicators and control what plays in the main player
5. **Duration Control**: Timer management ensures inserts play for specified duration
6. **Auto-progression**: System automatically moves to next item after duration expires