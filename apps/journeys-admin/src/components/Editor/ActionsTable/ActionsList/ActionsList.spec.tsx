import { fireEvent, render } from '@testing-library/react'
import {
  useEditor,
  EditorState,
  ActiveTab,
  ActiveFab,
  ActiveJourneyEditContent
} from '@core/journeys/ui/EditorProvider'
import { ActionFields_LinkAction as LinkAction } from '../../../../../__generated__/ActionFields'
import { ActionDetails } from '../../ActionDetails'
import { ActionsList } from './ActionsList'

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
  const actions: LinkAction[] = [
    {
      __typename: 'LinkAction',
      parentBlockId: '84d742c8-9905-4b77-8987-99c08c04cde3',
      gtmEventName: null,
      url: 'https://www.google.com/'
    }
  ]

  const dispatch = jest.fn()

  const state: EditorState = {
    drawerMobileOpen: false,
    activeTab: ActiveTab.Cards,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Action
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  it('should render a list of actions', () => {
    const { getByText } = render(<ActionsList actions={actions} />)
    expect(getByText('https://www.google.com/')).toBeInTheDocument()
  })

  it('should dispatch on click', () => {
    const { getByTestId } = render(<ActionsList actions={actions} />)
    fireEvent.click(getByTestId('EditRoundedIcon'))
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Goal Details',
      children: <ActionDetails url={actions[0].url} />
    })
  })
})
