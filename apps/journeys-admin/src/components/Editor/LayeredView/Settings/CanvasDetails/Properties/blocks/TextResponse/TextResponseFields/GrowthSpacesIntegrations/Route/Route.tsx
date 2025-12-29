import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import type {
  GetIntegration_integrations,
  GetIntegration_integrations_IntegrationGrowthSpaces,
  GetIntegration_integrations_IntegrationGrowthSpaces_routes
} from '../../../../../../../../../../../../__generated__/GetIntegration'
import {
  TextResponseRouteUpdate,
  TextResponseRouteUpdateVariables
} from '../../../../../../../../../../../../__generated__/TextResponseRouteUpdate'
import { useIntegrationQuery } from '../../../../../../../../../../../libs/useIntegrationQuery'
import { Select } from '../Select'

export const TEXT_RESPONSE_ROUTE_UPDATE = gql`
  mutation TextResponseRouteUpdate(
    $id: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, input: $input) {
      id
      routeId
    }
  }
`

export function Route(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { state, dispatch } = useEditor()
  const selectedBlock = state.selectedBlock

  const { add } = useCommand()

  const [textResponseRouteUpdate] = useMutation<
    TextResponseRouteUpdate,
    TextResponseRouteUpdateVariables
  >(TEXT_RESPONSE_ROUTE_UPDATE)

  const { data, loading } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  function isMatchingGrowthSpacesIntegration(
    integration: GetIntegration_integrations
  ): integration is GetIntegration_integrations_IntegrationGrowthSpaces {
    if (
      !isTextResponseBlock(selectedBlock) ||
      selectedBlock.integrationId == null
    )
      return false

    return (
      integration.__typename === 'IntegrationGrowthSpaces' &&
      integration.id === selectedBlock.integrationId
    )
  }

  function isTextResponseBlock(
    block: TreeBlock | null | undefined
  ): block is TreeBlock<TextResponseBlock> {
    return block?.__typename === 'TextResponseBlock'
  }

  const selectedIntegration = data?.integrations.find(
    isMatchingGrowthSpacesIntegration
  )

  const growthSpacesIntegration =
    selectedIntegration?.__typename === 'IntegrationGrowthSpaces'
      ? selectedIntegration
      : null

  const options =
    selectedIntegration?.routes?.reduce<
      Array<{ value: string; label: string }>
    >((accumulatedOptions, route) => {
      if (route == null) return accumulatedOptions

      const validRoute = validateRoute(route)
      if (validRoute == null) return accumulatedOptions

      accumulatedOptions.push(validRoute)
      return accumulatedOptions
    }, []) ?? []

  function validateRoute(
    route: GetIntegration_integrations_IntegrationGrowthSpaces_routes
  ): { value: string; label: string } | null {
    if (route.id == null || route.name == null) return null

    return { value: route.id, label: route.name }
  }

  function handleChange(routeId: string | null): void {
    if (selectedBlock == null) return

    add({
      parameters: {
        execute: { routeId },
        undo: {
          routeId: isTextResponseBlock(selectedBlock)
            ? selectedBlock.routeId
            : null
        }
      },
      execute({ routeId }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })
        void textResponseRouteUpdate({
          variables: {
            id: selectedBlock.id,
            input: {
              routeId
            }
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'TextResponseBlock',
              routeId
            }
          }
        })
      }
    })
  }

  return (
    <>
      {isTextResponseBlock(selectedBlock) &&
        selectedBlock.integrationId != null &&
        !loading && (
          <>
            <Select
              label={t('Route')}
              value={
                isTextResponseBlock(selectedBlock)
                  ? (selectedBlock?.routeId ?? undefined)
                  : undefined
              }
              onChange={handleChange}
              options={options}
            />
          </>
        )}
    </>
  )
}
