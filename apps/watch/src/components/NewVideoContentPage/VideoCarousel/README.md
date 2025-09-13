# VideoCarousel Best Practices

## Overview
This document outlines best practices for maintaining the VideoCarousel component to ensure optimal performance and user experience.

## ✅ Current Implementation (DO NOT CHANGE)

### Virtual Slides Architecture
The carousel uses **Virtual Slides** for optimal performance:

```jsx
// Required imports
import { Virtual } from 'swiper/modules'

// Required configuration
<Swiper
  modules={[Virtual, ...]}
  virtual={true}
  observer={true}
  observeParents={true}
>
  {videos.map((video, index) => (
    <SwiperSlide key={video.id} virtualIndex={index}>
      <VideoCard {...props} />
    </SwiperSlide>
  ))}
</Swiper>
```

**Why Virtual Slides:**
- Only renders visible slides + buffer (performance)
- Handles infinite scroll without memory issues
- Automatically manages dynamic slide addition
- Prevents scroll position jumping

## 🚫 Common Anti-Patterns to AVOID

### 1. Manual Scroll Position Management
```jsx
// ❌ NEVER DO THIS - Leads to complex, brittle code
const [preventAutoScroll, setPreventAutoScroll] = useState(false)
const [savedScrollPosition, setSavedScrollPosition] = useState(0)

useEffect(() => {
  // Complex scroll prevention logic with setTimeout
}, [])
```

**Why it's bad:** Race conditions, memory leaks, fragile Swiper internals manipulation.

### 2. Direct Swiper Manipulation
```jsx
// ❌ AVOID - Bypasses React's reconciliation
swiperRef.current.setTranslate(savedPosition)
swiper.slideTo(index, 0)
```

**Why it's bad:** Breaks React's declarative paradigm, creates state inconsistencies.

### 3. Missing virtualIndex
```jsx
// ❌ WRONG - Breaks virtual slides
<SwiperSlide key={video.id}>

// ✅ CORRECT - Required for virtual slides
<SwiperSlide key={video.id} virtualIndex={index}>
```

### 4. Console Logs in Production
```jsx
// ❌ NEVER - Remove all debug logs
console.log('🚫 PREVENTING AUTO-SCROLL:', ...)
```

## 🔧 Maintenance Guidelines

### Adding New Features
1. **Always test with 100+ slides** to verify virtual slides performance
2. **Use React state** for all dynamic updates, not direct Swiper manipulation  
3. **Test dynamic slide addition** to ensure no scroll jumping occurs

### Performance Monitoring
- Monitor slide rendering count (should stay ~7-10 regardless of total slides)
- Check memory usage doesn't grow with slide count
- Verify smooth scrolling on mobile devices

### Required Modules
```jsx
modules={[Virtual, Mousewheel, FreeMode, A11y, Navigation]}
```

**Don't add unless necessary:**
- `Manipulation` - Not needed with virtual slides
- `Autoplay` - Conflicts with user control
- `Pagination` - Not used in this design

## 📊 Configuration Standards

### Breakpoints (Don't Change)
```jsx
{
  xs: { slidesPerView: 2.4, slidesPerGroup: 2 },
  sm: { slidesPerView: 3.4, slidesPerGroup: 3 },
  md: { slidesPerView: 4.4, slidesPerGroup: 4 },
  // ... established values work well
}
```

### Essential Props
```jsx
virtual={true}                    // Performance
observer={true}                   // Auto-update on DOM changes
observeParents={true}             // Auto-update on parent changes
slidesPerView="auto"              // Responsive behavior
spaceBetween={20}                 // Consistent spacing
mousewheel={{ forceToAxis: true }} // Horizontal scroll only
```

## 🧪 Testing Checklist

Before any changes:
- [ ] Test with 1000+ video slides
- [ ] Verify smooth scrolling on mobile
- [ ] Check memory usage stays constant
- [ ] Test dynamic slide addition (no position jumping)
- [ ] Verify keyboard navigation works
- [ ] Test loading skeleton states

## 🚨 Emergency Fixes Only

If you must make changes:
1. **Keep Virtual Slides** - Never remove this architecture
2. **Test thoroughly** - With realistic data volumes  
3. **Measure performance** - Before and after changes
4. **Document rationale** - In code comments for complex changes

## 📈 Performance Metrics

**Target Performance:**
- First slide render: <100ms
- Scroll smoothness: 60fps
- Memory usage: Constant regardless of slide count
- Bundle size impact: <5KB additional

---

*Last updated: 2025-09-13*  
*Maintained by: Development Team*