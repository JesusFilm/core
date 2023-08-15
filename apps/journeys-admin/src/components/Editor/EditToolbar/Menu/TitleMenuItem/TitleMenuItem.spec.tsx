import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { ThemeProvider } from '../../../../ThemeProvider'

import { JOURNEY_TITLE_UPDATE } from './TitleDialog'
import { TitleMenuItem } from './TitleMenuItem'

describe('TitleMenuItem', () => {
  it('should handle edit title', async () => {
    const updatedJourney = {
      title: 'New Journey'
    }

    const onClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_TITLE_UPDATE,
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
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <ThemeProvider>
              <TitleMenuItem onClose={onClose} />
            </ThemeProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Title' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Journey' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
