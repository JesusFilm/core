import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

export function Properties(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  return (
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
          {t('Details')}
        </Typography>
      </Toolbar>
      <Stack sx={{ py: 6 }} spacing={6} divider={<Divider />}>
        <Box sx={{ px: 6 }}>
          <Typography variant="body2">
            {journey != null
              ? journey.language.name.find((primary) => primary)?.value
              : ''}
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  )
}
