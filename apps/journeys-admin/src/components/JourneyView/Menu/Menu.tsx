import { useQuery } from '@apollo/client'
import MoreVert from '@mui/icons-material/MoreVert'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetRole } from '../../../../__generated__/GetRole'
import { Role, UserJourneyRole } from '../../../../__generated__/globalTypes'
import { GET_ROLE } from '../../Editor/EditToolbar/Menu/Menu'

import { EditMenuItem } from './EditMenuItem'
import { PreviewMenuItem } from './PreviewMenuItem'
import { PublishMenuItem } from './PublishMenuItem'

export function Menu(): ReactElement {
  const { journey } = useJourney()
  const { data } = useQuery<GetRole>(GET_ROLE)

  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const isOwner =
    journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.id === data?.getUserRole?.userId
    )?.role === UserJourneyRole.owner

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
          <Chip
            icon={<VisibilityIcon />}
            label="Preview"
            component="a"
            href={`/api/preview?slug=${journey.slug}`}
            target="_blank"
            variant="outlined"
            clickable
            sx={{
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          />
          <IconButton
            aria-label="Preview"
            href={`/api/preview?slug=${journey.slug}`}
            target="_blank"
            sx={{
              display: {
                xs: 'flex',
                md: 'none'
              }
            }}
          >
            <VisibilityIcon />
          </IconButton>
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
            <PreviewMenuItem journey={journey} onClose={handleCloseMenu} />
            <PublishMenuItem
              journey={journey}
              isOwner={isOwner}
              isVisible={journey.template !== true || isPublisher}
            />
            <EditMenuItem
              journey={journey}
              isPublisher={isPublisher}
              isVisible={journey.template !== true || isPublisher}
            />
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
