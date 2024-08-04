import type { FormObject } from '@core/journeys/ui/setBeaconPageViewed'
import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import XCircleContained from '@core/shared/ui/icons/XCircleContained'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import {type  ReactElement, useState } from 'react'
import { BeaconInit } from './BeaconInit'
import Tooltip from '@mui/material/Tooltip'

interface HelpScoutBeaconProps {
  variant?: 'iconButton' | 'menuItem'
  iconButtonColor?: 'primary' | 'secondary'
  handleClick?: () => void
  userInfo?: FormObject
}

export function HelpScoutBeacon({
  variant = 'iconButton',
  iconButtonColor = 'primary',
  handleClick,
  userInfo
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
      <BeaconInit userInfo={userInfo} />
      {variant === 'iconButton' && (
        <Tooltip title={t('Help')} arrow sx={{m: 0}}>
          <IconButton
            data-testid="HelpScoutBeaconIconButton"
            size="medium"
            edge="start"
            color="inherit"
            aria-label="Help"
            onClick={handleBeaconClick}
            sx={{
              color:
                iconButtonColor === 'primary'
                ? 'secondary.light'
                : 'background.paper'
            }}
            >
            {beaconOpen ? <XCircleContained/> : <HelpCircleContained/>}
          </IconButton>
        </Tooltip>
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
