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
- **Primary Font**: System font stack (sans-serif)
- **Hero Title**: `text-4xl md:text-6xl xl:text-7xl font-bold`
- **Section Headers**: `text-3xl xl:text-4xl 2xl:text-5xl font-bold`
- **Body Text**: `text-xl leading-relaxed`
- **Button Text**: `font-semibold tracking-wide`

### Spacing System
- **Container Padding**: `px-20` (desktop), responsive for mobile
- **Section Spacing**: `py-16` (vertical), `mb-12` (between sections)
- **Component Spacing**: `gap-4`, `gap-6`, `gap-8` based on context

## Component Specifications

### 1. Header Component
```typescript
interface HeaderProps {
  onSearch?: (query: string) => void;
  onLanguageSelect?: () => void;
}
```

**Layout**: Fixed position, full width, z-index 99
**Logo**: 70px height on desktop, 50px on mobile
**Search Bar**: 
- Width: 256px (w-64)
- Background: `bg-white/10 backdrop-blur-sm`
- Border: `border-white/20`
- Placeholder: "Search videos..."

**Language Button**:
- Icon: Globe from Lucide React
- Background: `bg-white/10 backdrop-blur-sm`
- Hover: `hover:bg-white/20`

### 2. Hero Section
**Background**: 
- Animated grid of video thumbnails
- Gradient overlay: `linear-gradient(140deg, #0c0a09 0%, #292524 30%, #44403c 60%, #1c1917 100%)`
- Texture overlay: 50% opacity

**Content Layout**:
- Two-column grid on desktop
- Left: Mission statement and CTA
- Right: Audience segmentation

**Mission Statement**:
- Title: "Watch the Greatest Story Ever Told"
- Gradient text effect on "Greatest Story"
- Subtitle: 2xl text with stone-100/90 color

**Audience Segmentation**:
- Three buttons with icons
- Background: `bg-white/10 backdrop-blur-sm`
- Hover: `hover:bg-white/20`
- Icons: Compass, Sprout, Footprints

### 3. Video Collection Carousel
**Container**: Full-width with constrained content
**Carousel**: 
- Horizontal scroll with snap points
- Previous/Next buttons with backdrop blur
- Progress indicators at bottom

**Video Cards**:
- Aspect ratio: 2:3 (portrait)
- Width: 280px
- Border radius: `rounded-2xl`
- Shadow: `shadow-2xl hover:shadow-3xl`
- Hover effect: Scale 105% with play button overlay

**Video Metadata**:
- Duration and language count (small text)
- Title (large, bold)
- Subtitle (medium, secondary color)

### 4. Course Section
**Background**: 
- Video background image with mask gradient
- Overlay: `bg-gradient-to-tr from-red-950/40 via-orange-750/30 to-yellow-550/10`

**Video Grid**:
- 4-column responsive grid
- Aspect ratio: 16:9 (video)
- Episode numbers: Large, bold, with glow effect
- Duration badge: Bottom-right corner

**Episode Format**:
- Numbered episodes 1-10
- Thumbnail with play button overlay
- Title and subtitle below

### 5. Category Section
**Background**: 
- Subtle background image with mask
- Overlay: `bg-gradient-to-tr from-stone-950/80 via-stone-900/50 to-stone-800/20`

**Category Cards**:
- Aspect ratio: 4:5
- Width: 180px
- Gradient backgrounds for each category
- Icons: Top-right corner
- Titles: Bottom-left

**Categories**:
1. Jesus' Life & Teachings (orange gradient)
2. Faith & Salvation (teal gradient)
3. Hope & Healing (red gradient)
4. Forgiveness & Grace (green gradient)
5. Suffering & Struggle (purple gradient)
6. Identity & Purpose (blue gradient)
7. Love & Relationships (pink gradient)
8. Prayer & Spiritual Growth (indigo gradient)
9. Miracles & Power of God (yellow gradient)
10. Death & Resurrection (gray gradient)
11. Justice & Compassion (emerald gradient)
12. Discipleship & Mission (violet gradient)

## Responsive Design

### Mobile (< 768px)
- Single column layout
- Reduced padding: `px-4`
- Smaller text sizes
- Touch-optimized buttons
- Simplified animations

### Tablet (768px - 1024px)
- Two-column layout where appropriate
- Medium padding: `px-8`
- Adjusted text sizes
- Maintained hover effects

### Desktop (> 1024px)
- Full layout as specified
- Maximum width: 1920px
- Full padding: `px-20`
- All animations and effects

## Animation Specifications

### Hero Background Animation
- Continuous horizontal scroll
- Alternating directions per row
- 3-second animation delay between rows
- Smooth easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### Hover Effects
- Scale transform: `scale-105`
- Duration: 300ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Shadow enhancement on hover

### Carousel Transitions
- Smooth scrolling with snap points
- Fade in/out for navigation buttons
- Progress indicator updates

## Accessibility

### Keyboard Navigation
- Tab order: Logo → Search → Language → Content sections
- Focus indicators: `ring-2 ring-white/30`
- Skip links for main content

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Alt text for all images
- Descriptive link text

### Color Contrast
- Text contrast ratio: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- High contrast mode support

## Performance Considerations

### Image Optimization
- Next.js Image component with proper sizing
- WebP format with fallbacks
- Lazy loading for below-fold images
- Responsive image sizes

### Animation Performance
- Use `transform` and `opacity` for animations
- Avoid layout-triggering properties
- Hardware acceleration where possible
- Reduced motion support

### Loading States
- Skeleton screens for content
- Progressive image loading
- Smooth transitions between states 