import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { FormObject } from '@core/journeys/ui/beaconHooks'
import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import XCircleContained from '@core/shared/ui/icons/XCircleContained'

import { BeaconInit } from './BeaconInit'

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
  const [loaded, setLoaded] = useState(false)
  const [beaconOpen, setBeaconOpen] = useState(false)

  function handleBeaconToggle(): void {
    if (window.Beacon != null) {
      window.Beacon('on', 'open', () => {
        setBeaconOpen(true)
      })
      window.Beacon('on', 'close', () => {
        setBeaconOpen(false)
      })
    }
  }

  useEffect(() => {
    handleBeaconToggle()
  }, [loaded, setBeaconOpen])

  const handleBeaconClick = (): void => {
    if (window.Beacon != null) {
      handleBeaconToggle()
      window.Beacon('toggle')
    } else {
      void router.push('https://support.nextstep.is/')
    }
    handleClick?.()
  }

  return (
    <>
      <BeaconInit userInfo={userInfo} loaded={loaded} setLoaded={setLoaded} />
      {variant === 'iconButton' && (
        <Tooltip
          title={beaconOpen ? t('Close') : t('Help')}
          arrow
          sx={{ m: 0 }}
        >
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
                  : 'background.paper',
              ml: 0
            }}
          >
            {beaconOpen ? <XCircleContained /> : <HelpCircleContained />}
          </IconButton>
        </Tooltip>
      )}
      {variant === 'menuItem' && (
        <MenuItem
          data-testid="HelpScoutBeaconMenuItem"
          onClick={handleBeaconClick}
          sx={{ gap: 2 }}
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
