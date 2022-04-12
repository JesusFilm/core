import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import MoreVert from '@mui/icons-material/MoreVert'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import { useEditor } from '@core/journeys/ui'
import SettingsIcon from '@mui/icons-material/Settings'
import NextLink from 'next/link'
import { DeleteBlock } from '../DeleteBlock'
import { useJourney } from '../../../../libs/context'

export function Menu(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const journey = useJourney()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  function BlockMenu(): ReactElement {
    return <DeleteBlock variant="list-item" />
  }

  function CardMenu(): ReactElement {
    return (
      <>
        <DeleteBlock variant="list-item" closeMenu={handleCloseMenu} />
        <Divider />
        <NextLink
          href={journey != null ? `/journeys/${journey.slug}` : ''}
          passHref
        >
          <MenuItem>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText>Journey Settings</ListItemText>
          </MenuItem>
        </NextLink>
      </>
    )
  }

  return (
    <>
      <IconButton
        id="edit-journey-actions"
        edge="end"
        aria-controls="edit-journey-actions"
        aria-haspopup="true"
        aria-expanded={anchorEl != null ? 'true' : undefined}
        onClick={handleShowMenu}
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
