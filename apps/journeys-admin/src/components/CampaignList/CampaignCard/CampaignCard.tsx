import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { intlFormat, isValid, parseISO } from 'date-fns'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { MouseEvent, ReactElement, memo, useState } from 'react'

import CopyRightIcon from '@core/shared/ui/icons/CopyRight'
import MoreIcon from '@core/shared/ui/icons/More'

import { GetCampaigns_campaigns as Campaign } from '../../../../__generated__/GetCampaigns'
import { CampaignStatus } from '../../../../__generated__/globalTypes'
import { buildCampaignPublicUrl } from '../../../libs/buildCampaignPublicUrl'
import { copyToClipboard } from '../../../libs/copyToClipboard'
import { LabelChip } from '../../LabelChip'

export interface CampaignCardProps {
  campaign: Campaign
  busy?: boolean
  /** False when the team cannot publish root-domain pages (custom domain). */
  canPublish?: boolean
  publishBlockedReason?: string | null
  onPublish?: (campaign: Campaign) => void
  onUnpublish?: (campaign: Campaign) => void
  onDelete?: (campaign: Campaign) => void
}

function formatUpdated(value: string | null | undefined): string | null {
  const parsed = value != null ? parseISO(value) : null
  return parsed != null && isValid(parsed)
    ? intlFormat(parsed, { day: 'numeric', month: 'short', year: 'numeric' })
    : null
}

function CampaignCardImpl({
  campaign,
  busy = false,
  canPublish = true,
  publishBlockedReason = null,
  onPublish,
  onUnpublish,
  onDelete
}: CampaignCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const isPublished = campaign.status === CampaignStatus.published
  const publicUrl = buildCampaignPublicUrl(campaign.slug)
  const updated = formatUpdated(campaign.updatedAt)
  const publishBlocked = !canPublish

  function handleMenuOpen(event: MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleMenuClose(): void {
    setAnchorEl(null)
  }
  async function handleCopy(): Promise<void> {
    const ok = await copyToClipboard(publicUrl)
    enqueueSnackbar(
      ok ? t('Link copied to clipboard') : t("Couldn't copy link"),
      { variant: ok ? 'success' : 'error', preventDuplicate: true }
    )
  }
  function handleOpen(): void {
    handleMenuClose()
    window.open(publicUrl, '_blank', 'noopener,noreferrer')
  }
  function handlePublishToggle(): void {
    handleMenuClose()
    if (isPublished) onUnpublish?.(campaign)
    else onPublish?.(campaign)
  }
  function handleDelete(): void {
    handleMenuClose()
    onDelete?.(campaign)
  }

  return (
    <Card
      data-testid={`CampaignCard-${campaign.id}`}
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderColor: 'divider',
        boxShadow: 'none'
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" noWrap sx={{ minWidth: 0 }}>
              {campaign.title}
            </Typography>
            <LabelChip
              color={isPublished ? 'success' : 'default'}
              label={isPublished ? t('Live') : t('Draft')}
            />
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{ color: 'text.secondary', minWidth: 0 }}
              data-testid="CampaignCardPublicUrl"
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
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('{{share}} share journeys · {{templates}} templates', {
              share: campaign.shareJourneys.length,
              templates: campaign.templateJourneys.length
            })}
            {updated != null &&
              ` · ${t('Updated {{date}}', { date: updated })}`}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            component={NextLink}
            href={`/campaigns/${campaign.id}`}
            variant="contained"
            color="secondary"
            disabled={busy}
            data-testid="CampaignCardEdit"
          >
            {t('Edit')}
          </Button>
          <IconButton
            aria-label={t('Campaign actions')}
            aria-haspopup="true"
            aria-expanded={anchorEl != null ? 'true' : undefined}
            onClick={handleMenuOpen}
            disabled={busy}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={anchorEl != null}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleOpen} disabled={!isPublished}>
              {t('Open public page')}
            </MenuItem>
            <Tooltip
              title={
                publishBlocked && !isPublished
                  ? (publishBlockedReason ?? '')
                  : ''
              }
              placement="left"
            >
              <span>
                <MenuItem
                  onClick={handlePublishToggle}
                  disabled={!isPublished && publishBlocked}
                >
                  {isPublished ? t('Unpublish') : t('Publish')}
                </MenuItem>
              </span>
            </Tooltip>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              {t('Delete')}
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Card>
  )
}

export const CampaignCard = memo(CampaignCardImpl)
