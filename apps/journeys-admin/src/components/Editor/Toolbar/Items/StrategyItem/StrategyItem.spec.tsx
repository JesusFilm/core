import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ActiveContent, EditorState } from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide,
  EditorProvider
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'
import { TestEditorState } from '../../../../../libs/TestEditorState'

import { StrategyItem } from '.'

describe('StrategyItem', () => {
  it('should navigate to goals and close menu on click', async () => {
    const state: EditorState = {
      activeSlide: ActiveSlide.JourneyFlow,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
    }
    const mockJourney: JourneyFields = {
      id: 'journeyId',
      title: 'Some Title',
      slug: 'journeySlug'
    } as unknown as JourneyFields
    const mockCloseMenu = jest.fn()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <JourneyProvider value={{ journey: mockJourney }}>
              <TestEditorState />
              <StrategyItem variant="button" closeMenu={mockCloseMenu} />
            </JourneyProvider>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('activeContent: goals')).toBeInTheDocument()
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(mockCloseMenu).toHaveBeenCalled()
  })
})
