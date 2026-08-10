import { vi } from 'vitest'

vi.mock('react-email', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-email')>()),
  render: vi.fn().mockImplementation((component, options) => {
    if (options?.plainText) {
      return Promise.resolve('Mocked plain text email content')
    }
    return Promise.resolve('<div>Mocked HTML email content</div>')
  })
}))
