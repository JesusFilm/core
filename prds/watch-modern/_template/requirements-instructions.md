# Requirements Template Instructions

## Overview

The requirements document must have TWO distinct sections:

1. **Section 1**: Functional & Technical Requirements (detailed descriptions)
2. **Section 2**: EARS-style Requirements (categorized by user activity/hierarchy)

## Section 1: Functional & Technical Requirements

### Structure
- **Functional Requirements**: What the feature does from a user perspective
- **Technical Requirements**: How the feature is implemented technically
- **Non-Functional Requirements**: Quality attributes (performance, security, etc.)
- **Constraints**: Limitations and requirements

### Functional Requirements Guidelines
- Describe each major component/feature
- Explain user interactions
- Specify data requirements
- Detail integration points

### Technical Requirements Guidelines
- **Performance**: Specific targets (load time, Core Web Vitals)
- **SEO**: Meta tags, structured data, sitemap requirements
- **Responsive Design**: Breakpoints, touch interactions, accessibility
- **Data Management**: API integration, data sources, caching
- **Analytics**: Event tracking, user behavior monitoring
- **Internationalization**: Languages, translation, URL structure

### Non-Functional Requirements Guidelines
- **Accessibility**: WCAG compliance, keyboard navigation, screen readers
- **Security**: CSP, input validation, HTTPS
- **Monitoring**: Error tracking, performance monitoring, analytics

### Constraints Guidelines
- **UI Components**: Specific component library requirements
- **File Structure**: Directory structure constraints
- **Git Operations**: Version control constraints
- **Existing Patterns**: Reuse requirements from existing codebase

## Section 2: EARS-style Requirements

### Format
```
WM-<FEATURE>-XXX — WHEN <condition>, THE SYSTEM SHALL <observable behavior>
```

### Categories (Group by user activity or feature hierarchy)
1. **Page Load & Navigation**
2. **[Feature Section] Interactions**
3. **Performance & Accessibility**
4. **SEO & Analytics**
5. **Responsive Design**
6. **Data Integration**

### Guidelines for EARS Requirements
- **Specificity**: Make requirements testable and measurable
- **Coverage**: Ensure all functional requirements are covered
- **Clarity**: Use clear, unambiguous language
- **Completeness**: Include all user interactions and system behaviors

### Common Patterns

#### User Interactions
```
WM-<FEATURE>-XXX — WHEN a user [specific action], THE SYSTEM SHALL [observable behavior].
```

#### System Constraints
```
WM-<FEATURE>-XXX — THE SYSTEM SHALL [constraint requirement].
```

#### Page Load Requirements
```
WM-<FEATURE>-XXX — WHEN the page loads, THE SYSTEM SHALL [observable behavior].
```

## Example Structure

### Section 1: Functional & Technical Requirements
```
## Functional Requirements

### 1. Hero Section
- **Component/Function**: Animated hero with mission statement
- **User Interaction**: Audience segmentation buttons
- **Data Requirements**: Mission text, audience options
- **Integration Points**: Links to collection pages

## Technical Requirements

### 1. Performance
- **Loading Time**: Under 3 seconds on 3G
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Optimization**: Lazy loading, image optimization

## Non-Functional Requirements

### 1. Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliance

## Constraints
- **UI Components**: Use Shadcn/ui, no MUI components
- **File Structure**: All files within /workspaces/core/
- **Existing Patterns**: Reuse patterns from /apps/watch
```

### Section 2: EARS-style Requirements
```
## Page Load & Navigation
- **WM-HOMEPAGE-001** — WHEN a user visits the homepage, THE SYSTEM SHALL display the hero section.

## Hero Section Interactions
- **WM-HOMEPAGE-002** — WHEN a user clicks "Discover who Jesus is", THE SYSTEM SHALL navigate to the corresponding collection page.

## Performance & Accessibility
- **WM-HOMEPAGE-003** — THE SYSTEM SHALL load the homepage in under 3 seconds on a 3G connection.
- **WM-HOMEPAGE-004** — THE SYSTEM SHALL be fully navigable using only keyboard input.
```

## Common Mistakes to Avoid

### ❌ Wrong Approach: Only EARS Requirements
```
- **WM-FEATURE-001** — WHEN user visits page, THE SYSTEM SHALL show content.
```
**Problem**: No detailed functional description, only high-level EARS requirements.

### ✅ Correct Approach: Both Sections
```
## Functional Requirements
### 1. Hero Section
- **Component/Function**: Animated hero with mission statement
- **User Interaction**: Audience segmentation buttons
...

## EARS-style Requirements
## Page Load & Navigation
- **WM-FEATURE-001** — WHEN a user visits the homepage, THE SYSTEM SHALL display the hero section.
```

### ❌ Wrong Approach: No Categories
```
- **WM-FEATURE-001** — WHEN user visits page, THE SYSTEM SHALL show content.
- **WM-FEATURE-002** — WHEN user clicks button, THE SYSTEM SHALL navigate.
- **WM-FEATURE-003** — THE SYSTEM SHALL load in 3 seconds.
```

### ✅ Correct Approach: Categorized Requirements
```
## Page Load & Navigation
- **WM-FEATURE-001** — WHEN user visits page, THE SYSTEM SHALL show content.

## Hero Section Interactions
- **WM-FEATURE-002** — WHEN user clicks button, THE SYSTEM SHALL navigate.

## Performance & Accessibility
- **WM-FEATURE-003** — THE SYSTEM SHALL load in 3 seconds.
```

## Quality Checklist

Before finalizing requirements, verify:

1. **Two Sections**: Both functional/technical and EARS-style requirements present
2. **Coverage**: All functional requirements have corresponding EARS requirements
3. **Categories**: EARS requirements properly categorized by user activity
4. **Specificity**: Requirements are testable and measurable
5. **Completeness**: All user interactions and system behaviors covered
6. **Clarity**: Language is unambiguous and clear
7. **Constraints**: All limitations and requirements documented 