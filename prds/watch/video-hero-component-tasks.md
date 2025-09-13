# Video Hero Component Implementation Tasks - REVISED

## Overview
Create a new video player + carousel component for the home page hero section by copying and adapting existing `/watch` components to follow the exact architectural patterns used by the lead developers.

## Task List

### Phase 1: Data Layer - Apollo GraphQL Hook Pattern
- [x] **Task 1.1**: Create Featured Videos Hook (Following `useVideoChildren` Pattern)
  - [x] Create `apps/watch/src/libs/useFeaturedVideos/useFeaturedVideos.ts`
  - [x] Copy GraphQL pattern from `apps/watch/src/libs/useVideoChildren/useVideoChildren.ts`
  - [x] Adapt query to fetch "new-believer-course/english" videos
  - [x] Create `apps/watch/src/libs/useFeaturedVideos/index.ts` (barrel export)
  - [x] Import required GraphQL fragments from existing codebase

### Phase 2: Video Player Component (Copy/Paste HeroVideo)
- [x] **Task 2.1**: Create Hero Video Player
  - [x] Create folder `apps/watch/src/components/VideoHero/HeroVideo/`
  - [x] Copy `apps/watch/src/components/NewVideoContentPage/VideoContentHero/HeroVideo/HeroVideo.tsx`
  - [x] Adapt to remove Material-UI dependencies, keep styling approach
  - [x] Create `apps/watch/src/components/VideoHero/HeroVideo/index.ts` (barrel export)
  - [x] Copy required utilities and maintain video.js integration exactly as-is

### Phase 3: Video Carousel (Copy/Paste VideoCarousel)
- [x] **Task 3.1**: Create Video Carousel Component
  - [x] Create folder `apps/watch/src/components/VideoHero/VideoCarousel/`
  - [x] Copy `apps/watch/src/components/NewVideoContentPage/VideoCarousel/VideoCarousel.tsx`
  - [x] Replace Material-UI theme breakpoints with equivalent Tailwind responsive classes
  - [x] Create `apps/watch/src/components/VideoHero/VideoCarousel/index.ts` (barrel export)
  - [x] Copy navigation button components

- [x] **Task 3.2**: Create Video Card Component (Copy/Paste Pattern)
  - [x] Create folder `apps/watch/src/components/VideoHero/VideoCarousel/VideoCard/`
  - [x] Copy `apps/watch/src/components/NewVideoContentPage/VideoCarousel/VideoCard/VideoCard.tsx`
  - [x] Adapt styling but maintain exact same functionality and hover states
  - [x] Create `apps/watch/src/components/VideoHero/VideoCarousel/VideoCard/index.ts`
  - [x] Copy utilities like `getLabelDetails` and `getWatchUrl`

### Phase 4: Navigation Buttons (Copy/Paste NavButton)
- [x] **Task 4.1**: Create Navigation Buttons
  - [x] Create folder `apps/watch/src/components/VideoHero/VideoCarousel/NavButton/`
  - [x] Copy `apps/watch/src/components/VideoCarousel/NavButton/NavButton.tsx`
  - [x] Adapt styling but maintain refs and click handling
  - [x] Create `apps/watch/src/components/VideoHero/VideoCarousel/NavButton/index.ts`

### Phase 5: Main VideoHero Component (Copy/Paste ContentHero Pattern)
- [x] **Task 5.1**: Create Main VideoHero Component
  - [x] Create folder `apps/watch/src/components/VideoHero/`
  - [x] Copy structure from `apps/watch/src/components/NewVideoContentPage/VideoContentHero/VideoContentHero.tsx`
  - [x] Combine HeroVideo + VideoCarousel in same layout pattern
  - [x] Create `apps/watch/src/components/VideoHero/index.ts` (barrel export)
  - [x] Implement video switching logic by copying player context patterns

### Phase 6: Context Integration (Copy/Paste PlayerContext Pattern)
- [x] **Task 6.1**: Copy Player Context if Needed
  - [x] Determine if player context is needed for video switching
  - [x] If yes, copy `apps/watch/src/libs/playerContext/PlayerContext.tsx`
  - [x] Adapt to `apps/watch/src/libs/playerContext/`
  - [x] Create proper barrel exports following exact pattern

### Phase 7: GraphQL Types and Fragments
- [x] **Task 7.1**: Copy Required GraphQL Infrastructure
  - [x] Copy required fragments from `apps/watch/src/libs/videoChildFields.ts`
  - [x] Copy required interfaces from `apps/watch/src/libs/videoContentFields.ts`
  - [x] Create `apps/watch/src/libs/videoChildFields.ts`
  - [x] Ensure Apollo Client is properly configured

### Phase 8: Home Page Integration
- [x] **Task 8.1**: Update Home Page
  - [x] Modify `apps/watch/src/pages/watch/index.tsx`
  - [x] Copy provider pattern from existing `/watch` pages
  - [x] Add VideoHero component above existing content
  - [x] Follow exact same provider nesting as `/watch` components

### Phase 9: Required Utilities (Copy/Paste)
- [x] **Task 9.1**: Copy Required Utility Functions
  - [x] Copy `apps/watch/src/libs/utils/getLabelDetails/`
  - [x] Copy `apps/watch/src/libs/utils/getWatchUrl/`
  - [x] Create equivalent utilities in `apps/watch/src/libs/utils/`
  - [x] Maintain exact same function signatures and behavior

### Phase 10: Testing and Validation
- [x] **Task 10.1**: Component Testing
  - [x] Test video playback using same patterns as existing components
  - [x] Test carousel navigation matches existing behavior
  - [x] Test video switching maintains player state correctly
  - [x] Validate GraphQL queries return expected data structure

## Technical Requirements (REVISED)

### Exact Architectural Patterns to Follow
1. **File Structure**: `ComponentName/ComponentName.tsx` + `ComponentName/index.ts`
2. **Context Pattern**: Reducer-based with typed actions (if needed)
3. **GraphQL Pattern**: Custom hooks with Apollo Client following `useVideoChildren`
4. **Export Pattern**: Barrel exports in every folder with `index.ts`
5. **Styling**: Copy existing component styles, adapt Material-UI to equivalent Tailwind
6. **State Management**: Follow existing PlayerContext/WatchContext patterns

### File Structure (EXACT /watch PATTERN)
```
apps/watch-modern/src/
├── libs/
│   ├── useFeaturedVideos/
│   │   ├── useFeaturedVideos.ts
│   │   └── index.ts
│   ├── playerContext/ (if needed)
│   │   ├── PlayerContext.tsx
│   │   └── index.ts
│   ├── utils/
│   │   ├── getLabelDetails/
│   │   │   ├── getLabelDetails.ts
│   │   │   └── index.ts
│   │   └── getWatchUrl/
│   │       ├── getWatchUrl.ts
│   │       └── index.ts
│   ├── videoChildFields.ts
│   └── videoContentFields.ts
└── components/
    └── VideoHero/
        ├── VideoHero.tsx
        ├── index.ts
        ├── HeroVideo/
        │   ├── HeroVideo.tsx
        │   └── index.ts
        └── VideoCarousel/
            ├── VideoCarousel.tsx
            ├── index.ts
            ├── VideoCard/
            │   ├── VideoCard.tsx
            │   └── index.ts
            └── NavButton/
                ├── NavButton.tsx
                └── index.ts
```

### Dependencies (ALREADY AVAILABLE)
- video.js: ^8.17.4
- videojs-mux: ^4.21.0  
- swiper: ^11.0.3
- @apollo/client: ^3.8.3
- lodash (already available)

### Copy Sources (EXACT FILES TO COPY/ADAPT)
1. **HeroVideo**: `apps/watch/src/components/NewVideoContentPage/VideoContentHero/HeroVideo/HeroVideo.tsx`
2. **VideoCarousel**: `apps/watch/src/components/NewVideoContentPage/VideoCarousel/VideoCarousel.tsx`
3. **VideoCard**: `apps/watch/src/components/NewVideoContentPage/VideoCarousel/VideoCard/VideoCard.tsx`
4. **NavButton**: `apps/watch/src/components/VideoCarousel/NavButton/NavButton.tsx`
5. **useVideoChildren**: `apps/watch/src/libs/useVideoChildren/useVideoChildren.ts`
6. **PlayerContext**: `apps/watch/src/libs/playerContext/PlayerContext.tsx`
7. **Utils**: All utility functions from `apps/watch/src/libs/utils/`

## Notes
- **COPY/PASTE APPROACH**: Each component should be copied exactly and adapted minimally
- **MAINTAIN PATTERNS**: Keep exact same patterns for state management, contexts, and hooks
- **STYLING ADAPTATION**: Only change styling from Material-UI to Tailwind, keep all logic identical
- **BARREL EXPORTS**: Every folder must have `index.ts` file following exact `/watch` pattern
- **GraphQL INTEGRATION**: Use exact same Apollo Client patterns and query structures