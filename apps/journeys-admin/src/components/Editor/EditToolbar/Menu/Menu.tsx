import MoreVert from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import ShareRoundedIcon from '@mui/icons-material/ShareRounded'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { DuplicateBlock } from '../../../DuplicateBlock'
import { MenuItem } from '../../../MenuItem'
import { DeleteBlock } from '../DeleteBlock'

export function Menu(): ReactElement {
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  const { journey } = useJourney()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
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
        {!smUp && (
          <MenuItem
            label="Social Settings"
            icon={<ShareRoundedIcon />}
            onClick={handleOpenSocial}
          />
        )}
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
        {!smUp && (
          <MenuItem
            label="Social Settings"
            icon={<ShareRoundedIcon />}
            onClick={handleOpenSocial}
          />
        )}
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

  function handleOpenSocial(): void {
    dispatch({
      type: 'SetDrawerMobileOpenAction',
      mobileOpen: true
    })
    handleCloseMenu()
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
      </MuiMenu>
    </>
  )
}
