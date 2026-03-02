import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import { TemplateCardPreview } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview'

import { TreeBlock } from '@core/journeys/ui/block'

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
  const dialogProps = {
    open,
    onClose,
    'data-testid': 'TemplateCardPreviewDialog' as const,
    fullWidth: true,
    maxWidth: false as const,
    PaperProps: {
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
    },
    slotProps: {
      backdrop: {
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
      }
    }
  }

  if (steps.length === 0) {
    return (
      <Dialog {...dialogProps}>
        <Box />
      </Dialog>
    )
  }

  return (
    <Dialog {...dialogProps}>
      <Box
        sx={{
          pointerEvents: 'auto',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            width: '100%',
            py: 8,
            px: 2
          }}
        >
          <TemplateCardPreview
            steps={steps}
            variant="guestPreviewDesktop"
            initialStepId={initialStepId}
          />
        </Box>
      </Box>
    </Dialog>
  )
}
