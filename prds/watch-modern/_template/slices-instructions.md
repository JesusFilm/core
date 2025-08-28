# ShapeUp Slicing Instructions

## Core Principles

### 1. Vertical Slicing (Not Horizontal)
- **Vertical**: Each slice delivers end-to-end user value
- **Horizontal**: Building layers (e.g., "all components", then "all styling", then "all logic")
- **Goal**: Each slice should be a complete, working feature that users can interact with

### 2. Same Feature, Different Stages
- **Basic**: Minimal working version of the complete feature
- **Improved**: Enhanced version with additional capabilities
- **Polished**: Final optimized version with advanced features

### 3. Production-Ready at Each Stage
- Every slice should be deployable and usable
- Users can interact with the feature at each stage
- Quality standards maintained throughout

## Common Mistakes to Avoid

### ❌ Wrong Approach: Separate Features
```
Slice 1: Header Component
Slice 2: Hero Section  
Slice 3: Video Grid
Slice 4: Footer
```

### ✅ Correct Approach: Same Feature, Different Stages
```
Slice 1 Basic: Complete homepage (minimal)
Slice 1 Improved: Same homepage (enhanced)
Slice 1 Polished: Same homepage (optimized)
```

### ❌ Wrong Approach: Technical Layers
```
Slice 1: All Components
Slice 2: All Styling
Slice 3: All Logic
Slice 4: All Tests
```

### ✅ Correct Approach: User-Facing Features
```
Slice 1: Complete feature with basic styling and logic
Slice 2: Same feature with enhanced styling and interactions
Slice 3: Same feature with advanced features and optimization
```

## Example: Homepage Feature

### Basic Implementation
- Complete homepage with static content
- All sections present but minimal
- Basic responsive design
- No animations or advanced interactions

### Improved Implementation  
- Same homepage with animations
- Enhanced interactions and hover effects
- Better responsive design
- Additional user interactions

### Polished Implementation
- Same homepage with performance optimization
- Advanced features (search, analytics)
- Internationalization
- SEO optimization

## Guidelines for Each Stage

### Basic Stage
- **Goal**: Prove the concept works
- **Scope**: Minimal viable feature
- **Quality**: Functional but simple
- **Testing**: Basic functionality tests

### Improved Stage
- **Goal**: Enhance user experience
- **Scope**: Add polish and interactions
- **Quality**: Good user experience
- **Testing**: Interaction and edge case tests

### Polished Stage
- **Goal**: Production-ready excellence
- **Scope**: Performance and advanced features
- **Quality**: Professional grade
- **Testing**: Comprehensive test coverage

## Definition of Done (DoD) Examples

### Basic Stage DoD
- [ ] Feature renders correctly
- [ ] Basic functionality works
- [ ] Responsive design implemented
- [ ] Accessibility basics (keyboard navigation, screen reader)
- [ ] Unit tests for core functionality

### Improved Stage DoD
- [ ] Enhanced interactions work
- [ ] Animations perform well
- [ ] Edge cases handled
- [ ] Integration tests pass
- [ ] Performance meets baseline

### Polished Stage DoD
- [ ] Performance targets met
- [ ] Advanced features complete
- [ ] Comprehensive test coverage
- [ ] Documentation updated
- [ ] Production deployment ready

## Risk Mitigation

### Early Risk Identification
- Address technical risks in Basic stage
- Test integrations early
- Validate assumptions with minimal implementation

### Iterative Validation
- Each stage validates the approach
- User feedback incorporated
- Technical debt managed

### Quality Assurance
- Each stage maintains quality standards
- Testing increases with complexity
- Performance monitored throughout

## Success Metrics

### Basic Stage
- Feature works end-to-end
- No critical bugs
- Basic user acceptance

### Improved Stage
- Enhanced user experience
- Performance meets targets
- Integration tests pass

### Polished Stage
- Production-ready quality
- Comprehensive test coverage
- Performance optimized
- Advanced features complete 