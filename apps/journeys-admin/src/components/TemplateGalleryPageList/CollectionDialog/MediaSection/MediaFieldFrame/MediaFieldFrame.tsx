import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { SxProps, Theme } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { MEDIA_BOX_HEIGHT } from '../../MediaPreview'

interface MediaFieldFrameProps {
  /** The inner 16:9 preview (thumbnail / embed / grey placeholder). */
  children: ReactNode
  /**
   * When set, an edit affordance is shown and the whole frame is clickable —
   * mirroring the creator-image picker. Upload passes `openPicker` here (so the
   * box is Choose / Replace); Link omits it so the preview fills the frame.
   */
  onEdit?: () => void
  /** Accessible label for the clickable frame (when `onEdit` is set). */
  editLabel?: string
}

// Fixed grey-box width matching the creator-image box (92×77). The preview
// fills the space left of the edit icon; without an icon (Link) it stretches
// to the full padded width.
const FRAME_WIDTH = 92

const frameSx: SxProps<Theme> = {
  width: FRAME_WIDTH,
  height: MEDIA_BOX_HEIGHT,
  flexShrink: 0,
  bgcolor: '#efefef',
  borderRadius: 2,
  p: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 1
}

/**
 * Grey outer box that frames the media preview, matching the creator-details
 * image picker (outer #efefef rounded box, darker inner preview). Shared by the
 * Link field and the Upload control so the two read as one consistent control.
 */
export function MediaFieldFrame({
  children,
  onEdit,
  editLabel
}: MediaFieldFrameProps): ReactElement {
  const inner = (
    <>
      {children}
      {onEdit != null && (
        <Edit2Icon sx={{ fontSize: 24, color: 'primary.main', flexShrink: 0 }} />
      )}
    </>
  )

  if (onEdit != null) {
    return (
      <ButtonBase
        onClick={onEdit}
        aria-label={editLabel}
        sx={{ ...frameSx, textAlign: 'left' }}
      >
        {inner}
      </ButtonBase>
    )
  }

  return <Box sx={frameSx}>{inner}</Box>
}
