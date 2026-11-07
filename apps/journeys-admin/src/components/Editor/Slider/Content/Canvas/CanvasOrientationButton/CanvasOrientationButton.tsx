import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'

import { CanvasOrientation, useEditor } from '@core/journeys/ui/EditorProvider'
import ArrowRotateLeft1Icon from '@core/shared/ui/icons/ArrowRotateLeft1'

// Rotates the Canvas between Portrait and Landscape. A view choice for the
// Editor session: it dispatches straight to the Editor state rather than
// through a Command, so it adds nothing to undo/redo and saves nothing.
export function CanvasOrientationButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { canvasOrientation },
    dispatch
  } = useEditor()

  const isLandscape = canvasOrientation === CanvasOrientation.Landscape
  const label = isLandscape ? t('Rotate to portrait') : t('Rotate to landscape')

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    // the Canvas selects the Card on click; rotating should leave the
    // current selection alone
    event.stopPropagation()
    dispatch({
      type: 'SetCanvasOrientationAction',
      canvasOrientation: isLandscape
        ? CanvasOrientation.Portrait
        : CanvasOrientation.Landscape
    })
  }

  return (
    <Tooltip title={label} arrow>
      <IconButton
        aria-label={label}
        onClick={handleClick}
        onMouseDown={(event) => event.stopPropagation()}
        sx={{ flexShrink: 0 }}
      >
        <ArrowRotateLeft1Icon />
      </IconButton>
    </Tooltip>
  )
}
