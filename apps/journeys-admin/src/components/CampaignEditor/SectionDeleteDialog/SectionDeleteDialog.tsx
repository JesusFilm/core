import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'

interface SectionDeleteDialogProps {
  open: boolean
  /** The page the section sits on; the Region Page adds its warning. */
  pageKind: CampaignPageKind
  /** `column` is the bin of a section in a Column Slot: it empties the column. */
  variant?: 'section' | 'column'
  onClose: () => void
  onConfirm: () => void
}

/**
 * The one confirmation a section's bin has (Extras delete without one). Its
 * copy points at undo rather than at not saving, and on the Region Page it
 * says the section leaves every region page at once. For a section in a
 * Column Slot it says the column is emptied, not removed.
 */
export function SectionDeleteDialog({
  open,
  pageKind,
  variant = 'section',
  onClose,
  onConfirm
}: SectionDeleteDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: variant === 'column' ? t('Empty column?') : t('Delete section?'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: variant === 'column' ? t('Empty') : t('Delete'),
        closeLabel: t('Cancel')
      }}
      testId="CampaignSectionDeleteDialog"
    >
      {variant === 'column' && (
        <Typography gutterBottom>
          {t('This removes the section from the column; the column stays.')}
        </Typography>
      )}
      {pageKind === CampaignPageKind.regionTemplate && (
        <Typography gutterBottom>
          {t('This removes the section from every region page.')}
        </Typography>
      )}
      <Typography>{t('You can undo this afterwards.')}</Typography>
    </Dialog>
  )
}
