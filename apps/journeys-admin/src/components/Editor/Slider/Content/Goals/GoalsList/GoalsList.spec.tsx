import { fireEvent, render, screen } from '@testing-library/react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import {
  ActiveContent,
  ActiveFab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { Goal } from '../Goals'

import { GoalsList } from './GoalsList'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('GoalsList', () => {
  const goals: Goal[] = [
    {
      url: 'https://www.google.com/',
      count: 2,
      goalType: GoalType.Website
    },
    {
      url: 'https://www.biblegateway.com/versions/',
      count: 1,
      goalType: GoalType.Bible
    },
    {
      url: 'https://www.messenger.com/t/',
      count: 1,
      goalType: GoalType.Chat
    }
  ]

  const dispatch = jest.fn()

  const state: EditorState = {
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Goals,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  describe('GoalsList', () => {
    it('should render title and subtitle', () => {
      render(<GoalsList goals={goals} />)
      expect(screen.getByText('The Journey Goals')).toBeInTheDocument()
    })

    it('should call dispatch with a URL when "Learn More" button is clicked', () => {
      render(<GoalsList goals={goals} />)
      fireEvent.click(screen.getByRole('button', { name: 'Learn More' }))
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SetSelectedGoalUrlAction'
      })
    })

    it('should render goal URL subtitle', () => {
      render(<GoalsList goals={goals} />)
      expect(screen.getByText('https://www.google.com/')).toBeInTheDocument()
      expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    })

    it('should open drawer or dispatch on click', () => {
      render(<GoalsList goals={goals} />)
      fireEvent.click(screen.getAllByTestId('Edit2Icon')[0])
      expect(dispatch).toHaveBeenCalled()
    })

    it('should render the table titles', () => {
      render(<GoalsList goals={goals} />)
      expect(screen.getByText('Target and Goal')).toBeInTheDocument()
      expect(screen.getByText('Appears on')).toBeInTheDocument()
    })
  })
})
