import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { TITLE_DESCRIPTION_UPDATE } from '../../../../JourneyView/TitleDescription/TitleDescriptionDialog/TitleDescriptionDialog'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { TitleDescriptionMenuItem } from './TitleDescriptionMenuItem'

describe('TitleDescriptionMenuItem', () => {
  it('should handle edit journey title and description if user is publisher', async () => {
    const updatedJourney = {
      title: 'New Title',
      description: 'New Description'
    }

    const onClose = jest.fn()
    const { getByRole, getAllByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: TITLE_DESCRIPTION_UPDATE,
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
              <TitleDescriptionMenuItem />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'New Title' }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
