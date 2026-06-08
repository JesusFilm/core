import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { SxProps, Theme } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { MEDIA_BOX_HEIGHT, MEDIA_BOX_WIDTH } from '../../MediaPreview'

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
  /** Disables the clickable frame (e.g. while the dialog is saving). */
  disabled?: boolean
}

// Fixed grey box matching the creator-image box (MEDIA_BOX-sized). The
// preview fills the padded area's full height and stretches up to the edit
// icon's column, so the grey border reads evenly on the left/top/bottom while
// the right keeps a dedicated lane for the edit affordance. Without an icon
// (Link) the preview fills the full padded width.
const frameSx: SxProps<Theme> = {
  width: MEDIA_BOX_WIDTH,
  height: MEDIA_BOX_HEIGHT,
  flexShrink: 0,
  bgcolor: '#efefef',
  borderRadius: 2,
  // 8px inset between the preview and the frame edge (theme spacing unit is
  // 4px, so p:2 = 8px).
  p: 2,
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
  editLabel,
  disabled = false
}: MediaFieldFrameProps): ReactElement {
  const inner = (
    <>
      <Box sx={{ flex: 1, height: '100%', minWidth: 0 }}>{children}</Box>
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
        disabled={disabled}
        sx={{ ...frameSx, textAlign: 'left' }}
      >
        {inner}
      </ButtonBase>
    )
  }

  return <Box sx={frameSx}>{inner}</Box>
}
