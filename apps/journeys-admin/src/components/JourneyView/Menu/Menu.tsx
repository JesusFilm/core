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
import CheckRounded from '@mui/icons-material/CheckRounded'
import NextLink from 'next/link'
import { useSnackbar } from 'notistack'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { useRouter } from 'next/router'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../__generated__/globalTypes'
import { JourneyPublish } from '../../../../__generated__/JourneyPublish'
import { GetRole } from '../../../../__generated__/GetRole'
import { ApplyTemplate } from '../../../../__generated__/ApplyTemplate'
import { MenuItem } from '../../MenuItem'
import { TitleDescriptionDialog } from '../TitleDescription/TitleDescriptionDialog'
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

export const APPLY_TEMPLATE = gql`
  mutation ApplyTemplate($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

export function Menu(): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()
  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
  const [applyTemplate] = useMutation<ApplyTemplate>(APPLY_TEMPLATE)
  const { data } = useQuery<GetRole>(GET_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const isOwner =
    journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.id === data?.getUserRole?.userId
    )?.role === UserJourneyRole.owner
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
    useState(false)
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
  const handleTemplate = async (): Promise<void> => {
    if (journey == null) return

    const { data } = await applyTemplate({
      variables: {
        id: journey.id
      },
      update(cache, { data }) {
        if (data?.journeyDuplicate != null) {
          cache.modify({
            fields: {
              adminJourneys(existingAdminJourneyRefs = []) {
                const duplicatedJourneyRef = cache.writeFragment({
                  data: data.journeyDuplicate,
                  fragment: gql`
                    fragment DuplicatedJourney on Journey {
                      id
                    }
                  `
                })
                return [...existingAdminJourneyRefs, duplicatedJourneyRef]
              }
            }
          })
        }
      }
    })

    if (data?.journeyDuplicate != null) {
      void router.push(`/journeys/${data.journeyDuplicate.id}`, undefined, {
        shallow: true
      })
    }
  }
  const handleUpdateTitleDescription = (): void => {
    setShowTitleDescriptionDialog(true)
    setAnchorEl(null)
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
                disabled={journey.status === JourneyStatus.draft}
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
            {journey.template === true && isPublisher !== true && (
              <MenuItem
                label="Use Template"
                icon={<CheckRounded />}
                onClick={handleTemplate}
              />
            )}
            {journey.template === true && isPublisher && (
              <MenuItem
                label="Description"
                icon={<EditIcon />}
                onClick={handleUpdateTitleDescription}
              />
            )}
            {journey.template !== true && (
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
            {(journey.template !== true || isPublisher) && (
              <MenuItem
                label="Language"
                icon={<TranslateIcon />}
                onClick={handleUpdateLanguage}
              />
            )}
            {journey.template !== true && reports && (
              <NextLink href={`/journeys/${journey.id}/reports`} passHref>
                <MenuItem label="Report" icon={<AssessmentRoundedIcon />} />
              </NextLink>
            )}
            {journey.template !== true && isPublisher === true && (
              <CreateTemplateMenuItem />
            )}
            {(journey.template !== true || isPublisher) && (
              <>
                <Divider />
                <NextLink href={editLink != null ? editLink : ''} passHref>
                  <MenuItem label="Edit Cards" icon={<ViewCarouselIcon />} />
                </NextLink>
              </>
            )}
            {journey.template !== true && (
              <>
                <Divider />
                <MenuItem
                  label="Copy Link"
                  icon={<ContentCopyIcon />}
                  onClick={handleCopyLink}
                />
              </>
            )}
          </MuiMenu>
          <TitleDescriptionDialog
            open={showTitleDescriptionDialog}
            onClose={() => setShowTitleDescriptionDialog(false)}
          />
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
