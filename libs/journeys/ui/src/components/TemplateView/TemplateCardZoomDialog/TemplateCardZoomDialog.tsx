import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '../../../libs/block'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../libs/useJourneyQuery/__generated__/GetJourney'
import { TemplateCardPreview } from '../TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreview'

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

  const variant = isDesktop ? 'guestPreviewDesktop' : 'guestPreviewMobile'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-label={t('Card preview')}
      fullWidth
      disableScrollLock
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.65)' }
        },
        paper: {
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: '95vw',
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
      <TemplateCardPreview
        steps={steps}
        variant={variant}
        selectedStep={selectedStep}
      />
    </Dialog>
  )
}
