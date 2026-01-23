import { gql, useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { enqueueSnackbar } from 'notistack'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import Layout1Icon from '@core/shared/ui/icons/Layout1'
import LayoutTopIcon from '@core/shared/ui/icons/LayoutTop'

import { CreateTemplate } from '../../../../../../__generated__/CreateTemplate'
import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'
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
  globalPublish?: boolean
  handleCloseMenu?: () => void
  journey?: Journey
}

export function CreateTemplateItem({
  variant,
  globalPublish = false,
  handleCloseMenu,
  journey
}: CreateTemplateItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext

  const [removeUserJourney] =
    useMutation<RemoveUserJourney>(REMOVE_USER_JOURNEY)
  const [createTemplate] = useMutation<CreateTemplate>(CREATE_TEMPLATE)

  const handleCreateTemplate = async (): Promise<void> => {
    if (journeyData == null) return

    // Detect if we're in Editor context (editing a journey) vs JourneyList context
    const isEditorContext = router.pathname === '/journeys/[journeyId]'

    // Duplicate journey but don't add to journeys cache since we're converting to template immediately
    const { data } = await journeyDuplicate({
      variables: {
        id: journeyData.id,
        teamId: globalPublish ? 'jfp-team' : (journeyData.team?.id ?? '')
      },
      update() {
        // Override default cache update - we'll handle cache update after converting to template
        // This prevents the duplicate from appearing in journeys cache
      }
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
                adminJourneys(existingAdminJourneyRefs = [], details) {
                  const args = (
                    details as {
                      args?: { template?: boolean }
                    }
                  ).args
                  // Only add template to templates cache (template: true)
                  // Skip journeys cache (template: false) since we never added the duplicate there
                  if (args?.template === true) {
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
                  return existingAdminJourneyRefs
                }
              }
            })
          }
        },
        onCompleted: () => {
          enqueueSnackbar(t('Template Created'), {
            variant: 'success',
            preventDuplicate: true
          })
        }
      })

      if (templateData?.journeyTemplate != null) {
        await removeUserJourney({
          variables: {
            id: templateData?.journeyTemplate.id
          }
        })

        if (globalPublish) {
          // Global templates: navigate to editor with publisher path (works for both contexts)
          void router.push(
            `/publisher/${templateData.journeyTemplate.id}`,
            undefined,
            { shallow: true }
          )
        } else {
          // Local templates: context-aware navigation
          if (isEditorContext) {
            // In Editor: navigate to journeys list with template tab
            void router.push('/?type=templates&refresh=true')
          } else {
            // In JourneyList: update query params to switch to template tab (shallow routing)
            void router.push(
              {
                query: {
                  ...router.query,
                  type: 'templates',
                  refresh: 'true'
                }
              },
              undefined,
              { shallow: true }
            )
          }
          handleCloseMenu?.()
        }
      }
    }
  }

  return (
    <Item
      variant={variant}
      label={globalPublish ? t('Make Global Template') : t('Make Template')}
      icon={globalPublish ? <Layout1Icon /> : <LayoutTopIcon />}
      onClick={handleCreateTemplate}
    />
  )
}
