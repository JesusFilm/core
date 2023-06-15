import { fireEvent, render } from '@testing-library/react'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { Footer } from './Footer'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('Footer', () => {
  const state: EditorState = {
    steps: [],
    drawerMobileOpen: false,
    activeTab: ActiveTab.Journey,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch: jest.fn()
    })
  })
  it('should display Footer attributes', () => {
    const { getByText } = render(<Footer />)

    expect(getByText('Hosted by')).toBeInTheDocument()
    expect(getByText('Chat Widget')).toBeInTheDocument()
  })

  it('should open property drawer for variant', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })

    render(<Footer />)

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetSelectedAttributeIdAction',
      id: 'hosted-by'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Hosted By',
      mobileOpen: true,
      children: <div>Hosted by content component</div>
    })
  })

  it('should open property drawer for chat widget', () => {
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })

    const { getByText } = render(<Footer />)
    fireEvent.click(getByText('Chat Widget'))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Chat Widget',
      mobileOpen: true,
      children: <div>Chat Widget Component</div>
    })
  })
})
