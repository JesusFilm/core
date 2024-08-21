import { gql, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import Bag5Icon from '@core/shared/ui/icons/Bag5'

import { CreateTemplate } from '../../../../../../__generated__/CreateTemplate'
import { RemoveUserJourney } from '../../../../../../__generated__/RemoveUserJourney'
import { Item } from '../Item/Item'

export const REMOVE_USER_JOURNEY = gql`
  mutation RemoveUserJourney($id: ID!) {
    userJourneyRemoveAll(id: $id) {
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

interface CreateTemplateItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export function CreateTemplateItem({
  variant
}: CreateTemplateItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()

  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const [removeUserJourney] =
    useMutation<RemoveUserJourney>(REMOVE_USER_JOURNEY)
  const [createTemplate] = useMutation<CreateTemplate>(CREATE_TEMPLATE)

  const handleCreateTemplate = async (): Promise<void> => {
    if (journey == null) return

    const { data } = await journeyDuplicate({
      variables: { id: journey?.id, teamId: 'jfp-team' }
    })

    // Convert duplicated journey to a template
    if (data != null) {
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
        await removeUserJourney({
          variables: {
            id: templateData?.journeyTemplate.id
          }
        })

        void router.push(
          `/publisher/${templateData.journeyTemplate.id}`,
          undefined,
          { shallow: true }
        )
      }
    }
  }

  return (
    <Item
      variant={variant}
      label={t('Create Template')}
      icon={<Bag5Icon />}
      onClick={handleCreateTemplate}
    />
  )
}
