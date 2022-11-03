import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'
import { useVisitorInfo } from '../VisitorInfoProvider'
import { VisitorJourneyTimeline } from '../VisitorJourneyTimeline'

export const DRAWER_WIDTH = 328

export function VisitorJourneyDrawer(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: { journey, open },
    dispatch
  } = useVisitorInfo()

  function handleClose(): void {
    dispatch({ type: 'SetOpenAction', open: false })
  }

  return (
    <Drawer
      anchor={smUp ? 'right' : 'bottom'}
      variant={smUp ? 'permanent' : 'temporary'}
      open={smUp || open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: smUp ? DRAWER_WIDTH : '100%',
          height: '100%',
          display: 'flex'
        }
      }}
    >
      {journey != null && (
        <>
          <AppBar position="static" color="default">
            <Toolbar sx={{ boxSizing: 'content-box' }}>
              <Typography
                variant="subtitle1"
                noWrap
                component="div"
                sx={{ flexGrow: 1 }}
                data-testid="drawer-title"
              >
                {journey.title}
              </Typography>
              <IconButton
                onClick={handleClose}
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                edge="end"
              >
                <Close />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Box sx={{ p: 6, flexGrow: 1, overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('Timeline')}&nbsp;
              {journey.createdAt != null &&
                format(parseISO(journey.createdAt), 'MMM d')}
            </Typography>
            <VisitorJourneyTimeline events={journey.events} />
          </Box>
        </>
      )}
    </Drawer>
  )
}
