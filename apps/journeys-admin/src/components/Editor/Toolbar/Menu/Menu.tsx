import { gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import MoreIcon from '@core/shared/ui/icons/More'

import { GetMe } from '../../../../../__generated__/GetMe'
import { GetRole } from '../../../../../__generated__/GetRole'
import { Role } from '../../../../../__generated__/globalTypes'
import { HelpScoutBeacon } from '../../../HelpScoutBeacon'
import { GET_ME } from '../../../PageWrapper/NavigationDrawer/UserNavigation'
import { AccessItem } from '../Items/AccessItem'
import { AnalyticsItem } from '../Items/AnalyticsItem'
import { CopyLinkItem } from '../Items/CopyLinkItem'
import { CreateTemplateItem } from '../Items/CreateTemplateItem'
import { DescriptionItem } from '../Items/DescriptionItem'
import { LanguageItem } from '../Items/LanguageItem'
import { PreviewItem } from '../Items/PreviewItem'
import { ShareItem } from '../Items/ShareItem'
import { StrategyItem } from '../Items/StrategyItem'
import { TemplateSettingsItem } from '../Items/TemplateSettingsItem'
import { TitleItem } from '../Items/TitleItem'

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

export function Menu(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useQuery<GetRole>(GET_ROLE)
  const { data: me } = useQuery<GetMe>(GET_ME)
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
        edge="end"
        aria-label={t('Edit Journey Actions')}
        aria-controls="edit-journey-actions"
        aria-haspopup="true"
        aria-expanded={anchorEl != null ? 'true' : undefined}
        onClick={handleShowMenu}
        disabled={journey == null}
        data-testid="ToolbarMenuButton"
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
      >
        {!smUp && <PreviewItem variant="menu-item" onClick={handleCloseMenu} />}
        <AccessItem variant="menu-item" onClose={handleCloseMenu} />
        {journey?.template === true && (
          <TemplateSettingsItem variant="menu-item" onClose={handleCloseMenu} />
        )}
        {journey?.template !== true && (
          <TitleItem variant="menu-item" onClose={handleCloseMenu} />
        )}
        {journey?.template !== true && (
          <DescriptionItem variant="menu-item" onClose={handleCloseMenu} />
        )}
        {(journey?.template !== true || isPublisher != null) && (
          <LanguageItem variant="menu-item" onClose={handleCloseMenu} />
        )}
        {!smUp && journey?.template !== true && (
          <AnalyticsItem variant="menu-item" />
        )}
        {journey?.template !== true && isPublisher === true && (
          <CreateTemplateItem variant="menu-item" />
        )}
        {!smUp &&
          journey != null &&
          (journey?.template !== true || isPublisher != null) && (
            <>
              <StrategyItem variant="menu-item" closeMenu={handleCloseMenu} />
              <ShareItem variant="menu-item" closeMenu={handleCloseMenu} />
              <CopyLinkItem variant="menu-item" onClose={handleCloseMenu} />
            </>
          )}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && (
            <Divider data-testid="menu-divider" />
          )}
        {!smUp &&
        journey != null &&
        (journey?.template !== true || isPublisher != null) ? (
          <HelpScoutBeacon
            userInfo={{
              name: `${me?.me?.firstName} ${me?.me?.lastName}`,
              email: me?.me?.email
            }}
          />
        ) : (
          <CopyLinkItem variant="menu-item" onClose={handleCloseMenu} />
        )}
      </MuiMenu>
    </>
  )
}
