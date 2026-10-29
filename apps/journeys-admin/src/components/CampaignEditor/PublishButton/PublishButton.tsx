import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { MouseEvent, ReactElement, useState } from 'react'

import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import Upload1Icon from '@core/shared/ui/icons/Upload1'

import {
  CampaignPageKind,
  CampaignStatus
} from '../../../../__generated__/globalTypes'
import { campaignOpenPageHref } from '../../../libs/campaignAddress'
import { useCampaignPublishMutation } from '../../../libs/useCampaignPublishMutation'
import { useCampaignUnpublishMutation } from '../../../libs/useCampaignUnpublishMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'

import { campaignStatusCopy } from './statusCopy'
import { UnpublishDialog } from './UnpublishDialog'

/**
 * The rail's Publish button: an icon with a status dot (grey draft, green
 * published) whose popover holds the status copy, Publish (no confirmation)
 * or Unpublish (confirming, and stating that the linked journeys and their
 * QR codes keep working) and Refresh and open page, which goes through
 * `/api/campaign/open` so the campaign's public pages are rebuilt before the
 * page it stands on opens, like journey Preview. A draft has no public page,
 * so until it is published that button is disabled, with a caption saying so. Publish and unpublish are
 * explicit actions, never Commands; nothing here replaces Save.
 */
export function PublishButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const {
    campaign,
    currentRegion,
    state: { pageKind }
  } = useCampaignEditor()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [unpublishOpen, setUnpublishOpen] = useState(false)
  const [campaignPublish, { loading: publishing }] =
    useCampaignPublishMutation()
  const [campaignUnpublish, { loading: unpublishing }] =
    useCampaignUnpublishMutation()
  const published = campaign.status === CampaignStatus.published
  const regionSlug =
    pageKind === CampaignPageKind.regionTemplate && currentRegion != null
      ? currentRegion.slug
      : undefined
  // `regionSlug` keeps the current region's page.
  const openPageHref = campaignOpenPageHref(campaign.id, regionSlug)

  function showError(error: unknown, fallback: string): void {
    enqueueSnackbar(error instanceof Error ? error.message : fallback, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  function handleOpen(event: MouseEvent<HTMLElement>): void {
    setAnchor(event.currentTarget)
  }

  async function handlePublish(): Promise<void> {
    try {
      await campaignPublish({ variables: { id: campaign.id } })
    } catch (error) {
      showError(error, t('Could not publish campaign'))
    }
  }

  function handleUnpublishClick(): void {
    setAnchor(null)
    setUnpublishOpen(true)
  }

  async function handleUnpublish(): Promise<void> {
    setUnpublishOpen(false)
    try {
      await campaignUnpublish({ variables: { id: campaign.id } })
    } catch (error) {
      showError(error, t('Could not unpublish campaign'))
    }
  }

  return (
    <>
      <Tooltip title={t('Publish')} placement="right" arrow>
        <IconButton
          onClick={handleOpen}
          aria-label={t('Publish status')}
          aria-haspopup="dialog"
          aria-expanded={anchor != null}
          sx={{ position: 'relative' }}
        >
          <Upload1Icon />
          <Box
            data-testid="PublishStatusDot"
            data-status={published ? 'published' : 'draft'}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: 2,
              borderColor: 'background.paper',
              bgcolor: published ? 'success.main' : 'grey.500'
            }}
          />
        </IconButton>
      </Tooltip>
      <Popover
        open={anchor != null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 280 } } }}
        data-testid="PublishPopover"
      >
        <Stack spacing={3} sx={{ p: 4 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="PublishStatusCopy"
          >
            {campaignStatusCopy(t, published)}
          </Typography>
          {published ? (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleUnpublishClick}
              disabled={unpublishing}
            >
              {t('Unpublish')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handlePublish}
              disabled={publishing}
            >
              {t('Publish')}
            </Button>
          )}
          <Stack spacing={1}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LinkExternalIcon />}
              {...(published
                ? { href: openPageHref, target: '_blank', rel: 'noopener' }
                : {})}
              disabled={!published}
              aria-describedby={
                published ? undefined : 'PublishOpenPageDraftCaption'
              }
            >
              {t('Refresh and open page')}
            </Button>
            {!published && (
              <Typography
                id="PublishOpenPageDraftCaption"
                variant="caption"
                color="text.secondary"
              >
                {t('The page goes live when you publish.')}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Popover>
      <UnpublishDialog
        open={unpublishOpen}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={handleUnpublish}
      />
    </>
  )
}
