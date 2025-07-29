# homepage — Intake
**Issue ID**: WAT-135
**Status**: ✅ SHAPING COMPLETE

## Problem / Goal
Redesign homepage to surface trending content and improve first-time discovery experience

## Audience & Context
Mobile-first casual visitors browsing on phones
Two key personas:
- Missionaries (our partners) - returning users who need quick access to content for ministry
- Seekers (our potential followers) - first-time visitors exploring faith content

## Must-haves
Featured content sections + Trending lists
Language switcher for international audience
Link to all videos search page
Site header
Intro section

## Nice-to-haves (~)
~Category filters (genre, duration, etc.)
~Search functionality
~Video intro
~Featured content carousel

## Non-goals / No-gos
No backend for managing the home page section. Homepage sections should be hardcoded.

## Constraints
No MUI allowed; Tailwind/shadcn components only
Render data from existing video collections. Each collection ID is hardcoded.

## Data / Integrations (known/assumed)
Reuse existing GraphQL endpoints for content

## Success Criteria
Increase time spent on initial page load

## Prior Art / References
Reference design from [JesusFilm.org Easter page](https://www.jesusfilm.org/watch/easter.html/english.html)
- Header layout and navigation
- Main container sizing and structure
- Intro section presentation
- Video Bible Collection section layout
- Easter Documentary Series section format
- Bible Videos section organization  
- Video Course section design

## Open Questions
✅ **Trending categories**: Featured, New, Video Gospel, Short Videos, Animated Series, Upcoming Events
✅ **Language selection**: Global language switcher (affects entire site)
✅ **Mobile navigation**: Responsive mobile menu panel
✅ **Content loading**: Sections load progressively
✅ **Supported languages**: English, Russian, French

---

## ✅ COMPLETION STATUS
**Intake Phase**: ✅ Complete  
**Shaping Phase**: ✅ Complete - Ready for development handoff  
**Next Phase**: Development implementation with real GraphQL integration
