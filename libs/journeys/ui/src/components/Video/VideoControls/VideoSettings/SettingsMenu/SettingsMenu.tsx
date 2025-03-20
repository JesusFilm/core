import ArrowForwardIosRounded from '@mui/icons-material/ArrowForwardIosRounded'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface SettingsMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  currentQuality: string
  onQualityClick: () => void
  onToggleStats: (event: React.MouseEvent) => void
}

export function SettingsMenu({
  anchorEl,
  open,
  onClose,
  currentQuality,
  onQualityClick,
  onToggleStats
}: SettingsMenuProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Menu
      id="settings-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
    >
      <MenuItem onClick={onToggleStats} sx={{ minWidth: 220 }}>
        <Typography>{t('Stats for nerds')}</Typography>
      </MenuItem>
      <MenuItem onClick={onQualityClick} sx={{ minWidth: 220 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography>{t('Quality')}</Typography>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography color="secondary.main">{currentQuality}</Typography>
            <ArrowForwardIosRounded fontSize="small" />
          </Stack>
        </Stack>
      </MenuItem>
    </Menu>
  )
}
