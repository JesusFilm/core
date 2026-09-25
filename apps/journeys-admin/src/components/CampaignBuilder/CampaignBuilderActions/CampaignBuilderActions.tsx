import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import CopyRightIcon from '@core/shared/ui/icons/CopyRight'

import { copyToClipboard } from '../../../libs/copyToClipboard'
import { LabelChip } from '../../LabelChip'

interface CampaignBuilderActionsProps {
  title: string
  isPublished: boolean
  publicUrl: string
  dirty: boolean
  isSubmitting: boolean
  isUnpublishing: boolean
  /** True while a media upload is in flight — blocks Save and Publish. */
  submitBlocked: boolean
  canPublish: boolean
  publishBlockedReason: string | null
  onSave: () => void
  onPublish: () => void
  onUnpublish: () => void
}

/** Sticky header of the builder: status, public link and the save/publish actions. */
export function CampaignBuilderActions({
  title,
  isPublished,
  publicUrl,
  dirty,
  isSubmitting,
  isUnpublishing,
  submitBlocked,
  canPublish,
  publishBlockedReason,
  onSave,
  onPublish,
  onUnpublish
}: CampaignBuilderActionsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const busy = isSubmitting || isUnpublishing
  const publishBlocked = !canPublish

  async function handleCopy(): Promise<void> {
    const ok = await copyToClipboard(publicUrl)
    enqueueSnackbar(
      ok ? t('Link copied to clipboard') : t("Couldn't copy link"),
      { variant: ok ? 'success' : 'error', preventDuplicate: true }
    )
  }

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      data-testid="CampaignBuilderActions"
      sx={{
        alignItems: { md: 'center' },
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="h6" noWrap sx={{ minWidth: 0 }}>
            {title}
          </Typography>
          <LabelChip
            color={isPublished ? 'success' : 'default'}
            label={isPublished ? t('Live') : t('Draft')}
          />
          {dirty && <LabelChip label={t('Unsaved')} />}
        </Stack>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'text.secondary', minWidth: 0 }}
            data-testid="CampaignBuilderPublicUrl"
          >
            {publicUrl}
          </Typography>
          <Tooltip title={t('Copy link')}>
            <IconButton
              size="small"
              aria-label={t('Copy link')}
              onClick={handleCopy}
            >
              <CopyRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexShrink: 0 }}
      >
        <Button
          component="a"
          href={isPublished ? publicUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!isPublished}
          data-testid="CampaignBuilderOpen"
        >
          {t('Open public page')}
        </Button>
        {isPublished ? (
          <Button
            color="error"
            onClick={onUnpublish}
            loading={isUnpublishing}
            disabled={busy}
            data-testid="CampaignBuilderUnpublish"
          >
            {t('Unpublish')}
          </Button>
        ) : (
          <Tooltip
            title={publishBlocked ? (publishBlockedReason ?? '') : ''}
            placement="top"
            disableHoverListener={!publishBlocked}
          >
            <Box component="span">
              <Button
                onClick={onPublish}
                loading={isSubmitting}
                disabled={publishBlocked || busy || submitBlocked}
                data-testid="CampaignBuilderPublish"
              >
                {t('Publish')}
              </Button>
            </Box>
          </Tooltip>
        )}
        <Button
          variant="contained"
          onClick={onSave}
          loading={isSubmitting}
          disabled={busy || submitBlocked || !dirty}
          data-testid="CampaignBuilderSave"
        >
          {t('Save')}
        </Button>
      </Stack>
    </Stack>
  )
}
