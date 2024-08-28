import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'
import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../../../../../../__generated__/JourneySettingsUpdate'
import { JOURNEY_SETTINGS_UPDATE } from '../../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { UpdateReactionInput } from './Reactions'

import { Reactions } from '.'

describe('Reactions', () => {
  const defaultJourney = {
    __typename: 'Journey',
    id: 'journey.id',
    title: 'Internal Title',
    description: 'Internal Description',
    strategySlug: null,
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    },
    tags: [],
    website: null,
    showShareButton: true,
    showLikeButton: false,
    showDislikeButton: null
  } as unknown as Journey

  const getJourneySettingsUpdateMock = (
    input: UpdateReactionInput
  ): MockedResponse<JourneySettingsUpdate, JourneySettingsUpdateVariables> => {
    return {
      request: {
        query: JOURNEY_SETTINGS_UPDATE,
        variables: {
          id: defaultJourney.id,
          input
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyUpdate: {
            ...defaultJourney,
            ...input
          }
        }
      }))
    }
  }

  it('should render', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <Reactions />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const reactionsAccordion = screen.getByRole('button', { name: 'Reactions' })
    expect(reactionsAccordion).toBeInTheDocument()

    fireEvent.click(reactionsAccordion)

    expect(screen.getByText('Share')).toBeVisible()
    expect(screen.getByText('Like')).toBeVisible()
    expect(screen.getByText('Dislike')).toBeVisible()

    const checkboxes = screen.getAllByRole('checkbox')

    expect(checkboxes[0]).toBeChecked() // true
    expect(checkboxes[1]).not.toBeChecked() // false
    expect(checkboxes[2]).toBeChecked() // null
  })

  it('should update an option', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({ showShareButton: false })
    render(
      <MockedProvider mocks={[mockUpdate]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <Reactions />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const reactionsAccordion = screen.getByRole('button', { name: 'Reactions' })
    expect(reactionsAccordion).toBeInTheDocument()

    fireEvent.click(reactionsAccordion)

    const share = screen.getByTestId('checkbox-Share')
    fireEvent.click(within(share).getByRole('checkbox'))

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())
  })

  it('should undo and redo an option', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({ showShareButton: false })
    const mockUpdateUndo = getJourneySettingsUpdateMock({ showShareButton: true })
    const mockUpdateRedo = getJourneySettingsUpdateMock({ showShareButton: false })

    render(
      <MockedProvider mocks={[mockUpdate, mockUpdateUndo, mockUpdateRedo]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <Reactions />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Reactions' }))

    const share = screen.getByTestId('checkbox-Share')
    fireEvent.click(within(share).getByRole('checkbox'))

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateUndo.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockUpdateRedo.result).toHaveBeenCalled())
  })
})
