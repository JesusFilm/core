import { gql, useQuery } from '@apollo/client'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
// import BeenHereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import CheckRounded from '@mui/icons-material/CheckRounded'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import MoreVert from '@mui/icons-material/MoreVert'
import TranslateIcon from '@mui/icons-material/Translate'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetRole } from '../../../../__generated__/GetRole'
import { Role } from '../../../../__generated__/globalTypes'
// import { JourneyPublish } from '../../../../__generated__/JourneyPublish'
import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { MenuItem } from '../../MenuItem'
import { CopyToTeamDialog } from '../../Team/CopyToTeamDialog'
import { TitleDescriptionDialog } from '../TitleDescription/TitleDescriptionDialog'

import { CreateTemplateMenuItem } from './CreateTemplateMenuItem'
import { DescriptionDialog } from './DescriptionDialog'
import { TitleDialog } from './TitleDialog'

const DynamicLanguageDialog = dynamic<{
  open: boolean
  onClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "MenuLanguageDialog" */
      './LanguageDialog'
    ).then((mod) => mod.LanguageDialog)
)

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
  const router = useRouter()
  // const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const { data } = useQuery<GetRole>(GET_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
    useState(false)
  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] = useState(false)

  const { enqueueSnackbar } = useSnackbar()

  const openMenu = Boolean(anchorEl)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }
  // const handlePublish = async (): Promise<void> => {
  //   if (journey == null) return

  //   await journeyPublish({
  //     variables: { id: journey.id },
  //     optimisticResponse: {
  //       journeyPublish: {
  //         id: journey.id,
  //         __typename: 'Journey',
  //         status: JourneyStatus.published
  //       }
  //     }
  //   })
  //   setAnchorEl(null)
  //   journey.template === true
  //     ? enqueueSnackbar('Template Published', {
  //         variant: 'success',
  //         preventDuplicate: true
  //       })
  //     : enqueueSnackbar('Journey Published', {
  //         variant: 'success',
  //         preventDuplicate: true
  //       })
  // }
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
            {journey.template !== true && (
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
          {showLanguageDialog && (
            <DynamicLanguageDialog
              open={showLanguageDialog}
              onClose={() => setShowLanguageDialog(false)}
            />
          )}
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
