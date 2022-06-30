import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  DuplicateJourneyMenuItem,
  JOURNEY_DUPLICATE
} from './DuplicateJourneyMenuItem'

describe('DuplicateJourneys', () => {
  it('should duplicate a journey on menu card click', async () => {
    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journeyId'
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              admin: true
            }}
          >
            <DuplicateJourneyMenuItem id="journeyId" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
