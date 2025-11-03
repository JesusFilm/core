import { render, screen } from '@testing-library/react'

import { EnvironmentBanner } from './EnvironmentBanner'

// Mock the environment utility module
jest.mock('../../libs/environment', () => ({
  shouldShowEnvironmentBanner: jest.fn()
}))

const mockShouldShowEnvironmentBanner = jest.requireMock(
  '../../libs/environment'
).shouldShowEnvironmentBanner

describe('EnvironmentBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when not in staging environment (production)', () => {
    mockShouldShowEnvironmentBanner.mockReturnValue(false)
    process.env.NEXT_PUBLIC_GATEWAY_URL =
      'https://api-gateway.central.jesusfilm.org/'

    render(<EnvironmentBanner />)

    expect(screen.queryByText(/ENVIRONMENT/)).not.toBeInTheDocument()
  })

  it('should not render when not in staging environment (localhost)', () => {
    mockShouldShowEnvironmentBanner.mockReturnValue(false)
    process.env.NEXT_PUBLIC_GATEWAY_URL = 'http://localhost:4000'

    render(<EnvironmentBanner />)

    expect(screen.queryByText(/ENVIRONMENT/)).not.toBeInTheDocument()
  })

  it('should render when in staging environment', () => {
    mockShouldShowEnvironmentBanner.mockReturnValue(true)
    process.env.NEXT_PUBLIC_GATEWAY_URL =
      'https://api-gateway.stage.central.jesusfilm.org/'

    render(<EnvironmentBanner />)

    expect(screen.getByText(/STAGE ENVIRONMENT/)).toBeInTheDocument()
    expect(screen.queryByText(/🚧/)).not.toBeInTheDocument()
  })
})
