import { gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import type {
  GetIntegration_integrations,
  GetIntegration_integrations_IntegrationGrowthSpaces
} from '../../../../../../../../../../../../__generated__/GetIntegration'
import {
  TextResponseIntegrationUpdate,
  TextResponseIntegrationUpdateVariables
} from '../../../../../../../../../../../../__generated__/TextResponseIntegrationUpdate'
import { useIntegrationQuery } from '../../../../../../../../../../../libs/useIntegrationQuery'
import { Select } from '../Select'

export const TEXT_RESPONSE_INTEGRATION_UPDATE = gql`
  mutation TextResponseIntegrationUpdate(
    $id: ID!
    $integrationId: String
    $routeId: String
  ) {
    textResponseBlockUpdate(
      id: $id
      input: { integrationId: $integrationId, routeId: $routeId }
    ) {
      id
      integrationId
      routeId
    }
  }
`

export function App(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { state, dispatch } = useEditor()
  const selectedBlock = state.selectedBlock

  const { add } = useCommand()

  const [textResponseIntegrationUpdate] = useMutation<
    TextResponseIntegrationUpdate,
    TextResponseIntegrationUpdateVariables
  >(TEXT_RESPONSE_INTEGRATION_UPDATE)

  const { data, loading } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  function isGrowthSpacesIntegration(
    integration: GetIntegration_integrations
  ): integration is GetIntegration_integrations_IntegrationGrowthSpaces {
    return integration.__typename === 'IntegrationGrowthSpaces'
  }

  function isTextResponseBlock(
    block: TreeBlock | null | undefined
  ): block is TreeBlock<TextResponseBlock> {
    return block?.__typename === 'TextResponseBlock'
  }

  const options = (data?.integrations ?? [])
    .filter(isGrowthSpacesIntegration)
    .reduce<
      Array<{ value: string; label: string }>
    >((acc, { id, accessId }) => {
      if (accessId == null) return acc
      acc.push({ value: id, label: accessId })
      return acc
    }, [])

  function handleChange(integrationId: string | null): void {
    if (selectedBlock == null) return

    const previousIntegrationId = isTextResponseBlock(selectedBlock)
      ? selectedBlock.integrationId
      : null
    const previousRouteId = isTextResponseBlock(selectedBlock)
      ? selectedBlock.routeId
      : null

    add({
      parameters: {
        execute: {
          integrationId,
          routeId: null
        },
        undo: {
          integrationId: previousIntegrationId,
          routeId: previousRouteId
        }
      },
      execute({ integrationId, routeId }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })
        void textResponseIntegrationUpdate({
          variables: {
            id: selectedBlock.id,
            integrationId,
            routeId
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'TextResponseBlock',
              integrationId,
              routeId
            }
          }
        })
      }
    })
  }

  return !loading && options.length > 0 ? (
    <>
      <Typography variant="subtitle2">{t('Growth Spaces')}</Typography>
      <Select
        label={t('App ID')}
        value={
          isTextResponseBlock(selectedBlock)
            ? (selectedBlock?.integrationId ?? undefined)
            : undefined
        }
        onChange={handleChange}
        options={options}
      />
    </>
  ) : (
    <></>
  )
}
