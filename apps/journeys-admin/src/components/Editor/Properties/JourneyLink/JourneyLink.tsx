import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { setBeaconPageViewed } from '../../../../libs/setBeaconPageViewed'

import { EmbedJourneyDialog } from './EmbedJourneyDialog'
import { SlugDialog } from './SlugDialog'

export function JourneyLink(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const router = useRouter()
 
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
                process.env.NEXT_PUBLIC_JOURNEYS_URL ??
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
            setShowSlugDialog(true);
            router.query.param = 'edit-url';
            void router.push(router);
            router.events.on('routeChangeComplete', () => {
              setBeaconPageViewed('edit-url');
            });
          }}
          size="small"
          startIcon={<Edit2Icon />}
          disabled={journey == null}
        >
          {t('Edit URL')}
        </Button>
        <Button
          onClick={() => {
            setShowEmbedDialog(true);
            router.query.param = 'embed-journey';
            void router.push(router);
            router.events.on('routeChangeComplete', () => {
              setBeaconPageViewed('embed-journey');
            });
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
      />
      <EmbedJourneyDialog
        open={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
      />
    </>
  )
}
