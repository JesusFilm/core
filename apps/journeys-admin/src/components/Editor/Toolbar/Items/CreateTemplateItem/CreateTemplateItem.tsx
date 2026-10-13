import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { enqueueSnackbar } from 'notistack'
import { ComponentProps, ReactElement, useRef, useState } from 'react'

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
  /**
   * Keeps the parent menu mounted for the rest of the session. Called when
   * template creation starts, so dismissing the menu mid-flight (escape or
   * backdrop click) doesn't unmount this item and reset the in-flight guard.
   * Matches how ShareItem and CopyToTeamMenuItem hold the menu open.
   */
  handleKeepMounted?: () => void
  journey?: Journey
}

export function CreateTemplateItem({
  variant,
  globalPublish = false,
  handleCloseMenu,
  handleKeepMounted,
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

  // Synchronous in-flight guard. Rapid clicks can fire before React re-renders
  // with the updated `creating` state, so state alone cannot block the second
  // click - each duplicate/template chain would run in full and leave behind an
  // extra template. The ref is read and written in the same tick, so it does.
  const isCreatingRef = useRef(false)
  const [creating, setCreating] = useState(false)

  const handleCreateTemplate = async (): Promise<void> => {
    if (journeyData == null || isCreatingRef.current) return

    isCreatingRef.current = true
    setCreating(true)
    handleKeepMounted?.()

    try {
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
    } catch (error) {
      // Success already reports via snackbar. Without this, a failed mutation
      // rejects into onClick, where React discards it - the item would silently
      // re-enable and the user would have no idea anything went wrong.
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    } finally {
      // Always clear, so a failed mutation doesn't leave the item permanently
      // disabled for the rest of the session.
      isCreatingRef.current = false
      setCreating(false)
    }
  }

  return (
    <Item
      variant={variant}
      label={globalPublish ? t('Make Global Template') : t('Make Template')}
      icon={globalPublish ? <Layout1Icon /> : <LayoutTopIcon />}
      onClick={handleCreateTemplate}
      MenuItemProps={{ disabled: creating }}
    />
  )
}
