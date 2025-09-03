# Watch-Modern Testing Guide

## Overview

This comprehensive testing guide provides detailed instructions for testing every new feature and identified bug in the Watch-Modern application. It covers both component-level testing (RTL) and end-to-end testing (Playwright) with specific workflows and examples.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Stack](#testing-stack)
3. [Feature Testing Workflow](#feature-testing-workflow)
4. [Bug Testing Workflow](#bug-testing-workflow)
5. [Test Organization](#test-organization)
6. [Running Tests](#running-tests)
7. [Test Categories](#test-categories)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Testing Philosophy

### **CRITICAL REQUIREMENTS**

1. **Test-Driven Development (TDD)**: All development follows TDD methodology
2. **Every Feature Must Be Tested**: No feature is complete without comprehensive tests
3. **Every Bug Must Have Tests**: All identified bugs require test cases to prevent regression
4. **80%+ Test Coverage**: Minimum coverage requirement for new code
5. **Cross-Platform Testing**: Tests must work across all supported browsers and devices

### TDD Process

**Red → Green → Refactor** (Repeat)

1. **Red**: Write failing tests first before any implementation
2. **Green**: Write minimal code to make tests pass
3. **Refactor**: Improve code while maintaining test coverage

## Testing Stack

### Component Testing (RTL)
- **Framework**: React Testing Library + Jest
- **Location**: `src/components/ComponentName.spec.tsx`
- **Purpose**: Test component logic, interactions, and rendering
- **Coverage**: 80% minimum for new components

### End-to-End Testing (Playwright)
- **Framework**: Playwright with Firefox
- **Location**: `apps/watch-modern-e2e/src/e2e/feature-name/`
- **Purpose**: Test complete user workflows and integration
- **Coverage**: Critical user journeys and browser compatibility

### Testing Infrastructure
- **Location**: `apps/watch-modern-e2e/`
- **Configuration**: `playwright.config.ts`
- **Reports**: HTML reports with screenshots and videos
- **CI/CD**: Headless execution for automated testing

## Feature Testing Workflow

### Phase 1: Pre-Implementation Planning

#### Create Test Files First
```typescript
// 1. Component Test: src/components/NewFeature.spec.tsx
describe('NewFeature', () => {
  it('should render without crashing')
  it('should handle user interactions')
  it('should be accessible')
  it('should work responsively')
  it('should handle error states')
})

// 2. E2E Test: apps/watch-modern-e2e/src/e2e/new-feature.spec.ts
test.describe('New Feature E2E', () => {
  test('should complete full user workflow')
  test('should integrate with existing features')
  test('should work on mobile and desktop')
})
```

#### Test Checklist (Pre-Implementation)
- [ ] Component test file created (`ComponentName.spec.tsx`)
- [ ] E2E test file created (`apps/watch-modern-e2e/src/e2e/feature/`)
- [ ] All test scenarios planned and documented
- [ ] Success criteria defined for each test
- [ ] Test data and mock data prepared

### Phase 2: During Implementation

#### Component-Level Testing (RTL)

**Required Test Cases for Every Component:**

```typescript
describe('ComponentName', () => {
  // ✅ Rendering Tests
  it('should render without crashing', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render with default props', () => {
    render(<ComponentName />)
    expect(screen.getByText('Default Text')).toBeInTheDocument()
  })

  it('should render with custom props', () => {
    render(<ComponentName title="Custom Title" />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  // ✅ Interaction Tests
  it('should handle click events', async () => {
    const mockOnClick = jest.fn()
    render(<ComponentName onClick={mockOnClick} />)

    await userEvent.click(screen.getByRole('button'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should handle keyboard navigation', async () => {
    render(<ComponentName />)
    const button = screen.getByRole('button')

    button.focus()
    expect(button).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(mockHandler).toHaveBeenCalled()
  })

  // ✅ Accessibility Tests
  it('should have proper ARIA labels', () => {
    render(<ComponentName />)
    expect(screen.getByLabelText('Close')).toBeInTheDocument()
  })

  it('should support keyboard navigation', async () => {
    render(<ComponentName />)
    const element = screen.getByRole('button')

    await userEvent.tab()
    expect(element).toHaveFocus()
  })

  // ✅ Responsive Tests
  it('should hide on mobile when specified', () => {
    render(<ComponentName hideOnMobile />)
    expect(screen.queryByTestId('component')).not.toBeVisible()
  })

  it('should adapt layout for different screen sizes', () => {
    // Test with different viewport sizes
    // This might require custom hooks or context
  })

  // ✅ Error State Tests
  it('should handle loading states', () => {
    render(<ComponentName loading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error messages appropriately', () => {
    render(<ComponentName error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should recover from error states', async () => {
    const { rerender } = render(<ComponentName error="Error" />)
    expect(screen.getByText('Error')).toBeInTheDocument()

    rerender(<ComponentName />)
    expect(screen.queryByText('Error')).not.toBeInTheDocument()
  })
})
```

#### Browser-Level Testing (Playwright E2E)

**Required E2E Test Cases:**

```typescript
test.describe('New Feature E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature-route')
  })

  // ✅ Critical User Journey Tests
  test('should complete full user workflow', async ({ page }) => {
    // Navigate to feature
    await page.goto('/new-feature')

    // Perform user actions
    await page.fill('input[name="name"]', 'Test User')
    await page.click('button[type="submit"]')

    // Verify results
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.result')).toContainText('Welcome, Test User')
  })

  test('should handle network failures gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/feature', route => route.abort())

    await page.goto('/new-feature')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/new-feature')
    await page.fill('input[name="name"]', 'Mobile User')
    await page.click('button[type="submit"]')

    await expect(page.locator('.mobile-optimized')).toBeVisible()
  })

  test('should work on slow connections', async ({ page }) => {
    // Throttle network
    await page.route('**/*', route => {
      // Simulate slow connection
      setTimeout(() => route.continue(), 1000)
    })

    await page.goto('/new-feature')
    // Should still work with loading indicators
    await expect(page.locator('.loading')).toBeVisible()
  })

  // ✅ Integration Tests
  test('should integrate with existing features', async ({ page }) => {
    // Test interaction with existing components
    await page.goto('/existing-feature')
    await page.click('button[data-testid="open-new-feature"]')

    // Should navigate to new feature
    await expect(page.locator('.new-feature')).toBeVisible()
  })

  test('should update related components', async ({ page }) => {
    // Test that related components update when this feature changes
    await page.goto('/related-component')
    const initialState = await page.locator('.related-data').textContent()

    // Perform action in new feature
    await page.goto('/new-feature')
    await page.click('button[data-testid="update-data"]')

    // Check that related component updated
    await page.goto('/related-component')
    const updatedState = await page.locator('.related-data').textContent()
    expect(updatedState).not.toBe(initialState)
  })

  test('should maintain data consistency', async ({ page }) => {
    // Test data integrity across features
    await page.goto('/new-feature')
    await page.fill('input[name="data"]', 'Test Data')
    await page.click('button[type="submit"]')

    // Navigate away and come back
    await page.goto('/other-page')
    await page.goto('/new-feature')

    // Data should still be there or properly handled
    await expect(page.locator('input[name="data"]')).toHaveValue('Test Data')
  })
})
```

### Phase 3: Post-Implementation Validation

#### Test Execution Checklist
- [ ] All component tests pass (RTL)
- [ ] All e2e tests pass (Playwright)
- [ ] Tests work across different browsers (Firefox primary)
- [ ] Tests work across different viewport sizes
- [ ] Accessibility requirements met
- [ ] Performance benchmarks met
- [ ] No existing tests broken (regression testing)

## Bug Testing Workflow

### **CRITICAL REQUIREMENT**: Every bug MUST have a test case

### Phase 1: Reproduce the Bug

**Create Reproduction Test First:**
```typescript
// Component test reproducing the bug
test('reproduces bug: component crashes on invalid input', () => {
  // This test should FAIL initially (reproducing the bug)
  expect(() => {
    render(<BuggyComponent input={invalidInput} />)
  }).toThrow()
})

// E2E test reproducing the bug
test('reproduces bug: page crashes when form submitted with invalid data', async ({ page }) => {
  await page.goto('/buggy-page')
  await page.fill('input[name="email"]', 'invalid-email')
  await page.click('button[type="submit"]')

  // This should fail initially, reproducing the bug
  await expect(page.locator('.error-message')).toBeVisible()
})
```

### Phase 2: Implement Fix

**Write Minimal Fix:**
```typescript
// Fix the bug with minimal code changes
export function BuggyComponent({ input }: Props) {
  // Add validation
  if (!isValidInput(input)) {
    return <ErrorMessage message="Invalid input provided" />
  }

  return <NormalComponent input={input} />
}
```

### Phase 3: Verify Fix

**Test Should Now Pass:**
```typescript
test('should handle invalid input gracefully', async ({ page }) => {
  await page.goto('/buggy-page')
  await page.fill('input[name="email"]', 'invalid-email')
  await page.click('button[type="submit"]')

  // Now this should pass with the fix
  await expect(page.locator('.error-message')).toBeVisible()
  await expect(page.locator('.success-message')).not.toBeVisible()
})
```

### Phase 4: Add Regression Tests

**Comprehensive Edge Case Testing:**
```typescript
describe('BuggyComponent Regression Tests', () => {
  it('should handle null input', () => {
    expect(() => render(<BuggyComponent input={null} />)).not.toThrow()
  })

  it('should handle undefined input', () => {
    expect(() => render(<BuggyComponent input={undefined} />)).not.toThrow()
  })

  it('should handle empty string input', () => {
    render(<BuggyComponent input="" />)
    expect(screen.getByText('Please provide input')).toBeInTheDocument()
  })

  it('should handle special characters', () => {
    render(<BuggyComponent input="<>!@#$%" />)
    expect(screen.getByText('Invalid characters')).toBeInTheDocument()
  })

  it('should handle very long input', () => {
    const longInput = 'a'.repeat(10000)
    render(<BuggyComponent input={longInput} />)
    expect(screen.getByText('Input too long')).toBeInTheDocument()
  })

  it('should handle numeric input when expecting string', () => {
    render(<BuggyComponent input={12345} />)
    expect(screen.getByText('Invalid input type')).toBeInTheDocument()
  })
})
```

## Test Organization

### Directory Structure

```
apps/watch-modern/
├── src/
│   ├── components/
│   │   ├── ComponentName/
│   │   │   ├── ComponentName.tsx           # Implementation
│   │   │   ├── ComponentName.spec.tsx      # Component tests
│   │   │   └── index.ts                    # Exports
│   │   └── index.ts                        # Main component exports
│   └── app/
│       └── page.tsx                        # Page integration
└── apps/watch-modern-e2e/
    ├── src/
    │   └── e2e/
    │       ├── search/                     # Feature-specific tests
    │       │   ├── search.spec.ts
    │       │   ├── grid-layout.spec.ts
    │       │   └── performance.spec.ts
    │       ├── video/                      # Video feature tests
    │       │   └── video.spec.ts
    │       └── user/                       # User feature tests
    │           └── user.spec.ts
    └── playwright.config.ts
```

### Naming Conventions

#### Component Tests
- **File**: `ComponentName.spec.tsx`
- **Location**: Adjacent to component file
- **Pattern**: `describe('ComponentName', () => { ... })`

#### E2E Tests
- **File**: `feature-name.spec.ts`
- **Location**: `apps/watch-modern-e2e/src/e2e/feature-name/`
- **Pattern**: `test.describe('Feature Name', () => { ... })`

#### Test Names
- **Descriptive**: `should render with correct text`
- **Action-oriented**: `should handle click events`
- **State-based**: `should display error message when invalid`

## Running Tests

### Component Tests (RTL)

```bash
# Run all component tests
cd /workspaces && npm test watch-modern

# Run specific component test
cd /workspaces && npm test watch-modern -- --testNamePattern="ComponentName"

# Run with coverage
cd /workspaces && npm test watch-modern -- --coverage
```

### E2E Tests (Playwright)

```bash
# Run all e2e tests
cd /workspaces && nx run watch-modern-e2e:e2e

# Run specific test suite
cd /workspaces && npx playwright test apps/watch-modern-e2e/src/e2e/search/ --project=firefox

# Run with visual debugging
cd /workspaces && nx run watch-modern-e2e:debug

# Run specific test
cd /workspaces && npx playwright test apps/watch-modern-e2e/src/e2e/search/search.spec.ts --project=firefox

# View test reports
cd /workspaces && npx playwright show-report
```

### CI/CD Commands

```bash
# Headless execution for CI/CD
cd /workspaces && npx playwright test --project=firefox --headed=false

# Parallel execution
cd /workspaces && npx playwright test --project=firefox --workers=4
```

## Test Categories

### 1. Rendering Tests
- Component renders without crashing
- Correct HTML structure
- Proper CSS classes applied
- Responsive behavior

### 2. Interaction Tests
- Click events
- Keyboard navigation
- Form submissions
- State changes

### 3. Accessibility Tests
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

### 4. Integration Tests
- Component communication
- Data flow
- API integration
- State management

### 5. Performance Tests
- Load times
- Memory usage
- Bundle size impact
- Runtime performance

### 6. Cross-Browser Tests
- Firefox (primary)
- Chrome compatibility
- Mobile browsers
- Different screen sizes

## Best Practices

### Test Writing Principles

1. **One Concept Per Test**: Each test should verify one specific behavior
2. **Descriptive Names**: Test names should clearly describe what is being tested
3. **Independent Tests**: Tests should not depend on each other
4. **Fast Execution**: Tests should run quickly to support TDD workflow
5. **Realistic Data**: Use realistic test data that reflects actual usage

### Component Testing Best Practices

```typescript
// ✅ Good: Descriptive test names
it('should display error message when email is invalid', () => {
  // Test implementation
})

// ❌ Bad: Vague test names
it('should work', () => {
  // Test implementation
})
```

```typescript
// ✅ Good: Test one concept
it('should validate email format', () => {
  // Only test email validation
})

it('should show error for empty email', () => {
  // Only test empty email case
})

// ❌ Bad: Test multiple concepts
it('should validate and submit form', () => {
  // Tests validation AND submission
})
```

### E2E Testing Best Practices

```typescript
// ✅ Good: Use semantic selectors
await page.click('button[aria-label="Submit form"]')
await expect(page.locator('h1')).toContainText('Success')

// ❌ Bad: Use fragile selectors
await page.click('.btn-primary:nth-child(3)')
await expect(page.locator('#random-id')).toBeVisible()
```

```typescript
// ✅ Good: Test complete user journeys
test('should complete purchase flow', async ({ page }) => {
  await page.goto('/products')
  await page.click('text=Laptop')
  await page.click('text=Add to Cart')
  await page.click('text=Checkout')
  await page.fill('input[name="email"]', 'user@example.com')
  await page.click('button[type="submit"]')
  await expect(page.locator('.order-confirmation')).toBeVisible()
})
```

## Troubleshooting

### Common Issues

#### **Component Tests Failing**
- **Issue**: Tests pass in isolation but fail when run together
- **Solution**: Check for shared state or side effects between tests
- **Prevention**: Use proper cleanup in `afterEach` blocks

#### **E2E Tests Timing Out**
- **Issue**: Tests fail with timeout errors
- **Solution**: Increase timeouts for slow operations or wait for specific conditions
- **Prevention**: Use appropriate wait strategies instead of fixed delays

#### **Selectors Not Found**
- **Issue**: E2E tests can't find elements
- **Solution**: Use more robust selectors or wait for elements to be ready
- **Prevention**: Prefer semantic selectors over CSS/XPath selectors

#### **Flaky Tests**
- **Issue**: Tests pass sometimes but fail others
- **Solution**: Add proper waiting and remove race conditions
- **Prevention**: Avoid fixed delays, use condition-based waiting

### Debug Commands

```bash
# Debug component tests
cd /workspaces && npm test watch-modern -- --testNamePattern="ComponentName" --verbose

# Debug e2e tests with browser visible
cd /workspaces && DEBUG=pw:api npx playwright test --headed

# Generate test coverage report
cd /workspaces && npm test watch-modern -- --coverage --coverageDirectory=coverage

# Run tests in watch mode
cd /workspaces && npm test watch-modern -- --watch
```

---

## Quick Reference

### Test File Templates

**Component Test Template:**
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<ComponentName />)

    await user.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

**E2E Test Template:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature-route')
  })

  test('should complete user workflow', async ({ page }) => {
    await page.fill('input[name="field"]', 'test value')
    await page.click('button[type="submit"]')
    await expect(page.locator('.success')).toBeVisible()
  })
})
```

### Essential Commands

```bash
# Component tests
cd /workspaces && npm test watch-modern

# E2E tests
cd /workspaces && nx run watch-modern-e2e:e2e

# Specific test
cd /workspaces && npx playwright test apps/watch-modern-e2e/src/e2e/feature/ --project=firefox

# Debug mode
cd /workspaces && nx run watch-modern-e2e:debug

# Coverage report
cd /workspaces && npm test watch-modern -- --coverage
```

---

**Remember**: Testing is not optional. Every feature and every bug fix MUST have corresponding tests to ensure quality and prevent regressions.
