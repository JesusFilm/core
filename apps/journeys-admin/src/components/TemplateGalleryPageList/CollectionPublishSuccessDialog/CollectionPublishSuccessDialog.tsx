import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'

import { copyToClipboard } from '../../../libs/copyToClipboard'

export interface CollectionPublishSuccessDialogProps {
  open: boolean
  /** The shareable public URL for the just-published page. */
  publicUrl: string | null
  onClose: () => void
}

export function CollectionPublishSuccessDialog({
  open,
  publicUrl,
  onClose
}: CollectionPublishSuccessDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  async function handleCopy(): Promise<void> {
    if (publicUrl == null) return
    const ok = await copyToClipboard(publicUrl)
    enqueueSnackbar(
      ok ? t('Link copied to clipboard') : t("Couldn't copy link"),
      { variant: ok ? 'success' : 'error', preventDuplicate: true }
    )
  }

  function handleView(): void {
    if (publicUrl == null) return
    window.open(publicUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: t('Your Template Page is Published!'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleView,
        submitLabel: t('View the page'),
        closeLabel: t('Close')
      }}
      testId="CollectionPublishSuccessDialog"
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t(
            'Anyone with this link can browse the templates in your collection.'
          )}
        </Typography>
        <TextField
          value={publicUrl ?? ''}
          fullWidth
          variant="filled"
          hiddenLabel
          inputProps={{
            readOnly: true,
            'aria-label': t('Public URL')
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t('Copy link')}>
                  <span>
                    <IconButton
                      aria-label={t('Copy link')}
                      onClick={handleCopy}
                      disabled={publicUrl == null}
                      edge="end"
                    >
                      <LinkAngledIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
      </Stack>
    </Dialog>
  )
}
