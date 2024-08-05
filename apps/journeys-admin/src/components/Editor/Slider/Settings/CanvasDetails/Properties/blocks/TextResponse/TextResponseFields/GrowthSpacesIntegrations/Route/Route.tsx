import { gql, useMutation } from '@apollo/client'
import { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useTranslation } from 'react-i18next'

import { gql, useMutation } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui/block'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseRouteUpdate,
  TextResponseRouteUpdateVariables
} from '../../../../../../../../../../../../__generated__/TextResponseRouteUpdate'
import { useIntegrationQuery } from '../../../../../../../../../../../libs/useIntegrationQuery'

import { useCommand } from '@core/journeys/ui/CommandProvider'
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

  async function handleChange(routeId: string | null) {
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
        textResponseRouteUpdate({
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
