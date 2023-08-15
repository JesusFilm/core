import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'

import { JourneyDetails } from './JourneyDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('journeyDetails', () => {
  it('renders the language', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                createdAt: new Date('2021-11-19T12:34:56.647Z').toISOString(),
                language: {
                  __typename: 'Language',
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'Translation'
                    }
                  ]
                }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <JourneyDetails journeyType="Journey" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })
})
