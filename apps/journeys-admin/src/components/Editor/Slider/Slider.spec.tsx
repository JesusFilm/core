import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { mockReactFlow } from '../../../../test/mockReactFlow'

import { Slider } from '.'

jest.mock('@core/journeys/ui/EditorProvider', () => ({
  __esModule: true,
  ...jest.requireActual('@core/journeys/ui/EditorProvider'),
  useEditor: jest.fn()
}))

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>

describe('Slider', () => {
  const state: EditorState = {
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
    activeContent: ActiveContent.Social,
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow
  }
  const mockDispatch = jest.fn()

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch: mockDispatch
    })
    mockUseMediaQuery.mockImplementation(() => true)
    mockReactFlow()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders slides', () => {
    render(
      <MockedProvider>
        <Slider />
      </MockedProvider>
    )

    expect(screen.getByTestId('Slider')).toBeInTheDocument()
    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(screen.getByTestId('Content')).toBeInTheDocument()
    expect(screen.getByTestId('SocialShareAppearance')).toBeInTheDocument()
  })

  it('dispatches SetActiveSlideAction on activeIndexChange', () => {})

  it('handles prev on back click', async () => {
    render(
      <MockedProvider>
        <Slider />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('ChevronLeftIcon'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SetActiveSlideAction',
      activeSlide: -1
    })
  })
})
