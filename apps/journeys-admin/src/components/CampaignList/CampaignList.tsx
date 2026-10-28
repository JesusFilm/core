import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { CampaignStatus } from '../../../__generated__/globalTypes'
import { campaignPublicAddress } from '../../libs/campaignAddress'
import { useCampaignsQuery } from '../../libs/useCampaignsQuery'
import { LabelChip } from '../LabelChip'

import { CreateCampaignDialog } from './CreateCampaignDialog'

/**
 * The active team's campaigns, newest first — the body of the dashboard's
 * Team Campaigns tab, so the team select lives in the page header. With no
 * team picked the list asks for one and Create stays disabled. Each row
 * opens the editor and shows the campaign's public address as Settings
 * does: its Campaign Domain when it has one (the root-domain address then
 * 404s), else `/campaign/<slug>` on the root domain. Create campaign opens
 * the dialog.
 */
export function CampaignList(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { query: teamQuery, activeTeam } = useTeam()
  const [createOpen, setCreateOpen] = useState(false)
  const { data, loading, error, refetch } = useCampaignsQuery(
    activeTeam?.id != null ? { teamId: activeTeam.id } : undefined
  )

  const teamLoading = activeTeam == null && teamQuery.loading
  const noTeam = activeTeam == null && !teamQuery.loading
  const campaigns = data?.campaigns ?? []

  return (
    <Stack
      spacing={4}
      data-testid="CampaignList"
      sx={{ mt: { xs: 3, sm: 4 }, px: { xs: 5, sm: 0 } }}
    >
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Plus2Icon />}
          onClick={() => setCreateOpen(true)}
          disabled={activeTeam == null}
        >
          {t('Create campaign')}
        </Button>
      </Stack>
      {(teamLoading || loading) && (
        <CircularProgress data-testid="CampaignListLoading" />
      )}
      {noTeam && (
        <Typography color="text.secondary">
          {t('Pick a team to see its campaigns')}
        </Typography>
      )}
      {!loading && error != null && data == null && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void refetch()
              }}
            >
              {t('Try again')}
            </Button>
          }
        >
          {t('There was an error loading campaigns.')}
        </Alert>
      )}
      {!loading && data != null && campaigns.length === 0 && (
        <Typography color="text.secondary">
          {t(
            'No campaigns yet. Create one to build a landing page with a page for every region.'
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
                    {campaignPublicAddress(campaign)}
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
