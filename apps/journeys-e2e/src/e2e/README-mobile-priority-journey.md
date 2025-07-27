# Mobile Priority Journey E2E Test

## Overview
This test suite (`mobile-priority-journey.spec.ts`) provides comprehensive end-to-end testing for the mobile journey experience on the e2e-priority journey.

## Test Coverage

The test covers all 31 steps outlined in the requirements:

### Navigation & UI Elements (Steps 1-7)
- ✅ Initial page load verification
- ✅ Navigation with swipe/click gestures
- ✅ Info button popup functionality
- ✅ Report content email integration
- ✅ Terms & Conditions link verification
- ✅ Left/right arrow navigation
- ✅ Swipe gesture testing

### Background Video Testing (Steps 8-12)
- ✅ Jesus Film Library background videos
- ✅ YouTube library background videos
- ✅ YouTube linked background videos
- ✅ Custom uploaded background videos
- ✅ Video autoplay, fullscreen, and overlay verification

### Background Image Testing (Steps 13-16)
- ✅ Gallery images with overlays
- ✅ Uploaded images with overlays
- ✅ AI generated images with overlays
- ✅ White text verification on overlays

### Video Block Testing (Steps 17-26)
- ✅ Video block autoplay and controls
- ✅ Play/pause functionality
- ✅ Scrub bar interaction
- ✅ Fullscreen mode testing
- ✅ Different video sources (Jesus Film, YouTube, Custom)

### Interactive Elements (Steps 27-31)
- ✅ Image blocks rendering
- ✅ Poll functionality
- ✅ Response field validation
- ✅ Submit behavior testing
- ✅ Facebook messenger chat widget

## Running the Tests

### Prerequisites
- Node.js and npm installed
- Chrome browser for mobile emulation

### Command Line Execution

```bash
# Run only the mobile priority journey test
npx playwright test mobile-priority-journey.spec.ts --project=chrome-mobile

# Run with UI mode for debugging
npx playwright test mobile-priority-journey.spec.ts --project=chrome-mobile --ui

# Run with headed browser (visible)
npx playwright test mobile-priority-journey.spec.ts --project=chrome-mobile --headed

# Generate test report
npx playwright test mobile-priority-journey.spec.ts --project=chrome-mobile --reporter=html
```

### Environment Configuration

The test uses the base URL configured in `playwright.config.ts`. Make sure the `DEPLOYMENT_URL` environment variable is set to the correct staging environment:

```bash
export DEPLOYMENT_URL=https://your-stage.nextstep.is
```

Or update the `baseURL` in the config file.

## Test Structure

### Main Test: `should complete full mobile priority journey flow`
This comprehensive test walks through all 31 steps in sequence, testing:
- UI element visibility and functionality
- Video playback and controls
- Image rendering and overlays
- Form interactions and validation
- External link integrations

### Additional Tests:
1. **Mobile-specific interactions**: Tests touch gestures and mobile viewport
2. **Video autoplay policies**: Handles mobile video autoplay restrictions

## Mobile Configuration

The test is configured to run only on mobile viewports using:
- **Device**: Pixel 5 emulation
- **Browser**: Chrome (for video playback support)
- **Viewport**: Mobile-optimized dimensions

## Helper Functions

The `MobileJourneyHelpers` class provides:
- `performSwipeGesture()`: Simulates mobile swipe gestures
- `navigateToCardWithText()`: Intelligently navigates to specific cards
- `waitForVideoToLoad()`: Handles video loading with proper timeouts

## Debugging Tips

1. **Use `--headed` flag** to see the test execution in real-time
2. **Add `await page.pause()`** to pause execution at specific points
3. **Check video autoplay** - mobile browsers may require user interaction
4. **Verify element selectors** using browser dev tools
5. **Use `--trace=on`** to generate detailed execution traces

## Common Issues

### Video Not Playing
- Mobile browsers have strict autoplay policies
- Test includes click interactions to trigger video playback
- Check console for autoplay errors

### Element Not Found
- Use the helper functions to navigate to specific cards
- Add additional wait times for slow networks
- Verify data-testid attributes match the application

### Swipe Gestures Not Working
- Mobile emulation may not perfectly replicate touch events
- Fallback to button clicks if swipe fails
- Check viewport size and touch event handling

## Expected Test Duration
- **Full test suite**: ~3-5 minutes
- **Individual test steps**: 10-30 seconds each
- **Video sections**: Longer due to loading and playback testing

## Test Environment Requirements
- **Staging environment**: https://your-stage.nextstep.is
- **Journey path**: `/e2e-priority`
- **Mobile viewport**: Enabled in browser
- **Network**: Stable connection for video content