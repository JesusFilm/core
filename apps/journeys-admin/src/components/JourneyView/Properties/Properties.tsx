import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { CopyTextField } from '@core/shared/ui'
import { useJourney } from '@core/journeys/ui'
import { useTranslation } from 'react-i18next'
import EditIcon from '@mui/icons-material/Edit'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyDetails } from './JourneyDetails'
import { SlugDialog } from './SlugDialog'

export function Properties(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [showSlugDialog, setShowSlugDialog] = useState(false)

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
              journeySlug={journey?.slug}
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
                  ? `https://your.nextstep.is/${journey.slug}`
                  : undefined
              }
            />
            <Box sx={{ pt: 2 }}>
              <Button
                onClick={() => setShowSlugDialog(true)}
                size="small"
                startIcon={<EditIcon />}
                disabled={journey == null}
              >
                {t('Edit')}
              </Button>
            </Box>
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
            journeySlug={journey?.slug}
            userJourneys={journey?.userJourneys ?? undefined}
            size="medium"
          />
        </Divider>
        <Box sx={{ px: 6 }}>
          <JourneyDetails />
        </Box>
        <Divider />
        <Box sx={{ px: 6 }}>
          <CopyTextField
            value={
              journey?.slug != null
                ? `https://your.nextstep.is/${journey.slug}`
                : undefined
            }
            label={t('Journey URL')}
          />
          <Box sx={{ pt: 2 }}>
            <Button
              onClick={() => setShowSlugDialog(true)}
              size="small"
              startIcon={<EditIcon />}
              disabled={journey == null}
            >
              {t('Edit')}
            </Button>
          </Box>
        </Box>
      </Stack>
      <SlugDialog
        open={showSlugDialog}
        onClose={() => setShowSlugDialog(false)}
      />
    </>
  )
}
