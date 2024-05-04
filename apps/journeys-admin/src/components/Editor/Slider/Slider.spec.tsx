import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../test/mockReactFlow'
import { TestEditorState } from '../../../libs/TestEditorState'

import { Slider } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>

describe('Slider', () => {
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
        children: []
      }
    ]
  } as unknown as TreeBlock<StepBlock>

  beforeEach(() => {
    state = {
      selectedStep,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
      activeContent: ActiveContent.Canvas,
      activeFab: ActiveFab.Add,
      activeSlide: ActiveSlide.JourneyFlow
    }
    mockUseMediaQuery.mockImplementation(() => true)
    mockReactFlow()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders slides', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={state}>
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Slider')).toBeInTheDocument()
    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(screen.getByTestId('Content')).toBeInTheDocument()
    expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
  })

  it('dispatches SetActiveSlideAction on activeIndexChange', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Slider />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('EditorCanvas'))
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })

  it('handles prev on back click', async () => {
    const contentState = {
      ...state,
      activeSlide: ActiveSlide.Content
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <Slider />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })
})
