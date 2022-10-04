import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Fab from '@mui/material/Fab'
import TagManager from 'react-gtm-module'
import EditIcon from '@mui/icons-material/Edit'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ConvertTemplate } from '../../../../__generated__/ConvertTemplate'
import { TemplateUseEventCreate } from '../../../../__generated__/TemplateUseEventCreate'

export const CONVERT_TEMPLATE = gql`
  mutation ConvertTemplate($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

export const TEMPLATE_USE_EVENT_CREATE = gql`
  mutation TemplateUseEventCreate($input: TemplateUseEventInput!) {
    templateUseEventCreate(input: $input) {
      id
      userId
      journeyId
    }
  }
`

interface JourneyViewFabProps {
  isPublisher?: boolean
}

export function JourneyViewFab({
  isPublisher
}: JourneyViewFabProps): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()
  const [ConvertTemplate] = useMutation<ConvertTemplate>(CONVERT_TEMPLATE)
  const [templateUseEventCreate] = useMutation<TemplateUseEventCreate>(
    TEMPLATE_USE_EVENT_CREATE
  )

  const handleConvertTemplate = async (): Promise<void> => {
    if (journey == null) return

    const { data } = await ConvertTemplate({
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
      void handleCreateEvent()
      void router.push(`/journeys/${data.journeyDuplicate.id}`, undefined, {
        shallow: true
      })
    }
  }

  const handleCreateEvent = async (): Promise<void> => {
    if (journey == null) return
    const { data } = await templateUseEventCreate({
      variables: {
        input: { journeyId: journey.id }
      }
    })
    if (data?.templateUseEventCreate != null) {
      const { id, journeyId, userId } = data.templateUseEventCreate
      TagManager.dataLayer({
        dataLayer: {
          event: 'template_use',
          eventId: id,
          journeyId,
          userId,
          journeyTitle: journey.title
        }
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
