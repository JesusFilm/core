import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'

import {
  ActiveContent,
  ActiveFab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'

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
      count: 2
    },
    {
      url: 'https://www.biblegateway.com/versions/',
      count: 1
    },
    {
      url: 'https://www.messenger.com/t/',
      count: 1
    }
  ]

  const dispatch = jest.fn()

  const state: EditorState = {
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Goals
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  describe('mdUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render the information drawer on the right', () => {
      const { getByTestId, getByRole } = render(<GoalsList goals={goals} />)
      fireEvent.click(getByRole('button', { name: 'Learn More' }))
      expect(getByTestId('GoalInformation').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close information drawer on close icon click', () => {
      const { getByTestId, getByText, getByRole } = render(
        <GoalsList goals={goals} />
      )
      fireEvent.click(getByRole('button', { name: 'Learn More' }))
      expect(getByText('Information')).toBeInTheDocument()
      fireEvent.click(getByTestId('X2Icon'))
      expect(getByTestId('GoalInformation').parentElement).not.toHaveClass(
        'MuiDrawer-parentAnchorRight'
      )
    })

    it('should render a list of goals', () => {
      const { getAllByText } = render(<GoalsList goals={goals} />)
      expect(getAllByText('https://www.google.com/')[0]).toBeInTheDocument()
      expect(getAllByText('Visit a website')[0]).toBeInTheDocument()
      expect(getAllByText(2)[0]).toBeInTheDocument()
    })

    it('should open the drawer or dispatch on click', () => {
      const { getAllByTestId } = render(<GoalsList goals={goals} />)
      fireEvent.click(getAllByTestId('Edit2Icon')[0])
      expect(dispatch).toHaveBeenCalled()
    })
  })

  describe('mdDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the information drawer from the bottom', () => {
      const { getByTestId, getByText, getByRole } = render(
        <GoalsList goals={goals} />
      )
      fireEvent.click(getByRole('button', { name: 'Learn More' }))
      expect(getByText('Information')).toBeInTheDocument()
      expect(getByTestId('GoalInformation').parentElement).toHaveClass(
        'MuiPaper-root MuiPaper-elevation MuiPaper-elevation0 MuiDrawer-paper MuiDrawer-paperAnchorBottom css-1mdfdy2-MuiPaper-root-MuiDrawer-paper'
      )
    })

    it('should render the goals list in mobile view', () => {
      const { getAllByText } = render(<GoalsList goals={goals} />)
      expect(getAllByText('Target and Goal')[0]).toBeInTheDocument()
      expect(getAllByText('Appears on')).not.toHaveLength(2)
    })
  })
})
