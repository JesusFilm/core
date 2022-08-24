import { ReactElement, useState } from 'react'
import { useMutation, gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MoreVert from '@mui/icons-material/MoreVert'
import BeenHereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DescriptionIcon from '@mui/icons-material/Description'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import TranslateIcon from '@mui/icons-material/Translate'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import NextLink from 'next/link'
import { useSnackbar } from 'notistack'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../__generated__/globalTypes'
import { JourneyPublish } from '../../../../__generated__/JourneyPublish'
import { GetRole } from '../../../../__generated__/GetRole'
import { DescriptionDialog } from './DescriptionDialog'
import { TitleDialog } from './TitleDialog'
import { LanguageDialog } from './LanguageDialog'
import { CreateTemplateMenuItem } from './CreateTemplateMenuItem'

export const JOURNEY_PUBLISH = gql`
  mutation JourneyPublish($id: ID!) {
    journeyPublish(id: $id) {
      id
      status
    }
  }
`

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

interface MenuProps {
  forceOpen?: boolean
}

export function Menu({ forceOpen }: MenuProps): ReactElement {
  const { journey } = useJourney()
  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
  const { data } = useQuery<GetRole>(GET_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const isOwner =
    journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.id === data?.getUserRole?.userId
    )?.role === UserJourneyRole.owner
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { reports } = useFlags()

  const openMenu = forceOpen ?? Boolean(anchorEl)

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
    enqueueSnackbar('Journey Published', {
      variant: 'success',
      preventDuplicate: true
    })
  }
  const handleUpdateTitle = (): void => {
    setShowTitleDialog(true)
    setAnchorEl(null)
  }
  const handleUpdateDescription = (): void => {
    setShowDescriptionDialog(true)
    setAnchorEl(null)
  }
  const handleUpdateLanguage = (): void => {
    setShowLanguageDialog(true)
    setAnchorEl(null)
  }
  const handleCopyLink = async (): Promise<void> => {
    if (journey == null) return

    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'}/${
        journey.slug
      }`
    )
    setAnchorEl(null)
    enqueueSnackbar('Link Copied', {
      variant: 'success',
      preventDuplicate: true
    })
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
            <MenuItem
              disabled={journey.status === JourneyStatus.draft}
              component="a"
              href={`/api/preview?slug=${journey.slug}`}
              target="_blank"
              rel="noopener"
              onClick={handleCloseMenu}
            >
              <ListItemIcon>
                <VisibilityIcon />
              </ListItemIcon>
              <ListItemText>Preview</ListItemText>
            </MenuItem>
            <MenuItem
              disabled={
                journey.status === JourneyStatus.published &&
                (isOwner || (journey.template === true && isPublisher))
              }
              onClick={handlePublish}
            >
              <ListItemIcon>
                <BeenHereRoundedIcon />
              </ListItemIcon>
              <ListItemText>Publish</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUpdateTitle}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText>Title</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUpdateDescription}>
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText>Description</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUpdateLanguage}>
              <ListItemIcon>
                <TranslateIcon />
              </ListItemIcon>
              <ListItemText>Language</ListItemText>
            </MenuItem>
            {reports && (
              <NextLink href={`/journeys/${journey.id}/reports`} passHref>
                <MenuItem>
                  <ListItemIcon>
                    <AssessmentRoundedIcon />
                  </ListItemIcon>
                  <ListItemText>Report</ListItemText>
                </MenuItem>
              </NextLink>
            )}
            {isPublisher === true && <CreateTemplateMenuItem />}
            <Divider />
            <NextLink href={`/journeys/${journey.id}/edit`} passHref>
              <MenuItem>
                <ListItemIcon>
                  <ViewCarouselIcon />
                </ListItemIcon>
                <ListItemText>Edit Cards</ListItemText>
              </MenuItem>
            </NextLink>
            <Divider />
            <MenuItem onClick={handleCopyLink}>
              <ListItemIcon>
                <ContentCopyIcon />
              </ListItemIcon>
              <ListItemText>Copy Link</ListItemText>
            </MenuItem>
          </MuiMenu>
          <TitleDialog
            open={showTitleDialog}
            onClose={() => setShowTitleDialog(false)}
          />
          <DescriptionDialog
            open={showDescriptionDialog}
            onClose={() => setShowDescriptionDialog(false)}
          />
          <LanguageDialog
            open={showLanguageDialog}
            onClose={() => setShowLanguageDialog(false)}
          />
        </>
      ) : (
        <IconButton disabled>
          <MoreVert />
        </IconButton>
      )}
    </>
  )
}
