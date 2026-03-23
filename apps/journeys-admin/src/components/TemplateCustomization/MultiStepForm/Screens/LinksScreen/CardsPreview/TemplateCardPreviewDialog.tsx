import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import CloseIcon from '@mui/icons-material/Close'
import { TemplateCardPreview } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'

export interface TemplateCardPreviewDialogProps {
  open: boolean
  onClose: () => void
  steps: Array<TreeBlock<StepBlock>>
  initialStepId: string | null
}

export function TemplateCardPreviewDialog({
  open,
  onClose,
  steps,
  initialStepId
}: TemplateCardPreviewDialogProps): ReactElement {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-label="Card preview"
      data-testid="TemplateCardPreviewDialog"
      fullWidth
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' } },
        paper: {
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            m: 0,
            maxWidth: '100vw',
            width: '100%',
            height: '100%',
            minHeight: '100vh',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close preview"
        data-testid="TemplateCardPreviewDialogClose"
        sx={{
          pointerEvents: 'auto',
          position: 'fixed',
          top: 16,
          right: 16,
          color: 'common.white',
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box
        sx={{
          pointerEvents: 'auto',
          position: 'relative',
          width: '100%',
          py: 8,
          px: 2
        }}
      >
        <TemplateCardPreview
          steps={steps}
          variant="guestPreview"
          initialStepId={initialStepId}
        />
      </Box>
    </Dialog>
  )
}
