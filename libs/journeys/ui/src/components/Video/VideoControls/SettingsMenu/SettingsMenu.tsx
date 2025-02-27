import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { QualityMenuItems } from '../QualitySelector/QualityMenuItems'
import { QualityOption } from '../QualitySelector/types'

interface SettingsMenuProps {
  player: Player
  isMobile: boolean
  qualities: QualityOption[]
  currentQuality: string
  autoMode: boolean
  onQualityChange: (height: number | 'auto') => void
}

export function SettingsMenu({
  player,
  isMobile,
  qualities,
  currentQuality,
  autoMode,
  onQualityChange
}: SettingsMenuProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showQualitySubmenu, setShowQualitySubmenu] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    if (isMobile) {
      setMobileOpen(true)
    } else {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = (): void => {
    setAnchorEl(null)
    setMobileOpen(false)
    setShowQualitySubmenu(false)
  }

  const handleQualityClick = (): void => {
    setShowQualitySubmenu(true)
  }

  const handleQualitySelect = (height: number | 'auto'): void => {
    onQualityChange(height)
    handleClose()
  }

  const handleBack = (): void => {
    setShowQualitySubmenu(false)
  }

  const displayQuality = autoMode
    ? t('Auto ({{quality}})', { quality: currentQuality })
    : currentQuality

  return (
    <>
      <IconButton
        aria-label={t('settings')}
        onClick={handleClick}
        sx={{ py: 0, px: 2 }}
        data-testid="settings-menu-button"
      >
        <SettingsIcon />
      </IconButton>

      {!isMobile ? (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
        >
          {!showQualitySubmenu ? (
            <MenuItem onClick={handleQualityClick} sx={{ minWidth: 200 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                spacing={2}
              >
                <Typography>{t('Quality')}</Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography color="text.secondary" noWrap>
                    {displayQuality}
                  </Typography>
                  <ChevronRightIcon fontSize="small" sx={{ ml: 0.5 }} />
                </Stack>
              </Stack>
            </MenuItem>
          ) : (
            <MenuList>
              <MenuItem onClick={handleBack}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ChevronLeftIcon fontSize="small" />
                  <Typography>{t('Quality')}</Typography>
                </Stack>
              </MenuItem>
              <QualityMenuItems
                qualities={qualities}
                currentQuality={currentQuality}
                autoMode={autoMode}
                onQualityChange={handleQualitySelect}
              />
            </MenuList>
          )}
        </Menu>
      ) : (
        <Modal
          open={mobileOpen}
          onClose={handleClose}
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <Stack
            spacing={1}
            sx={{
              width: '100%',
              bgcolor: 'background.paper',
              p: 2,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8
            }}
          >
            {!showQualitySubmenu ? (
              <>
                <Typography variant="h6">{t('Settings')}</Typography>
                <MenuItem onClick={handleQualityClick}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                    spacing={2}
                  >
                    <Typography>{t('Quality')}</Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography color="text.secondary" noWrap>
                        {displayQuality}
                      </Typography>
                      <ChevronRightIcon fontSize="small" sx={{ ml: 0.5 }} />
                    </Stack>
                  </Stack>
                </MenuItem>
              </>
            ) : (
              <MenuList>
                <MenuItem onClick={handleBack}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      onClick={handleBack}
                      edge="start"
                      sx={{ ml: -1 }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6">{t('Quality')}</Typography>
                  </Stack>
                </MenuItem>
                <QualityMenuItems
                  qualities={qualities}
                  currentQuality={currentQuality}
                  autoMode={autoMode}
                  onQualityChange={handleQualitySelect}
                />
              </MenuList>
            )}
          </Stack>
        </Modal>
      )}
    </>
  )
}
