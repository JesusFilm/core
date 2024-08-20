import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
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
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  const { add } = useCommand()

  const [textResponseRouteUpdate] = useMutation<
    TextResponseRouteUpdate,
    TextResponseRouteUpdateVariables
  >(TEXT_RESPONSE_ROUTE_UPDATE)

  const { data, loading } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  const selectedIntegration = data?.integrations.find(
    (integration) => selectedBlock?.integrationId === integration.id
  )

  const options =
    selectedIntegration?.routes.map(({ id, name }) => ({
      value: id,
      label: name
    })) ?? []

  function handleChange(routeId: string | null): void {
    if (selectedBlock == null) return

    add({
      parameters: {
        execute: { routeId },
        undo: { routeId: selectedBlock.routeId }
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
      {selectedBlock?.integrationId != null && !loading && (
        <>
          <Select
            label={t('Route')}
            value={selectedBlock?.routeId ?? undefined}
            onChange={handleChange}
            options={options}
          />
        </>
      )}
    </>
  )
}
