import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { GetCampaigns_campaigns as Campaign } from '../../../__generated__/GetCampaigns'
import { useCampaignsQuery } from '../../libs/useCampaignsQuery'
import { useCanPublishCollection } from '../../libs/useCanPublishCollection'

import { CampaignCard } from './CampaignCard'
import { CampaignCreateDialog } from './CampaignCreateDialog'
import { CampaignDeleteDialog } from './CampaignDeleteDialog'
import { useCampaignMutations } from './useCampaignMutations'

export function CampaignList(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const teamId = activeTeam?.id
  const { data, loading, error } = useCampaignsQuery(
    teamId != null ? { teamId } : undefined
  )
  const { canPublish, reason } = useCanPublishCollection({ teamId })
  const { busyId, publish, unpublish, remove } = useCampaignMutations()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)

  const campaigns = data?.campaigns ?? []
  const publishBlockedReason = reason != null ? t(reason) : null

  async function handleConfirmDelete(): Promise<void> {
    if (deleteTarget == null) return
    const ok = await remove(deleteTarget.id)
    if (ok) setDeleteTarget(null)
  }

  return (
    <Stack spacing={4} data-testid="CampaignList">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {t('Campaigns')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t(
              'Bundle journeys into a public landing page with a language share panel, QR codes and live country views.'
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus2Icon />}
          onClick={() => setCreateOpen(true)}
          disabled={teamId == null}
          data-testid="CampaignListCreate"
        >
          {t('New campaign')}
        </Button>
      </Stack>

      {teamId == null && (
        <Alert severity="info">
          {t('Select a team to see its campaigns.')}
        </Alert>
      )}
      {error != null && (
        <Alert severity="error">
          {t("Couldn't load campaigns. Refresh to try again.")}
        </Alert>
      )}
      {teamId != null && loading && campaigns.length === 0 && (
        <Stack spacing={2}>
          {[0, 1].map((index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Stack>
      )}
      {teamId != null &&
        !loading &&
        error == null &&
        campaigns.length === 0 && (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 3
            }}
            data-testid="CampaignListEmpty"
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('No campaigns yet')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t(
                'Create a campaign to link journeys and build its public page.'
              )}
            </Typography>
          </Box>
        )}
      {campaigns.length > 0 && (
        <Stack spacing={2}>
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              busy={busyId === campaign.id}
              canPublish={canPublish}
              publishBlockedReason={publishBlockedReason}
              onPublish={(target) => {
                void publish(target.id)
              }}
              onUnpublish={(target) => {
                void unpublish(target.id)
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </Stack>
      )}

      {teamId != null && (
        <CampaignCreateDialog
          open={createOpen}
          teamId={teamId}
          onClose={() => setCreateOpen(false)}
        />
      )}
      <CampaignDeleteDialog
        open={deleteTarget != null}
        title={deleteTarget?.title ?? ''}
        wasPublished={deleteTarget?.publishedAt != null}
        loading={deleteTarget != null && busyId === deleteTarget.id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleConfirmDelete()
        }}
      />
    </Stack>
  )
}
