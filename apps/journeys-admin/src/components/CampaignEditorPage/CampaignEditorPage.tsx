import { CombinedGraphQLErrors } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect } from 'react'

import { useCampaignQuery } from '../../libs/useCampaignQuery'

/** The editor and everything it loads stay out of the route's first load. */
const CampaignEditor = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "CampaignEditor" */ '../CampaignEditor/CampaignEditor'
    ).then((mod) => mod.CampaignEditor),
  { ssr: false }
)

interface CampaignEditorPageProps {
  campaignId?: string
}

/**
 * The campaign editor route's body. The editor renders from the campaign in
 * hand, the last one loaded when a background refetch fails, so a passing
 * failure keeps the editor (and its undo stack) mounted and only raises a
 * snackbar. The error screen shows when there is no campaign at all: a
 * campaign of a team the user is not in (`FORBIDDEN`) says so and offers only
 * the way back; every other error reads "Campaign not found" with a retry.
 */
export function CampaignEditorPage({
  campaignId
}: CampaignEditorPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, previousData, error, refetch } = useCampaignQuery(
    campaignId != null ? { id: campaignId } : undefined
  )
  // previousData can belong to the campaign navigated away from.
  const campaign =
    data?.campaign ??
    (previousData?.campaign.id === campaignId
      ? previousData?.campaign
      : undefined)
  const hasCampaign = campaign != null
  const forbidden =
    CombinedGraphQLErrors.is(error) &&
    error.errors[0]?.extensions?.code === 'FORBIDDEN'

  // Once per failed refetch: each failure carries a new error object.
  useEffect(() => {
    if (error == null || !hasCampaign) return
    enqueueSnackbar(t('There was an error refreshing the campaign.'), {
      variant: 'error'
    })
  }, [error, hasCampaign, enqueueSnackbar, t])

  return (
    <>
      <NextSeo
        title={
          campaign?.title != null
            ? t('Edit {{title}}', { title: campaign.title })
            : t('Edit campaign')
        }
      />
      {error != null && campaign == null ? (
        <Stack
          spacing={2}
          sx={{
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            p: 6
          }}
        >
          <Typography variant="h5">
            {forbidden
              ? t("You don't have access to this campaign")
              : t('Campaign not found')}
          </Typography>
          <Typography color="text.secondary">
            {forbidden
              ? t('Ask a manager of its team to add you.')
              : error.message}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              component={NextLink}
              href="/?type=campaigns"
              variant="outlined"
            >
              {t('Back to campaigns')}
            </Button>
            {!forbidden && (
              <Button
                variant="contained"
                onClick={() => {
                  void refetch()
                }}
              >
                {t('Try again')}
              </Button>
            )}
          </Stack>
        </Stack>
      ) : (
        <CampaignEditor campaign={campaign} />
      )}
    </>
  )
}
