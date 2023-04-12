import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Fab from '@mui/material/Fab'
import TagManager from 'react-gtm-module'
import EditIcon from '@mui/icons-material/Edit'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useJourneyDuplicate } from '../../../libs/useJourneyDuplicate'

interface JourneyViewFabProps {
  isPublisher?: boolean
}

export function JourneyViewFab({
  isPublisher
}: JourneyViewFabProps): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()

  const { duplicateJourney } = useJourneyDuplicate()

  const handleConvertTemplate = async (): Promise<void> => {
    if (journey == null) return

    const data = await duplicateJourney({ id: journey.id })

    if (data != null) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'template_use',
          journeyId: journey.id,
          journeyTitle: journey.title
        }
      })

      void router.push(`/journeys/${data.id}`, undefined, {
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
          onClick={handleConvertTemplate}
        >
          <CheckRoundedIcon sx={{ mr: 3 }} />
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
        <NextLink href={editLink != null ? editLink : ''} passHref>
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
            <EditIcon sx={{ mr: 3 }} />
            Edit
          </Fab>
        </NextLink>
      )}
    </>
  )
}
