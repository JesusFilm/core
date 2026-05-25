import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import CopyRightIcon from '@core/shared/ui/icons/CopyRight'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'

import { copyToClipboard } from '../../../libs/copyToClipboard'

export interface CollectionPublishSuccessDialogProps {
  open: boolean
  /** The shareable public URL for the just-published page. */
  publicUrl: string | null
  /**
   * Slug of the just-published collection. "View the page" routes through
   * the authenticated `/api/preview-template-gallery?slug=<slug>` proxy,
   * which validates auth and 307-redirects to the public URL. Null when
   * not yet known (e.g. closed dialog) — in that case "View the page"
   * stays disabled.
   */
  slug: string | null
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
  const viewDisabled =
    publicUrl == null || slug == null || slug === '' || !canPublish

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
    // `viewDisabled` already gates at runtime, but TypeScript can't
    // narrow `slug` through a boolean — the explicit `slug == null`
    // here is the type-narrowing pair, not a redundant safety check.
    if (viewDisabled || slug == null) return
    window.open(
      `/api/preview-template-gallery?slug=${encodeURIComponent(slug)}`,
      '_blank',
      'noopener,noreferrer'
    )
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      // Switching from `dialogAction` to `dialogActionChildren` flips
      // the shared Dialog's default to `dividers={true}`. Force off so
      // the success message + URL + action sit as one clean block.
      divider={false}
      dialogTitle={{
        title: t('Your Template Page is Published!'),
        closeButton: true
      }}
      dialogActionChildren={
        <Button
          variant="contained"
          color="primary"
          startIcon={<LinkExternalIcon />}
          onClick={handleView}
          disabled={viewDisabled}
        >
          {t('View the page')}
        </Button>
      }
      testId="CollectionPublishSuccessDialog"
      // The shared Dialog defaults DialogActions to `padding: 8`, which
      // tucks the action button into the corner — visually it doesn't
      // line up with the content above (which has the standard 24px
      // horizontal padding). Match the horizontal pad here so the
      // button's left/right edges sit on the same vertical lines as
      // the URL field and helper copy.
      sx={{
        // Align the action area with the 24px padding around title and
        // content. Top stays at 0 so the button hugs the URL field
        // above (its own 10px vertical padding gives the breathing
        // room). Spacing token in this theme is 1 = 4px, so 6 = 24px.
        '& .MuiDialogActions-root': {
          pt: 0,
          px: 6,
          pb: 6
        }
      }}
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
                      <CopyRightIcon />
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
