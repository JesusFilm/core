import { ReactElement, useState } from 'react'
import { useMutation, gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
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
import { MenuItem } from './MenuItem/MenuItem'

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

export function Menu(): ReactElement {
  const { journey } = useJourney()
  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
  const { data, loading } = useQuery<GetRole>(GET_ROLE)
  // getUserRole hasn't fetched yet by the time we set isPublisher in tests
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
            <NextLink
              href={`/api/preview?slug=${journey.slug}`}
              target="_blank"
              rel="noopener"
              passHref
            >
              <MenuItem
                label="Preview"
                icon={<VisibilityIcon />}
                disabled={journey.status === JourneyStatus.draft}
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
            <MenuItem
              label="Language"
              icon={<TranslateIcon />}
              onClick={handleUpdateLanguage}
            />
            {reports && (
              <NextLink href={`/journeys/${journey.id}/reports`} passHref>
                <MenuItem label="Report" icon={<AssessmentRoundedIcon />} />
              </NextLink>
            )}
            {isPublisher === true && <CreateTemplateMenuItem />}
            <Divider />
            <NextLink href={`/journeys/${journey.id}/edit`} passHref>
              <MenuItem label="Edit Cards" icon={<ViewCarouselIcon />} />
            </NextLink>
            <Divider />
            <MenuItem
              label="Copy Link"
              icon={<ContentCopyIcon />}
              onClick={handleCopyLink}
            />
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
