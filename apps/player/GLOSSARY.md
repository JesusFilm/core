# Player

The audience-facing shared-playlist viewer (`player.jesusfilm.org`): renders a media-context Playlist shared by its owner as a full-page video player, and funnels viewers toward the native mobile apps via deep links and install banners. Owns no entities — Playlist, Playlist Item, Variant, Video, and Language vocabulary all belong to the media and languages contexts.

## Language

### Delivery

**Playlist Page**:
The single meaningful surface of the app — the `/pl/{slug}` page that plays a shared Playlist. The Playlist is addressed by slug, not database id.
_Avoid_: Watch page, share page

**Shared Playlist**:
How this surface frames the upstream media Playlist: a list someone made and sent to you ("Shared with you by {owner's first name}"). Same entity as the media context's Playlist; the framing (owner attribution, share-oriented metadata) is player-native.
_Avoid_: Collection, video list

**Active Item**:
The Playlist Item currently loaded in the player, selected by position in the list. Playback auto-advances to the next Item when a video ends. Purely on-device state; it never leaves the browser.
_Avoid_: Current video, selection

**Unplayable Item**:
A Playlist Item whose Variant has no HLS stream; it is shown in the list but disabled. Playability is decided per-Variant, not per-Video.
_Avoid_: Broken video, missing video

### App handoff

**Install Banner**:
The dismissible in-page banner steering viewers to the iOS/Android apps. Which store buttons appear depends on Platform Detection; dismissal persists on the device.
_Avoid_: Smart banner (that is the iOS-native one below)

**Smart App Banner**:
The iOS-native banner triggered by the `apple-itunes-app` meta tag, deep-linking back into the same Playlist. On iOS it replaces the Install Banner entirely.

**App Association**:
The `.well-known` files (Apple app-site-association, Android asset links) that let Playlist URLs open directly in the native apps instead of the browser.
_Avoid_: Universal links config, deep link file

### Presentation

**OG Mosaic**:
The dynamically generated Open Graph image for a Playlist — a 1–4 cell grid of item thumbnails with a `+N` overflow cell — so a shared link previews the list's contents.
_Avoid_: Thumbnail, cover image
