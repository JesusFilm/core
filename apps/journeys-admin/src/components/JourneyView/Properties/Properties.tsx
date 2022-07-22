import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import EditIcon from '@mui/icons-material/Edit'
import ShareRoundedIcon from '@mui/icons-material/ShareRounded'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyDetails } from './JourneyDetails'
import { SlugDialog } from './SlugDialog'
import { EmbedDialog } from './EmbedDialog'

export function Properties(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '328px'
          }
        }}
      >
        <Toolbar>
          <Typography variant="subtitle1" component="div" sx={{ ml: 2 }}>
            {t('Properties')}
          </Typography>
        </Toolbar>
        <Stack sx={{ py: 6 }} spacing={6} divider={<Divider />}>
          <Box sx={{ px: 6 }}>
            <JourneyDetails />
          </Box>
          <Box sx={{ px: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('Access Control')}
            </Typography>
            <AccessAvatars
              journeyId={journey?.id}
              userJourneys={journey?.userJourneys ?? undefined}
              size="medium"
              xsMax={5}
            />
          </Box>
          <Box sx={{ px: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('Journey URL')}
            </Typography>
            <CopyTextField
              value={
                journey?.slug != null
                  ? `${
                      process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                      'https://your.nextstep.is'
                    }/${journey.slug}`
                  : undefined
              }
            />
            <Stack direction="row" spacing={6} sx={{ pt: 2 }}>
              <Button
                onClick={() => setShowSlugDialog(true)}
                size="small"
                startIcon={<EditIcon />}
                disabled={journey == null}
              >
                {t('Edit URL')}
              </Button>
              <Button
                onClick={() => setShowEmbedDialog(true)}
                size="small"
                startIcon={<ShareRoundedIcon />}
              >
                {t('Embed Code')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Drawer>
      <Stack
        sx={{
          display: {
            xs: 'block',
            sm: 'none'
          },
          backgroundColor: 'background.paper',
          pb: 6
        }}
        spacing={6}
      >
        <Divider>
          <AccessAvatars
            journeyId={journey?.id}
            userJourneys={journey?.userJourneys ?? undefined}
            size="medium"
          />
        </Divider>
        <Box sx={{ px: 6 }}>
          <JourneyDetails />
        </Box>
      </Stack>
      <SlugDialog
        open={showSlugDialog}
        onClose={() => setShowSlugDialog(false)}
      />
      <EmbedDialog
        open={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
      />
    </>
  )
}
