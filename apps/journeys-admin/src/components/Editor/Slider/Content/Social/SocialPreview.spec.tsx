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

import { ThemeProvider } from '../../../../ThemeProvider'

import { SocialPreview } from './SocialPreview'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

const mockDispatch = jest.fn()

describe('SocialPreview', () => {
  const state: EditorState = {
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Social,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock
  }

  beforeEach(() => {
    mockUseMediaQuery.mockImplementation(() => true)

    mockUseEditor.mockReturnValue({
      state,
      dispatch: mockDispatch
    })
  })

  it('should render Message Post and Fab for viewports larger than mobile', () => {
    render(
      <ThemeProvider>
        <SocialPreview />
      </ThemeProvider>
    )

    expect(screen.getByText('Social App View')).toBeInTheDocument()
    expect(screen.getByText('Messaging App View')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('should only render Message and Post for mobile viewport', () => {
    mockUseMediaQuery.mockImplementation(() => false)

    render(
      <ThemeProvider>
        <SocialPreview />
      </ThemeProvider>
    )

    expect(screen.getByText('Social App View')).toBeInTheDocument()
    expect(screen.getByText('Messaging App View')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit' })
    ).not.toBeInTheDocument()
  })

  it('should dispatch active slide action on click', () => {
    render(
      <ThemeProvider>
        <SocialPreview />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByTestId('SocialPreview'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
  })
})
