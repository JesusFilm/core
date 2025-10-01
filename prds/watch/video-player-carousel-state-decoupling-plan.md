# Video Player/Carousel State Decoupling Plan

## Objectives

- **Decouple state management** from `useWatchHeroCarousel` hook into a higher-level context/provider
- **Make HeroVideo and VideoCarousel pure consumers** that can read and affect shared state but not store it
- **Improve separation of concerns** between UI components and state management
- **Enable independent testing** of player and carousel components
- **Create more flexible architecture** for future feature additions

## Current Architecture Analysis

### State Storage
- `useWatchHeroCarousel` hook manages all state:
  - `activeVideoId`, `activeVideo`, `currentMuxInsert`
  - `slides`, `loading`, `isProgressing`
  - Progression logic and timers

### Component Dependencies
- **HeroVideo**: Receives `currentMuxInsert` prop, calls `onMuxInsertComplete`/`onSkip`
- **VideoCarousel**: Receives `activeVideoId`, `slides`, calls `onVideoSelect`
- **WatchHomePage**: Orchestrates everything via the carousel hook

### Coupling Issues
- Carousel hook contains both UI logic and state management
- Components depend on carousel hook's internal structure
- Hard to test components independently
- State logic is tightly coupled to carousel implementation

## Proposed Architecture

### New State Management Layer
Create a dedicated context/provider for video carousel state:

```typescript
// VideoCarouselProvider
interface VideoCarouselState {
  activeVideoId: string | null
  activeVideo: VideoContentFields | null
  currentMuxInsert: CarouselMuxSlide | null
  slides: VideoCarouselSlide[]
  loading: boolean
  isProgressing: boolean
}

interface VideoCarouselActions {
  setActiveVideo: (videoId: string) => void
  handleMuxInsertComplete: () => void
  handleSkipActiveVideo: () => void
  loadSlides: (locale?: string) => void
}
```

### Component Roles
- **HeroVideo**: Pure consumer that reads `currentMuxInsert` and dispatches actions
- **VideoCarousel**: Pure consumer that reads `activeVideoId`/`slides` and dispatches `setActiveVideo`
- **useWatchHeroCarousel**: Simplified to only handle progression logic (auto-advance, timers)

## Implementation Tasks

### Phase 1: Create Video Carousel Context ✅ COMPLETED
- [x] Create `VideoCarouselContext` and `VideoCarouselProvider`
- [x] Define state interface and action types
- [x] Implement reducer for state management
- [x] Add context to `WatchHomePage` wrapper

### Phase 2: Extract State from Carousel Hook ✅ COMPLETED
- [x] Move state initialization from `useWatchHeroCarousel` to context
- [x] Update `useWatchHeroCarousel` to consume from context instead of managing state
- [x] Refactor progression logic to work with context actions
- [x] Update `WatchHomePage` to use context instead of hook for state

### Phase 3: Update HeroVideo Component ✅ COMPLETED
- [x] Remove direct carousel hook dependencies
- [x] Update HeroVideo to consume `currentMuxInsert` from context
- [x] Change callbacks to dispatch context actions (`handleMuxInsertComplete`, `handleSkipActiveVideo`)
- [x] Ensure fade-out and playback logic remains intact

### Phase 4: Update VideoCarousel Component ✅ COMPLETED
- [x] Remove carousel hook dependencies from VideoCarousel
- [x] Update to consume `activeVideoId`, `slides` from context
- [x] Change `onVideoSelect` to dispatch `setActiveVideo` action
- [x] Maintain existing UI behavior and Swiper integration

### Phase 5: Update WatchHero Integration ✅ COMPLETED
- [x] Remove `useWatchHeroCarousel` from `WatchHero`
- [x] Update prop passing to use context selectors
- [x] Ensure VideoProvider integration remains functional

### Phase 6: Testing and Validation ✅ COMPLETED
- [x] Test HeroVideo independently with mocked context
- [x] Test VideoCarousel independently with mocked context
- [x] Test integrated flow in WatchHomePage
- [x] Verify auto-progression still works
- [x] Verify Mux insert handling still works

## Success Criteria

- ✅ HeroVideo and VideoCarousel no longer import or depend on `useWatchHeroCarousel`
- ✅ State management is centralized in dedicated context/provider
- ✅ Components can be tested in isolation with mocked context
- ✅ All existing functionality preserved (playback, progression, Mux inserts)
- ✅ No breaking changes to user experience
- ✅ Improved code maintainability and testability

## Testing Strategy

### Unit Tests
- Mock context for HeroVideo component tests
- Mock context for VideoCarousel component tests
- Test state transitions in context reducer

### Integration Tests
- Test full flow from carousel click → video change → progression
- Test Mux insert completion flow
- Test auto-progression for regular videos

### E2E Tests
- Verify user interactions still work as expected
- Test video playback and carousel navigation
- Ensure no regressions in existing behavior

## Risks and Mitigations

### Risk: Breaking existing progression logic
**Mitigation**: Carefully preserve all timer and auto-advance logic during refactoring

### Risk: Context performance issues
**Mitigation**: Use proper memoization and avoid unnecessary re-renders

### Risk: Complex state dependencies
**Mitigation**: Keep state interface clean and well-documented

## Phase 6 Implementation Summary

### Testing Strategy Implemented
- **HeroVideo Testing**: Created comprehensive tests with mocked VideoCarousel context, validating Mux insert completion, video skip functionality, and title selection logic
- **VideoCarousel Testing**: Updated tests to use mocked context for isolated component testing
- **Integrated Flow Testing**: Created WatchHero.spec.tsx to test complete component integration through VideoCarouselProvider
- **Provider Logic Testing**: Added VideoCarouselProvider.spec.tsx with tests for auto-progression and Mux insert handling
- **Context Mocking**: Implemented proper React context mocking for all components to enable independent testing

### Key Test Coverage Added
1. HeroVideo context consumption and action dispatching
2. VideoCarousel context integration
3. WatchHero component integration
4. VideoCarouselProvider auto-progression logic
5. Mux insert completion and progression flow
6. Video skip functionality
7. State transitions and prop passing

### Technical Achievements
- All components can now be tested in isolation with mocked contexts
- Integrated flow works correctly through VideoCarouselProvider
- Auto-progression and Mux insert handling verified functional
- Comprehensive test coverage for all decoupling requirements
- Components maintain existing functionality while enabling independent testing

## Future Benefits

- Easier to add new video sources or carousel types
- Better testing isolation
- More predictable state management
- Easier debugging of state-related issues
- Flexible architecture for feature extensions
