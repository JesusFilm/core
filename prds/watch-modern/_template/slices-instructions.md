# Instructions for Code Agent AI: Filling Slices Template

## Overview
This document provides step-by-step instructions for AI code agents on how to transform data from `pitch.md` into a comprehensive `slices.md` plan following ShapeUp principles of vertical, value-first feature delivery.

## Core Principles
- **Vertical Slices**: Each slice delivers end-to-end value, not horizontal layers
- **Value First**: Prioritize features that provide immediate user value
- **Gradual Improvement**: Start with basic functionality, then enhance iteratively
- **Risk Mitigation**: Address unknowns early in the process

## Step-by-Step Process

### Step 1: Analyze pitch.md Data
1. **Extract Problem Statement**: Identify the core user problem being solved
2. **Parse Solution Overview**: Break down the proposed solution into discrete features
3. **Identify Must-haves vs Nice-to-haves**: Categorize requirements by priority
4. **Map Technical Approach**: Understand implementation constraints and dependencies
5. **Assess Risks/Unknowns**: Note areas requiring early validation

### Step 2: Define Vertical Features
For each major feature identified in the solution overview:
- **Name the Feature**: Use descriptive, action-oriented names
- **Define Scope**: What constitutes a minimal viable version
- **Identify Dependencies**: What must be built first
- **Estimate Complexity**: Simple, Medium, or Complex

### Step 3: Create Basic Implementation Slices
For each vertical feature, create a "Basic" slice that includes:

#### Must-haves Structure:
```
- [ ] Core Functionality
    - [ ] Primary user action (e.g., "User can view video grid")
    - [ ] Essential data loading
    - [ ] Basic error handling
    - [ ] Minimal styling for functionality

- [ ] User Experience Basics
    - [ ] Responsive layout (mobile-first)
    - [ ] Accessibility fundamentals (ARIA labels, keyboard navigation)
    - [ ] Loading states
    - [ ] Error states

- [ ] Technical Foundation
    - [ ] Component structure
    - [ ] Data fetching/integration
    - [ ] Basic routing (if needed)
    - [ ] Integration with existing systems
```

#### Definition of Done (DoD):
- Tests for core functionality
- Accessibility basics implemented
- Responsive baseline achieved
- Integration with existing analytics/SEO patterns

### Step 4: Create Improved Implementation Slices
For each feature, define enhancements that add value:

#### Nice-to-haves Structure:
```
- [ ] Enhanced User Experience
    - [ ] Improved animations/transitions
    - [ ] Better loading states
    - [ ] Enhanced error handling
    - [ ] Performance optimizations

- [ ] Advanced Features
    - [ ] Additional functionality
    - [ ] Edge case handling
    - [ ] Advanced interactions
    - [ ] Integration with other features
```

#### Definition of Done (DoD):
- Tests for new functionality
- Performance validation (if relevant)
- User acceptance criteria met

### Step 5: Create Polished Implementation Slices
Focus on UX refinements and production readiness:

#### Polish Tasks Structure:
```
- [ ] UX Refinements
    - [ ] Micro-interactions
    - [ ] Edge state handling
    - [ ] Accessibility improvements
    - [ ] Visual polish

- [ ] Production Readiness
    - [ ] Documentation updates
    - [ ] Telemetry/analytics hooks
    - [ ] SEO optimizations
    - [ ] Performance monitoring
```

#### Definition of Done (DoD):
- Documentation updated
- Telemetry hooks implemented (if needed)
- Production deployment ready

## Template Filling Guidelines

### Naming Conventions
- **Slice Names**: Use format "Slice X — [Feature Name] [Phase]"
- **Feature Names**: Action-oriented, user-focused (e.g., "Video Grid Display", "Search Functionality")
- **Phases**: Basic → Improved → Polished

### Scope Descriptions
- **Basic**: "Minimal end-to-end path for [feature]"
- **Improved**: "Enhanced functionality and user experience"
- **Polished**: "UX refinements, edge states, and production readiness"

### Status Tracking
- Use consistent status indicators: [PLANNED], [IN PROGRESS], [COMPLETED], [BLOCKED]

## Data Mapping from pitch.md

### Problem Statement → Slice Prioritization
- High-impact problems get earlier slices
- Risk mitigation drives slice ordering
- User value determines feature priority

### Solution Overview → Feature Breakdown
- Each major section becomes a vertical feature
- Break complex features into smaller slices
- Identify dependencies between features

### Must-haves → Basic Slice Requirements
- Direct mapping to must-have requirements
- Ensure each must-have is covered in basic slices
- Prioritize by user impact and technical risk

### Nice-to-haves → Improved/Polished Slices
- Distribute across improved and polished phases
- Consider technical complexity and user value
- Balance feature richness with delivery speed

### Technical Approach → Implementation Details
- Use existing patterns mentioned in technical approach
- Integrate with existing systems (GraphQL, analytics, etc.)
- Follow established conventions for the codebase

### Risks/Unknowns → Early Slices
- Address unknowns in early basic slices
- Create validation slices for high-risk areas
- Plan for potential pivots based on findings

## Quality Checklist

Before finalizing the slices plan, verify:

1. **Vertical Delivery**: Each slice delivers end-to-end value
2. **Dependency Order**: Earlier slices don't depend on later ones
3. **Risk Distribution**: High-risk items addressed early
4. **User Value**: Each slice provides meaningful user benefit
5. **Technical Feasibility**: Implementation approach is realistic
6. **Testing Strategy**: DoD includes appropriate testing
7. **Integration Points**: Existing systems properly integrated

## Example Transformation

**From pitch.md:**
```
Solution Overview:
- Hero Section with animated background
- Video Bible Collection carousel
- Video Course Section
- Category Browse
- Enhanced Navigation
```

**To slices.md:**
```
Slice 1 — Hero Section Basic [Status: PLANNED]
Scope: Minimal animated hero with audience segmentation

Slice 2 — Video Grid Basic [Status: PLANNED]  
Scope: Basic video display with essential navigation

Slice 3 — Navigation Enhancement Basic [Status: PLANNED]
Scope: Language switcher and search functionality
```

## Final Notes

- **Keep it Simple**: Start with the simplest possible implementation
- **Value First**: Every slice should provide user value
- **Iterate**: Plan for learning and adjustment
- **Document**: Include rationale for slice ordering and scope decisions
- **Validate**: Plan for user feedback and technical validation

Remember: The goal is to deliver working, valuable features quickly while building toward the full vision outlined in the pitch. 