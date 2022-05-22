import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'
import MuiDrawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Close from '@mui/icons-material/Close'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { GetLanguages_languages as Language } from '../../../../../__generated__/GetLanguages'
import { LanguageSelect, LanguageSelectOption } from '../../../LanguageSelect'

export const DRAWER_WIDTH = 328

interface VideoLanguageProps {
  open?: boolean
  onClose: () => void
  onChange: (language: LanguageSelectOption) => void
  language: LanguageSelectOption
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

  return (
    <MuiDrawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      open={open}
      onClose={handleClose}
      elevation={smUp ? 1 : undefined}
      hideBackdrop={smUp}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: { sm: 'border-box' },
          width: { sm: DRAWER_WIDTH },
          height: '100%'
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
            Available Languages
          </Typography>
          <IconButton onClick={handleClose} edge="end" aria-label="Close">
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 6 }}>
        <LanguageSelect
          onChange={handleChange}
          value={language}
          languages={languages}
          loading={loading}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3 }}>
        <Button onClick={handleApply}>Apply</Button>
      </Box>
    </MuiDrawer>
  )
}
