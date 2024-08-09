import useMediaQuery from '@mui/material/useMediaQuery'
import { render, screen } from '@testing-library/react'

import {
  EditorProvider,
  type EditorState
} from '@core/journeys/ui/EditorProvider'

import { ThemeProvider } from '../../../../../ThemeProvider'

import { CanvasFooter } from './CanvasFooter'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CanvasFooter', () => {
  it('should render fab when not in analytics mode', () => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)

    const initialState = {
      showAnalytics: false
    } as unknown as EditorState

    render(
      <ThemeProvider>
        <EditorProvider initialState={initialState}>
          <CanvasFooter scale={1} />
        </EditorProvider>
      </ThemeProvider>
    )

    expect(screen.getByTestId('Fab')).toBeInTheDocument()
  })

  it('should render card analytics when in analytics mode', () => {
    const initialState = {
      showAnalytics: true
    } as unknown as EditorState

    render(
      <EditorProvider initialState={initialState}>
        <CanvasFooter scale={1} />
      </EditorProvider>
    )

    expect(screen.getByTestId('CardAnalytics')).toBeInTheDocument()
  })
})
