# Homepage Design Specification

## Design System

### Color Palette
- **Primary Background**: `#0c0a09` (stone-950)
- **Secondary Background**: `#1c1917` (stone-900)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `rgba(255,255,255,0.9)` (stone-100/90)
- **Text Tertiary**: `rgba(255,255,255,0.6)` (stone-200/80)
- **Accent Orange**: `#f97316` (orange-500)
- **Gradient Text**: `from-stone-200 to-stone-100`

### Typography
- **Headlines**: Inter font, bold weight, tight leading
- **Body Text**: Inter font, regular weight, relaxed leading
- **Button Text**: Inter font, semibold weight, wide tracking
- **Labels**: Inter font, medium weight, uppercase tracking

### Spacing System
- **Container Padding**: `px-20` (80px) on desktop, `px-4` (16px) on mobile
- **Section Spacing**: `py-16` (64px) between sections
- **Component Spacing**: `gap-4` (16px) between elements
- **Card Spacing**: `p-6` (24px) internal padding

## Component Specifications

### Header Component
```typescript
interface HeaderProps {
  onSearch: (query: string) => void;
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}
```

**Layout**: Fixed position, full width, z-index 99
**Logo**: 70px height on desktop, 50px on mobile
**Search Bar**: 256px width, rounded-full, backdrop blur
**Language Button**: 48px square, backdrop blur, border

### Hero Section
**Background**: Animated grid with 24 video thumbnails
**Animation**: Continuous horizontal scroll, alternating directions
**Overlay**: Multiple gradient layers for text readability
**Content**: Left-aligned text, right-aligned audience segmentation

### Video Carousel
**Auto-advance**: 5-second intervals
**Manual Navigation**: Previous/Next buttons with hover effects
**Progress Dots**: Interactive dots showing current position
**Card Design**: 280px width, 2:3 aspect ratio, rounded corners

### Video Grid
**Layout**: Responsive grid (1-4 columns based on screen size)
**Card Design**: 16:9 aspect ratio, rounded corners
**Episode Numbers**: Large, bold numbers with glow effect
**Hover Effects**: Scale transform, play button overlay

### Category Cards
**Design**: 180px width, 4:5 aspect ratio, gradient backgrounds
**Icons**: 48px Lucide React icons, positioned top-right
**Colors**: 12 different gradient combinations
**Animation**: Hover scale effect, smooth transitions

### Audience Segmentation
**Buttons**: Full width, backdrop blur, border
**Icons**: 40px Lucide React icons, left-aligned
**Text**: Large, semibold, left-aligned
**Arrow**: Right-aligned chevron icon

## Responsive Behavior

### Mobile (< 640px)
- Single column layouts
- Reduced padding (`px-4`)
- Smaller text sizes
- Touch-friendly button sizes (44px minimum)
- Simplified animations

### Tablet (640px - 1024px)
- Two-column layouts where appropriate
- Medium padding (`px-8`)
- Adjusted text sizes
- Maintained hover effects

### Desktop (> 1024px)
- Multi-column layouts
- Full padding (`px-20`)
- Large text sizes
- Enhanced animations and effects

## Animation Guidelines

### Micro-interactions
- **Button Hover**: Scale 1.05, shadow increase
- **Card Hover**: Scale 1.02, shadow increase
- **Icon Hover**: Color change, slight scale
- **Text Hover**: Color change, underline

### Page Transitions
- **Section Entry**: Fade in with slight upward motion
- **Carousel Transitions**: Smooth slide with easing
- **Modal Open**: Scale and fade in from center
- **Loading States**: Skeleton animation with pulse

### Performance Considerations
- **GPU Acceleration**: Use `transform` and `opacity` for animations
- **Reduced Motion**: Respect `prefers-reduced-motion`
- **Lazy Loading**: Intersection Observer for animations
- **Frame Rate**: Target 60fps for smooth animations

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
- **Critical Content**: Load hero section first
- **Above the Fold**: Prioritize visible content
- **Lazy Loading**: Load images as they enter viewport
- **Preloading**: Preload critical navigation elements 