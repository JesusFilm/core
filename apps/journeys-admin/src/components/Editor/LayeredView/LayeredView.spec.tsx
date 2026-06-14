import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../test/mockReactFlow'
import { TestEditorState } from '../../../libs/TestEditorState'
import { MuxVideoUploadProvider } from '../../MuxVideoUploadProvider'
import { EditorLayoutProvider } from '../EditorLayoutContext'

import { LayeredView } from '.'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn(() => false)
}))

const mockUseMediaQuery = useMediaQuery as MockedFunction<typeof useMediaQuery>

describe('LayeredView', () => {
  let state: EditorState
  const selectedStep = {
    __typename: 'StepBlock',
    id: 'step1.id',
    children: [
      {
        __typename: 'CardBlock',
        id: 'card1.id',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        children: [],
        showAssistant: null,
        expandChatByDefault: null
      }
    ]
  } as unknown as TreeBlock<StepBlock>

  beforeEach(() => {
    state = {
      steps: [selectedStep],
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      activeContent: ActiveContent.Canvas,
      activeSlide: ActiveSlide.JourneyFlow
    }
    mockUseMediaQuery.mockImplementation(() => true)
    mockReactFlow()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderLayeredView(initialState: EditorState): void {
    render(
      <MockedProvider>
        <EditorProvider initialState={initialState}>
          <MuxVideoUploadProvider>
            <EditorLayoutProvider value="layered">
              <TestEditorState />
              <LayeredView />
            </EditorLayoutProvider>
          </MuxVideoUploadProvider>
        </EditorProvider>
      </MockedProvider>
    )
  }

  it('renders journey flow with drawer closed on journey flow slide', () => {
    renderLayeredView(state)

    expect(screen.getByTestId('LayeredView')).toBeInTheDocument()
    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(
      screen.queryByTestId('LayeredViewDrawerContent')
    ).not.toBeInTheDocument()
  })

  it('opens drawer with content and settings on content slide', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Content })

    expect(screen.getByTestId('LayeredViewDrawer')).toBeVisible()
    expect(screen.getByTestId('Content')).toBeInTheDocument()
    expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
  })

  it('opens drawer on drawer slide', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Drawer })

    expect(screen.getByTestId('LayeredViewDrawer')).toBeVisible()
  })

  it('slides settings panel in only on drawer slide', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Content })

    expect(screen.getByTestId('LayeredViewDrawerContent')).toHaveStyle(
      'transform: translateX(calc(328px + 32px))'
    )
  })

  it('shows settings panel on drawer slide', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Drawer })

    expect(screen.getByTestId('LayeredViewDrawerContent')).toHaveStyle(
      'transform: translateX(0)'
    )
  })

  it('dispatches journey flow slide on backdrop close', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Drawer })

    expect(screen.getByText('activeSlide: 2')).toBeInTheDocument()
    fireEvent.click(document.querySelector('.MuiBackdrop-root') as Element)
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })

  it('lets clicks on the paper empty areas fall through to the backdrop', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Drawer })

    // the transparent paper is pointer-events: none so empty areas around the
    // card reach the dimmed backdrop (which closes the drawer)...
    expect(
      document.querySelector('.MuiDrawer-paper') as Element
    ).toHaveStyle('pointer-events: none')
    // ...while the settings panel re-enables clicks so it stays interactive
    expect(screen.getByTestId('SettingsDrawer').parentElement).toHaveStyle(
      'pointer-events: auto'
    )
  })

  it('keeps the off-screen settings panel inert on the content slide', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Content })

    // on the content slide the settings panel is slid off-screen; it must stay
    // pointer-events: none so it cannot intercept clicks meant for the backdrop
    // while it is transitioning in/out
    expect(screen.getByTestId('SettingsDrawer').parentElement).toHaveStyle(
      'pointer-events: none'
    )
  })
})
