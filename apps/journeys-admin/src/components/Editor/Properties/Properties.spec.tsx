import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { defaultJourney } from '../data'

import { Properties } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Properties', () => {
  it('should render journey properties', async () => {
    const { getAllByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <Properties />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getAllByText('Access Control')[0]).toBeInTheDocument()
    expect(getAllByText('Journey URL')[0]).toBeInTheDocument()
  })
})
