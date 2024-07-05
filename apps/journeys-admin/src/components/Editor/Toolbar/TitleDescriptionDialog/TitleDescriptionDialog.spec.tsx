import { MockedProvider } from '@apollo/client/testing'
import {
  act,
  fireEvent,
  getByTestId,
  render,
  waitFor
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import userEvent from '@testing-library/user-event'
import { JOURNEY_TITLE_DESCRIPTION_UPDATE, TitleDescriptionDialog } from '.'
import { journey } from '../../../JourneyList/ActiveJourneyList/ActivePriorityList/ActiveJourneyListData'

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
    expect(journey.title).not.toBe('New Journey')
  })

  it('should update journey title and description on submit', async () => {
    const updatedJourney = {
      title: 'Changed Title',
      description: 'Description'
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

    const { getByRole, getAllByRole, getByTestId } = render(
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

    // fireEvent.change(getAllByRole('textbox')[0], {
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'Changed Title' }
    })

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows notistack error alert when title fails to update', async () => {
    const { getByRole, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_DESCRIPTION_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Journey',
                  description: 'Description'
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

    fireEvent.change(getAllByRole('textbox')[0], {
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

    const { getByRole, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_DESCRIPTION_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'Journey Heading',
                  description: 'Description'
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

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: '' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})
