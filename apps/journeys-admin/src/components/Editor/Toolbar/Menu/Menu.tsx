import { gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import File5Icon from '@core/shared/ui/icons/File5'
import MoreIcon from '@core/shared/ui/icons/More'
import Play3Icon from '@core/shared/ui/icons/Play3'
import SettingsIcon from '@core/shared/ui/icons/Settings'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { GetRole } from '../../../../../__generated__/GetRole'
import { Role } from '../../../../../__generated__/globalTypes'
import { setBeaconPageViewed } from '../../../../libs/setBeaconPageViewed'
import { MenuItem } from '../../../MenuItem'
import { AnalyticsItem } from '../Items/AnalyticsItem'
import { StrategyItem } from '../Items/StrategyItem'

import { CopyLinkItem } from './CopyLinkItem'
import { CreateTemplateItem } from './CreateTemplateItem'
import { LanguageItem } from './LanguageItem'

const AccessDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "components/AccessDialog" */
      '../../../AccessDialog'
    ).then((mod) => mod.AccessDialog),
  { ssr: false }
)

const DescriptionDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Toolbar/Menu/DescriptionDialog" */
      './DescriptionDialog'
    ).then((mod) => mod.DescriptionDialog),
  { ssr: false }
)
const TemplateSettingsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Toolbar/Menu/TemplateSettingsDialog" */
      './TemplateSettingsDialog'
    ).then((mod) => mod.TemplateSettingsDialog),
  { ssr: false }
)
const TitleDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Toolbar/Menu/TitleDialog" */
      './TitleDialog'
    ).then((mod) => mod.TitleDialog),
  { ssr: false }
)

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
  const router = useRouter()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useQuery<GetRole>(GET_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const [accessDialogOpen, setAccessDialogOpen] = useState<
    boolean | undefined
  >()
  const [titleDialogOpen, setTitleDialogOpen] = useState<boolean | undefined>()
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState<
    boolean | undefined
  >()
  const [templateSettingsDialogOpen, setTemplateSettingsDialogOpen] = useState<
    boolean | undefined
  >()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router, undefined, { shallow: true })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleOpenAccessDialog(): void {
    setRoute('access')
    setAccessDialogOpen(true)
    setAnchorEl(null)
  }

  function handleShowMenu(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }
  function handleOpenTitleDialog(): void {
    setRoute('title')
    setTitleDialogOpen(true)
    setAnchorEl(null)
  }
  function handleCloseTitleDialog(): void {
    setTitleDialogOpen(false)
    setAnchorEl(null)
  }
  function handleOpenDescriptionDialog(): void {
    setRoute('description')
    setDescriptionDialogOpen(true)
    setAnchorEl(null)
  }
  function handleCloseDescriptionDialog(): void {
    setDescriptionDialogOpen(false)
    setAnchorEl(null)
  }
  function handleOpenTemplateSettingsDialog(): void {
    setTemplateSettingsDialogOpen(true)
    setAnchorEl(null)
  }
  function handleCloseTemplateSettingsDialog(): void {
    setTemplateSettingsDialogOpen(false)
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
      >
        <MoreIcon />
      </IconButton>
      <MuiMenu
        id="edit-journey-actions"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'edit-journey-actions'
        }}
      >
        <NextLink
          href={`/api/preview?slug=${journey?.slug ?? ''}`}
          passHref
          legacyBehavior
          prefetch={false}
        >
          <MenuItem
            label={t('Preview')}
            icon={<Play3Icon />}
            openInNew
            onClick={handleCloseMenu}
          />
        </NextLink>
        <MenuItem
          label={t('Manage Access')}
          icon={<UsersProfiles2Icon />}
          onClick={handleOpenAccessDialog}
        />
        {journey?.template === true && (
          <MenuItem
            label={t('Template Settings')}
            icon={<SettingsIcon />}
            onClick={handleOpenTemplateSettingsDialog}
          />
        )}
        {journey?.template !== true && (
          <MenuItem
            label={t('Title')}
            icon={<Edit2Icon />}
            onClick={handleOpenTitleDialog}
          />
        )}
        {journey?.template !== true && (
          <MenuItem
            label={t('Description')}
            icon={<File5Icon />}
            onClick={handleOpenDescriptionDialog}
          />
        )}
        {(journey?.template !== true || isPublisher != null) && (
          <LanguageItem onClose={handleCloseMenu} />
        )}
        {journey != null && (
          <AnalyticsItem journey={journey} variant="list-item" />
        )}
        {journey?.template !== true && isPublisher === true && (
          <CreateTemplateItem />
        )}
        {journey != null && (
          <StrategyItem variant="list-item" closeMenu={handleCloseMenu} />
        )}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && <Divider />}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && (
            <CopyLinkItem journey={journey} onClose={handleCloseMenu} />
          )}
      </MuiMenu>
      {journey?.id != null && accessDialogOpen != null && (
        <AccessDialog
          journeyId={journey.id}
          open={accessDialogOpen}
          onClose={() => setAccessDialogOpen(false)}
        />
      )}
      {titleDialogOpen != null && (
        <TitleDialog open={titleDialogOpen} onClose={handleCloseTitleDialog} />
      )}
      {descriptionDialogOpen != null && (
        <DescriptionDialog
          open={descriptionDialogOpen}
          onClose={handleCloseDescriptionDialog}
        />
      )}
      {templateSettingsDialogOpen != null && (
        <TemplateSettingsDialog
          open={templateSettingsDialogOpen}
          onClose={handleCloseTemplateSettingsDialog}
        />
      )}
    </>
  )
}
