# Homepage Implementation Slices

## Instructions for Filling Slices Template

This template follows ShapeUp principles of vertical, value-first feature delivery. Each slice should:

1. Deliver end-to-end user value
2. Address risks early
3. Start simple and iterate
4. Be testable and production-ready

## Basic implementation

### Slice 1 — Homepage Basic [Status: COMPLETED]
Scope: Minimal homepage with hero section and basic navigation

Must-haves:
- [x] Basic page structure with Next.js App Router
- [x] Header with logo and search bar (no functionality)
- [x] Hero section with static background (no animation)
- [x] Mission statement text (no gradient effects)
- [x] Single CTA button linking to video collection
- [x] Basic responsive layout (mobile/desktop)

DoD: tests for page rendering; a11y basics; responsive baseline.

### Slice 2 — Video Collection Basic [Status: COMPLETED]
Scope: Simple video grid display

Must-haves:
- [x] Static grid of 6 video cards (no carousel)
- [x] Basic video metadata display (title, duration)
- [x] GraphQL integration for video data (implemented)
- [x] Click navigation to video detail pages
- [x] Basic responsive grid (2-4 columns)
- [x] API connection verification and data loading
  - Start dev server: `cd /workspaces/core && nx run watch-modern:serve --port 4200`
  - Trigger compilation: `curl -s http://localhost:4200/watch`
  - Verify runtime:
    - Page renders without Apollo error banner
    - At least 6 video cards render with non-empty titles
    - Images load from Media API (no broken thumbnails)
    - No console errors in browser
  - Document outcome in `apps/watch-modern/LEARNINGS.md`
 - [x] Loading state with skeleton placeholders for cards
 - [x] Error state UI with friendly message when query fails
 - [x] Accessibility: cards operable via keyboard (Enter/Space), `role="button"`, `tabIndex=0`, `aria-label`
 - [x] Data shape aligns with schema (arrays for `title`, `snippet`, `description`, `imageAlt`, `images`)

DoD: tests for video display; navigation works; responsive grid; GraphQL integration complete; loading and error states covered; a11y validated; runtime API verified and documented in LEARNINGS.

### Slice 3 — Video Grid Section Basic [Status: COMPLETED]
Scope: Simple grid of videos with optional numbering

Must-haves:
- [x] Static grid of 10 video cards
- [x] Optional numbering labels for items
- [x] Hardcoded demo data
- [x] Basic responsive layout
- [x] "SEE ALL" button (no functionality)
- [x] Loading state placeholders
- [x] Accessibility: keyboard operable items with `role="button"`, `tabIndex=0`, `aria-label`
- [x] Tests: rendering, item count, responsive grid classes, optional numbering

DoD: tests for grid display; optional numbering; responsive layout; a11y baseline; loading state present.

### Slice 4 — Categories Basic [Status: COMPLETED]
Scope: Simple category display

Must-haves:
- [x] Static grid of 12 category cards
- [x] Basic category names and icons
- [x] Hardcoded category data
- [x] Basic responsive layout
- [x] Click navigation to category pages (reserved for future improvements)
 - [x] Loading state placeholders
 - [x] Accessibility: keyboard operable category cards with `role="button"`, `tabIndex=0`, `aria-label`
 - [x] Tests: rendering, card count, keyboard interaction, responsive grid classes

DoD: tests for category display; responsive layout; a11y baseline; loading state present.

## Improved implementation

### Slice 1 — Homepage Improved [Status: COMPLETED]
Scope: Enhanced hero with animations and audience segmentation

Nice-to-haves (~):
- [x] Animated background grid (simplified version)
- [x] Gradient text effects on mission statement
- [x] Audience segmentation buttons (3 options)
- [x] Language button with modal trigger (removed - already in header)
- [x] Enhanced responsive design

DoD: tests for animations; modal functionality; enhanced responsive.

### Slice 2 — Video Collection Improved [Status: COMPLETED]
Scope: Carousel functionality and enhanced video cards

Nice-to-haves (~):
- [x] Horizontal carousel with navigation buttons
- [x] Progress indicators for carousel
- [x] Enhanced video metadata (languages, subtitles)
- [x] Play button overlays on hover
- [x] Smooth scrolling and snap points

DoD: tests for carousel functionality; hover effects; smooth scrolling.

### Slice 3 — Course Section Improved [Status: COMPLETED]
Scope: Enhanced course display with background and effects

Nice-to-haves (~):
- [x] Background image with overlay effects
- [x] Enhanced episode numbering with glow effects
- [x] Duration badges and play overlays
- [x] Improved responsive grid (4 columns)
- [x] "SEE ALL" button with proper linking

DoD: tests for background effects; enhanced styling; proper linking.

### Slice 4 — Categories Improved [Status: PLANNED]
Scope: Enhanced category display with gradients and carousel

Nice-to-haves (~):
- [ ] Gradient backgrounds for each category
- [ ] Horizontal carousel with navigation
- [ ] Enhanced hover effects and transitions
- [ ] Improved responsive design
- [ ] Category-specific icons and colors

DoD: tests for gradients; carousel functionality; enhanced hover effects.

## Polished Implementation

### Slice 1 — Homepage Polished [Status: PLANNED]
Scope: Performance optimization and advanced animations

- [ ] Performance optimizations
  - [ ] Lazy loading for images
  - [ ] Core Web Vitals optimization
  - [ ] Bundle size optimization
  - [ ] Image optimization with Next.js Image
- [ ] Advanced animations
  - [ ] Smooth 60fps background animation
  - [ ] Reduced motion support
  - [ ] Hardware acceleration
  - [ ] Animation performance monitoring

DoD: performance targets met; animations optimized; accessibility enhanced.

### Slice 2 — Video Collection Polished [Status: PLANNED]
Scope: API integration and advanced features

- [ ] API integration
  - [ ] GraphQL integration for video data
  - [ ] Media API for thumbnails
  - [ ] Error handling and loading states
  - [ ] Data caching and optimization
- [ ] Advanced features
  - [ ] Search integration with Algolia
  - [ ] Analytics tracking for video interactions
  - [ ] SEO optimization for video content
  - [ ] Structured data markup

DoD: API integration complete; search functional; analytics tracking.

### Slice 3 — Course Section Polished [Status: PLANNED]
Scope: Advanced course features and optimization

- [ ] Advanced course features
  - [ ] Course progress tracking
  - [ ] Episode completion states
  - [ ] Course metadata and descriptions
  - [ ] Related content suggestions
- [ ] Optimization
  - [ ] Video preloading for next episodes
  - [ ] Course analytics tracking
  - [ ] SEO optimization for course content
  - [ ] Performance monitoring

DoD: course features complete; analytics tracking; performance optimized.

### Slice 4 — Categories Polished [Status: PLANNED]
Scope: Advanced category features and internationalization

- [ ] Advanced category features
  - [ ] Category-specific content filtering
  - [ ] Category analytics tracking
  - [ ] Category metadata and descriptions
  - [ ] Category-specific layouts
- [ ] Internationalization
  - [ ] Category name translations
  - [ ] Multi-language support
  - [ ] Language-specific content
  - [ ] RTL language support

DoD: category features complete; i18n implemented; analytics tracking.

## Technical Dependencies

### External Libraries
- Next.js 14+ with App Router
- Tailwind CSS 3.4+
- Shadcn/ui components
- Lucide React icons
- Algolia InstantSearch.js
- Apollo Client for GraphQL

### Internal Dependencies
- Existing Algolia configuration from `/apps/watch`
- Language modal component from `/apps/watch`
- Internationalization setup from `/apps/watch`
- Analytics patterns from `/apps/watch`

### API Dependencies
- GraphQL API for video data
- Media API for video thumbnails
- Algolia search API
- Translation API for i18n

## Risk Mitigation

### High Risk Items
- **Animation Performance**: Implement reduced motion support and fallbacks
- **Search Integration**: Thorough testing of Algolia integration
- **Internationalization**: Comprehensive testing of all supported languages

### Medium Risk Items
- **Responsive Design**: Extensive testing across devices
- **SEO Implementation**: Regular audits and monitoring
- **Performance**: Continuous monitoring and optimization

### Low Risk Items
- **Component Development**: Standard React/Next.js patterns
- **Styling**: Well-established Tailwind CSS approach
- **Testing**: Standard testing practices

## Success Criteria
- Homepage loads in under 3 seconds
- All animations run at 60fps
- Accessibility score of 100%
- SEO score of 90+ on Lighthouse
- Cross-browser compatibility
- Mobile-first responsive design
- Full internationalization support

