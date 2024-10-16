import { gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import MoreIcon from '@core/shared/ui/icons/More'

import { GetRole } from '../../../../../__generated__/GetRole'
import { Role } from '../../../../../__generated__/globalTypes'
import { HelpScoutBeacon } from '../../../HelpScoutBeacon'
import { AccessItem } from '../Items/AccessItem'
import { AnalyticsItem } from '../Items/AnalyticsItem'
import { CopyLinkItem } from '../Items/CopyLinkItem'
import { CreateTemplateItem } from '../Items/CreateTemplateItem'
import { DetailsItem } from '../Items/DetailsItem'
import { ShareItem } from '../Items/ShareItem'
import { StrategyItem } from '../Items/StrategyItem'
import { TemplateSettingsItem } from '../Items/TemplateSettingsItem'

import { JourneyDetails } from './JourneyDetails'

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

interface MenuProps {
  user?: User
}

export function Menu({ user }: MenuProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useQuery<GetRole>(GET_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        id="edit-journey-actions"
        aria-label={t('Edit Journey Actions')}
        aria-controls="edit-journey-actions"
        aria-haspopup="true"
        aria-expanded={anchorEl != null ? 'true' : undefined}
        onClick={handleShowMenu}
        disabled={journey == null}
        data-testid="ToolbarMenuButton"
        sx={{ p: 0 }}
      >
        <MoreIcon />
      </IconButton>
      <MuiMenu
        id="edit-journey-actions"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        keepMounted
        MenuListProps={{
          'aria-labelledby': 'edit-journey-actions'
        }}
        sx={{
          '& .MuiList-root': {
            py: 2
          }
        }}
      >
        {!smUp && (
          <Stack sx={{ width: 220 }}>
            <JourneyDetails />
          </Stack>
        )}
        <DetailsItem variant="menu-item" onClose={handleCloseMenu} />
        {!smUp && <Divider data-testid="details-menu-divider" />}
        {journey?.template === true && (
          <TemplateSettingsItem variant="menu-item" onClose={handleCloseMenu} />
        )}
        <AccessItem variant="menu-item" onClose={handleCloseMenu} />
        {!smUp && journey?.template !== true && (
          <AnalyticsItem variant="menu-item" />
        )}
        {journey?.template !== true && isPublisher === true && (
          <CreateTemplateItem variant="menu-item" />
        )}
        {!smUp && (
          <>
            <StrategyItem variant="menu-item" closeMenu={handleCloseMenu} />
            <ShareItem variant="menu-item" closeMenu={handleCloseMenu} />
          </>
        )}
        {journey != null && smUp && <Divider data-testid="menu-divider" />}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && (
            <CopyLinkItem variant="menu-item" onClose={handleCloseMenu} />
          )}
        {!smUp && (
          <>
            <Divider data-testid="helpscout-menu-divider" />
            <HelpScoutBeacon
              variant="menuItem"
              userInfo={{
                name: user?.displayName ?? '',
                email: user?.email ?? ''
              }}
              handleClick={handleCloseMenu}
            />
          </>
        )}
      </MuiMenu>
    </>
  )
}
