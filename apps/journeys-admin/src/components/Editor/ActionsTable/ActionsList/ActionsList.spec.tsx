import { fireEvent, render } from '@testing-library/react'
import {
  useEditor,
  EditorState,
  ActiveTab,
  ActiveFab,
  ActiveJourneyEditContent
} from '@core/journeys/ui/EditorProvider'
import { ActionDetails } from '../../ActionDetails'
import { Actions } from '../ActionsTable'
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
    const { getAllByText } = render(
      <ActionsList actions={actions} goalLabel={() => 'Visit a Website'} />
    )
    expect(getAllByText('Visit a Website')[0]).toBeInTheDocument()
  })

  it('should dispatch on click', () => {
    const { getAllByTestId } = render(
      <ActionsList actions={actions} goalLabel={() => 'Visit a Website'} />
    )
    fireEvent.click(getAllByTestId('EditRoundedIcon')[0])
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Goal Details',
      children: <ActionDetails url={actions[0].url} />
    })
  })
})
