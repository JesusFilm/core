import { fireEvent, render } from '@testing-library/react'

import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ChatPlatform,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'

import { Chat } from './Chat'
import { Footer } from './Footer'
import { HostSidePanel } from './HostSidePanel'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            chatButtons: [
              {
                id: '1',
                link: 'https://m.me/user',
                platform: ChatPlatform.facebook
              },
              {
                id: '2',
                link: 'viber://',
                platform: ChatPlatform.viber
              }
            ]
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <Footer />
      </JourneyProvider>
    )

    // expect(getByText('Hosted by')).toBeInTheDocument()
    expect(getByText('Chat Widget')).toBeInTheDocument()
    expect(getByText('Facebook and Viber')).toBeInTheDocument()
  })

  it('should return a singular platform value', () => {
    const { getByText } = render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            chatButtons: [
              {
                id: '1',
                link: 'https://m.me/user',
                platform: ChatPlatform.facebook
              }
            ]
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <Footer />
      </JourneyProvider>
    )
    expect(getByText('Facebook')).toBeInTheDocument()
  })

  it.skip('should display Host attribute with hosts name if a name is provided', () => {
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
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <Footer />
      </JourneyProvider>
    )

    expect(getByText('Hosted by')).toBeInTheDocument()
    expect(getByText(`John Geronimo "The Rock" Johnson`)).toBeInTheDocument()
  })

  it.skip('should open property drawer for variant', () => {
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
      mobileOpen: true,
      children: <HostSidePanel />
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
