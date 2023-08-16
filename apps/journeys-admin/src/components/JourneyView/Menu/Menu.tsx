import { useQuery } from '@apollo/client'
import CheckRounded from '@mui/icons-material/CheckRounded'
import MoreVert from '@mui/icons-material/MoreVert'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetRole } from '../../../../__generated__/GetRole'
import { Role } from '../../../../__generated__/globalTypes'
import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { GET_ROLE } from '../../Editor/EditToolbar/Menu/Menu'
import { MenuItem } from '../../MenuItem'
import { CopyToTeamDialog } from '../../Team/CopyToTeamDialog'

export function Menu(): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const { data } = useQuery<GetRole>(GET_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const openMenu = Boolean(anchorEl)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }
  const handleTemplate = async (teamId: string | undefined): Promise<void> => {
    if (journey == null || teamId == null) return

    const { data } = await journeyDuplicate({
      variables: { id: journey.id, teamId }
    })

    if (data != null) {
      void router.push(`/journeys/${data.journeyDuplicate.id}`, undefined, {
        shallow: true
      })
    }
  }

  let editLink
  if (journey != null) {
    if (journey.template === true && isPublisher === true) {
      editLink = `/publisher/${journey.id}/edit`
    } else {
      editLink = `/journeys/${journey.id}/edit`
    }
  }

  return (
    <>
      {journey != null ? (
        <>
          {journey.template !== true && (
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
            </>
          )}
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
            <NextLink href={`/api/preview?slug=${journey.slug}`} passHref>
              <MenuItem
                label="Preview"
                icon={<VisibilityIcon />}
                openInNew
                onClick={handleCloseMenu}
              />
            </NextLink>
            {journey.template === true && (
              <MenuItem
                label="Use Template"
                icon={<CheckRounded />}
                onClick={() => setDuplicateTeamDialogOpen(true)}
              />
            )}
            {(journey.template !== true || isPublisher) && (
              <>
                <Divider />
                <NextLink href={editLink != null ? editLink : ''} passHref>
                  <MenuItem label="Edit Cards" icon={<ViewCarouselIcon />} />
                </NextLink>
              </>
            )}
          </MuiMenu>
          <CopyToTeamDialog
            submitLabel="Add"
            title="Add Journey to Team"
            open={duplicateTeamDialogOpen}
            onClose={() => setDuplicateTeamDialogOpen(false)}
            submitAction={handleTemplate}
          />
        </>
      ) : (
        <IconButton edge="end" disabled>
          <MoreVert />
        </IconButton>
      )}
    </>
  )
}
