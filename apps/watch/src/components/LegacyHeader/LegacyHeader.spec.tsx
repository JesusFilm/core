import { MockedProvider } from '@apollo/client/testing'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import { render, screen } from '@testing-library/react'

import { LegacyHeader } from '.'

jest.mock('@mui/material/useScrollTrigger', () => ({
  __esModule: true,
  default: jest.fn()
}))

const useScrollTriggerMock = useScrollTrigger as jest.Mock

describe('LegacyHeader', () => {
  beforeEach(() => {
    useScrollTriggerMock.mockReset()
  })

  it('should render header drawer', () => {
    render(
      <MockedProvider>
        <LegacyHeader />
      </MockedProvider>
    )
    expect(screen.getByTestId('HeaderMenuPanel')).toBeInTheDocument()
  })

  it('should hide bottom app bar', () => {
    render(
      <MockedProvider>
        <LegacyHeader hideBottomAppBar />
      </MockedProvider>
    )
    expect(screen.queryByTestId('BottomAppBar')).not.toBeInTheDocument()
  })

  it('should hide spacer', () => {
    render(
      <MockedProvider>
        <LegacyHeader hideSpacer />
      </MockedProvider>
    )
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })

  it('should hide top app bar', () => {
    render(
      <MockedProvider>
        <LegacyHeader hideTopAppBar />
      </MockedProvider>
    )
    expect(screen.queryByTestId('TopAppBar')).not.toBeInTheDocument()
  })
})
