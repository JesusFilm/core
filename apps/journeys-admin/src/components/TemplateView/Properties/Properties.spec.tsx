import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '../data'
import { Properties } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('JourneyView/Properties', () => {
  it('should render the current language', async () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <Properties />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })
})
