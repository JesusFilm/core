import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { JOURNEY_DESC_UPDATE } from './DescriptionDialog'
import { DescriptionMenuItem } from './DescriptionMenuItem'

describe('DescriptionMenuItem', () => {
  it('should handle edit journey description', async () => {
    const updatedJourney = {
      description: 'New Description'
    }
    const onClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_DESC_UPDATE,
                variables: {
                  id: defaultJourney.id,
                  input: updatedJourney
                }
              },
              result: {
                data: {
                  journeyUpdate: {
                    id: defaultJourney.id,
                    __typename: 'Journey',
                    ...updatedJourney
                  }
                }
              }
            }
          ]}
        >
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <DescriptionMenuItem onClose={onClose} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
