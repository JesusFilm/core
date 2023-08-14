import { gql, useMutation, useQuery } from '@apollo/client'
import BeenHereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import MoreVert from '@mui/icons-material/MoreVert'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import NextLink from 'next/link'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetRole } from '../../../../__generated__/GetRole'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../__generated__/globalTypes'
import { JourneyPublish } from '../../../../__generated__/JourneyPublish'
import { GET_ROLE } from '../../Editor/EditToolbar/Menu/Menu'
import { MenuItem } from '../../MenuItem'

export const JOURNEY_PUBLISH = gql`
  mutation JourneyPublish($id: ID!) {
    journeyPublish(id: $id) {
      id
      status
    }
  }
`

export function Menu(): ReactElement {
  const { journey } = useJourney()
  const { data } = useQuery<GetRole>(GET_ROLE)

  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)

  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const isOwner =
    journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.id === data?.getUserRole?.userId
    )?.role === UserJourneyRole.owner

  const { enqueueSnackbar } = useSnackbar()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const openMenu = Boolean(anchorEl)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }
  const handlePublish = async (): Promise<void> => {
    if (journey == null) return

    await journeyPublish({
      variables: { id: journey.id },
      optimisticResponse: {
        journeyPublish: {
          id: journey.id,
          __typename: 'Journey',
          status: JourneyStatus.published
        }
      }
    })
    setAnchorEl(null)
    journey.template === true
      ? enqueueSnackbar('Template Published', {
          variant: 'success',
          preventDuplicate: true
        })
      : enqueueSnackbar('Journey Published', {
          variant: 'success',
          preventDuplicate: true
        })
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
            <NextLink href={`/api/preview?slug=${journey.slug}`} passHref>
              <MenuItem
                label="Preview"
                icon={<VisibilityIcon />}
                openInNew
                onClick={handleCloseMenu}
              />
            </NextLink>
            {(journey.template !== true || isPublisher) && (
              <MenuItem
                label="Publish"
                icon={<BeenHereRoundedIcon />}
                disabled={
                  journey.status === JourneyStatus.published ||
                  (journey.template !== true && !isOwner)
                }
                onClick={handlePublish}
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
        </>
      ) : (
        <IconButton edge="end" disabled>
          <MoreVert />
        </IconButton>
      )}
    </>
  )
}
