import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { defaultJourney } from '../../data'
import { AccessControl } from './AccessControl'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('AccessControl', () => {
  it('should display current access', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <AccessControl />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Access Control')).toBeInTheDocument()
  })
})
