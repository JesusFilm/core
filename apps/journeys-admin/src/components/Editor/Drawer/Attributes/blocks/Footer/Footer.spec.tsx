import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider,
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
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { Footer } from './Footer'
import { HostSidePanel } from './HostSidePanel'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))
const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
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
    jest.resetAllMocks()
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
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <Footer />
            <TestEditorState renderChildren />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByText('Chat Widget'))
    expect(getByText('drawerTitle: Chat Widget')).toBeInTheDocument()
  })
})
