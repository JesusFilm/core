import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

import { gql, useMutation } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui/block'
import { SelectChangeEvent } from '@mui/material/Select'

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
    $id: ID!, 
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

  const { data } = useIntegrationQuery({
    teamId: activeTeam?.id as string
  })

  const selectedIntegration = data?.integrations.find(
    (integration) => selectedBlock?.integrationId === integration.id
  )

  const value = selectedIntegration?.routes.find(
    (route) => route.id === selectedBlock?.routeId
  )?.name

  const options = selectedIntegration?.routes.map((route) => route.name)

  async function handleChange(event: SelectChangeEvent) {
    if (selectedBlock == null) return
    const route = selectedIntegration?.routes.find(
      (route) => route.name === event.target.value
    )

    if (route == null) return

    await add({
      parameters: {
        execute: { routeId: route.id },
        undo: { routeId: selectedBlock.routeId }
      },
      async execute({ routeId }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })
        await textResponseRouteUpdate({
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
      {selectedBlock?.integrationId && (
        <>
          <Typography variant="subtitle2">{t('Route')}</Typography>
          <Select
            label="Routes"
            value={value ?? ''}
            onChange={handleChange}
            options={options}
          />
        </>
      )}
    </>
  )
}
