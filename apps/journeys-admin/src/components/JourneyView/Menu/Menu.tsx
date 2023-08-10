import MoreVert from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { MenuItems } from '../../MenuItems'

export function Menu(): ReactElement {
  const { journey } = useJourney()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const openMenu = Boolean(anchorEl)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
      {journey != null ? (
        <>
          <IconButton
            id="single-journey-actions"
            edge="end"
            aria-controls="single-journey-actions"
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            onClick={handleShowMenu}
          >
            <MoreVert />
          </IconButton>
          <MuiMenu
            id="single-journey-actions"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'journey-actions'
            }}
          >
            {/* pass onclick that should close the parent */}
            <MenuItems journey={journey} onClose={handleCloseMenu} />
          </MuiMenu>
        </>
      ) : (
        <IconButton edge="end" disabled>
          <MoreVert />
        </IconButton>
      )}
    </>
  )
}
