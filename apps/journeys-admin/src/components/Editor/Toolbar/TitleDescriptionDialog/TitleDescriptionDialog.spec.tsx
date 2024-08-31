import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../../../__generated__/JourneySettingsUpdate'
import { JOURNEY_SETTINGS_UPDATE } from '../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'
import { journey } from '../../../JourneyList/ActiveJourneyList/ActivePriorityList/ActiveJourneyListData'

import { TitleDescriptionDialog } from '.'

const onClose = jest.fn()

function getJourneySettingsUpdateMock(
  title: string,
  description: string
): MockedResponse<JourneySettingsUpdate, JourneySettingsUpdateVariables> {
  return {
    request: {
      query: JOURNEY_SETTINGS_UPDATE,
      variables: {
        id: defaultJourney.id,
        input: {
          title,
          description
        }
      }
    },
    result: {
      data: {
        journeyUpdate: {
          ...defaultJourney,
          id: defaultJourney.id,
          title,
          description,
          strategySlug: null,
          language: journey.language
        }
      }
    }
  }
}

describe('TitleDescriptionDialog', () => {
  it('should not set journey title on close', async () => {
    const mock = getJourneySettingsUpdateMock('New Journey', 'Description')
    render(
      <MockedProvider mocks={[{ ...mock }]}>
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
    await userEvent.type(screen.getAllByRole('textbox')[0], 'New Journey')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(journey.title).not.toBe('New Journey')
  })

  it('should update journey title and description on submit', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          title: 'Changed Title',
          description: 'Changed Description'
        }
      }
    }))
    const mock = getJourneySettingsUpdateMock(
      'Changed Title',
      'Changed Description'
    )
    render(
      <MockedProvider mocks={[{ ...mock, result }]}>
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

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Changed Title' }
    })

    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'Changed Description' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows notistack error alert when title fails to update', async () => {
    const mock = getJourneySettingsUpdateMock(
      'Changed Title',
      'Changed Description'
    )
    render(
      <MockedProvider mocks={[{ ...mock }]}>
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

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'New Journey' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        screen.getByText('Field update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })

  it('should require the title field', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey'
        }
      }
    }))
    const mock = getJourneySettingsUpdateMock(
      'Changed Title',
      'Changed Description'
    )
    render(
      <MockedProvider mocks={[{ ...mock }]}>
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

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByText('Required')).toBeInTheDocument()
    )
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})
