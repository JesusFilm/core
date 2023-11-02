import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import X2Icon from '@core/shared/ui/icons/X2'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { AboutTabPanel } from './AboutTabPanel'
import { CategoriesTabPanel } from './CategoriesTabPanel'
import { MetadataTabPanel } from './MetadataTabPanel/MetadataTabPanel'

export const DRAWER_WIDTH = 328

interface TemplateSettingsDrawerProps {
  open?: boolean
  onClose?: () => void
}

export function TemplateSettingsDrawer({
  open,
  onClose
}: TemplateSettingsDrawerProps): ReactElement {
  const [tab, setTab] = useState(0)
  function handleTabChange(_event, newValue): void {
    setTab(newValue)
  }
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation()

  return (
    <MuiDrawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      open={open}
      elevation={smUp ? 1 : 0}
      hideBackdrop
      sx={{
        left: {
          xs: 0,
          sm: 'unset'
        },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: smUp ? DRAWER_WIDTH : '100%',
          height: '100%',
          display: 'flex'
        }
      }}
    >
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {t('Template Settings')}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <X2Icon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider'
        }}
        data-testid="TemplateSettingsDrawer"
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="template-settings-drawer-tabs"
        >
          <Tab
            label={t('Metadata')}
            sx={{ flexGrow: 1 }}
            {...tabA11yProps('metadata', 0)}
          />
          <Tab
            label={t('Categories')}
            sx={{ flexGrow: 1 }}
            {...tabA11yProps('categories', 1)}
          />
          <Tab
            label={t('About')}
            sx={{ flexGrow: 1 }}
            {...tabA11yProps('about', 2)}
          />
        </Tabs>
      </Box>
      <Box sx={{ p: 6, flex: 1, overflow: 'auto' }}>
        <TabPanel name="metadata" value={tab} index={0}>
          <Stack spacing={5}>
            <MetadataTabPanel />
          </Stack>
        </TabPanel>
        <TabPanel name="categories" value={tab} index={1}>
          <Stack spacing={5}>
            <CategoriesTabPanel />
          </Stack>
        </TabPanel>
        <TabPanel name="about" value={tab} index={2}>
          <Stack spacing={5}>
            <AboutTabPanel />
          </Stack>
        </TabPanel>
      </Box>
    </MuiDrawer>
  )
}
