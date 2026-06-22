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

  it('shows the settings panel alongside the card on the content slide', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Content })

    // card + properties are coupled: the panel is in place on the content slide
    // too, rather than slid off-screen until the drawer slide
    expect(screen.getByTestId('LayeredViewDrawerContent')).toHaveStyle(
      'transform: translateX(0)'
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

  it('makes the paper pointer-transparent while keeping the settings panel interactive', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Drawer })

    // The close behaviour itself is covered by the backdrop-close test above.
    // jsdom does not hit-test pointer-events, so a click cannot actually route
    // through the paper to the backdrop here; this test pins the mechanism that
    // lets a real click reach it: the transparent paper is pointer-events:none
    // (empty areas fall through) while the settings panel re-enables them.
    expect(document.querySelector('.MuiDrawer-paper') as Element).toHaveStyle(
      'pointer-events: none'
    )
    expect(screen.getByTestId('SettingsDrawer').parentElement).toHaveStyle(
      'pointer-events: auto'
    )
  })

  it('keeps the settings panel interactive on the content slide', () => {
    renderLayeredView({ ...state, activeSlide: ActiveSlide.Content })

    // card + properties are coupled, so the settings panel is shown and
    // interactive on the content slide too
    expect(screen.getByTestId('SettingsDrawer').parentElement).toHaveStyle(
      'pointer-events: auto'
    )
  })
})
