import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import { SidePanelTitle } from './SidePanelTitle'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

const mockUseMediaQuery = useMediaQuery as MockedFunction<typeof useMediaQuery>

describe('SidePanelTitle', () => {
  beforeEach(() => {
    window.Beacon = vi.fn()
    mockUseMediaQuery.mockImplementation(() => true)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render the side panel title and HelpScoutBeaconFab', () => {
    const { getByText } = render(
      <MockedProvider>
        <SidePanelTitle />
      </MockedProvider>
    )
    expect(getByText('Create a New Journey')).toBeInTheDocument()
  })

  it('should not render HelpScoutBeaconIconButton on mobile', () => {
    mockUseMediaQuery.mockImplementation(() => false)
    const { queryByTestId } = render(
      <MockedProvider>
        <SidePanelTitle />
      </MockedProvider>
    )
    expect(queryByTestId('HelpScoutBeaconIconButton')).not.toBeInTheDocument()
  })

  it('should render HelpScoutBeaconIconButton on desktop', () => {
    mockUseMediaQuery.mockImplementation(() => true)
    const { getByTestId } = render(
      <MockedProvider>
        <SidePanelTitle />
      </MockedProvider>
    )
    expect(getByTestId('HelpScoutBeaconIconButton')).toBeInTheDocument()
  })
})
