import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render } from '@testing-library/react'

import { SidePanelTitle } from './SidePanelTitle'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>

describe('SidePanelTitle', () => {
  beforeEach(() => {
    window.Beacon = jest.fn()
    mockUseMediaQuery.mockImplementation(() => true)
  })

  afterEach(() => {
    jest.resetAllMocks()
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
