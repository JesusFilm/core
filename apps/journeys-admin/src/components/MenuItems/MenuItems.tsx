import { gql, useMutation, useQuery } from '@apollo/client'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import BeenHereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import CheckRounded from '@mui/icons-material/CheckRounded'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Divider from '@mui/material/Divider'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { Dispatch, ReactElement, SetStateAction, useState } from 'react'

import { GetRole } from '../../../__generated__/GetRole'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'
import { JourneyPublish } from '../../../__generated__/JourneyPublish'
import { useJourneyDuplicateMutation } from '../../libs/useJourneyDuplicateMutation'
import { TitleDescriptionDialog } from '../JourneyView/TitleDescription/TitleDescriptionDialog'
import { MenuItem } from '../MenuItem'
import { CopyToTeamDialog } from '../Team/CopyToTeamDialog'

import { CreateTemplateMenuItem } from './CreateTemplateMenuItem'
import DescriptionMenuItem from './DescriptionMenuItem/DescriptionMenuItem'
import LanguageMenuItem from './LanguageMenuItem/LanguageMenuItem'
import { TitleMenuItem } from './TitleMenuItem'

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

interface MenuItemsProps {
  journey: Journey
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>
  onClose: () => void
}

export function MenuItems({
  journey,
  setAnchorEl,
  onClose: handleCloseMenu
}: MenuItemsProps): ReactElement {
  const router = useRouter()
  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { data } = useQuery<GetRole>(GET_ROLE)

  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const isOwner =
    journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.id === data?.getUserRole?.userId
    )?.role === UserJourneyRole.owner

  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
    useState(false)
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] = useState(false)

  console.log(showTitleDescriptionDialog)

  const { enqueueSnackbar } = useSnackbar()

  const handleUpdateTitleDescription = (): void => {
    setShowTitleDescriptionDialog(true)
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
          <TitleMenuItem />
          <DescriptionMenuItem />
        </>
      )}
      {(journey.template !== true || isPublisher) && <LanguageMenuItem />}
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

      <TitleDescriptionDialog
        open={showTitleDescriptionDialog}
        onClose={() => setShowTitleDescriptionDialog(false)}
      />

      <CopyToTeamDialog
        submitLabel="Add"
        title="Add Journey to Team"
        open={duplicateTeamDialogOpen}
        onClose={() => setDuplicateTeamDialogOpen(false)}
        submitAction={handleTemplate}
      />
    </>
  )
}
