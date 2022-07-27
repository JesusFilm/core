import { ReactElement } from 'react'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

export function Properties(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

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
    </Drawer>
  )
}
