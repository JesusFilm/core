import { fireEvent, render } from '@testing-library/react'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { Footer } from './Footer'
import { Chat } from './Chat'

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

  it('should display Host attribute with hosts name if a name is provided', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            themeMode: ThemeMode.dark,
            themeName: ThemeName.base,
            language: {
              __typename: 'Language',
              id: '529',
              bcp47: 'en',
              iso3: 'eng'
            },
            host: {
              title: `John Geronimo "The Rock" Johnson`
            }
          } as unknown as Journey
        }}
      >
        <Footer />
      </JourneyProvider>
    )

    expect(getByText('Hosted by')).toBeInTheDocument()
    expect(getByText(`John Geronimo "The Rock" Johnson`)).toBeInTheDocument()
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
      children: <Chat />
    })
  })
})
