import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MoreVert from '@mui/icons-material/MoreVert'
import { useMutation, gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { CreateTemplate } from '../../../../../__generated__/CreateTemplate'
import { DuplicateJourney } from '../../../../../__generated__/DuplicateJourney'

export const DUPLICATE_JOURNEY = gql`
  mutation DuplicateJourney($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($id: ID!, $input: JourneyTemplateInput!) {
    journeyTemplate(id: $id, input: $input) {
      id
      template
    }
  }
`

export function CreateTemplateMenuItem(): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()

  const [duplicateJourney] = useMutation<DuplicateJourney>(DUPLICATE_JOURNEY)
  const [createTemplate] = useMutation<CreateTemplate>(CREATE_TEMPLATE)

  const handleCreateTemplate = async (): Promise<void> => {
    if (journey == null) return

    const { data } = await duplicateJourney({
      variables: {
        id: journey?.id
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
      const { data: templateData } = await createTemplate({
        variables: {
          id: data.journeyDuplicate.id,
          input: {
            template: true
          }
        },
        update(cache, { data }) {
          if (data?.journeyTemplate != null) {
            cache.modify({
              fields: {
                adminJourneys(existingAdminJourneyRefs = []) {
                  const journeyTemplate = cache.writeFragment({
                    data: data.journeyTemplate,
                    fragment: gql`
                      fragment journeyTemplate on Journey {
                        id
                      }
                    `
                  })
                  return [...existingAdminJourneyRefs, journeyTemplate]
                }
              }
            })
          }
        }
      })

      if (templateData?.journeyTemplate != null) {
        void router.push(
          `/journeys/templates/${templateData.journeyTemplate.id}`,
          undefined,
          { shallow: true }
        )
      }
    }
  }

  return (
    <MenuItem onClick={handleCreateTemplate}>
      <ListItemIcon>
        <MoreVert />
      </ListItemIcon>
      <ListItemText>Create Template</ListItemText>
    </MenuItem>
  )
}
