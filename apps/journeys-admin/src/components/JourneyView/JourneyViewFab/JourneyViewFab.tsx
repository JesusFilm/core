import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Fab from '@mui/material/Fab'
import EditIcon from '@mui/icons-material/Edit'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ConvertTemplate } from '../../../../__generated__/ConvertTemplate'

export const CONVERT_TEMPLATE = gql`
  mutation ConvertTemplate($id: ID!) {
    journeyDuplicate(id: $id) {
      id
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
      void router.push(`/journeys/${data.journeyDuplicate.id}`, undefined, {
        shallow: true
      })
    }
  }

  let editLink
  if (journey != null) {
    if (journey.template === true && isPublisher === true) {
      editLink = `/templates/${journey.id}/edit`
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
          Use Template
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
