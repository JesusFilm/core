import { gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import File5Icon from '@core/shared/ui/icons/File5'
import MoreIcon from '@core/shared/ui/icons/More'
import SettingsIcon from '@core/shared/ui/icons/Settings'

import { GetRole } from '../../../../../__generated__/GetRole'
import { Role } from '../../../../../__generated__/globalTypes'
import { DuplicateBlock } from '../../../DuplicateBlock'
import { MenuItem } from '../../../MenuItem'
import { DeleteBlock } from '../DeleteBlock'

import { CopyMenuItem } from './CopyMenuItem'
import { CreateTemplateMenuItem } from './CreateTemplateMenuItem'
import { DescriptionDialog } from './DescriptionDialog'
import { LanguageMenuItem } from './LanguageMenuItem'
import { ReportMenuItem } from './ReportMenuItem'
import { TitleDialog } from './TitleDialog'

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

const TemplateSettingsForm = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TemplateSettingsForm" */
      '../../../JourneyView/TemplateSettings/TemplateSettingsForm'
    ).then((mod) => mod.TemplateSettingsForm)
)

const TemplateSettingsDrawer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TemplateSettingsDrawer" */
      '../../../JourneyView/TemplateSettings/TemplateSettingsDrawer'
    ).then((mod) => mod.TemplateSettingsDrawer)
)

export function Menu(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const { journey } = useJourney()

  const { data } = useQuery<GetRole>(GET_ROLE)

  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [showTemplateSettingsDialog, setShowTemplateSettingsDialog] =
    useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const handleUpdateTitle = (): void => {
    setShowTitleDialog(true)
  }

  const handleCloseTitle = (): void => {
    setShowTitleDialog(false)
    setAnchorEl(null)
  }

  const handleUpdateDescription = (): void => {
    setShowDescriptionDialog(true)
  }

  const handleCloseDescription = (): void => {
    setShowDescriptionDialog(false)
    setAnchorEl(null)
  }

  const handleUpdateTemplateSettings = (): void => {
    setShowTemplateSettingsDialog(true)
  }

  const handleCloseTemplateSettings = (): void => {
    setShowTemplateSettingsDialog(false)
    setAnchorEl(null)
  }

  function BlockMenu(): ReactElement {
    return (
      <>
        <NextLink
          href={`/api/preview?slug=${journey?.slug ?? ''}`}
          passHref
          legacyBehavior
        >
          <MenuItem
            label="Preview"
            icon={<EyeOpenIcon />}
            openInNew
            onClick={handleCloseMenu}
          />
        </NextLink>

        <DuplicateBlock
          variant="list-item"
          disabled={selectedBlock?.__typename === 'VideoBlock'}
        />
        <DeleteBlock variant="list-item" />
        <Divider />
      </>
    )
  }

  function CardMenu(): ReactElement {
    return (
      <>
        <NextLink
          href={`/api/preview?slug=${journey?.slug ?? ''}`}
          passHref
          legacyBehavior
        >
          <MenuItem
            label="Preview"
            icon={<EyeOpenIcon />}
            openInNew
            onClick={handleCloseMenu}
          />
        </NextLink>
        <DuplicateBlock variant="list-item" />
        <DeleteBlock variant="list-item" closeMenu={handleCloseMenu} />
        <Divider />
        {journey != null && journey.template === true && (
          <NextLink href={`/publisher/${journey.id}`} passHref legacyBehavior>
            <MenuItem label="Publisher Settings" icon={<SettingsIcon />} />
          </NextLink>
        )}
      </>
    )
  }

  return (
    <>
      <IconButton
        id="edit-journey-actions"
        edge="end"
        aria-label="Edit Journey Actions"
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
        {selectedBlock?.__typename === 'StepBlock' ? (
          <CardMenu />
        ) : (
          <BlockMenu />
        )}
        {journey?.template === true && isPublisher != null && (
          <MenuItem
            label="Description"
            icon={<Edit2Icon />}
            onClick={handleUpdateTemplateSettings}
          />
        )}
        {journey?.template !== true && (
          <MenuItem
            label="Title"
            icon={<Edit2Icon />}
            onClick={handleUpdateTitle}
          />
        )}
        {journey?.template !== true && (
          <MenuItem
            label="Description"
            icon={<File5Icon />}
            onClick={handleUpdateDescription}
          />
        )}
        {(journey?.template !== true || isPublisher != null) && (
          <LanguageMenuItem onClose={handleCloseMenu} />
        )}
        {journey != null && <ReportMenuItem journey={journey} />}
        {journey?.template !== true && isPublisher === true && (
          <CreateTemplateMenuItem />
        )}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && <Divider />}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && (
            <CopyMenuItem journey={journey} onClose={handleCloseMenu} />
          )}
      </MuiMenu>
      <TitleDialog open={showTitleDialog} onClose={handleCloseTitle} />
      <DescriptionDialog
        open={showDescriptionDialog}
        onClose={handleCloseDescription}
      />
      {journey != null &&
        (journey?.template !== true || isPublisher != null) && (
          <TemplateSettingsForm onSubmit={handleCloseTemplateSettings}>
            <TemplateSettingsDrawer
              open={showTemplateSettingsDialog}
              onClose={handleCloseTemplateSettings}
            />
          </TemplateSettingsForm>
        )}
    </>
  )
}
