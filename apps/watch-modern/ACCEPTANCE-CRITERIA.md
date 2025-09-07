# Video Carousel Acceptance Criteria

## Overview
Replace the static hero image with an auto-progressing video carousel that displays curated gospel videos from Arclight API.

## Functional Requirements

### Video Playback
- [ ] Each video plays exactly 15 seconds before auto-advancing
- [ ] Videos start muted by default
- [ ] Only one video plays at a time (others are paused/unmounted)
- [ ] Soft transition fade occurs during last 800ms of each 15-second cycle
- [ ] Videos use HLS streaming with hls.js for non-Safari browsers
- [ ] Videos use native HLS for Safari browsers
- [ ] Videos maintain 16:9 aspect ratio without layout shifts

### Navigation Controls
- [ ] Left arrow button navigates to previous video
- [ ] Right arrow button navigates to next video
- [ ] Bullet indicators show current video and allow direct navigation
- [ ] Bullet progress bar fills during 15-second playback
- [ ] All controls are keyboard accessible (arrow keys, space, enter)
- [ ] All controls have proper ARIA labels and roles

### Content Display
- [ ] Each slide displays: video title, type, description, language count, "Watch Now" button
- [ ] Video title is prominently displayed and truncated if too long
- [ ] Description text is truncated with ellipsis for long content
- [ ] Language count shows available audio/video languages
- [ ] "Watch Now" button links to legacy Watch using proper slug routing

### Visual Design
- [ ] Semi-transparent bottom gradient dissolves video into page background
- [ ] Gradient becomes more prominent during transition fade
- [ ] All text maintains AA accessibility contrast ratios
- [ ] Controls are properly positioned and sized for touch/mobile
- [ ] Responsive design works across all viewport sizes (360px+)

### Accessibility
- [ ] Carousel has `role="region"` and `aria-roledescription="carousel"`
- [ ] Each slide has `role="group"` with descriptive `aria-label`
- [ ] Active bullet has `aria-current="true"`
- [ ] Live region announces slide changes
- [ ] Keyboard navigation: arrows for navigation, space for pause/play
- [ ] Focus management follows carousel navigation
- [ ] Screen reader announcements for state changes

### Performance
- [ ] Zero Cumulative Layout Shift (CLS < 0.1)
- [ ] Lazy initialization of video players (only active + adjacent)
- [ ] Efficient memory management (cleanup inactive players)
- [ ] Progressive enhancement (SSR overlays work without JS)
- [ ] Optimized image loading for video posters

### Error Handling & Fallbacks
- [ ] If API fails, display static hero image with original overlay
- [ ] If video fails to load, skip to next video automatically
- [ ] If specific video not found, gracefully skip that item
- [ ] Network interruptions handled with timer-based advancement
- [ ] Graceful degradation when JavaScript is disabled

### Routing & URLs
- [ ] "Watch Now" links use NEXT_PUBLIC_WATCH_URL + "/" + videoSlug
- [ ] Links open in new tab/window
- [ ] Proper slug sanitization and validation
- [ ] Support for language slug overrides from curated list

### Browser Compatibility
- [ ] Chrome 90+ (desktop & mobile)
- [ ] Firefox 88+ (desktop & mobile)
- [ ] Safari 14+ (desktop & mobile)
- [ ] Edge 90+ (desktop & mobile)
- [ ] iOS Safari 14+
- [ ] Android Chrome 90+

### Data Source
- [ ] Uses GraphQL API via NEXT_PUBLIC_GATEWAY_URL
- [ ] Fetches curated video list from JSON configuration
- [ ] Supports locale-based content localization
- [ ] Mirrors legacy Watch field structure for parity
- [ ] Handles missing/invalid data gracefully

## Non-Functional Requirements

### Performance Metrics
- [ ] First Contentful Paint < 2.5s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 300ms

### SEO & Social
- [ ] Server-side rendering shows video overlays
- [ ] Proper meta tags for social sharing
- [ ] Structured data for video content
- [ ] Open Graph tags for video thumbnails

### Analytics & Monitoring
- [ ] Video play/pause/unmute events tracked
- [ ] Navigation events (arrows, bullets) tracked
- [ ] Error events logged for monitoring
- [ ] Performance metrics collected
- [ ] Conversion tracking for "Watch Now" clicks

### Testing Coverage
- [ ] Unit tests for all utility functions
- [ ] Integration tests for API data flow
- [ ] E2E tests for complete user journeys
- [ ] Accessibility audits (Lighthouse, axe)
- [ ] Performance monitoring in production

## Definition of Done

### Code Quality
- [ ] All components fully typed with TypeScript
- [ ] JSDoc comments on all public functions
- [ ] ESLint and Prettier rules followed
- [ ] Unit test coverage > 80%
- [ ] Integration tests for critical paths

### Documentation
- [ ] README updated with carousel maintenance instructions
- [ ] API documentation for data structures
- [ ] Troubleshooting guide for common issues
- [ ] Content team guide for managing video lists

### Quality Assurance
- [ ] Manual testing across all supported browsers
- [ ] Accessibility testing with screen readers
- [ ] Performance testing on low-end devices
- [ ] Cross-device testing (phone, tablet, desktop)
- [ ] Network condition testing (slow, intermittent)

### Deployment Readiness
- [ ] Feature flag implementation for gradual rollout
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented
- [ ] Performance baseline established
