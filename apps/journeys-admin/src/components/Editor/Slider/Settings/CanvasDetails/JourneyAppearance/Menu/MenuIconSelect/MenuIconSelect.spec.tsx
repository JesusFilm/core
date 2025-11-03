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

import { JourneyMenuButtonIcon } from '../../../../../../../../../__generated__/globalTypes'
import { getJourneySettingsUpdateMock } from '../../../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation.mock'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import { MenuIconSelect } from '.'

describe('MenuIconSelect', () => {
  it('should render without icon selected', () => {
    render(
      <MockedProvider>
        <JourneyProvider>
          <EditorProvider>
            <MenuIconSelect />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Select Icon')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should render with icon selected', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...defaultJourney,
              menuButtonIcon: JourneyMenuButtonIcon.home4
            }
          }}
        >
          <EditorProvider>
            <MenuIconSelect />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      within(screen.getByRole('combobox')).getByTestId('Home4Icon')
    ).toBeInTheDocument()
  })

  it('should update icon', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({
      menuButtonIcon: JourneyMenuButtonIcon.home4
    })

    render(
      <MockedProvider mocks={[mockUpdate]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <MenuIconSelect />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))

    const options = screen.getAllByRole('option')
    fireEvent.click(options[6])

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())
  })

  it('can reset the icon', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({
      menuButtonIcon: null
    })
    const mockUpdateUndo = getJourneySettingsUpdateMock({
      menuButtonIcon: JourneyMenuButtonIcon.home4
    })
    const mockUpdateRedo = getJourneySettingsUpdateMock({
      menuButtonIcon: null
    })

    render(
      <MockedProvider mocks={[mockUpdate, mockUpdateUndo, mockUpdateRedo]}>
        <JourneyProvider
          value={{
            journey: {
              ...defaultJourney,
              menuButtonIcon: JourneyMenuButtonIcon.home4
            }
          }}
        >
          <EditorProvider>
            <MenuIconSelect />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))

    const options = screen.getAllByRole('option')
    fireEvent.click(options[0])

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateUndo.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockUpdateRedo.result).toHaveBeenCalled())
  })

  it('should handle undo/redo', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({
      menuButtonIcon: JourneyMenuButtonIcon.home4
    })
    const mockUpdateUndo = getJourneySettingsUpdateMock({
      menuButtonIcon: null
    })
    const mockUpdateRedo = getJourneySettingsUpdateMock({
      menuButtonIcon: JourneyMenuButtonIcon.home4
    })

    render(
      <MockedProvider mocks={[mockUpdate, mockUpdateUndo, mockUpdateRedo]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <MenuIconSelect />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))

    const options = screen.getAllByRole('option')
    fireEvent.click(options[6])

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateUndo.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockUpdateRedo.result).toHaveBeenCalled())
  })
})
