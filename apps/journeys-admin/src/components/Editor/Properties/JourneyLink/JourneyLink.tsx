import { useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { GetCustomDomain } from '../../../../../__generated__/GetCustomDomain'
import { setBeaconPageViewed } from '../../../../libs/setBeaconPageViewed'
import { GET_CUSTOM_DOMAIN } from '../../../Team/CustomDomainDialog/CustomDomainDialog'

import { EmbedJourneyDialog } from './EmbedJourneyDialog'
import { SlugDialog } from './SlugDialog'

export function JourneyLink(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const { data: customDomainData } = useQuery<GetCustomDomain>(
    GET_CUSTOM_DOMAIN,
    {
      variables: { teamId: journey?.team?.id }
    }
  )

  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const router = useRouter()

  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router, undefined, { shallow: true })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const hasCustomDomain =
    customDomainData?.customDomains[0]?.name != null &&
    customDomainData.customDomains[0]?.verification?.verified === true

  return (
    <>
      {smUp && (
        <Typography variant="subtitle2" gutterBottom>
          {t('Journey URL')}
        </Typography>
      )}
      <CopyTextField
        value={
          journey?.slug != null
            ? `${
                hasCustomDomain
                  ? 'https://' + customDomainData.customDomains[0].name
                  : process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                    'https://your.nextstep.is'
              }/${journey.slug}`
            : undefined
        }
        label={!smUp ? t('Journey URL') : undefined}
        sx={
          !smUp
            ? {
                '.MuiFilledInput-root': {
                  backgroundColor: 'background.paper'
                }
              }
            : undefined
        }
      />
      <Stack direction="row" spacing={6} sx={{ pt: 2 }}>
        <Button
          onClick={() => {
            setShowSlugDialog(true)
            setRoute('edit-url')
          }}
          size="small"
          startIcon={<Edit2Icon />}
          disabled={journey == null}
        >
          {t('Edit URL')}
        </Button>
        <Button
          onClick={() => {
            setShowEmbedDialog(true)
            setRoute('embed-journey')
          }}
          size="small"
          startIcon={<Code1Icon />}
          disabled={journey == null}
        >
          {t('Embed Journey')}
        </Button>
      </Stack>
      <SlugDialog
        open={showSlugDialog}
        onClose={() => setShowSlugDialog(false)}
        customDomainName={customDomainData?.customDomains[0]?.name}
      />
      <EmbedJourneyDialog
        open={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        customDomainName={customDomainData?.customDomains[0]?.name}
      />
    </>
  )
}
