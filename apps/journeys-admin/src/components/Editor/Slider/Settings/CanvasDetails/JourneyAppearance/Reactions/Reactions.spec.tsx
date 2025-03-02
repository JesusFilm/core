import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { getJourneySettingsUpdateMock } from '../../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { Reactions } from '.'

describe('Reactions', () => {
  it('should render', () => {
    const journey = {
      ...defaultJourney,
      showShareButton: true,
      showLikeButton: false,
      showDislikeButton: null
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <EditorProvider>
            <Reactions />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const accordion = screen.getByTestId('AccordionSummary')
    expect(accordion).toBeInTheDocument()
    expect(within(accordion).getByText('Reactions')).toBeInTheDocument()
    expect(within(accordion).getByRole('checkbox')).toBeInTheDocument()

    fireEvent.click(accordion)

    expect(screen.getByLabelText('Share')).toBeChecked()
    expect(screen.getByLabelText('Like')).not.toBeChecked()
    expect(screen.getByLabelText('Dislike')).toBeChecked()
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

    fireEvent.click(screen.getByTestId('AccordionSummary'))

    const share = screen.getByTestId('checkbox-Share')
    fireEvent.click(within(share).getByRole('checkbox'))

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())
  })

  it('should undo and redo an option', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({ showShareButton: false })
    const mockUpdateUndo = getJourneySettingsUpdateMock({
      showShareButton: true
    })
    const mockUpdateRedo = getJourneySettingsUpdateMock({
      showShareButton: false
    })

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

    fireEvent.click(screen.getByTestId('AccordionSummary'))

    const share = screen.getByTestId('checkbox-Share')
    fireEvent.click(within(share).getByRole('checkbox'))

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateUndo.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockUpdateRedo.result).toHaveBeenCalled())
  })
})
