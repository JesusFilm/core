// Mock for @react-email/render
export const render = jest.fn().mockImplementation((component, options) => {
  if (options?.plainText) {
    return Promise.resolve('Mocked plain text email content')
  }
  return Promise.resolve('<div>Mocked HTML email content</div>')
})
