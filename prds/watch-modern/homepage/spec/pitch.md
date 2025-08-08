# Homepage Feature Pitch

## Overview
The homepage serves as the primary landing page for the Jesus Film Project's video platform, showcasing the mission to share the Gospel through authentic films translated into thousands of languages worldwide.

## Problem Statement
Users need a compelling, visually engaging homepage that:
- Immediately communicates the mission and value proposition
- Provides easy access to video content across different categories
- Offers personalized content discovery based on user journey stage
- Maintains high performance and SEO standards

## Solution
A modern, responsive homepage featuring:
- Hero section with animated background and audience segmentation
- Video Bible collection showcase with carousel navigation
- New Believer Course section with episode-based learning
- Category browsing with spiritual themes
- Integrated search and language selection

## Key Features
1. **Hero Section**: Animated grid background with mission statement and audience segmentation
2. **Video Collections**: Carousel showcasing featured films with metadata
3. **Course Content**: Episode-based learning for new believers
4. **Category Browsing**: Spiritual theme-based content organization
5. **Search Integration**: Algolia-powered search functionality
6. **Language Support**: Multi-language interface with language switching modal

## Success Metrics
- Page load performance (Core Web Vitals)
- User engagement (time on page, scroll depth)
- Content discovery (clicks on videos, categories)
- Search usage and effectiveness
- Language selection and content localization

## Technical Requirements
- Next.js App Router with TypeScript
- Tailwind CSS for styling
- Shadcn/ui components
- Algolia search integration
- GraphQL for data fetching
- Internationalization with next-i18next
- SEO optimization
- Responsive design (mobile-first)

## Integration Points
- Reuse existing Algolia search patterns from `/apps/watch`
- Leverage existing language modal implementation
- Follow established GraphQL patterns for video data
- Maintain consistency with existing analytics tracking
