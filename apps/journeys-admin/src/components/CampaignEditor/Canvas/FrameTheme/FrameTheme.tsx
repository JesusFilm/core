import { Theme, ThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode, useCallback } from 'react'

interface FrameThemeProps {
  /** The document of the frame the children render into. */
  document: Document
  children: ReactNode
}

/**
 * Makes every popover, menu, select, dialog and popper rendered inside the
 * frame open in the frame's body. Left to itself, MUI portals one without an
 * anchor into the editor's own document, outside the frame's emotion cache and
 * theme, and outside the scaled wrapper that everything in the frame follows.
 */
export function FrameTheme({
  document,
  children
}: FrameThemeProps): ReactElement {
  const extendTheme = useCallback(
    (outerTheme: Theme): Theme => {
      const defaultProps = { container: () => document.body }
      return {
        ...outerTheme,
        components: {
          ...outerTheme.components,
          MuiModal: { defaultProps },
          MuiPopover: { defaultProps },
          MuiPopper: { defaultProps }
        }
      }
    },
    [document]
  )
  return <ThemeProvider theme={extendTheme}>{children}</ThemeProvider>
}
