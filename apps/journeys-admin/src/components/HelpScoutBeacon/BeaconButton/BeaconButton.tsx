import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import XCircleContained from '@core/shared/ui/icons/XCircleContained'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface BeaconButtonProps {
  variant: 'iconButton' | 'menuItem'
  onClick: () => void
  beaconOpen: boolean
}

export function BeaconButton({
  variant,
  onClick,
  beaconOpen
}: BeaconButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  switch (variant) {
    case 'iconButton':
      return (
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="Help"
          onClick={onClick}
          sx={{
            m: 0,
            width: 24,
            height: 24,
            color: 'secondary.dark'
            // color:
            //   mdUp || newUserPaths.includes(router.route)
            //     ? 'secondary.dark'
            //     : 'background.paper'
          }}
        >
          {beaconOpen ? <XCircleContained /> : <HelpCircleContained />}
        </IconButton>
      )
    case 'menuItem':
      return (
        <MenuItem onClick={onClick}>
          <ListItemIcon>
            <HelpCircleContained />
          </ListItemIcon>
          <ListItemText>{t('Help')}</ListItemText>
        </MenuItem>
      )
  }
}
