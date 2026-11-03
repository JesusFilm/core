import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect } from 'react'

import { useCampaignQuery } from '../../libs/useCampaignQuery'
import { CampaignEditor } from '../CampaignEditor'

interface CampaignEditorPageProps {
  campaignId?: string
}

/**
 * The campaign editor route's body. The editor renders from the campaign in
 * hand, the last one loaded when a background refetch fails, so a passing
 * failure keeps the editor (and its undo stack) mounted and only raises a
 * snackbar. The error screen shows when there is no campaign at all.
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
          <Typography variant="h5">{t('Campaign not found')}</Typography>
          <Typography color="text.secondary">{error.message}</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              component={NextLink}
              href="/?type=campaigns"
              variant="outlined"
            >
              {t('Back to campaigns')}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                void refetch()
              }}
            >
              {t('Try again')}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <CampaignEditor campaign={campaign} />
      )}
    </>
  )
}
