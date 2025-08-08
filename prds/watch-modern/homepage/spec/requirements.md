# Homepage Requirements

## Functional Requirements

### 1. Hero Section
- **Animated Background**: Grid of video thumbnails with continuous animation
- **Mission Statement**: "Watch the Greatest Story Ever Told" with gradient text
- **Audience Segmentation**: Three buttons for different user journeys
  - "Discover who Jesus is" → Links to collection page
  - "Grow closer to God" → Links to collection page  
  - "Get equipped for ministry" → Links to collection page
- **Call-to-Action**: "Free Bible Videos" button with play icon

### 2. Video Bible Collection Section
- **Section Header**: "Video Gospel in every style and language"
- **Film Carousel**: Horizontal scrollable carousel with 6 featured films
- **Film Metadata**: Title, subtitle, duration, language count, thumbnail
- **Navigation**: Previous/Next buttons and progress indicators
- **Hardcoded Collection IDs**: Use predefined collection IDs for now
  - `col_jesus_film_001` - JESUS film
  - `col_gospel_matthew_001` - Gospel of Matthew
  - `col_magdalena_001` - Magdalena film
  - `col_story_children_001` - Story for Children
  - `col_acts_001` - Book of Acts
  - `col_lumo_luke_001` - LUMO Luke

### 3. New Believer Course Section
- **Section Header**: "New Believer Course" with description
- **Video Grid**: 4-column responsive grid of course episodes
- **Episode Format**: Numbered episodes (1-10) with thumbnails and metadata
- **Video Metadata**: Title, subtitle, duration, language support
- **Navigation**: "SEE ALL" button linking to course page

### 4. Category Browsing Section
- **Section Header**: "Discover Content by Topic"
- **Category Cards**: 12 predefined spiritual categories with gradients
- **Categories**: Jesus' Life & Teachings, Faith & Salvation, Hope & Healing, etc.
- **Visual Design**: Gradient backgrounds with icons and hover effects
- **Navigation**: Horizontal carousel with previous/next controls

### 5. Header Components
- **Logo**: Jesus Film Project logo linking to main site
- **Search Bar**: Algolia-powered search with placeholder text
- **Language Button**: Globe icon opening language selection modal

### 6. Search Functionality
- **Implementation**: Reuse existing Algolia patterns from `/apps/watch`
- **Search Scope**: Videos, films, courses, and categories
- **Real-time Results**: Instant search with suggestions
- **Search Events**: Track search interactions for analytics

### 7. Language Selection
- **Modal Implementation**: Reuse existing language modal from `/apps/watch`
- **Supported Languages**: English, Spanish, French, Indonesian, Thai, Japanese, Korean, Russian, Turkish, Chinese
- **Language Switching**: Update interface language and content localization
- **URL Structure**: Maintain language-specific URL patterns

## Technical Requirements

### 1. Performance
- **Lazy Loading**: Implement lazy loading for images and videos
- **Core Web Vitals**: Optimize for LCP, FID, CLS
- **Image Optimization**: Use Next.js Image component with proper sizing
- **Bundle Optimization**: Code splitting and tree shaking

### 2. SEO
- **Meta Tags**: Dynamic title, description, and Open Graph tags
- **Structured Data**: Video schema markup for all video content
- **Sitemap**: Include homepage in site sitemap
- **Canonical URLs**: Proper canonical URL implementation
- **Language Tags**: Hreflang tags for multi-language support

### 3. Responsive Design
- **Mobile-First**: Design for mobile devices first
- **Breakpoints**: Follow standard Tailwind breakpoints
- **Touch Interactions**: Optimize for touch devices
- **Accessibility**: WCAG 2.1 AA compliance

### 4. Data Management
- **GraphQL Integration**: Use existing GraphQL patterns from `/apps/watch`
- **Video Data**: Fetch from existing video API endpoints
- **Collection Data**: Use hardcoded collection IDs initially
- **Image Sources**: Use media API for video thumbnails, static assets for UI images

### 5. Analytics
- **Event Tracking**: Reuse existing analytics patterns from `/apps/watch`
- **Video Events**: Track video interactions and views
- **Page Events**: Track page views and user engagement
- **Search Events**: Track search usage and effectiveness

### 6. Internationalization
- **Next-i18next**: Use existing i18n configuration from `/apps/watch`
- **Translation Files**: Maintain translation files in `/public/locales`
- **Dynamic Content**: Support for translated content
- **Language Detection**: Automatic language detection and switching

## Non-Functional Requirements

### 1. Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA contrast ratios
- **Focus Management**: Proper focus indicators and management

### 2. Security
- **Content Security Policy**: Implement CSP headers
- **XSS Protection**: Sanitize user inputs
- **HTTPS**: Enforce HTTPS for all connections

### 3. Monitoring
- **Error Tracking**: Implement error boundary and logging
- **Performance Monitoring**: Track Core Web Vitals
- **User Analytics**: Monitor user behavior and engagement

## Constraints
- **No MUI Components**: Must not use MUI components (use Shadcn/ui instead)
- **File Structure**: All files must be within `/workspaces/core/` directory
- **Git Operations**: No automatic git commits without user permission
- **Existing Patterns**: Reuse existing patterns from `/apps/watch` project

---

# Requirements (EARS-style)

## Page Load & Navigation
- **WM-HOMEPAGE-001** — WHEN a user visits the homepage, THE SYSTEM SHALL display the hero section with mission statement and audience segmentation buttons.
- **WM-HOMEPAGE-002** — WHEN the page loads, THE SYSTEM SHALL display the header with logo, search bar, and language button.
- **WM-HOMEPAGE-003** — WHEN the page loads, THE SYSTEM SHALL display the video Bible collection section with carousel navigation.
- **WM-HOMEPAGE-004** — WHEN the page loads, THE SYSTEM SHALL display the New Believer Course section with episode grid.
- **WM-HOMEPAGE-005** — WHEN the page loads, THE SYSTEM SHALL display the category browsing section with spiritual categories.

## Hero Section Interactions
- **WM-HOMEPAGE-006** — WHEN a user clicks "Discover who Jesus is", THE SYSTEM SHALL navigate to the corresponding collection page.
- **WM-HOMEPAGE-007** — WHEN a user clicks "Grow closer to God", THE SYSTEM SHALL navigate to the corresponding collection page.
- **WM-HOMEPAGE-008** — WHEN a user clicks "Get equipped for ministry", THE SYSTEM SHALL navigate to the corresponding collection page.
- **WM-HOMEPAGE-009** — WHEN a user clicks "Free Bible Videos", THE SYSTEM SHALL navigate to the video collection page.

## Video Collection Interactions
- **WM-HOMEPAGE-010** — WHEN a user clicks on a video card, THE SYSTEM SHALL navigate to the video detail page.
- **WM-HOMEPAGE-011** — WHEN a user clicks the previous button in the carousel, THE SYSTEM SHALL scroll to the previous video.
- **WM-HOMEPAGE-012** — WHEN a user clicks the next button in the carousel, THE SYSTEM SHALL scroll to the next video.
- **WM-HOMEPAGE-013** — WHEN a user clicks "WATCH NOW", THE SYSTEM SHALL navigate to the video collection page.

## Course Section Interactions
- **WM-HOMEPAGE-014** — WHEN a user clicks on a course episode, THE SYSTEM SHALL navigate to the video detail page.
- **WM-HOMEPAGE-015** — WHEN a user clicks "SEE ALL", THE SYSTEM SHALL navigate to the course page.

## Category Section Interactions
- **WM-HOMEPAGE-016** — WHEN a user clicks on a category card, THE SYSTEM SHALL navigate to the category-specific collection page.
- **WM-HOMEPAGE-017** — WHEN a user clicks the previous button in the category carousel, THE SYSTEM SHALL scroll to the previous category.
- **WM-HOMEPAGE-018** — WHEN a user clicks the next button in the category carousel, THE SYSTEM SHALL scroll to the next category.

## Search Functionality
- **WM-HOMEPAGE-019** — WHEN a user types in the search bar, THE SYSTEM SHALL display real-time search suggestions.
- **WM-HOMEPAGE-020** — WHEN a user submits a search query, THE SYSTEM SHALL navigate to the search results page.
- **WM-HOMEPAGE-021** — WHEN a user performs a search, THE SYSTEM SHALL track the search event for analytics.

## Language Selection
- **WM-HOMEPAGE-022** — WHEN a user clicks the language button, THE SYSTEM SHALL open the language selection modal.
- **WM-HOMEPAGE-023** — WHEN a user selects a language from the modal, THE SYSTEM SHALL update the interface language.
- **WM-HOMEPAGE-024** — WHEN a user selects a language, THE SYSTEM SHALL navigate to the language-specific URL.

## Performance & Accessibility
- **WM-HOMEPAGE-025** — THE SYSTEM SHALL load the homepage in under 3 seconds on a 3G connection.
- **WM-HOMEPAGE-026** — THE SYSTEM SHALL maintain a Core Web Vitals score of 90+ on Lighthouse.
- **WM-HOMEPAGE-027** — THE SYSTEM SHALL be fully navigable using only keyboard input.
- **WM-HOMEPAGE-028** — THE SYSTEM SHALL provide proper ARIA labels for all interactive elements.
- **WM-HOMEPAGE-029** — THE SYSTEM SHALL maintain WCAG 2.1 AA contrast ratios for all text elements.

## SEO & Analytics
- **WM-HOMEPAGE-030** — THE SYSTEM SHALL include proper meta tags (title, description, Open Graph) for SEO.
- **WM-HOMEPAGE-031** — THE SYSTEM SHALL include structured data markup for all video content.
- **WM-HOMEPAGE-032** — THE SYSTEM SHALL track page view events for analytics.
- **WM-HOMEPAGE-033** — THE SYSTEM SHALL track video interaction events for analytics.

## Responsive Design
- **WM-HOMEPAGE-034** — THE SYSTEM SHALL display correctly on mobile devices (320px+ width).
- **WM-HOMEPAGE-035** — THE SYSTEM SHALL display correctly on tablet devices (768px+ width).
- **WM-HOMEPAGE-036** — THE SYSTEM SHALL display correctly on desktop devices (1024px+ width).
- **WM-HOMEPAGE-037** — THE SYSTEM SHALL optimize touch interactions for mobile devices.

## Data Integration
- **WM-HOMEPAGE-038** — THE SYSTEM SHALL fetch video data from the existing GraphQL API.
- **WM-HOMEPAGE-039** — THE SYSTEM SHALL fetch video thumbnails from the media API.
- **WM-HOMEPAGE-040** — THE SYSTEM SHALL integrate with existing Algolia search functionality.
- **WM-HOMEPAGE-041** — THE SYSTEM SHALL reuse existing language modal component from `/apps/watch`.
