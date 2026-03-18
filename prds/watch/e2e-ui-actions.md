# Watch Page - UI Actions Documentation

**Date:** November 26, 2025  
**Page URL:** http://localhost:4300/watch  
**Purpose:** Document current behavior of all interactive elements for comparison against future test runs

## Header & Navigation

### Search Textbox

- **Element:** Text input field
- **Label:** "Search videos by keyword..."
- **Location:** Top of page, header area
- **Behavior:**
  - Focusable input field
  - Appears to be readonly initially
  - Placeholder text: "Search videos by keyword..."
- **Issues:** None observed

### Go to Watch Home Link

- **Element:** Link (`<a>`)
- **Label:** "Go to Watch home"
- **Location:** Header, left side
- **Behavior:**
  - Navigates to `/watch/variant.html` when clicked
  - Contains JesusFilm Project logo image
- **Issues:** None observed

### Select Audio Language Button

- **Element:** Button
- **Label:** "select audio language"
- **Location:** Header, right side
- **Behavior:**
  - Opens a dialog/modal when clicked
  - Dialog contains:
    - Language selection combobox (initially shows "Loading language..." and is disabled)
    - Category filter buttons:
      - "Bible Stories"
      - "Worship"
      - "Teaching"
      - "Youth"
      - "Family"
      - "Holiday"
    - Close button ("Close")
- **Issues:** Language combobox appears disabled/loading initially

## Video Player Controls

### Play Video Button

- **Element:** Button (large overlay)
- **Label:** "Play Video"
- **Location:** Center of video player area
- **Behavior:**
  - Starts video playback when clicked
  - Changes to "Pause" button when video is playing
- **Issues:** None observed

### Pause Button

- **Element:** Button
- **Label:** "Pause" (or "Pau e" in accessibility tree)
- **Location:** Video player controls bar
- **Behavior:**
  - Pauses video playback when clicked
  - Changes to "Play" button when paused
- **Issues:** None observed

### Skip Backward Button

- **Element:** Button
- **Label:** "Skip Backward"
- **Location:** Video player controls bar
- **Behavior:**
  - Skips video backward by a set interval
- **Issues:** None observed

### Skip Forward Button

- **Element:** Button
- **Label:** "Skip Forward"
- **Location:** Video player controls bar
- **Behavior:**
  - Skips video forward by a set interval
- **Issues:** None observed

### Unmute/Mute Button

- **Element:** Button
- **Label:** "Unmute" (when muted) / "Mute" (when unmuted)
- **Location:** Video player controls bar, appears twice (in controls and overlay)
- **Behavior:**
  - Toggles audio mute state
  - Appears in main controls and in overlay area
- **Issues:** None observed

### Volume Level Slider

- **Element:** Slider (`<div>` with slider role)
- **Label:** "Volume Level"
- **Location:** Video player controls bar, next to mute button
- **Behavior:**
  - Adjusts audio volume level
  - Draggable slider control
- **Issues:** None observed

### Progress Bar Slider

- **Element:** Slider (`<div>` with slider role)
- **Label:** "Progress Bar"
- **Location:** Video player controls bar
- **Behavior:**
  - Shows video playback progress
  - Draggable to seek to different positions in video
- **Issues:** None observed

### Seek to Live Button

- **Element:** Button
- **Label:** "Seek to live, currently behind live LIVE"
- **Location:** Video player controls bar
- **Behavior:**
  - Seeks to live position in live streams
  - Shows "LIVE" indicator
- **Issues:** None observed

### Playback Rate Button

- **Element:** Button
- **Label:** "Playback Rate"
- **Location:** Video player controls bar
- **Behavior:**
  - Opens menu to change playback speed
  - Appears collapsed initially
- **Issues:** None observed

### Chapter Button

- **Element:** Button
- **Label:** "Chapter"
- **Location:** Video player controls bar
- **Behavior:**
  - Opens chapter navigation menu
  - Appears collapsed initially
- **Issues:** None observed

### Description Button

- **Element:** Button with dropdown menu
- **Label:** "Description" (or "De cription" in accessibility tree)
- **Location:** Video player controls bar
- **Behavior:**
  - Opens description menu
  - Menu contains:
    - Radio option: "selected description off"
  - Appears collapsed initially
- **Issues:** None observed

### Caption Button

- **Element:** Button with dropdown menu
- **Label:** "Caption"
- **Location:** Video player controls bar
- **Behavior:**
  - Opens caption menu
  - Menu contains:
    - Menu item: "open caption setting dialog caption setting"
    - Radio option: "selected caption off"
  - Appears collapsed initially
- **Issues:** None observed

### Audio Track Button

- **Element:** Button with dropdown menu
- **Label:** "Audio Track"
- **Location:** Video player controls bar
- **Behavior:**
  - Opens audio track selection menu
  - Menu contains:
    - Radio option: "selected Default"
  - Appears collapsed initially
- **Issues:** None observed

### Picture-in-Picture Button

- **Element:** Button
- **Label:** "Picture-in-Picture"
- **Location:** Video player controls bar
- **Behavior:**
  - Enters/exits picture-in-picture mode
- **Issues:** None observed

### Fullscreen Button

- **Element:** Button
- **Label:** "Fullscreen" (or "Full creen" in accessibility tree)
- **Location:** Video player controls bar
- **Behavior:**
  - Enters/exits fullscreen mode
- **Issues:** None observed

### Skip Video Button

- **Element:** Button
- **Label:** "Skip video"
- **Location:** Overlay area above video player
- **Behavior:**
  - Skips current video
- **Issues:** None observed

## Carousel Sections

### Today's Video Picks Carousel

- **Element:** Carousel with navigation
- **Location:** Below video player
- **Behavior:**
  - Shows carousel items (e.g., "Nov 25: Today's Video Picks")
  - Navigation indicators show "1 / 10", "2 / 10", "3 / 10", etc. (up to 10 items)
  - Carousel items are clickable buttons
  - Items contain nested navigation buttons (e.g., "Navigate to welcome-start")
  - Each carousel group contains:
    - Button with video title
    - Nested button with video type/description
    - Navigate button with route identifier
  - Examples of carousel items:
    - "Nov 25: Today's Video Picks" → Navigate to welcome-start
    - "Simeon's Prophecy" → Navigate to simeon-prophecy
    - "Bilions are searching" → Navigate to join-us
    - "Ancient Jewish Meditation Literature (Episode 4)" → Navigate to bp-ancient-jewish-med-lit-episode-4
    - "My Kingdom is Not of This World" → Navigate to my-kingdom-is-not-of-this-world
    - "Telling the Story of Jesus, Together" → Navigate to telling-the-story-of-jesus
    - "La Búsqueda - The Search" → Navigate to la-búsqueda-the-search
    - "Creation To Christ Story Full Video" → Navigate to creation-to-christ-story-full-video
    - "Episode 9" → Navigate to episode-9
    - "Bible: DM From God" → Navigate to bible-dm-from-god
- **Issues:** None observed

### Watch Section Carousels

- **Element:** Multiple carousel sections
- **Location:** Throughout page content
- **Behavior:**
  - Multiple sections with "Watch" link buttons as headers
  - Each section contains carousel with navigation indicators showing current position
  - Examples of carousel sizes:
    - "1 / 6" through "6 / 6" (6 items)
    - "1 / 4" through "4 / 4" (4 items)
    - Other sizes may vary
  - Carousel groups contain VideoCard links
  - Each VideoCard contains a button with video information (title, duration, type)
  - VideoCards are clickable links that navigate to video pages
- **Issues:** None observed

## Video Cards

### VideoCard Links

- **Element:** Links (`<a>`)
- **Location:** Throughout carousel sections
- **Behavior:**
  - Multiple VideoCard links throughout the page
  - Each card contains:
    - Link wrapper
    - Button element (some disabled)
    - Video metadata (title, duration, etc.)
  - URLs follow pattern: `/watch/[collection].html/[video]/[language].html`
  - Some cards have disabled buttons
  - Some cards have undefined URLs: `/watch/.html/undefined.html`
- **Issues:**
  - **CRITICAL:** Some VideoCard links have undefined URLs (`/watch/.html/undefined.html`)
  - Some VideoCard buttons are disabled

### Section Header "Watch" Links

- **Element:** Links (`<a>`) containing buttons
- **Label:** "Watch"
- **Location:** Section headers throughout page
- **Behavior:**
  - Multiple "Watch" link buttons in different sections
  - URLs vary by section (e.g., `/watch`, `/watch/considering-christmas.html/considering-christmas/english.html`)
  - Navigate to collection or specific video pages
- **Issues:** None observed

## Newsletter Subscription Form

### Name Input Field

- **Element:** Text input (`<input>`)
- **Label:** "Name"
- **Location:** Newsletter subscription section (bottom of page)
- **Behavior:**
  - Required field
  - Placeholder: "Your name"
  - Helper text: "We'll use this to personalize your subscription."
- **Issues:** None observed

### Email Address Input Field

- **Element:** Text input (`<input>`)
- **Label:** "Email address"
- **Location:** Newsletter subscription section (bottom of page)
- **Behavior:**
  - Required field
  - Placeholder: "name@example.com"
  - Helper text: "We'll send updates and resources to this address."
- **Issues:** None observed

## Draggable Areas

### Carousel Navigation

- **Element:** Carousel groups
- **Location:** Multiple carousel sections
- **Behavior:**
  - Carousels appear to support horizontal scrolling/dragging
  - Navigation indicators show current position (e.g., "1 / 4")
  - Multiple carousel groups per section
- **Issues:** None observed

### Video Player Sliders

- **Element:** Volume and Progress sliders
- **Location:** Video player controls
- **Behavior:**
  - Volume slider: Draggable to adjust volume
  - Progress bar: Draggable to seek through video
- **Issues:** None observed

## Summary of Issues Found

1. **CRITICAL:** Some VideoCard links have undefined URLs (`/watch/.html/undefined.html`)
2. **MINOR:** Some VideoCard buttons are disabled
3. **MINOR:** Language selection combobox appears disabled/loading initially in audio language dialog
4. **MINOR:** Accessibility tree shows some text with missing characters (e.g., "Pau e" instead of "Pause", "De cription" instead of "Description")

## Notes

- Page uses Next.js route announcer for accessibility
- Video player appears to be a custom implementation with comprehensive controls
- Multiple carousel sections throughout the page with similar structure
- Newsletter form appears at bottom of page
- Page structure is responsive and contains multiple content sections
