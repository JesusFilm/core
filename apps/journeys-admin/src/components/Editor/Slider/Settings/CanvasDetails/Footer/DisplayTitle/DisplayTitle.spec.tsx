import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { getJourneySettingsUpdateMock } from '../../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { DisplayTitle } from '.'

describe('DisplayTitle', () => {
  it('should render with initial value of display title', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...defaultJourney, displayTitle: 'Display title' }
          }}
        >
          <EditorProvider>
            <DisplayTitle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const accordion = screen.getByRole('button', { name: 'Display Title' })
    expect(accordion).toBeInTheDocument()

    fireEvent.click(accordion)

    const input = screen.getByRole('textbox')
    expect(input).toBeVisible()
    expect(input).toHaveValue('Display title')
  })

  it('initial value should be seo title if no display title', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...defaultJourney, seoTitle: 'Seo title' }
          }}
        >
          <EditorProvider>
            <DisplayTitle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const accordion = screen.getByRole('button', { name: 'Display Title' })
    expect(accordion).toBeInTheDocument()

    fireEvent.click(accordion)

    const input = screen.getByRole('textbox')
    expect(input).toBeVisible()
    expect(input).toHaveValue('Seo title')
  })

  it('should update display title', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({
      displayTitle: 'display title'
    })

    render(
      <MockedProvider mocks={[mockUpdate]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <DisplayTitle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const accordion = screen.getByRole('button', { name: 'Display Title' })
    expect(accordion).toBeInTheDocument()

    fireEvent.click(accordion)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'display title' } })
    fireEvent.blur(input)

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())
  })

  it('should handle undo and redo', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({
      displayTitle: 'display title'
    })
    const mockUpdateUndo = getJourneySettingsUpdateMock({ displayTitle: null })
    const mockUpdateRedo = getJourneySettingsUpdateMock({
      displayTitle: 'display title'
    })

    render(
      <MockedProvider mocks={[mockUpdate, mockUpdateUndo, mockUpdateRedo]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <DisplayTitle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const accordion = screen.getByRole('button', { name: 'Display Title' })
    expect(accordion).toBeInTheDocument()

    fireEvent.click(accordion)

    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'display title' } })
    fireEvent.blur(input)

    await waitFor(() => expect(mockUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateUndo.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockUpdateRedo.result).toHaveBeenCalled())
  })
})
