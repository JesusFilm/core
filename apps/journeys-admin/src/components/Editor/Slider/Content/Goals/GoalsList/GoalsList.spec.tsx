import { fireEvent, render, screen } from '@testing-library/react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { ActiveContent, EditorState } from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide,
  EditorProvider
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { TestEditorState } from '../../../../../../libs/TestEditorState'
import { Goal } from '../Goals'

import { GoalsList } from './GoalsList'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

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

  const state: EditorState = {
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Goals,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
    selectedGoalUrl: 'initialUrl'
  }

  describe('GoalsList', () => {
    it('should render title and subtitle', () => {
      render(<GoalsList goals={goals} />)
      expect(screen.getByText('The Journey Goals')).toBeInTheDocument()
    })

    it('should setSelectedGoalUrl to null when "Learn More" button is clicked', () => {
      render(
        <EditorProvider initialState={state}>
          <TestEditorState />
          <GoalsList goals={goals} />
        </EditorProvider>
      )

      expect(
        screen.getByText('selectedGoalUrl: initialUrl')
      ).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Learn More' }))
      expect(screen.getByText('selectedGoalUrl:')).toBeInTheDocument()
    })

    it('should render goal URL subtitle', () => {
      render(<GoalsList goals={goals} />)
      expect(screen.getByText('https://www.google.com/')).toBeInTheDocument()
      expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    })

    it('should render the table titles', () => {
      render(<GoalsList goals={goals} />)
      expect(screen.getByText('Target and Goal')).toBeInTheDocument()
      expect(screen.getByText('Appears on')).toBeInTheDocument()
    })
  })
})
