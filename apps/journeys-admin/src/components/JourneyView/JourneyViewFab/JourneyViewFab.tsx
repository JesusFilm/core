import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import TagManager from 'react-gtm-module'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import CheckIcon from '@core/shared/ui/icons/Check'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { CopyToTeamDialog } from '../../Team/CopyToTeamDialog'

interface JourneyViewFabProps {
  isPublisher?: boolean
}

export function JourneyViewFab({
  isPublisher
}: JourneyViewFabProps): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] = useState(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const handleConvertTemplate = async (
    teamId: string | undefined
  ): Promise<void> => {
    if (journey == null || teamId == null) return

    const { data } = await journeyDuplicate({
      variables: { id: journey.id, teamId }
    })

    if (data != null) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'template_use',
          journeyId: journey.id,
          journeyTitle: journey.title
        }
      })

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
      {journey?.template === true && isPublisher !== true ? (
        <Fab
          variant="extended"
          size="large"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: { xs: 20, sm: 348 }
          }}
          color="primary"
          disabled={journey == null}
          onClick={() => setDuplicateTeamDialogOpen(true)}
        >
          <CheckIcon sx={{ mr: 3 }} />
          <Typography
            variant="subtitle2"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Use Template
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            Use It
          </Typography>
        </Fab>
      ) : (
        <NextLink
          href={editLink != null ? editLink : ''}
          passHref
          legacyBehavior
        >
          <Fab
            variant="extended"
            size="large"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: { xs: 20, sm: 348 }
            }}
            color="primary"
            disabled={journey == null}
          >
            <Edit2Icon sx={{ mr: 3 }} />
            Edit
          </Fab>
        </NextLink>
      )}

      <CopyToTeamDialog
        submitLabel="Add"
        title="Add Journey to Team"
        open={duplicateTeamDialogOpen}
        onClose={() => setDuplicateTeamDialogOpen(false)}
        submitAction={handleConvertTemplate}
      />
    </>
  )
}
