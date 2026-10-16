import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { CampaignStatus } from '../../../__generated__/globalTypes'
import { useCampaignsQuery } from '../../libs/useCampaignsQuery'
import { LabelChip } from '../LabelChip'

import { CreateCampaignDialog } from './CreateCampaignDialog'

/**
 * The active team's campaigns, newest first, behind the `campaignBuilder`
 * flag: with the flag off the page sends the visitor home. Each row opens
 * the editor; Create campaign opens the dialog.
 */
export function CampaignList(): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { campaignBuilder } = useFlags()
  const { activeTeam } = useTeam()
  const enabled = campaignBuilder === true
  const [createOpen, setCreateOpen] = useState(false)
  const { data, loading } = useCampaignsQuery(
    enabled && activeTeam?.id != null ? { teamId: activeTeam.id } : undefined
  )

  useEffect(() => {
    if (!enabled) void router.replace('/')
  }, [enabled, router])

  if (!enabled) return null

  const campaigns = data?.campaigns ?? []

  return (
    <Stack spacing={4} data-testid="CampaignList">
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h4">{t('Campaigns')}</Typography>
        <Button
          variant="contained"
          startIcon={<Plus2Icon />}
          onClick={() => setCreateOpen(true)}
          disabled={activeTeam == null}
        >
          {t('Create campaign')}
        </Button>
      </Stack>
      {loading && <CircularProgress data-testid="CampaignListLoading" />}
      {!loading && activeTeam != null && campaigns.length === 0 && (
        <Typography color="text.secondary">
          {t(
            'No campaigns yet. Create one to build a seasonal landing page with a page for every region.'
          )}
        </Typography>
      )}
      <Stack spacing={2}>
        {campaigns.map((campaign) => {
          const published = campaign.status === CampaignStatus.published
          return (
            <Card key={campaign.id} variant="outlined">
              <CardActionArea
                component={NextLink}
                href={`/campaigns/${campaign.id}`}
                data-testid={`CampaignListItem-${campaign.id}`}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="h6" noWrap>
                      {campaign.title}
                    </Typography>
                    <LabelChip
                      color={published ? 'success' : 'default'}
                      label={published ? t('Published') : t('Draft')}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {`/campaign/${campaign.slug}`}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Stack>
      {activeTeam != null && (
        <CreateCampaignDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          teamId={activeTeam.id}
        />
      )}
    </Stack>
  )
}
