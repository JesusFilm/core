import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { Theme, useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import X2Icon from '@core/shared/ui/icons/X2'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages_languages as Language } from '../../../../../__generated__/GetLanguages'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../../constants'

interface VideoLanguageProps {
  open?: boolean
  onClose: () => void
  onChange: (language: LanguageOption) => void
  language: LanguageOption
  languages?: Language[]
  loading: boolean
}

export function VideoLanguage({
  open,
  onClose: handleClose,
  onChange: handleChange,
  language,
  languages,
  loading
}: VideoLanguageProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const handleApply = (): void => {
    handleClose()
  }
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <MuiDrawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      open={open}
      onClose={handleClose}
      elevation={smUp ? 1 : 0}
      hideBackdrop={smUp}
      sx={{
        zIndex: (theme) => theme.zIndex.modal,
        left: {
          xs: 0,
          sm: 'unset'
        },
        '& .MuiDrawer-paper': smUp
          ? {
              height: (theme) =>
                `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px - ${theme.spacing(
                  8 // drawn from margin for top and bottom (4 + 4)
                )})`,
              width: DRAWER_WIDTH,
              top: EDIT_TOOLBAR_HEIGHT,
              display: 'flex',
              m: 4,
              ml: 0
            }
          : {
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
              display: 'flex'
            }
      }}
      data-testid="VideoLanguage"
    >
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {t('Available Languages')}
          </Typography>
          <IconButton onClick={handleClose} edge="end" aria-label="Close">
            <X2Icon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 6 }}>
        <LanguageAutocomplete
          onChange={handleChange}
          value={language}
          languages={languages}
          loading={loading}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3 }}>
        <Button onClick={handleApply}>{t('Apply')}</Button>
      </Box>
    </MuiDrawer>
  )
}
