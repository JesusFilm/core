# Video Carousel Enhancement – Hardcoded Multi-Collection Playlist (Infinite, Seamless)

## Current State Analysis
The current implementation (`useFeaturedVideos.ts`) hardcodes a single collection and loads all children at once. It cannot support a fixed multi-collection sequence with random picks per collection, nor a seamless infinite feed.

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Playlist Configuration
- [x] Store playlist sequence in a JSON file
- [x] Format: Array of arrays. Each inner array is one "pool" (step)
  - [x] Single-item array → pick from that collection **ID**
  - [x] Multi-item array → treat as one merged pool and pick from any child in the union
- [x] **shortFilms**: handled in code (not in JSON) as a separate pool that appears on **every cycle**
- [x] **No categories surfaced in UI**: comments for humans only, never shown
- [x] **IDs instead of slugs**: Each entry in the JSON uses **collection IDs**, not slugs. This allows fetching `childrenCount` and video metadata efficiently

**Example JSON:**

{
  "version": "1.0.0",
  "playlistSequence": [
    ["1_jf-0-0"],
    ["20_Featured"],
    // New believer course
    ["8_NBC"],
    //lumo
    ["GOJohnCollection", "GOLukeCollection", "GOMarkCollection", "GOMattCollection"],
    //nua
    ["7_Origins", "Nua", "7_0-nur", "2_ElCamWaySJEN"],
    // Magdalena
    ["MAG1"],
    //bibleproject
    ["11_Sermon", "11_Shema", "11_ReadBible", "11_Advent"],
    // Book of acts
    ["2_Acts-0-0"],
    // animated native
    ["a-day-and-a-night-with-creator-sets-free"],
    // gospel of john
    ["2_GOJ-0-0"],
    ["90_ConversationStarters"],
    // the saviour
    ["the-savior"],
    ["91_CreationToChrist"],
    // animated filezero
    ["2_FileZero-0-0"],
    ["darkroom-faith"]
    // NOTE: shortFilms pool is injected in code on every cycle
  ]
}

#### 1.2 Data Layer Refactoring
- [x] Add GraphQL queries that return `childrenCount` for each collection ID
- [x] **One daily query**: request `childrenCount` for all collection IDs using `where: { ids: [...] }`. Cache for 24h (per business timezone)
- [x] For each pool:
  - [x] If one ID: use its `childrenCount` to compute a **daily deterministic offset** into its children
  - [x] If multiple IDs: sum all `childrenCount` values to get `total`. Use a daily seed to pick a global index, then map it to a parent collection and `childIndex` using cumulative counts
- [x] Fetch the chosen child using a `skip` or cursor query to return **exactly one video**

**Example: daily counts query shape (adjust to schema):**

query CollectionCounts($ids: [ID!]!, $languageId: ID) {
  collections(where: { ids: $ids }, languageId: $languageId) {
    nodes {
      id
      childrenCount
      slug
      label
      title { value }
      primaryLanguageId
      publishedAt
    }
  }
}

**Example: fetch one child by index (skip/cursor):**

query OneChildByIndex($parentId: ID!, $skip: Int!, $first: Int! = 1, $languageId: ID) {
  node(id: $parentId, languageId: $languageId) {
    id
    children(first: $first, skip: $skip) {
      nodes {
        id
        slug
        title { value }
        thumbnail { url }
        duration
        publishedAt
        label
      }
    }
  }
}

#### 1.3 State Management
- [x] Replace `useFeaturedVideos` with `useCarouselVideos`
- [x] Track only an internal **pool index** while mounted; **no cross-session position persistence**
- [x] **Played IDs requirement**:
  - [x] Maintain a **session-scoped** list of played video IDs to avoid repeats in the same visit
  - [x] Maintain a **persistent** list of played video IDs that auto-resets **monthly**
  - [x] If a random pick is already played in this session, request another from the same pool. If exhausted, **skip**

---

### Phase 2: Carousel Logic

#### 2.1 Infinite, Seamless Flow
- [x] Iterate `playlistSequence` in order. After the last pool, continue from the first **without any visual reset**
- [x] UI must never "jump back" or reveal categories; the feed feels **infinite** and "random enough"

#### 2.2 Small-Pool Exhaustion Rule
- [x] **If a pool becomes exhausted during this session (all videos already played), skip it** immediately and move to the next pool

#### 2.3 shortFilms Pool
- [x] Inject a **shortFilms** pool (by label) **on every cycle** in code, not JSON
- [x] Behaves like any other pool: pick one random short film, respect the played list, skip if exhausted

#### 2.4 Deterministic Daily Randomness
- [x] Use `periodKey = YYYY-MM-DD` (business timezone)
- [x] Seed a deterministic function with `(periodKey + collectionId)` for each pool to compute offsets
- [x] Everyone sees the **same picks for the day** → predictable, cache-friendly
- [x] At midnight (business timezone), the sequence changes automatically

#### 2.5 Prefetching (optional but recommended)
- [x] Prefetch 1–2 upcoming items' metadata to keep navigation snappy
- [x] Cancel stale prefetches if the user skips ahead (prevents wasted bandwidth and race conditions)

#### 2.6 Caching Strategy
- [x] Stop using `fetchPolicy: 'no-cache'`; use Apollo caching
- [x] `cache-first` for stable pools; `cache-and-network` for volatile ones (e.g., Featured)
- [x] One `childrenCount` query per day; **cache aggressively** for all users

---

### Phase 3: UI/UX Enhancements

#### 3.1 Loading States
- [x] Use skeleton loaders for pending cards
- [x] If a pool resolves to zero videos, skip silently and continue

#### 3.2 Performance
- [x] Lazy-load thumbnails and defer heavy previews
- [x] Intersection Observer to load only near-viewport assets

---

## Critical Requirements
1. **Hardcoded order of pools** internally, **no visible categories** in the UI.  
2. **Endless feed**: seamless wrap; no jump-back.  
3. **Random within pool**: one deterministic random playable per pool per day.  
4. **Avoid repeats within a visit** where possible (session-scoped played list).  
5. **Monthly auto-reset** of the persistent played list.  
6. **Small pools**: when exhausted in-session, **skip**.  
7. **shortFilms**: appears **every cycle**, injected in code.  
8. **Daily caching**: counts request is shared across all visitors, cached for 24h.
