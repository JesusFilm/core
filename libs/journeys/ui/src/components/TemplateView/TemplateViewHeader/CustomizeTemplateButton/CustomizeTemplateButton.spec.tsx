import { render, screen } from '@testing-library/react'

import { CustomizeTemplateButton } from './CustomizeTemplateButton'

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

// Mock NextLink to capture href
jest.mock('next/link', () => {
  const mockNextLink = jest.fn(({ href, children, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  })

  return {
    __esModule: true,
    default: mockNextLink
  }
})

const mockNextLink = jest.requireMock('next/link').default

describe('CustomizeTemplateButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with correct link when journeyId is provided', () => {
    const journeyId = 'test-journey-123'
    render(<CustomizeTemplateButton journeyId={journeyId} />)

    const button = screen.getByTestId('CustomizeTemplateButton')
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()

    // Check that NextLink was called with correct href
    expect(mockNextLink).toHaveBeenCalledWith(
      expect.objectContaining({
        href: `/templates/${journeyId}/customize`,
        passHref: true,
        legacyBehavior: true
      }),
      undefined
    )
  })

  it('should be disabled when journeyId is null', () => {
    render(<CustomizeTemplateButton journeyId={null as any} />)

    const button = screen.getByTestId('CustomizeTemplateButton')
    expect(button).toBeDisabled()
  })
})
