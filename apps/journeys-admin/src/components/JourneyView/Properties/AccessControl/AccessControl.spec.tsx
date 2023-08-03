import { MockedProvider } from '@apollo/client/testing'
import {
  JourneyProvider,
  RenderLocation
} from '@core/journeys/ui/JourneyProvider'
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
    const { getByText, getAllByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              renderLocation: RenderLocation.Admin
            }}
          >
            <AccessControl />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Access Control')).toBeInTheDocument()
    expect(
      getAllByRole('img').map((element) => element.getAttribute('alt'))
    ).toEqual([
      // mobile
      'Coral Three',
      'Horace Two',
      'Amin One',
      // desktop
      'Coral Three',
      'Horace Two',
      'Amin One'
    ])
  })
})
