import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../data'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import userEvent from '@testing-library/user-event'
import { JOURNEY_TITLE_DESCRIPTION_UPDATE, TitleDescriptionDialog } from '.'

const onClose = jest.fn()

describe('JourneyView/Menu/TitleDescriptionDialog', () => {
  it('should not set journey title on close', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider mocks={[]}>
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

    userEvent.type(getByTestId('titletextbox'), 'New Journey')
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('should update journey title on submit', async () => {
    const updatedJourney = {
      title: 'New Journey'
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

    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_DESCRIPTION_UPDATE,
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

    fireEvent.change(getByTestId('titletextbox'), {
      target: { value: 'New Journey' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows notistack error alert when title fails to update', async () => {
    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_DESCRIPTION_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Journey'
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

    fireEvent.change(getByTestId('titletextbox'), {
      target: { value: 'New Journey' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Field update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })

  it('is a required field', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey'
        }
      }
    }))

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_DESCRIPTION_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Journey'
                }
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
            <EditorProvider>
              <TitleDescriptionDialog open onClose={onClose} />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    userEvent.type(getByTestId('titletextbox'), '')
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})
