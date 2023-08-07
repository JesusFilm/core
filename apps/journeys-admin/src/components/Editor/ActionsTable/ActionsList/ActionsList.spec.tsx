import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'

import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { Actions } from '../ActionsTable'

import { ActionsList } from './ActionsList'

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

describe('ActionsList', () => {
  const actions: Actions[] = [
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
    drawerMobileOpen: false,
    activeTab: ActiveTab.Journey,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Action
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
      const { getByTestId, getByRole } = render(
        <ActionsList actions={actions} goalLabel={() => 'Visit a website'} />
      )
      fireEvent.click(getByRole('button', { name: 'Learn More' }))
      expect(getByTestId('ActionInformation').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close information drawer on close icon click', () => {
      const { getByTestId, getByText, getByRole } = render(
        <ActionsList actions={actions} goalLabel={() => 'Visit a website'} />
      )
      fireEvent.click(getByRole('button', { name: 'Learn More' }))
      expect(getByText('Information')).toBeInTheDocument()
      fireEvent.click(getByTestId('CloseIcon'))
      expect(getByTestId('ActionInformation').parentElement).not.toHaveClass(
        'MuiDrawer-parentAnchorRight'
      )
    })

    it('should render a list of actions', () => {
      const { getAllByText } = render(
        <ActionsList actions={actions} goalLabel={() => 'Visit a website'} />
      )
      expect(getAllByText('https://www.google.com/')[0]).toBeInTheDocument()
      expect(getAllByText('Visit a website')[0]).toBeInTheDocument()
      expect(getAllByText(2)[0]).toBeInTheDocument()
    })

    it('should open the drawer or dispatch on click', () => {
      const { getAllByTestId } = render(
        <ActionsList actions={actions} goalLabel={() => 'Visit a website'} />
      )
      fireEvent.click(getAllByTestId('EditRoundedIcon')[0])
      expect(dispatch).toHaveBeenCalled()
    })
  })

  describe('mdDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the information drawer from the bottom', () => {
      const { getByTestId, getByText, getByRole } = render(
        <ActionsList actions={actions} goalLabel={() => 'Visit a website'} />
      )
      fireEvent.click(getByRole('button', { name: 'Learn More' }))
      expect(getByText('Information')).toBeInTheDocument()
      expect(getByTestId('ActionInformation').parentElement).toHaveClass(
        'MuiPaper-root MuiPaper-elevation MuiPaper-elevation0 MuiDrawer-paper MuiDrawer-paperAnchorBottom css-1mdfdy2-MuiPaper-root-MuiDrawer-paper'
      )
    })

    it('should render the actions list in mobile view', () => {
      const { getAllByText } = render(
        <ActionsList actions={actions} goalLabel={() => 'Visit a website'} />
      )
      expect(getAllByText('Target and Action')[0]).toBeInTheDocument()
      expect(getAllByText('Appears on')).not.toHaveLength(2)
    })
  })
})
