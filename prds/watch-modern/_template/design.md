# Design
## Component map
(TBD)
## Wireframe lineage (intake ⮕ prod)
| Intake file | Prod component | Notes |
|-------------|----------------|-------|
| intake/ui/<file>.tsx | src/components/... | keep markup |
## GraphQL ops
- …
## Proposed schema changes
- (await user approval)

## Resource Management

### Data Sources
- **API Integration**: All dynamic content fetched from internal GraphQL API
- **No External Calls**: Avoid third-party API dependencies
- **Caching Strategy**: Implement stale-while-revalidate pattern

### Asset Management
- **Font Files**: Self-hosted in `/public/fonts/` directory
- **Images**: Stored in `/public/images/` with Next.js Image component
- **Videos**: Served from internal CDN via our media API
- **Icons**: Use Lucide React package (approved internal dependency)

### Content Guidelines
- **Text Content**: All strings from i18n translation files
- **Media Assets**: No hotlinking to external resources
- **Placeholder Content**: Replace with real data from our GraphQL API
- **Static Files**: Follow Next.js public directory structure

### Performance Considerations
- **Font Loading**: Use `next/font` for optimized font loading
- **Image Optimization**: Leverage Next.js Image component features
- **Video Delivery**: Stream through internal CDN with adaptive bitrate
- **Asset Preloading**: Critical assets defined in document head


## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through interactive elements
- **Focus Indicators**: Clear focus rings on all interactive elements
- **Skip Links**: Skip to main content link
- **Escape Key**: Close modals and dropdowns

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alt Text**: Descriptive alt text for all images
- **Live Regions**: Announce dynamic content changes

### Color and Contrast
- **WCAG AA Compliance**: 4.5:1 contrast ratio minimum
- **Color Independence**: Information not conveyed by color alone
- **High Contrast Mode**: Support for system high contrast settings
- **Focus Indicators**: High contrast focus indicators

## Loading States

### Skeleton Loaders
- **Video Cards**: Rectangular placeholders with shimmer effect
- **Text Content**: Animated text placeholders
- **Images**: Blur-up placeholder images
- **Buttons**: Pulsing button placeholders

### Progressive Loading
- **Critical Content**: ...
- **Above the Fold**: ...
- **Lazy Loading**: Load images as they enter viewport
- **Preloading**: Preload critical navigation elements 