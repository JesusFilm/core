import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../data'

import {
  TITLE_DESCRIPTION_UPDATE,
  TitleDescriptionDialog
} from './TitleDescriptionDialog'

const onClose = jest.fn()

describe('TitleDescriptionDialog', () => {
  it('should update title and description on submit', async () => {
    const updatedJourney = {
      title: 'New Title',
      description: 'New Description'
    }

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          ...updatedJourney
        }
      }
    }))

    const { getByRole, getAllByRole } = render(
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
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TitleDescriptionDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'New Title' }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows error alert when either field fails to update', async () => {
    const { getByRole, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TITLE_DESCRIPTION_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Title',
                  description: 'New Description'
                }
              }
            },
            result: {
              data: {
                journeyUpdate: {
                  id: defaultJourney.id,
                  __typename: 'Journey',
                  title: 'New Title',
                  description: 'New Description'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TitleDescriptionDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Field update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })
})
