import Box from '@mui/material/Box'
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
  /**
   * The slug of the just-published collection. When set, "View the page"
   * routes through `/api/preview-template-gallery?slug=<slug>` so the
   * journeys app revalidates its ISR cache before redirecting — the user
   * sees the freshly-published content instead of stale cache.
   * Null when not yet known (e.g. closed dialog).
   */
  slug?: string | null
  /**
   * Belt-and-suspenders gate: the success dialog should never open when
   * the team can't publish, but if it does, "View the page" stays
   * disabled with the provided reason.
   */
  canPublish?: boolean
  publishBlockedReason?: string | null
  onClose: () => void
}

export function CollectionPublishSuccessDialog({
  open,
  publicUrl,
  slug,
  canPublish = true,
  publishBlockedReason = null,
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
    if (publicUrl == null || !canPublish) return
    // Prefer the admin proxy when we know the slug — it revalidates the
    // journeys ISR cache before redirecting, so the user lands on a fresh
    // page instead of a stale one. Fall back to the raw public URL for
    // safety (e.g. mid-migration callers that don't pass slug yet).
    const target =
      slug != null && slug !== ''
        ? `/api/preview-template-gallery?slug=${encodeURIComponent(slug)}`
        : publicUrl
    window.open(target, '_blank', 'noopener,noreferrer')
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
                  {/* Box wrapper so the Tooltip can attach to a disabled
                      child (MUI requires a non-disabled element to forward
                      events; <Box component="span"> matches the inline
                      flow MUI's InputAdornment expects). */}
                  <Box component="span">
                    <IconButton
                      aria-label={t('Copy link')}
                      onClick={handleCopy}
                      disabled={publicUrl == null}
                      edge="end"
                    >
                      <LinkAngledIcon />
                    </IconButton>
                  </Box>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
        {!canPublish && publishBlockedReason != null && (
          <Typography variant="caption" color="text.secondary">
            {publishBlockedReason}
          </Typography>
        )}
      </Stack>
    </Dialog>
  )
}
