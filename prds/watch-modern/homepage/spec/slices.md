# Homepage Implementation Slices

## Data Architecture

### GraphQL Queries
```typescript
// Reuse existing video query pattern
export const GET_HOME_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetHomeVideos($ids: [ID!]!, $languageId: ID) {
    videos(where: { ids: $ids }) {
      ...VideoChildFields
    }
  }
`

// Hardcoded collection IDs for initial implementation
const FEATURED_FILMS_IDS = [
  'jesus/english',
  'magdalena/english', 
  'book-of-acts/english',
  'story-of-jesus-for-children/english',
  'lumo-luke/english',
  'gospel-of-matthew/english'
]

const NEW_BELIEVER_COURSE_IDS = [
  'simple-gospel/english',
  'blood-of-jesus/english',
  'life-after-death/english',
  'gods-forgiveness/english',
  'savior-lord-friend/english',
  'being-made-new/english',
  'living-for-god/english',
  'the-bible/english',
  'prayer/english',
  'church/english'
]
```

### Component Structure
```
HomePage/
├── Header/
│   ├── Logo
│   ├── SearchBar
│   └── LanguageSwitcher
├── HeroSection/
│   ├── AnimatedBackground
│   ├── HeroContent
│   └── AudienceSegmentation
├── VideoBibleCollection/
│   ├── SectionHeader
│   ├── VideoCarousel
│   └── ProgressIndicator
├── VideoCourseSection/
│   ├── SectionHeader
│   ├── VideoGrid
│   └── CourseInfo
└── CategoryBrowse/
    ├── SectionHeader
    ├── CategoryCarousel
    └── CategoryInfo
```

## Implementation Slices

### Slice 1: Header Component
**Priority**: High
**Estimated Time**: 2 days

**Components**:
- `Header.tsx` - Main header component
- `SearchBar.tsx` - Search input with Algolia integration
- `LanguageSwitcher.tsx` - Language selection modal
- `LanguageModal.tsx` - Language selection dropdown

**Data Dependencies**:
- Language list from `baseLanguages.ts`
- Search integration with existing Algolia setup

**Key Features**:
- Responsive design with mobile menu
- Search functionality redirecting to `/watch/videos`
- Language switcher using existing i18n patterns

### Slice 2: Hero Section
**Priority**: High
**Estimated Time**: 3 days

**Components**:
- `HeroSection.tsx` - Main hero component
- `AnimatedBackground.tsx` - Grid animation component
- `HeroContent.tsx` - Text and CTA content
- `AudienceSegmentation.tsx` - User journey buttons

**Data Dependencies**:
- Hardcoded background images array
- Audience segmentation options

**Key Features**:
- Animated grid background with lazy loading
- Gradient overlays for text readability
- Interactive audience segmentation buttons
- Responsive text sizing

### Slice 3: Video Bible Collection
**Priority**: High
**Estimated Time**: 3 days

**Components**:
- `VideoBibleCollection.tsx` - Section wrapper
- `VideoCarousel.tsx` - Auto-advancing carousel
- `VideoCard.tsx` - Individual video card
- `ProgressIndicator.tsx` - Carousel progress dots

**Data Dependencies**:
- `GET_HOME_VIDEOS` query with `FEATURED_FILMS_IDS`
- Video metadata from GraphQL

**Key Features**:
- Auto-advancing carousel (5-second intervals)
- Manual navigation controls
- Progress indicator with dots
- Hover effects and play button overlays

### Slice 4: Video Course Section
**Priority**: Medium
**Estimated Time**: 2 days

**Components**:
- `VideoCourseSection.tsx` - Section wrapper
- `VideoGrid.tsx` - Responsive video grid
- `CourseVideoCard.tsx` - Course video card with episode numbers
- `CourseInfo.tsx` - Course description text

**Data Dependencies**:
- `GET_HOME_VIDEOS` query with `NEW_BELIEVER_COURSE_IDS`
- Episode numbering logic

**Key Features**:
- YouTube-style video grid layout
- Episode numbers with glow effects
- Responsive grid (1-4 columns)
- Hover animations and play overlays

### Slice 5: Category Browse
**Priority**: Medium
**Estimated Time**: 2 days

**Components**:
- `CategoryBrowse.tsx` - Section wrapper
- `CategoryCarousel.tsx` - Horizontal category carousel
- `CategoryCard.tsx` - Individual category card
- `CategoryInfo.tsx` - Section description

**Data Dependencies**:
- Hardcoded category data with icons and gradients
- Category navigation URLs

**Key Features**:
- 12 themed category cards
- Gradient backgrounds with icons
- Horizontal scrolling carousel
- Navigation to category pages

### Slice 6: Analytics Integration
**Priority**: Medium
**Estimated Time**: 1 day

**Components**:
- `AnalyticsProvider.tsx` - Analytics context
- `useAnalytics.ts` - Analytics hook

**Data Dependencies**:
- Existing Plausible and GTM setup
- Event tracking patterns from existing codebase

**Key Features**:
- Video interaction tracking (play, pause, progress)
- Page section visibility tracking
- Audience segmentation event tracking
- Search and navigation event tracking

### Slice 7: Performance Optimization
**Priority**: Low
**Estimated Time**: 1 day

**Components**:
- `LazyImage.tsx` - Lazy loading image component
- `SkeletonLoader.tsx` - Loading state components
- `IntersectionObserver.tsx` - Intersection observer hook

**Data Dependencies**:
- Next.js Image component optimization
- Intersection Observer API

**Key Features**:
- Lazy loading for images and components
- Skeleton loaders for loading states
- Progressive image loading
- Bundle size optimization

## Technical Dependencies

### External Libraries
- `lucide-react` - Icons
- `next-i18next` - Internationalization
- `@apollo/client` - GraphQL client
- `react-instantsearch` - Search functionality
- `next-plausible` - Analytics
- `@next/third-parties/google` - GTM

### Internal Dependencies
- `VIDEO_CHILD_FIELDS` - Video data structure
- `LanguageProvider` - Language context
- `WatchProvider` - Watch state management
- `createApolloClient` - Apollo client setup
- `baseLanguages.ts` - Language definitions

### Environment Variables
```env
NEXT_PUBLIC_ALGOLIA_INDEX=watch_videos
NEXT_PUBLIC_WATCH_URL=https://watch.jesusfilm.org
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## Testing Strategy

### Unit Tests
- Component rendering tests
- User interaction tests
- Data fetching tests
- Accessibility tests

### Integration Tests
- GraphQL query tests
- Search functionality tests
- Language switching tests
- Analytics event tests

### E2E Tests
- Page load performance
- Mobile responsiveness
- Cross-browser compatibility
- Accessibility compliance

## Deployment Considerations

### Build Optimization
- Code splitting for large components
- Image optimization with Next.js
- Bundle analysis and optimization
- CDN configuration for static assets

### Monitoring
- Performance monitoring with Core Web Vitals
- Error tracking and reporting
- Analytics data collection
- User experience monitoring 