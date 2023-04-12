import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { DUPLICATE_JOURNEY } from '../../../../../libs/useJourneyDuplicate'
import { DuplicateJourneyMenuItem } from './DuplicateJourneyMenuItem'

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()
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
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: DUPLICATE_JOURNEY,
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
            <DuplicateJourneyMenuItem
              id="journeyId"
              handleCloseMenu={handleCloseMenu}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Duplicated')).toBeInTheDocument()
  })
})
