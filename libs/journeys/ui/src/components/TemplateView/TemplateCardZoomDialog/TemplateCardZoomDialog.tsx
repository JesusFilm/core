import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '../../../libs/block'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../libs/useJourneyQuery/__generated__/GetJourney'
import { TemplateCardPreview } from '../TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreview'
import Box from '@mui/material/Box'

export interface TemplateCardZoomDialogProps {
  open: boolean
  onClose: () => void
  steps: Array<TreeBlock<StepBlock>>
  selectedStep: TreeBlock<StepBlock> | null
}

export function TemplateCardZoomDialog({
  open,
  onClose,
  steps,
  selectedStep
}: TemplateCardZoomDialogProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })

  const displayDesktop = { xs: 'none', md: 'block' }
  const displayMobile = { xs: 'block', md: 'none' }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-label={t('Card preview')}
      fullWidth
      // disableScrollLock
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.65)' }
        },
        paper: {
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: isDesktop ? 'lg' : 'sm',
            maxHeight: '90vh',
            m: 'auto',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
          }
        }
      }}
    >
      <Box sx={{ display: displayMobile }}>
        <TemplateCardPreview
          steps={steps}
          variant="guestPreviewMobile"
          selectedStep={selectedStep}
        />
      </Box>
      <Box sx={{ display: displayDesktop }}>
        <TemplateCardPreview
          steps={steps}
          variant="guestPreviewDesktop"
          selectedStep={selectedStep}
        />
      </Box>
    </Dialog>
  )
}
