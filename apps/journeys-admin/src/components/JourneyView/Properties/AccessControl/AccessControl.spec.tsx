import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

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
              variant: 'admin'
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
