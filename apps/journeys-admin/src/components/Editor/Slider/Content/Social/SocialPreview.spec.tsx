import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { TestEditorState } from '../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../ThemeProvider'
import { EditorLayoutProvider } from '../../../EditorLayoutContext'

import { SocialPreview } from '.'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

const mockUseMediaQuery = useMediaQuery as MockedFunction<typeof useMediaQuery>

describe('SocialPreview', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockImplementation(() => true)
  })

  it('should render Message Post and Fab for viewports larger than mobile', () => {
    render(
      <MockedProvider>
        <ThemeProvider>
          <SocialPreview />
        </ThemeProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Social Post View')).toBeInTheDocument()
    expect(screen.getByText('Message View')).toBeInTheDocument()
  })

  it('should only render Message and Post for mobile viewport', () => {
    mockUseMediaQuery.mockImplementation(() => false)

    render(
      <MockedProvider>
        <ThemeProvider>
          <SocialPreview />
        </ThemeProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Social Post View')).toBeInTheDocument()
    expect(screen.getByText('Message View')).toBeInTheDocument()
  })

  it('should dispatch active slide action on click', () => {
    const state: EditorState = {
      activeSlide: ActiveSlide.JourneyFlow,
      activeContent: ActiveContent.Social,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={state}>
          <ThemeProvider>
            <TestEditorState />
            <SocialPreview />
          </ThemeProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('SocialPreview'))
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })

  it('should render natural width and dispatch drawer slide on click in the layered layout', () => {
    const state: EditorState = {
      activeSlide: ActiveSlide.JourneyFlow,
      activeContent: ActiveContent.Social,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={state}>
          <ThemeProvider>
            <EditorLayoutProvider value="layered">
              <TestEditorState />
              <SocialPreview />
            </EditorLayoutProvider>
          </ThemeProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('OuterStack')).toHaveStyle('width: auto')
    // the preview re-enables pointer events so it stays interactive while the
    // drawer paper is pointer-events: none (empty areas close the drawer)
    expect(screen.getByTestId('OuterStack')).toHaveStyle('pointer-events: auto')
    expect(screen.getByTestId('SocialPostColumn')).toHaveStyle('width: 300px')
    expect(screen.getByTestId('SocialMessageColumn')).toHaveStyle(
      'width: 387px'
    )
    fireEvent.click(screen.getByTestId('SocialPreview'))
    expect(screen.getByText('activeSlide: 2')).toBeInTheDocument()
  })
})
