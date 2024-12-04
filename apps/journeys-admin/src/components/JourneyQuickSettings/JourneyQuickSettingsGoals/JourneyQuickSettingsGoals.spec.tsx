import { render } from '@testing-library/react'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { JourneyQuickSettingsGoals } from './JourneyQuickSettingsGoals'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('JourneyQuickSettingsGoals', () => {
  const state: EditorState = {
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Goals,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
    selectedGoalUrl: 'initialUrl'
  }

  // should render elements
  it('should render journeyquicksettingsgoals', () => {
    render(<JourneyQuickSettingsGoals />)
  })

  // should setselectedaction

  // should open drawer on click?
})
