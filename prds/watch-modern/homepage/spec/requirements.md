# Homepage Requirements

## Functional Requirements

### 1. Header Navigation
- **Logo**: Jesus Film Project logo linking to `/watch`
- **Search Bar**: Functional search input with placeholder "Search videos..."
- **Language Switcher**: Globe icon button that opens language selection modal
- **Responsive**: Collapses to mobile menu on smaller screens

### 2. Hero Section
- **Animated Background**: Grid of video thumbnails with continuous animation
- **Main Headline**: "Watch the Greatest Story Ever Told" with gradient text
- **Subheadline**: Descriptive text about Jesus Film Project mission
- **CTA Button**: "Free Bible Videos" button linking to video collection
- **Audience Segmentation**: Three interactive buttons for different user types

### 3. Video Bible Collection Section
- **Section Header**: "Video Gospel in every style and language"
- **Carousel**: Auto-advancing film carousel with manual navigation
- **Film Cards**: Display title, subtitle, duration, language count, and thumbnail
- **Progress Indicator**: Dots showing current position and total count
- **Navigation**: Previous/Next buttons with hover effects

### 4. Video Course Section
- **Section Header**: "New Believer Course" with description
- **Video Grid**: YouTube-style grid layout with episode numbers
- **Video Cards**: Thumbnail, title, subtitle, duration, and play button
- **Episode Numbers**: Large numbered badges on thumbnails
- **Hover Effects**: Play button overlay and scale animations

### 5. Category Browse Section
- **Section Header**: "Discover Content by Topic"
- **Category Cards**: 12 themed categories with gradient backgrounds
- **Icons**: Lucide React icons for each category
- **Carousel**: Horizontal scrolling with navigation controls
- **Responsive**: Adapts to different screen sizes

### 6. Audience Segmentation
- **Three Options**: 
  - "Discover who Jesus is" (Compass icon)
  - "Grow closer to God" (Sprout icon)
  - "Get equipped for ministry" (Footprints icon)
- **Interactive**: Hover effects and click handlers
- **Navigation**: Redirect to filtered content pages

### 7. Language Support
- **Supported Languages**: English, Russian, French, Spanish, Portuguese, Arabic
- **Language Modal**: Dropdown with language options
- **URL Structure**: Follow existing pattern `/watch/[language].html`
- **Internationalization**: Use next-i18next for translations

### 8. Search Functionality
- **Search Input**: Functional search bar in header
- **Search Results**: Navigate to `/watch/videos` with search query
- **Algolia Integration**: Use existing search infrastructure

### 9. Video Playback
- **Video Links**: Navigate to dedicated video pages using existing URL structure
- **URL Pattern**: `/watch/[video-slug].html/[language].html`
- **Video Player**: Use existing video player components

### 10. Category Navigation
- **Category Pages**: Dedicated pages for each category
- **URL Structure**: `/watch/category/[category-slug].html/[language].html`
- **Filtered Content**: Show videos filtered by category

## Non-Functional Requirements

### Performance
- **Lazy Loading**: Implement lazy loading for images and components
- **Optimized Images**: Use Next.js Image component with proper sizing
- **Bundle Size**: Minimize JavaScript bundle size
- **Loading States**: Show skeleton loaders during data fetching

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG AA compliance

### Responsive Design
- **Breakpoints**: Follow Tailwind CSS standard breakpoints
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
- **Mobile-First**: Design for mobile, enhance for desktop
- **Touch Targets**: Minimum 44px touch targets on mobile

### Analytics
- **Event Tracking**: Track user interactions using existing patterns
- **Video Events**: Track video play, pause, progress, completion
- **Page Views**: Track section visibility and engagement
- **User Journey**: Track audience segmentation selections

### SEO
- **Meta Tags**: Proper title, description, and Open Graph tags
- **Structured Data**: Video schema markup
- **Sitemap**: Include in site sitemap
- **Performance**: Core Web Vitals optimization 