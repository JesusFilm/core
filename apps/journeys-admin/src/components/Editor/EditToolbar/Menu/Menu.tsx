import { gql, useQuery } from '@apollo/client'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import MoreVert from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetRole } from '../../../../../__generated__/GetRole'
import { Role } from '../../../../../__generated__/globalTypes'
import { DuplicateBlock } from '../../../DuplicateBlock'
import { TitleDescriptionDialog } from '../../../JourneyView/TitleDescription/TitleDescriptionDialog'
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

export function Menu(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const { journey } = useJourney()

  const { data } = useQuery<GetRole>(GET_ROLE)

  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
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

  const handleUpdateTitleDescription = (): void => {
    setShowTitleDescriptionDialog(true)
  }

  const handleCloseTitleDescription = (): void => {
    setShowTitleDescriptionDialog(false)
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
            icon={<VisibilityIcon />}
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
    let settingsLink
    if (journey != null) {
      if (journey.template === true) {
        settingsLink = `/publisher/${journey.id}`
      } else {
        settingsLink = `/journeys/${journey.id}`
      }
    }

    return (
      <>
        <NextLink
          href={`/api/preview?slug=${journey?.slug ?? ''}`}
          passHref
          legacyBehavior
        >
          <MenuItem
            label="Preview"
            icon={<VisibilityIcon />}
            openInNew
            onClick={handleCloseMenu}
          />
        </NextLink>
        <DuplicateBlock variant="list-item" />
        <DeleteBlock variant="list-item" closeMenu={handleCloseMenu} />
        <Divider />
        <NextLink
          href={settingsLink != null ? settingsLink : ''}
          passHref
          legacyBehavior
        >
          <MenuItem
            label={
              journey?.template === true
                ? 'Publisher Settings'
                : 'Journey Settings'
            }
            icon={<SettingsIcon />}
          />
        </NextLink>
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
        <MoreVert />
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
            icon={<EditIcon />}
            onClick={handleUpdateTitleDescription}
          />
        )}
        {journey?.template !== true && (
          <>
            <MenuItem
              label="Title"
              icon={<EditIcon />}
              onClick={handleUpdateTitle}
            />
            <MenuItem
              label="Description"
              icon={<DescriptionIcon />}
              onClick={handleUpdateDescription}
            />
          </>
        )}
        {(journey?.template !== true || isPublisher != null) && (
          <LanguageMenuItem onClose={handleCloseMenu} />
        )}
        {journey != null && <ReportMenuItem journey={journey} />}
        {journey?.template !== true && isPublisher === true && (
          <CreateTemplateMenuItem />
        )}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && (
            <>
              <Divider />
              <CopyMenuItem journey={journey} onClose={handleCloseMenu} />
            </>
          )}
      </MuiMenu>
      <TitleDialog open={showTitleDialog} onClose={handleCloseTitle} />
      <DescriptionDialog
        open={showDescriptionDialog}
        onClose={handleCloseDescription}
      />
      <TitleDescriptionDialog
        open={showTitleDescriptionDialog}
        onClose={handleCloseTitleDescription}
      />
    </>
  )
}
