import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'

interface SectionDeleteDialogProps {
  open: boolean
  /** The page the section sits on; the Region Page adds its warning. */
  pageKind: CampaignPageKind
  onClose: () => void
  onConfirm: () => void
}

/**
 * The one confirmation a section's bin has (Extras delete without one). Its
 * copy points at undo rather than at not saving, and on the Region Page it
 * says the section leaves every region page at once.
 */
export function SectionDeleteDialog({
  open,
  pageKind,
  onClose,
  onConfirm
}: SectionDeleteDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Delete section?'), closeButton: true }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      testId="CampaignSectionDeleteDialog"
    >
      {pageKind === CampaignPageKind.regionTemplate && (
        <Typography gutterBottom>
          {t('This removes the section from every region page.')}
        </Typography>
      )}
      <Typography>{t('You can undo this afterwards.')}</Typography>
    </Dialog>
  )
}
