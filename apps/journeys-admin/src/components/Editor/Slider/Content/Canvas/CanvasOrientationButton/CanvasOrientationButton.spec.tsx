import Box from '@mui/material/Box'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  CanvasOrientation,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'

import { CanvasOrientationButton } from '.'

describe('CanvasOrientationButton', () => {
  it('should rotate to landscape from the default portrait', () => {
    let state: EditorState | undefined
    render(
      <EditorProvider>
        {(context) => {
          state = context.state
          return <CanvasOrientationButton />
        }}
      </EditorProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rotate to landscape' }))

    expect(state?.canvasOrientation).toBe(CanvasOrientation.Landscape)
    expect(
      screen.getByRole('button', { name: 'Rotate to portrait' })
    ).toBeInTheDocument()
  })

  it('should rotate back to portrait from landscape', () => {
    let state: EditorState | undefined
    render(
      <EditorProvider
        initialState={{ canvasOrientation: CanvasOrientation.Landscape }}
      >
        {(context) => {
          state = context.state
          return <CanvasOrientationButton />
        }}
      </EditorProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rotate to portrait' }))

    expect(state?.canvasOrientation).toBe(CanvasOrientation.Portrait)
    expect(
      screen.getByRole('button', { name: 'Rotate to landscape' })
    ).toBeInTheDocument()
  })

  it('should not let the click reach the Canvas', () => {
    const handleParentClick = vi.fn()
    render(
      <EditorProvider>
        <Box onClick={handleParentClick}>
          <CanvasOrientationButton />
        </Box>
      </EditorProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rotate to landscape' }))

    expect(handleParentClick).not.toHaveBeenCalled()
  })
})
