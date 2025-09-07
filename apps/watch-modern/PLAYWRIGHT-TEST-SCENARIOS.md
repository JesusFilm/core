# Playwright Test Scenarios - Video Carousel

## Test File Structure
```
apps/watch-modern/testing/browser-tests/
├── home-carousel.spec.ts          # Main carousel functionality tests
├── home-carousel-accessibility.spec.ts  # A11y-specific tests
├── home-carousel-performance.spec.ts    # Performance tests
└── home-carousel-fallback.spec.ts      # Error handling tests
```

## Core Functionality Tests (home-carousel.spec.ts)

### Video Playback Scenarios
- [ ] **Muted Autoplay**: Verify first video starts muted automatically
- [ ] **15-Second Timer**: Confirm video advances exactly after 15 seconds
- [ ] **Single Active Player**: Verify only one video plays at a time
- [ ] **Soft Transition**: Test fade effect during last 800ms of playback
- [ ] **Video Loading**: Ensure videos load and play without errors

### Navigation Control Tests
- [ ] **Arrow Navigation**: Test left/right arrow button functionality
- [ ] **Bullet Navigation**: Verify clicking bullets navigates to correct slide
- [ ] **Bullet Progress**: Confirm progress bar fills during 15-second cycle
- [ ] **Keyboard Navigation**: Test arrow keys, space, and enter keys
- [ ] **Wrap-around Navigation**: Test navigation from first to last and vice versa

### Content Display Tests
- [ ] **Overlay Content**: Verify title, description, language count display
- [ ] **Text Truncation**: Test truncation for long titles/descriptions
- [ ] **Watch Now Links**: Confirm links use correct URL structure
- [ ] **Language Localization**: Test content in different locales

### Visual Design Tests
- [ ] **Gradient Overlay**: Verify gradient appearance and transition
- [ ] **Responsive Layout**: Test across different viewport sizes
- [ ] **Aspect Ratio**: Confirm 16:9 aspect ratio maintenance
- [ ] **Control Positioning**: Verify controls don't overlap content

## Accessibility Tests (home-carousel-accessibility.spec.ts)

### Screen Reader Tests
- [ ] **ARIA Labels**: Verify all controls have proper aria-labels
- [ ] **Live Regions**: Test announcements for slide changes
- [ ] **Focus Management**: Confirm proper focus indicators and order
- [ ] **Keyboard Navigation**: Test full keyboard-only operation

### Visual Accessibility Tests
- [ ] **Color Contrast**: Verify AA contrast ratios for all text
- [ ] **Focus Indicators**: Test visible focus rings on all controls
- [ ] **Screen Reader Mode**: Confirm proper content in screen reader mode

## Performance Tests (home-carousel-performance.spec.ts)

### Loading Performance
- [ ] **Initial Load**: Measure time to first video appearance
- [ ] **Lazy Loading**: Verify videos load only when needed
- [ ] **Memory Usage**: Monitor memory consumption during playback
- [ ] **Network Efficiency**: Test bandwidth usage patterns

### Runtime Performance
- [ ] **Smooth Playback**: Verify 60fps during video playback
- [ ] **Transition Performance**: Test fade transition smoothness
- [ ] **Navigation Speed**: Measure time for slide transitions
- [ ] **CLS Prevention**: Confirm no layout shifts during loading

## Error Handling Tests (home-carousel-fallback.spec.ts)

### API Failure Scenarios
- [ ] **GraphQL Error**: Test fallback to static hero when API fails
- [ ] **Network Timeout**: Verify graceful handling of slow responses
- [ ] **Invalid Data**: Test handling of malformed API responses
- [ ] **Empty Results**: Confirm behavior when no videos available

### Video Playback Failures
- [ ] **Video Load Error**: Test skip to next video on load failure
- [ ] **Playback Error**: Verify error handling during playback
- [ ] **Network Interruption**: Test timer-based advancement on stalls

### Browser Compatibility
- [ ] **Safari Native HLS**: Confirm native HLS usage in Safari
- [ ] **Chrome HLS.js**: Verify hls.js usage in Chrome
- [ ] **Fallback Support**: Test graceful degradation in older browsers

## Cross-Browser Test Matrix

### Desktop Browsers
- [ ] Chrome 90+ (Windows, macOS, Linux)
- [ ] Firefox 88+ (Windows, macOS, Linux)
- [ ] Safari 14+ (macOS)
- [ ] Edge 90+ (Windows)

### Mobile Browsers
- [ ] Chrome Mobile 90+ (Android)
- [ ] Safari Mobile 14+ (iOS)
- [ ] Samsung Internet 12+ (Android)

## Test Data Setup

### Mock GraphQL Responses
- [ ] **Standard Response**: 3 videos with complete metadata
- [ ] **Minimal Response**: Videos with missing optional fields
- [ ] **Error Response**: GraphQL error scenarios
- [ ] **Empty Response**: No videos returned

### Test Video Assets
- [ ] **Short Videos**: Videos under 15 seconds
- [ ] **Long Videos**: Videos that should be capped at 15 seconds
- [ ] **Different Formats**: Various HLS stream configurations
- [ ] **Error Videos**: Intentionally broken video URLs

## Test Execution Strategy

### Smoke Tests (Pre-deployment)
- [ ] Basic functionality across all browsers
- [ ] Critical path validation
- [ ] Accessibility compliance check

### Regression Tests (Post-deployment)
- [ ] Full test suite on production
- [ ] Performance monitoring
- [ ] Error rate tracking

### Continuous Integration
- [ ] Automated test execution on PRs
- [ ] Visual regression testing
- [ ] Accessibility compliance gates

## Test Utilities Needed

### Custom Playwright Helpers
- [ ] `waitForVideoToPlay()` - Wait for video to start playing
- [ ] `waitForSlideTransition()` - Wait for carousel transitions
- [ ] `mockGraphQLResponse()` - Mock API responses
- [ ] `simulateNetworkError()` - Simulate network failures
- [ ] `checkAccessibility()` - Run accessibility audits

### Test Configuration
- [ ] Multiple viewport sizes (360px, 768px, 1280px)
- [ ] Different network conditions (slow, fast, offline)
- [ ] Various device configurations
- [ ] Browser context isolation

## Success Criteria

### Test Coverage
- [ ] All user journeys covered by at least one test
- [ ] Edge cases and error scenarios tested
- [ ] Accessibility requirements validated
- [ ] Performance benchmarks met

### Quality Gates
- [ ] 95%+ test success rate
- [ ] No critical accessibility violations
- [ ] Performance within acceptable ranges
- [ ] Cross-browser compatibility confirmed

### Monitoring
- [ ] Test results tracked over time
- [ ] Failure patterns identified and addressed
- [ ] Performance regressions caught early
- [ ] Accessibility compliance maintained
