import '@testing-library/jest-dom'

// Create a fake DOM node for React 18's createRoot function
beforeEach(() => {
  // Create a testing container for React 18 createRoot
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
    value: true,
    writable: true
  })

  // Setup mock container for testing
  const testContainer = document.createElement('div')
  testContainer.id = 'test-root'
  document.body.appendChild(testContainer)
})

afterEach(() => {
  const testContainer = document.getElementById('test-root')
  if (testContainer) {
    document.body.removeChild(testContainer)
  }
})
