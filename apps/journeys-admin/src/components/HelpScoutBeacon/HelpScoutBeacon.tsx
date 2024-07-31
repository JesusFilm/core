import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import XCircleContained from '@core/shared/ui/icons/XCircleContained'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { BeaconInit } from './BeaconInit'

interface HelpScoutBeaconProps {
  variant?: 'iconButton' | 'menuItem'
  iconButtonColor?: 'primary' | 'secondary'
  handleClick?: () => void
  userName?: string
  userEmail?: string
}

export function HelpScoutBeacon({
  variant = 'iconButton',
  iconButtonColor = 'primary',
  handleClick,
  userName,
  userEmail
}: HelpScoutBeaconProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const [beaconOpen, setBeaconOpen] = useState(false)

  const handleBeaconClick = (): void => {
    if (window.Beacon != null) {
      window.Beacon('on', 'open', () => {
        setBeaconOpen(true)
      })
      window.Beacon('on', 'close', () => {
        setBeaconOpen(false)
      })
      window.Beacon('toggle')
    } else {
      void router.push('https://support.nextstep.is/')
    }

    handleClick?.()
  }

  return (
    <>
      <BeaconInit userName={userName} userEmail={userEmail} />
      {variant === 'iconButton' && (
        <IconButton
          data-testid="HelpScoutBeaconIconButton"
          size="large"
          edge="start"
          color="inherit"
          aria-label="Help"
          onClick={handleBeaconClick}
          sx={{
            m: 0,
            width: 24,
            height: 24,
            color:
              iconButtonColor === 'primary'
                ? 'secondary.light'
                : 'background.paper'
          }}
        >
          {beaconOpen ? <XCircleContained /> : <HelpCircleContained />}
        </IconButton>
      )}
      {variant === 'menuItem' && (
        <MenuItem
          data-testid="HelpScoutBeaconMenuItem"
          onClick={handleBeaconClick}
        >
          <ListItemIcon>
            <HelpCircleContained />
          </ListItemIcon>
          <ListItemText>{t('Help')}</ListItemText>
        </MenuItem>
      )}
    </>
  )
}
