import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  ActiveContent,
  ActiveFab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide,
  EditorProvider
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

import { StrategyItem } from './StrategyItem'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

describe('StrategyItem', () => {
  const mockJourney: JourneyFields = {
    id: 'journeyId',
    title: 'Some Title',
    slug: 'journeySlug'
  } as unknown as JourneyFields

  const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

  const dispatch = jest.fn()
  const state: EditorState = {
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.Content,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  it('should naivigate to goals and close menu on click', async () => {
    const mockCloseMenu = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <JourneyProvider value={{ journey: mockJourney }}>
              <StrategyItem variant="button" closeMenu={mockCloseMenu} />
            </JourneyProvider>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Goals
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    expect(mockCloseMenu).toHaveBeenCalled()
  })
})
